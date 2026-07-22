"use client";

import React, { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { FaSpinner } from 'react-icons/fa';
import fernet from 'fernet';

// ── Risk configuration ────────────────────────────────────────────────────────
const RISK = {
    PRINT_SCREEN:  100,  // instant logout
    DEVTOOLS:      100,  // instant logout
    WIN_SHIFT_S:   100,  // instant logout — Snipping Tool
    CTRL_P:         60,
    CTRL_C:         30,
    CTRL_A:         20,
    CTRL_S:         40,
    CTRL_U:         50,
    BLUR:          100,  // instant logout — window lost focus / Snipping Tool active
    RIGHT_CLICK:    10,
    DRAG:           10,
};
const LOGOUT_THRESHOLD = 100;
// ─────────────────────────────────────────────────────────────────────────────

export default function SecureViewer({ params }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const docId = resolvedParams.id;

    // ── Core state ────────────────────────────────────────────────────────────
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);
    const [docName, setDocName]       = useState('');
    const [docPayload, setDocPayload] = useState(null);
    const containerRef = useRef(null);

    // ── Security state ────────────────────────────────────────────────────────
    const [riskScore, setRiskScore]       = useState(0);
    const [violated, setViolated]         = useState(false);
    const [violationMsg, setViolationMsg] = useState('');
    const [countdown, setCountdown]       = useState(5);
    const [userInfo, setUserInfo]         = useState({ name: '', email: '', sessionId: '' });
    const [clientIp, setClientIp]         = useState('...');

    const riskRef      = useRef(0);
    const countdownRef = useRef(null);
    const shiftSRef    = useRef(false);
    const devtoolsRef  = useRef(false);
    const shieldDivRef = useRef(null); // direct DOM ref — synchronous, no React delay
    
    const userInfoRef  = useRef(userInfo);
    const clientIpRef  = useRef(clientIp);

    useEffect(() => { userInfoRef.current = userInfo; }, [userInfo]);
    useEffect(() => { clientIpRef.current = clientIp; }, [clientIp]);
    // ─────────────────────────────────────────────────────────────────────────

    // ── Load user info & IP for watermark ─────────────────────────────────────
    useEffect(() => {
        try {
            const raw = localStorage.getItem('vdr_session');
            if (raw) {
                const s = JSON.parse(raw);
                setUserInfo({
                    name: s.name || '',
                    email: s.email || '',
                    sessionId: (s.id || '').slice(0, 8),
                });
            }
        } catch (_) {}
        fetch('https://api.ipify.org?format=json')
            .then(r => r.json())
            .then(d => setClientIp(d.ip || '—'))
            .catch(() => setClientIp('—'));
    }, []);

    // ── Document load & render ────────────────────────────────────────────────
    useEffect(() => { loadDocument(); }, [docId]);

    useEffect(() => {
        if (!loading && docPayload && containerRef.current) {
            renderDocument(docPayload.ext, docPayload.bytes, docPayload.text);
        }
    }, [loading, docPayload]);

    // ── Security Engine ───────────────────────────────────────────────────────
    useEffect(() => {

        // Show violation overlay + 5s countdown logout
        const triggerLogout = (msg) => {
            if (countdownRef.current) return;
            // Synchronous DOM shield (no React delay)
            if (shieldDivRef.current) shieldDivRef.current.style.display = 'flex';
            setViolationMsg(msg);
            setViolated(true);
            setCountdown(5);
            let secs = 5;
            countdownRef.current = setInterval(() => {
                secs -= 1;
                setCountdown(secs);
                if (secs <= 0) {
                    clearInterval(countdownRef.current);
                    localStorage.removeItem('vdr_session');
                    window.location.href = '/login';
                }
            }, 1000);
        };

        // Add risk score; logout when threshold reached
        const addRisk = (points, msg) => {
            riskRef.current += points;
            setRiskScore(riskRef.current);
            console.warn(`[SECURITY] +${points} (${msg}) | Total: ${riskRef.current}`);
            if (riskRef.current >= LOGOUT_THRESHOLD) triggerLogout(msg);
        };

        // Shield helpers — shieldDivRef is direct DOM (synchronous, instant)
        const showShield = () => {
            if (shieldDivRef.current) shieldDivRef.current.style.display = 'flex';
        };
        const hideShield = () => {
            if (!countdownRef.current && shieldDivRef.current) {
                shieldDivRef.current.style.display = 'none';
            }
        };

        // Clear clipboard helper
        const clearClipboard = () => {
            try {
                if (navigator.clipboard && navigator.clipboard.writeText && document.hasFocus()) {
                    navigator.clipboard.writeText('PROTECTED VDR DOCUMENT - SCREENSHOT RESTRICTED').catch(() => {});
                }
            } catch (_) {}
        };

        // ── Keyboard handler ─────────────────────────────────────────────────
        const onKeyDown = (e) => {
            const key  = (e.key || '').toLowerCase();
            const ctrl = e.ctrlKey || e.metaKey;

            // 1. Instant black-out on Meta (Win key), Shift, or Alt to preempt Snipping Tool screen freeze
            if (e.key === 'Meta' || e.key === 'Shift' || e.key === 'Alt') {
                showShield();
            }

            // PrintScreen — instant logout + clipboard wipe
            if (e.key === 'PrintScreen') {
                e.preventDefault();
                showShield();
                clearClipboard();
                addRisk(RISK.PRINT_SCREEN, 'PrintScreen detected');
                return;
            }
            // Win+Shift+S detection
            if ((e.metaKey || e.shiftKey) && key === 's') {
                e.preventDefault();
                showShield();
                clearClipboard();
                addRisk(RISK.WIN_SHIFT_S, 'Win+Shift+S Snipping Tool detected');
                return;
            }
            // Ctrl+P (Print)
            if (ctrl && key === 'p') { e.preventDefault(); showShield(); clearClipboard(); addRisk(RISK.CTRL_P, 'Ctrl+P (Print)'); return; }
            // Ctrl+C (Copy)
            if (ctrl && key === 'c') { e.preventDefault(); showShield(); clearClipboard(); addRisk(RISK.CTRL_C, 'Ctrl+C (Copy)'); return; }
            // Ctrl+A (Select All)
            if (ctrl && key === 'a') { e.preventDefault(); addRisk(RISK.CTRL_A, 'Ctrl+A (Select All)'); return; }
            // Ctrl+S (Save)
            if (ctrl && key === 's') { e.preventDefault(); showShield(); clearClipboard(); addRisk(RISK.CTRL_S, 'Ctrl+S (Save)'); return; }
            // Ctrl+U (View Source)
            if (ctrl && key === 'u') { e.preventDefault(); addRisk(RISK.CTRL_U, 'Ctrl+U (View Source)'); return; }
            // F12 (DevTools)
            if (e.key === 'F12') { e.preventDefault(); showShield(); addRisk(RISK.DEVTOOLS, 'F12 DevTools'); return; }
            // Ctrl+Shift+I/J/C (DevTools)
            if (ctrl && e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) {
                e.preventDefault(); showShield(); addRisk(RISK.DEVTOOLS, 'DevTools Inspect'); return;
            }
        };

        const onKeyUp = (e) => {
            // Hide shield if user just pressed Shift/Alt/Meta without triggering shortcut/blur
            if ((e.key === 'Meta' || e.key === 'Shift' || e.key === 'Alt') && !countdownRef.current) {
                hideShield();
            }
        };

        // ── Window blur — Snipping Tool causes blur immediately when overlay opens ──
        const onBlur = () => {
            // Always show black shield INSTANTLY via DOM ref
            showShield();
            clearClipboard();
            // Trigger immediate security violation & logout
            addRisk(100, 'Screenshot Tool / Window Focus Lost');
        };

        // Window regains focus — hide shield
        const onFocus = () => hideShield();

        // Tab hidden (screen capture tools may trigger this)
        const onVisibility = () => {
            if (document.hidden) {
                showShield();
                addRisk(RISK.BLUR, 'Tab hidden / screen capture detected');
            }
        };

        // Right-click blocked
        const onContextMenu = (e) => {
            e.preventDefault();
            addRisk(RISK.RIGHT_CLICK, 'Right-click attempt');
        };

        // Drag blocked
        const onDragStart = (e) => {
            e.preventDefault();
            addRisk(RISK.DRAG, 'Drag attempt');
        };

        // Select all text blocked
        const onSelectStart = (e) => { e.preventDefault(); };

        // DevTools panel size detection (every 1s)
        const devToolsInterval = setInterval(() => {
            const wDiff = window.outerWidth  - window.innerWidth;
            const hDiff = window.outerHeight - window.innerHeight;
            if (wDiff > 160 || hDiff > 160) {
                if (!devtoolsRef.current) {
                    devtoolsRef.current = true;
                    addRisk(RISK.DEVTOOLS, 'DevTools panel opened');
                }
            } else {
                devtoolsRef.current = false;
            }
        }, 1000);

        // Register all listeners
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('blur', onBlur);
        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', onVisibility);
        document.addEventListener('contextmenu', onContextMenu);
        document.addEventListener('dragstart', onDragStart);
        document.addEventListener('selectstart', onSelectStart);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('blur', onBlur);
            window.removeEventListener('focus', onFocus);
            document.removeEventListener('visibilitychange', onVisibility);
            document.removeEventListener('contextmenu', onContextMenu);
            document.removeEventListener('dragstart', onDragStart);
            document.removeEventListener('selectstart', onSelectStart);
            clearInterval(devToolsInterval);
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, []);
    // ─────────────────────────────────────────────────────────────────────────

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

            if (docErr || !doc) throw new Error('Document not found in database.');
            setDocName(doc.name);

            let hasAccess = false;
            if (session.role === 'super_admin' || (doc.uploaded_by === session.id && !doc.creator_revoked)) {
                hasAccess = true;
            } else {
                const { data: groups } = await supabase
                    .from('user_groups').select('group_id').eq('user_id', session.id);
                if (groups && groups.length > 0) {
                    const groupIds = groups.map(g => g.group_id).join(',');
                    let queryStr = `group_id=in.(${groupIds})&select=can_view,scope,document_id,folder_id`;
                    if (doc.folder_id) {
                        queryStr += `&or=(document_id.eq.${docId},folder_id.eq.${doc.folder_id})`;
                    } else {
                        queryStr += `&document_id=eq.${docId}`;
                    }
                    const res = await fetch(
                        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/permissions?${queryStr}`,
                        { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` } }
                    );
                    const perms       = await res.json();
                    const docPerms    = perms.filter(p => p.scope === 'document' && p.document_id === docId);
                    const folderPerms = perms.filter(p => p.scope === 'folder'   && p.folder_id   === doc.folder_id);
                    if (docPerms.length > 0)         { if (docPerms.some(p => p.can_view))    hasAccess = true; }
                    else if (folderPerms.length > 0) { if (folderPerms.some(p => p.can_view)) hasAccess = true; }
                }
            }

            if (!hasAccess) throw new Error('You do not have permission to view this document.');

            const { data: fileData, error: fileErr } = await supabase.storage
                .from('vault-files').download(doc.file_path);
            if (fileErr || !fileData) throw new Error('Encrypted file not found in storage bucket.');

            const encryptedText   = await fileData.text();
            const secret          = new fernet.Secret(doc.dek_ref);
            const token           = new fernet.Token({ token: encryptedText, secret, ttl: 0 });
            const decryptedBase64 = token.decode();

            const binaryString = atob(decryptedBase64);
            const bytes        = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

            const utf8Text = new TextDecoder('utf-8').decode(bytes);
            const fileExt  = doc.name.split('.').pop().toLowerCase();
            setDocPayload({ ext: fileExt, bytes, text: utf8Text });

            // Log document view
            const { error: logErr } = await supabase
                .from('document_access_logs')
                .insert({ user_id: session.id, document_id: docId, opened_at: new Date().toISOString() });
            if (logErr) console.error('[VIEW] Log failed:', logErr);

            setLoading(false);
        } catch (err) {
            console.error('View Error:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    const loadScript = (src) => new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src; s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
    });

    const appendWatermarkToElement = (element, info, ip) => {
        if (!element) return;
        element.style.position = 'relative';

        const overlay = document.createElement('div');
        overlay.className = 'page-watermark-overlay';
        overlay.style.position = 'absolute';
        overlay.style.inset = '0';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '10';
        overlay.style.overflow = 'hidden';

        const timeStr = new Date().toLocaleString('en-IN');
        const name = info?.name || 'CONFIDENTIAL';
        const email = info?.email || '';
        const sid = info?.sessionId || '';

        const mark = document.createElement('div');
        mark.style.position = 'absolute';
        mark.style.top = '50%';
        mark.style.left = '50%';
        mark.style.transform = 'translate(-50%, -50%) rotate(-30deg)';
        mark.style.opacity = '0.38';
        mark.style.whiteSpace = 'nowrap';
        mark.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        mark.style.fontSize = '22px';
        mark.style.lineHeight = '1.7';
        mark.style.color = '#334155';
        mark.style.textShadow = '0 0 3px rgba(255,255,255,0.95)';
        mark.style.userSelect = 'none';
        mark.style.webkitUserSelect = 'none';
        mark.style.textAlign = 'center';

        mark.innerHTML = `
            <div style="font-weight: 900; font-size: 28px; color: #0f172a; margin-bottom: 4px; letter-spacing: 0.5px;">${name}</div>
            <div>${email}</div>
            <div>IP: ${ip}</div>
            <div>${timeStr}</div>
            <div>SID: ${sid}</div>
        `;
        overlay.appendChild(mark);
        element.appendChild(overlay);
    };

    const renderDocument = async (ext, bytes, utf8Text) => {
        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = '';
        try {
            if (['xlsx', 'xls', 'csv'].includes(ext)) {
                if (!window.luckysheet) {
                    await loadScript('https://cdn.jsdelivr.net/npm/luckysheet/dist/plugins/js/plugin.js');
                    await loadScript('https://cdn.jsdelivr.net/npm/luckysheet/dist/luckysheet.umd.js');
                    await loadScript('https://cdn.jsdelivr.net/npm/luckyexcel/dist/luckyexcel.umd.js');
                }
                container.innerHTML = '<div id="luckysheet-container" style="width:100%;height:100%;position:absolute;top:0;left:0;"></div>';
                const opts = {
                    container: 'luckysheet-container', lang: 'en', showinfobar: false,
                    showtoolbar: false, showsheetbar: true, showstatisticBar: true,
                    allowEdit: false, enableAddRow: false, enableAddCol: false, sheetFormulaBar: false,
                };
                if (ext === 'csv') {
                    const rows = utf8Text.split(/\r?\n/).filter(r => r.length > 0);
                    const data = rows.map(row => row.split(',').map(val => ({ v: val, m: val })));
                    window.luckysheet.create({ ...opts, data: [{ name: 'CSV Data', status: 1, data }] });
                } else {
                    window.LuckyExcel.transformExcelToLucky(new File([bytes], 'file.xlsx'), (json) => {
                        window.luckysheet.create({ ...opts, data: json.sheets, title: docName });
                    });
                }
                setTimeout(() => {
                    const luckysheetBox = container.querySelector('#luckysheet-container');
                    if (luckysheetBox) appendWatermarkToElement(luckysheetBox, userInfoRef.current, clientIpRef.current);
                }, 500);
            } else if (ext === 'pdf') {
                if (!window['pdfjs-dist/build/pdf']) {
                    await loadScript('https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.min.js');
                }
                const pdfjsLib = window['pdfjs-dist/build/pdf'];
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page     = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1.5 });
                    const wrapper  = document.createElement('div');
                    wrapper.className  = 'pdf-page-wrapper shadow-lg mb-8 bg-white relative overflow-hidden';
                    wrapper.style.width  = viewport.width  + 'px';
                    wrapper.style.height = viewport.height + 'px';
                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width; canvas.height = viewport.height;
                    wrapper.appendChild(canvas);
                    container.appendChild(wrapper);
                    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
                    appendWatermarkToElement(wrapper, userInfoRef.current, clientIpRef.current);
                }
            } else if (['docx', 'doc'].includes(ext)) {
                if (!window.docx) {
                    await loadScript('https://unpkg.com/jszip/dist/jszip.min.js');
                    await loadScript('https://unpkg.com/docx-preview/dist/docx-preview.min.js');
                }
                const docContainer = document.createElement('div');
                docContainer.style.width = '100%';
                container.appendChild(docContainer);
                window.docx.renderAsync(bytes.buffer, docContainer, null, {
                    className: 'docx', inWrapper: true, ignoreWidth: false, ignoreHeight: false, breakPages: true,
                }).then(() => {
                    const sections = docContainer.querySelectorAll('section.docx');
                    sections.forEach(sec => {
                        appendWatermarkToElement(sec, userInfoRef.current, clientIpRef.current);
                    });
                }).catch(err => {
                    container.innerHTML = `<p style="color:red;">Error parsing DOCX: ${err.message}</p>`;
                });
            } else if (['txt', 'text'].includes(ext)) {
                const lines = utf8Text.split(/\r?\n/);
                const LPP   = 40;
                let html    = '';
                for (let i = 0; i < lines.length; i += LPP) {
                    html += `<div class="txt-page-wrapper relative overflow-hidden"><pre class="txt-view">${lines.slice(i, i + LPP).join('\n')}</pre></div>`;
                }
                container.innerHTML = html;
                const txtPages = container.querySelectorAll('.txt-page-wrapper');
                txtPages.forEach(p => {
                    appendWatermarkToElement(p, userInfoRef.current, clientIpRef.current);
                });
            } else {
                container.innerHTML = '<div class="text-white text-center mt-20 font-bold text-xl">Unsupported Format</div>';
            }
        } catch (e) {
            console.error(e);
            setError('Rendering Error: ' + e.message);
        }
    };

    // ── Loading / Error screens ───────────────────────────────────────────────
    if (loading) return (
        <div className="h-screen w-screen bg-[#1a1a1a] flex items-center justify-center">
            <FaSpinner className="animate-spin text-4xl text-brand" />
        </div>
    );

    if (error) return (
        <div className="h-screen w-screen bg-slate-900 flex items-center justify-center">
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-6 rounded-xl max-w-md text-center">
                <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                <p className="text-sm">{error}</p>
                <button onClick={() => window.close()} className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                    Close Tab
                </button>
            </div>
        </div>
    );

    return (
        <div
            className="min-h-screen bg-[#1a1a1a] flex flex-col"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
            {/* ── CSS ──────────────────────────────────────────────────────── */}
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://cdn.jsdelivr.net/npm/luckysheet/dist/plugins/css/pluginsCss.css');
                @import url('https://cdn.jsdelivr.net/npm/luckysheet/dist/plugins/plugins.css');
                @import url('https://cdn.jsdelivr.net/npm/luckysheet/dist/css/luckysheet.css');
                * { user-select: none !important; -webkit-user-select: none !important; }
                body { margin: 0; padding: 0; background-color: #1a1a1a; }
                .docx-wrapper { background: transparent !important; padding: 0 !important; display: flex; flex-direction: column; align-items: center; width: 100%; }
                .docx-wrapper > section.docx { background: #ffffff !important; box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important; margin-bottom: 30px !important; min-height: 297mm !important; width: 210mm !important; position: relative !important; }
                .txt-page-wrapper { background: #fff !important; width: 210mm; min-height: 297mm; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); padding: 25mm; box-sizing: border-box; position: relative !important; }
                .txt-view { white-space: pre-wrap; font-family: monospace; font-size: 14px; margin: 0; word-wrap: break-word; color: #000 !important; width: 100%; }
            ` }} />

            {/* ── BLACK SHIELD — always in DOM, toggled synchronously via DOM ref ── */}
            {/* This div is shown INSTANTLY on blur — no React re-render delay      */}
            <div
                ref={shieldDivRef}
                style={{
                    display: 'none',
                    position: 'fixed', inset: 0, zIndex: 99990,
                    background: '#000000',
                    alignItems: 'center', justifyContent: 'center',
                }}
            >
                {!violated && (
                    <p style={{ color: '#1f2937', fontSize: 13, fontFamily: 'system-ui', margin: 0 }}>
                        Secure View paused — return to this window to continue.
                    </p>
                )}
            </div>

            {/* ── VIOLATION OVERLAY — countdown + logout ───────────────────── */}
            {violated && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 99999,
                    background: 'rgba(0,0,0,0.97)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 20,
                }}>
                    <div style={{ fontSize: 64 }}>🚫</div>
                    <h1 style={{
                        color: '#ef4444', fontSize: 26, fontWeight: 900,
                        margin: 0, fontFamily: 'system-ui', textAlign: 'center',
                    }}>
                        Security Violation Detected
                    </h1>
                    <p style={{
                        color: '#fca5a5', fontSize: 14, maxWidth: 420,
                        textAlign: 'center', lineHeight: 1.8, margin: 0, fontFamily: 'system-ui',
                    }}>
                        <strong>{violationMsg}</strong><br />
                        This activity has been recorded and reported.<br />
                        Secure View has been terminated.
                    </p>
                    <div style={{
                        width: 84, height: 84, borderRadius: '50%',
                        border: '3px solid #ef4444', background: '#7f1d1d',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span style={{ color: '#fca5a5', fontSize: 10, fontFamily: 'system-ui', fontWeight: 700, letterSpacing: 1 }}>
                            LOGOUT IN
                        </span>
                        <span style={{ color: '#ef4444', fontSize: 34, fontWeight: 900, fontFamily: 'system-ui', lineHeight: 1 }}>
                            {countdown}
                        </span>
                    </div>
                    <p style={{ color: '#4b5563', fontSize: 12, fontFamily: 'system-ui', margin: 0 }}>
                        Risk Score: {riskScore} / {LOGOUT_THRESHOLD}
                    </p>
                </div>
            )}

            {/* ── DYNAMIC BACKGROUND WATERMARK GRID ────────────────────────── */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 50, pointerEvents: 'none', overflow: 'hidden' }}>
                {Array.from({ length: 6 }).map((_, row) =>
                    Array.from({ length: 5 }).map((__, col) => (
                        <div
                            key={`${row}-${col}`}
                            style={{
                                position: 'absolute',
                                top:  `${row * 220 + 30}px`,
                                left: `${col * 280 - 40}px`,
                                transform: 'rotate(-30deg)',
                                opacity: 0.15,
                                whiteSpace: 'nowrap',
                                fontFamily: 'system-ui, sans-serif',
                                fontSize: 12,
                                color: '#ffffff',
                                lineHeight: 1.6,
                                userSelect: 'none',
                                textAlign: 'center',
                            }}
                        >
                            <div style={{ fontWeight: 700 }}>{userInfo.name || 'CONFIDENTIAL'}</div>
                            <div>{userInfo.email}</div>
                            <div>IP: {clientIp}</div>
                            <div>{new Date().toLocaleString('en-IN')}</div>
                            <div>SID: {userInfo.sessionId}</div>
                        </div>
                    ))
                )}
            </div>

            {/* ── TOP TOOLBAR ──────────────────────────────────────────────── */}
            <div
                className="h-[60px] bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 sticky top-0"
                style={{ zIndex: 200 }}
            >
                <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-brand text-white text-[11px] font-bold rounded">SECURE VIEW</span>
                    <h1 className="text-slate-100 font-semibold text-[15px]">{docName}</h1>
                </div>
                {/* Live risk bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 80, height: 6, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', borderRadius: 4, transition: 'width 0.3s, background 0.3s',
                            background: riskScore < 40 ? '#22c55e' : riskScore < 70 ? '#f59e0b' : '#ef4444',
                            width: `${Math.min(riskScore, 100)}%`,
                        }} />
                    </div>
                    <span style={{ color: '#64748b', fontSize: 10, fontFamily: 'system-ui', letterSpacing: 1 }}>RISK</span>
                </div>
            </div>

            {/* ── DOCUMENT CONTAINER ───────────────────────────────────────── */}
            <div
                className="flex-1 w-full relative overflow-auto flex flex-col items-center py-10"
                ref={containerRef}
                onCopy={e => e.preventDefault()}
                onCut={e => e.preventDefault()}
                onPaste={e => e.preventDefault()}
                onDragStart={e => e.preventDefault()}
            />
        </div>
    );
}
