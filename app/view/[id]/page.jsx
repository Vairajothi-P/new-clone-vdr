"use client";

import React, { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { FaSpinner } from 'react-icons/fa';
import fernet from 'fernet';

export default function SecureViewer({ params }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const docId = resolvedParams.id;
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [docName, setDocName] = useState("");
    const [docPayload, setDocPayload] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        loadDocument();
    }, [docId]);

    useEffect(() => {
        if (!loading && docPayload && containerRef.current) {
            renderDocument(docPayload.ext, docPayload.bytes, docPayload.text);
        }
    }, [loading, docPayload]);

    const loadDocument = async () => {
        try {
            const raw = localStorage.getItem('vdr_session');
            if (!raw) { window.location.href = '/login'; return; }
            const session = JSON.parse(raw);

            const { data: doc, error: docErr } = await supabase
                .from('documents')
                .select('name, folder_id, uploaded_by, creator_revoked, file_path, dek_ref')
                .eq('id', docId)
                .single();

            if (docErr || !doc) throw new Error("Document not found in database.");
            setDocName(doc.name);

            let hasAccess = false;
            if (session.role === 'super_admin' || (doc.uploaded_by === session.id && !doc.creator_revoked)) {
                hasAccess = true;
            } else {
                const { data: groups } = await supabase.from('user_groups').select('group_id').eq('user_id', session.id);
                if (groups && groups.length > 0) {
                    const groupIds = groups.map(g => g.group_id).join(',');
                    let queryStr = `group_id=in.(${groupIds})&select=can_view,scope,document_id,folder_id`;
                    
                    if (doc.folder_id) {
                        queryStr += `&or=(document_id.eq.${docId},folder_id.eq.${doc.folder_id})`;
                    } else {
                        queryStr += `&document_id=eq.${docId}`;
                    }

                    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/permissions?${queryStr}`, {
                        headers: { 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` }
                    });
                    const perms = await res.json();

                    const docPerms = perms.filter(p => p.scope === 'document' && p.document_id === docId);
                    const folderPerms = perms.filter(p => p.scope === 'folder' && p.folder_id === doc.folder_id);

                    if (docPerms.length > 0) {
                        if (docPerms.some(p => p.can_view)) hasAccess = true;
                    } else if (folderPerms.length > 0) {
                        if (folderPerms.some(p => p.can_view)) hasAccess = true;
                    }
                }
            }

            if (!hasAccess) throw new Error("You do not have permission to view this document.");

            const { data: fileData, error: fileErr } = await supabase.storage
                .from('vault-files')
                .download(doc.file_path);

            if (fileErr || !fileData) throw new Error("Encrypted file not found in storage bucket.");

            const encryptedText = await fileData.text();
            const secret = new fernet.Secret(doc.dek_ref);
            const token = new fernet.Token({ token: encryptedText, secret, ttl: 0 });
            const decryptedBase64 = token.decode();
            
            const binaryString = atob(decryptedBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const utf8Text = new TextDecoder('utf-8').decode(bytes);
            const fileExt = doc.name.split('.').pop().toLowerCase();

            setDocPayload({ ext: fileExt, bytes: bytes, text: utf8Text });

            // ── Log this document view into document_access_logs ──────────
            console.log('[VIEW DEBUG] Attempting insert:', {
                user_id: session.id,
                document_id: docId,
            });
            const { data: logData, error: logErr } = await supabase
                .from('document_access_logs')
                .insert({
                    user_id: session.id,
                    document_id: docId,
                    opened_at: new Date().toISOString(),
                })
                .select();
            if (logErr) {
                console.error('[VIEW DEBUG] ❌ Insert FAILED:', logErr);
            } else {
                console.log('[VIEW DEBUG] ✅ Insert SUCCESS:', logData);
            }
            // ─────────────────────────────────────────────────────────────

            setLoading(false);

        } catch (err) {
            console.error("View Error:", err);
            setError(err.message);
            setLoading(false);
        }
    };

    const renderDocument = async (ext, bytes, utf8Text) => {
        const container = containerRef.current;
        if (!container) return;
        
        container.innerHTML = '';

        try {
            if (['xlsx', 'xls', 'csv'].includes(ext)) {
                if (!window.luckysheet) {
                   await loadScript("https://cdn.jsdelivr.net/npm/luckysheet/dist/plugins/js/plugin.js");
                   await loadScript("https://cdn.jsdelivr.net/npm/luckysheet/dist/luckysheet.umd.js");
                   await loadScript("https://cdn.jsdelivr.net/npm/luckyexcel/dist/luckyexcel.umd.js");
                }
                
                container.innerHTML = '<div id="luckysheet-container" style="width:100%;height:100%;position:absolute;top:0;left:0;"></div>';
                
                const luckyOptions = {
                    container: 'luckysheet-container', lang: 'en', showinfobar: false,      
                    showtoolbar: false, showsheetbar: true, showstatisticBar: true,
                    allowEdit: false, enableAddRow: false, enableAddCol: false, sheetFormulaBar: false
                };

                if (ext === 'csv') {
                    const rows = utf8Text.split(/\r?\n/).filter(r => r.length > 0);
                    const data = rows.map(row => row.split(',').map(val => ({ v: val, m: val })));
                    window.luckysheet.create({ ...luckyOptions, data: [{ name: "CSV Data", status: 1, data: data }] });
                } else {
                    window.LuckyExcel.transformExcelToLucky(new File([bytes], "file.xlsx"), (json) => {
                        window.luckysheet.create({ ...luckyOptions, data: json.sheets, title: docName });
                    });
                }
            } 
            else if (ext === 'pdf') {
                if (!window['pdfjs-dist/build/pdf']) {
                    await loadScript("https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.min.js");
                }
                const pdfjsLib = window['pdfjs-dist/build/pdf'];
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                
                const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1.5 });
                    const wrapper = document.createElement('div');
                    wrapper.className = 'pdf-page-wrapper shadow-lg mb-8 bg-white';
                    wrapper.style.width = viewport.width + 'px';
                    wrapper.style.height = viewport.height + 'px';
                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width; canvas.height = viewport.height;
                    wrapper.appendChild(canvas);
                    container.appendChild(wrapper);
                    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
                }
            } 
            else if (['docx', 'doc'].includes(ext)) {
                // 🔥 EXACT DOCX REPLICATION FROM VDRENGINE
                if (!window.docx) {
                    await loadScript("https://unpkg.com/jszip/dist/jszip.min.js");
                    await loadScript("https://unpkg.com/docx-preview/dist/docx-preview.min.js");
                }
                const docContainer = document.createElement('div');
                docContainer.style.width = '100%';
                container.appendChild(docContainer);

                window.docx.renderAsync(bytes.buffer, docContainer, null, {
                    className: "docx",
                    inWrapper: true,
                    ignoreWidth: false,
                    ignoreHeight: false,
                    breakPages: true 
                }).catch(err => {
                    container.innerHTML = "<p style='color:red;'>Error parsing DOCX: " + err.message + "</p>";
                });
            } 
            else if (['txt', 'text'].includes(ext)) {
                // 🔥 EXACT TXT PAGINATION FROM VDRENGINE
                const lines = utf8Text.split(/\r?\n/);
                const LINES_PER_PAGE = 40; 
                let html = '';
                for (let i = 0; i < lines.length; i += LINES_PER_PAGE) {
                    const chunk = lines.slice(i, i + LINES_PER_PAGE).join('\n');
                    html += `
                        <div class="txt-page-wrapper">
                            <pre class="txt-view">${chunk}</pre>
                        </div>
                    `;
                }
                container.innerHTML = html;
            } 
            else {
                container.innerHTML = `<div class="text-white text-center mt-20 font-bold text-xl">Unsupported Format</div>`;
            }
        } catch (e) {
            console.error(e);
            setError("Rendering Error: " + e.message);
        }
    };

    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };

    if (loading) return <div className="h-screen w-screen bg-[#1a1a1a] flex items-center justify-center text-white"><FaSpinner className="animate-spin text-4xl text-brand" /></div>;
    
    if (error) return (
        <div className="h-screen w-screen bg-slate-900 flex items-center justify-center flex-col gap-4">
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-6 rounded-xl max-w-md text-center">
                <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                <p className="text-sm">{error}</p>
                <button onClick={() => window.close()} className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Close Tab</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#1a1a1a] flex flex-col">
            {/* 🔥 INJECTED EXACT CSS FROM VDRENGINE FOR PERFECT A4 RENDERING */}
            <style dangerouslySetInnerHTML={{__html: `
                @import url('https://cdn.jsdelivr.net/npm/luckysheet/dist/plugins/css/pluginsCss.css');
                @import url('https://cdn.jsdelivr.net/npm/luckysheet/dist/plugins/plugins.css');
                @import url('https://cdn.jsdelivr.net/npm/luckysheet/dist/css/luckysheet.css');
                
                body { user-select: none; -webkit-user-select: none; margin: 0; padding: 0; background-color: #1a1a1a; }
                
                /* DOCX STYLES */
                .docx-wrapper { background: transparent !important; padding: 0 !important; display: flex; flex-direction: column; align-items: center; width: 100%; }
                .docx-wrapper > section.docx { background: #ffffff !important; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important; margin-bottom: 30px !important; min-height: 297mm !important; width: 210mm !important; }
                
                /* TXT STYLES */
                .txt-page-wrapper { background: #ffffff !important; width: 210mm; min-height: 297mm; height: max-content; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); padding: 25mm; box-sizing: border-box; color: #000000 !important; display: flex; flex-direction: column; }
                .txt-view { white-space: pre-wrap; font-family: monospace; font-size: 14px; margin: 0; word-wrap: break-word; color: #000000 !important; width: 100%; }
            `}} />

            {/* Top Toolbar */}
            <div className="h-[60px] bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-brand text-white text-[11px] font-bold rounded">SECURE VIEW</span>
                    <h1 className="text-slate-100 font-semibold text-[15px]">{docName}</h1>
                </div>
            </div>

            {/* Document Container */}
            <div className="flex-1 w-full relative overflow-auto flex flex-col items-center py-10" ref={containerRef}>
            </div>
        </div>
    );
}
















// "use client";

// import React, { useEffect, useState, useRef, use } from 'react';
// import { useRouter } from 'next/navigation';
// import { supabase } from '@/utils/supabase/client';
// import { FaSpinner } from 'react-icons/fa';
// import fernet from 'fernet';

// export default function SecureViewer({ params }) {
//     const router = useRouter();
//     const resolvedParams = use(params);
//     const docId = resolvedParams.id;
    
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [docName, setDocName] = useState("");
//     const [docPayload, setDocPayload] = useState(null); // 🔥 Holds the file in memory
//     const containerRef = useRef(null);

//     // 1. Initial Load
//     useEffect(() => {
//         loadDocument();
//     }, [docId]);

//     // 2. 🔥 THE FIX: Wait for loading to finish and container to exist BEFORE rendering!
//     useEffect(() => {
//         if (!loading && docPayload && containerRef.current) {
//             renderDocument(docPayload.ext, docPayload.bytes, docPayload.text);
//         }
//     }, [loading, docPayload]);

//     const loadDocument = async () => {
//         try {
//             const raw = localStorage.getItem('vdr_session');
//             if (!raw) { window.location.href = '/login'; return; }
//             const session = JSON.parse(raw);

//             const { data: doc, error: docErr } = await supabase
//                 .from('documents')
//                 .select('name, folder_id, uploaded_by, creator_revoked, file_path, dek_ref')
//                 .eq('id', docId)
//                 .single();

//             if (docErr || !doc) throw new Error("Document not found in database.");
//             setDocName(doc.name);

//             let hasAccess = false;
//             if (session.role === 'super_admin' || (doc.uploaded_by === session.id && !doc.creator_revoked)) {
//                 hasAccess = true;
//             } else {
//                 const { data: groups } = await supabase.from('user_groups').select('group_id').eq('user_id', session.id);
//                 if (groups && groups.length > 0) {
//                     const groupIds = groups.map(g => g.group_id).join(',');
//                     let queryStr = `group_id=in.(${groupIds})&select=can_view,scope,document_id,folder_id`;
                    
//                     if (doc.folder_id) {
//                         queryStr += `&or=(document_id.eq.${docId},folder_id.eq.${doc.folder_id})`;
//                     } else {
//                         queryStr += `&document_id=eq.${docId}`;
//                     }

//                     const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/permissions?${queryStr}`, {
//                         headers: { 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` }
//                     });
//                     const perms = await res.json();

//                     const docPerms = perms.filter(p => p.scope === 'document' && p.document_id === docId);
//                     const folderPerms = perms.filter(p => p.scope === 'folder' && p.folder_id === doc.folder_id);

//                     if (docPerms.length > 0) {
//                         if (docPerms.some(p => p.can_view)) hasAccess = true;
//                     } else if (folderPerms.length > 0) {
//                         if (folderPerms.some(p => p.can_view)) hasAccess = true;
//                     }
//                 }
//             }

//             if (!hasAccess) throw new Error("You do not have permission to view this document.");

//             const { data: fileData, error: fileErr } = await supabase.storage
//                 .from('vault-files')
//                 .download(doc.file_path);

//             if (fileErr || !fileData) throw new Error("Encrypted file not found in storage bucket.");

//             const encryptedText = await fileData.text();
//             const secret = new fernet.Secret(doc.dek_ref);
//             const token = new fernet.Token({ token: encryptedText, secret, ttl: 0 });
//             const decryptedBase64 = token.decode();
            
//             const binaryString = atob(decryptedBase64);
//             const bytes = new Uint8Array(binaryString.length);
//             for (let i = 0; i < binaryString.length; i++) {
//                 bytes[i] = binaryString.charCodeAt(i);
//             }

//             const utf8Text = new TextDecoder('utf-8').decode(bytes);
//             const fileExt = doc.name.split('.').pop().toLowerCase();

//             // 🔥 Store the decrypted data in state and stop the spinner
//             setDocPayload({ ext: fileExt, bytes: bytes, text: utf8Text });
//             setLoading(false);

//         } catch (err) {
//             console.error("View Error:", err);
//             setError(err.message);
//             setLoading(false);
//         }
//     };

//     const renderDocument = async (ext, bytes, utf8Text) => {
//         const container = containerRef.current;
//         if (!container) return;
        
//         container.innerHTML = ''; // Clear out any previous renders

//         try {
//             if (['xlsx', 'xls', 'csv'].includes(ext)) {
//                 if (!window.luckysheet) {
//                    await loadScript("https://cdn.jsdelivr.net/npm/luckysheet/dist/plugins/js/plugin.js");
//                    await loadScript("https://cdn.jsdelivr.net/npm/luckysheet/dist/luckysheet.umd.js");
//                    await loadScript("https://cdn.jsdelivr.net/npm/luckyexcel/dist/luckyexcel.umd.js");
//                 }
                
//                 container.innerHTML = '<div id="luckysheet-container" style="width:100%;height:100%;position:absolute;top:0;left:0;"></div>';
                
//                 const luckyOptions = {
//                     container: 'luckysheet-container', lang: 'en', showinfobar: false,      
//                     showtoolbar: false, showsheetbar: true, showstatisticBar: true,
//                     allowEdit: false, enableAddRow: false, enableAddCol: false, sheetFormulaBar: false
//                 };

//                 if (ext === 'csv') {
//                     const rows = utf8Text.split(/\r?\n/).filter(r => r.length > 0);
//                     const data = rows.map(row => row.split(',').map(val => ({ v: val, m: val })));
//                     window.luckysheet.create({ ...luckyOptions, data: [{ name: "CSV Data", status: 1, data: data }] });
//                 } else {
//                     window.LuckyExcel.transformExcelToLucky(new File([bytes], "file.xlsx"), (json) => {
//                         window.luckysheet.create({ ...luckyOptions, data: json.sheets, title: docName });
//                     });
//                 }
//             } 
//             else if (ext === 'pdf') {
//                 if (!window['pdfjs-dist/build/pdf']) {
//                     await loadScript("https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.min.js");
//                 }
//                 const pdfjsLib = window['pdfjs-dist/build/pdf'];
//                 pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                
//                 const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
//                 for (let i = 1; i <= pdf.numPages; i++) {
//                     const page = await pdf.getPage(i);
//                     const viewport = page.getViewport({ scale: 1.5 });
//                     const wrapper = document.createElement('div');
//                     wrapper.className = 'pdf-page-wrapper shadow-lg mb-8 bg-white';
//                     wrapper.style.width = viewport.width + 'px';
//                     wrapper.style.height = viewport.height + 'px';
//                     const canvas = document.createElement('canvas');
//                     canvas.width = viewport.width; canvas.height = viewport.height;
//                     wrapper.appendChild(canvas);
//                     container.appendChild(wrapper);
//                     await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
//                 }
//             } 
//             else if (['docx', 'doc'].includes(ext)) {
//                 if (!window.docx) {
//                     await loadScript("https://unpkg.com/jszip/dist/jszip.min.js");
//                     await loadScript("https://unpkg.com/docx-preview/dist/docx-preview.min.js");
//                 }
//                 const docContainer = document.createElement('div');
//                 docContainer.style.width = '100%';
//                 docContainer.style.display = 'flex';
//                 docContainer.style.flexDirection = 'column';
//                 docContainer.style.alignItems = 'center';
//                 container.appendChild(docContainer);

//                 window.docx.renderAsync(bytes.buffer, docContainer, null, {
//                     className: "docx shadow-lg mb-8 bg-white",
//                     inWrapper: true,
//                     ignoreWidth: false,
//                     ignoreHeight: false,
//                     breakPages: true 
//                 });
//             } 
//             else if (['txt', 'text'].includes(ext)) {
//                 container.innerHTML = `<div class="bg-white p-12 shadow-lg w-[210mm] min-h-[297mm] mx-auto text-black whitespace-pre-wrap font-mono">${utf8Text}</div>`;
//             } 
//             else {
//                 container.innerHTML = `<div class="text-white text-center mt-20 font-bold text-xl">Unsupported Format</div>`;
//             }
//         } catch (e) {
//             console.error(e);
//             setError("Rendering Error: " + e.message);
//         }
//     };

//     const loadScript = (src) => {
//         return new Promise((resolve, reject) => {
//             const script = document.createElement('script');
//             script.src = src;
//             script.onload = resolve;
//             script.onerror = reject;
//             document.head.appendChild(script);
//         });
//     };

//     if (loading) return <div className="h-screen w-screen bg-slate-900 flex items-center justify-center text-white"><FaSpinner className="animate-spin text-4xl text-brand" /></div>;
    
//     if (error) return (
//         <div className="h-screen w-screen bg-slate-900 flex items-center justify-center flex-col gap-4">
//             <div className="bg-red-500/10 border border-red-500 text-red-500 p-6 rounded-xl max-w-md text-center">
//                 <h2 className="text-xl font-bold mb-2">Access Denied</h2>
//                 <p className="text-sm">{error}</p>
//                 <button onClick={() => window.close()} className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Close Tab</button>
//             </div>
//         </div>
//     );

//     return (
//         <div className="min-h-screen bg-[#1a1a1a] flex flex-col">
//             <style dangerouslySetInnerHTML={{__html: `
//                 @import url('https://cdn.jsdelivr.net/npm/luckysheet/dist/plugins/css/pluginsCss.css');
//                 @import url('https://cdn.jsdelivr.net/npm/luckysheet/dist/plugins/plugins.css');
//                 @import url('https://cdn.jsdelivr.net/npm/luckysheet/dist/css/luckysheet.css');
                
//                 body { user-select: none; -webkit-user-select: none; }
//                 .docx-wrapper { background: transparent !important; padding: 0 !important; }
//                 .docx-wrapper > section.docx { width: 210mm !important; min-height: 297mm !important; margin-bottom: 30px !important; }
//             `}} />

//             {/* Top Toolbar */}
//             <div className="h-[60px] bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 sticky top-0 z-50">
//                 <div className="flex items-center gap-4">
//                     <span className="px-3 py-1 bg-brand text-white text-[11px] font-bold rounded">SECURE VIEW</span>
//                     <h1 className="text-slate-100 font-semibold text-[15px]">{docName}</h1>
//                 </div>
//             </div>

//             {/* Document Container - Added 'relative' so Luckysheet fills the screen correctly */}
//             <div className="flex-1 w-full relative overflow-auto flex flex-col items-center py-10" ref={containerRef}>
//             </div>
//         </div>
//     );
// }






