"use client";

import React, { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import fernet from 'fernet';
import { FaEye, FaEdit, FaUpload, FaShieldAlt, FaDownload, FaTrash } from 'react-icons/fa';

export default function DocumentsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center w-full h-full bg-[#FAFBFD]"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" /></div>}>
            <UnifiedWorkspace />
        </Suspense>
    );
}

function UnifiedWorkspace() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentView = searchParams.get('view') || 'files';
    const [session, setSession] = useState(null);

    // Core Data
    const [files, setFiles] = useState([]);
    const [mergedPerms, setMergedPerms] = useState({});
    const [globalFolderPerms, setGlobalFolderPerms] = useState({ can_create: false, can_merge: false, can_delete: false });

    // UI State
    const [loading, setLoading] = useState(true);
    const [currentFolderId, setCurrentFolderId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [deletedIds, setDeletedIds] = useState(new Set());
    const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
    const [downloadedIds, setDownloadedIds] = useState(new Set());
    const [downloading, setDownloading] = useState({});

    const formatBytes = (bytes) => {
        if (typeof bytes !== 'number' || Number.isNaN(bytes)) return '--';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    };

    const sortItemsByIndex = (a, b) => {
        const aIndex = Number.isFinite(+a.index) ? +a.index : 999999;
        const bIndex = Number.isFinite(+b.index) ? +b.index : 999999;
        if (aIndex !== bIndex) return aIndex - bIndex;
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
    };

    // Dropdowns & Modals
    const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPermDeleteModalOpen, setIsPermDeleteModalOpen] = useState(false);
    const [uploadQueue, setUploadQueue] = useState([]);

    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [movingToFolderId, setMovingToFolderId] = useState(null);

    const fileInputRef = useRef(null);
    const folderInputRef = useRef(null);

    // ── SESSION ──────────────────────────────────────────────────────────────
    useEffect(() => {
        const raw = localStorage.getItem('vdr_session');
        if (!raw) { router.push('/login'); return; }
        setSession(JSON.parse(raw));
    }, [router]);

    // ── SMART FETCH (ABAC ENGINE) ────────────────────────────────────────────
    useEffect(() => {
        if (!session) return;
        (async () => {
            setLoading(true);
            try {
                const isGodMode = session.role === 'super_admin';

                // 🔥 Declare BOTH variables up here so the whole function can access them!
                let myPerms = {};
                let globalTemp = { can_create: false, can_merge: false, can_delete: false };

                if (!isGodMode) {
                    const { data: myGroups } = await supabase.from('user_groups').select('group_id').eq('user_id', session.id);
                    const groupIds = (myGroups || []).map(g => g.group_id);

                    if (groupIds.length > 0) {
                        const { data: perms } = await supabase.from('permissions').select('*').in('group_id', groupIds);

                        (perms || []).forEach(p => {
                            // Catch the new global 'files' scope
                            if (p.scope === 'files') {
                                globalTemp.can_create = globalTemp.can_create || p.can_create_folder;
                                globalTemp.can_merge = globalTemp.can_merge || p.can_merge_folder;
                                globalTemp.can_delete = globalTemp.can_delete || p.can_delete_folder;
                            }

                            const key = p.scope === 'folder' ? `fol_${p.folder_id}` : `doc_${p.document_id}`;


                            if (!myPerms[key]) {
                                myPerms[key] = { ...p };
                            } else {
                                myPerms[key].can_view = myPerms[key].can_view || p.can_view;
                                myPerms[key].can_edit = myPerms[key].can_edit || p.can_edit;
                                myPerms[key].can_upload = myPerms[key].can_upload || p.can_upload;
                                myPerms[key].can_download_secure = myPerms[key].can_download_secure || p.can_download_secure;
                                myPerms[key].can_download_original = myPerms[key].can_download_original || p.can_download_original;
                                myPerms[key].can_delete = myPerms[key].can_delete || p.can_delete;
                            }
                        });
                    }
                }

                const [{ data: foldersData }, { data: docsData }, { data: usersData }] = await Promise.all([
                    supabase.from('folders').select('*').eq('company_id', session.company_id),
                    supabase.from('documents').select('*').eq('company_id', session.company_id),
                    supabase.from('users').select('id, name').eq('company_id', session.company_id),
                ]);

                const userMap = {};
                (usersData || []).forEach(u => userMap[u.id] = u.name);

                // Folders Map
                const mappedFolders = (foldersData || [])
                    .filter(f => isGodMode || myPerms[`fol_${f.id}`]?.can_view || session.role === 'admin' || session.role === 'subadmin')
                    .map(f => ({
                        id: f.id, parentId: f.parent_folder_id || null, index: f.index_number ? f.index_number.toString() : '1',
                        name: f.name, type: 'folder', size: '--', uploadedBy: userMap[f.created_by] || 'System',
                        dateCreated: new Date(f.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        is_bookmarked: f.is_bookmarked
                    }));

                // Docs Map
                // Docs Map
                const mappedDocs = (docsData || [])
                    .filter(doc => isGodMode || myPerms[`doc_${doc.id}`]?.can_view)
                    .map(doc => ({
                        id: doc.id, parentId: doc.folder_id || null, index: doc.index ? doc.index.toString().replace('.0', '') : '99',
                        name: doc.name, type: doc.name.split('.').pop().toLowerCase() || 'file',
                        size: formatBytes(doc.file_size_bytes),
                        uploadedBy: userMap[doc.uploaded_by] || 'System',
                        dateCreated: new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        deletedBy: userMap[doc.deleted_by] || 'Unknown',
                        deletedAt: doc.deleted_at ? new Date(doc.deleted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--',
                        is_bookmarked: doc.is_bookmarked, is_downloaded: doc.is_downloaded, is_deleted: doc.is_deleted,
                        file_path: doc.file_path,
                        original_file_path: doc.original_file_path, // 🔥 ADDED THIS
                        dek_ref: doc.dek_ref, mime_type: doc.mime_type
                    }));
                setMergedPerms(myPerms);
                setGlobalFolderPerms(globalTemp);
                setFiles([...mappedFolders, ...mappedDocs]);
                setBookmarkedIds(new Set([...(docsData || []).filter(d => d.is_bookmarked).map(d => d.id), ...(foldersData || []).filter(f => f.is_bookmarked).map(f => f.id)]));
                setDownloadedIds(new Set((docsData || []).filter(d => d.is_downloaded).map(d => d.id)));
                setDeletedIds(new Set((docsData || []).filter(d => d.is_deleted).map(d => d.id)));
            } catch (err) { console.error('Fetch error:', err); }
            finally { setLoading(false); }
        })();
    }, [session]);

    // ── PERMISSION HELPER ────────────────────────────────────────────────────
    const canUser = (action, item = null) => {
        if (!session) return false;
        if (session.role === 'super_admin') return true;

        if (!item) {
            if (action === 'can_upload' && currentFolderId === null) return session.role === 'admin' || session.role === 'subadmin';
            if (action === 'can_export') return session.role === 'admin' || session.role === 'subadmin';
            return false;
        }

        const key = item.type === 'folder' ? `fol_${item.id}` : `doc_${item.id}`;
        return mergedPerms[key]?.[action] === true;
    };

    // ── DERIVED STATE ────────────────────────────────────────────────────────
    const breadcrumbPath = useMemo(() => {
        const path = []; let id = currentFolderId;
        while (id !== null) {
            const folder = files.find(f => f.id === id);
            if (folder) { path.unshift(folder); id = folder.parentId; } else break;
        }
        return path;
    }, [currentFolderId, files]);

    const currentItems = useMemo(() => {
        if (currentView === 'trash') return files.filter(f => deletedIds.has(f.id));
        if (currentView === 'bookmarks') return files.filter(f => bookmarkedIds.has(f.id) && !deletedIds.has(f.id));
        if (currentView === 'downloads') return files.filter(f => downloadedIds.has(f.id) && !deletedIds.has(f.id));
        return files.filter(f => f.parentId === currentFolderId && !deletedIds.has(f.id));
    }, [currentFolderId, files, currentView, deletedIds, bookmarkedIds, downloadedIds]);

    const filteredItems = useMemo(() => {
        return currentItems
            .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort(sortItemsByIndex)
            .map((item, idx) => ({ ...item, displayIndex: (idx + 1).toString() }));
    }, [currentItems, searchQuery]);
    const selectedItemsArray = files.filter(f => selectedIds.has(f.id));

    // Nav Bar Logic Flags
    const selectionEnabled = !['bookmarks', 'downloads'].includes(currentView);

    // const canUploadHere = currentFolderId === null ? canUser('can_upload') : canUser('can_upload', { type: 'folder', id: currentFolderId });
    // const canEditSelected = selectedItemsArray.length > 0 && selectedItemsArray.every(item => canUser('can_edit', item));
    // const canDownloadSecureSelected = selectedItemsArray.length > 0 && selectedItemsArray.every(item => item.type !== 'folder' && canUser('can_download_secure', item));
    // const canDownloadOriginalSelected = selectedItemsArray.length > 0 && selectedItemsArray.every(item => item.type !== 'folder' && canUser('can_download_original', item));
    // const canDeleteSelected = selectedItemsArray.length > 0 && selectedItemsArray.every(item => canUser('can_delete', item)); // 🔥 Added Delete Flag

    const isGod = session?.role === 'super_admin' || session?.role === 'admin';

    const canUploadHere = currentFolderId === null ? canUser('can_upload') : canUser('can_upload', { type: 'folder', id: currentFolderId });
    const canCreateFolder = isGod || globalFolderPerms.can_create;
    const canMergeFolder = isGod || globalFolderPerms.can_merge;

    const canDownloadSecureSelected = selectedItemsArray.length > 0 && selectedItemsArray.every(item => item.type !== 'folder' && canUser('can_download_secure', item));
    const canDownloadOriginalSelected = selectedItemsArray.length > 0 && selectedItemsArray.every(item => item.type !== 'folder' && canUser('can_download_original', item));

    // Delete logic checks if it's a folder (needs folder_delete) or a file (needs file_delete)
    const canDeleteSelected = selectedItemsArray.length > 0 && selectedItemsArray.every(item => {
        if (item.type === 'folder') return isGod || globalFolderPerms.can_delete;
        return canUser('can_delete', item);
    });

    // ── HANDLERS ─────────────────────────────────────────────────────────────
    const handleToggleSelect = (id, e) => {
        e.stopPropagation();
        setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
    };

    const handleSelectAll = () => setSelectedIds(prev => prev.size === filteredItems.length ? new Set() : new Set(filteredItems.map(f => f.id)));

    const handleToggleBookmark = async (item, e) => {
        e.stopPropagation();
        try {
            const isBookmarked = bookmarkedIds.has(item.id);
            const table = item.type === 'folder' ? 'folders' : 'documents';
            await supabase.from(table).update({ is_bookmarked: !isBookmarked }).eq('id', item.id);
            setBookmarkedIds(prev => {
                const n = new Set(prev);
                if (isBookmarked) n.delete(item.id);
                else n.add(item.id);
                return n;
            });
        } catch (err) { console.error('Bookmark toggle failed', err); }
    };

    const handleItemClick = (item) => {
        if (item.type === 'folder') {
            setCurrentFolderId(item.id); setSelectedIds(new Set()); setSearchQuery('');
        } else {
            handleToggleSelect(item.id, { stopPropagation: () => { } });
        }
    };

    // ... (File Upload & Fernet Encryption Logic remains exactly the same) ...


    const handleFileChange = async (e) => {
        const chosenFiles = Array.from(e.target.files);
        if (chosenFiles.length === 0 || !session) return;

        setUploadQueue(chosenFiles.map((f, i) => ({
            id: `up-${Date.now()}-${i}`, name: f.name, progress: 0, status: 'uploading',
            size: formatBytes(f.size)
        })));
        setIsUploadModalOpen(true);

        const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        for (let i = 0; i < chosenFiles.length; i++) {
            const file = chosenFiles[i];
            try {
                // 1. Define Dual Paths
                const secureStoragePath = `${session.company_id}/secure_${Date.now()}_${file.name}`;
                const originalStoragePath = `${session.company_id}/original_${Date.now()}_${file.name}`;

                // 2. Upload RAW Original to new bucket
                const { error: origErr } = await supabase.storage.from('original-files').upload(originalStoragePath, file);
                if (origErr) throw new Error("Original Upload Failed: " + origErr.message);

                // 3. Encrypt and Upload SECURE to vault-files
                const randomBytes = window.crypto.getRandomValues(new Uint8Array(32));
                const fernetKey = btoa(String.fromCharCode(...randomBytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
                const base64Data = await readFileAsBase64(file);
                const secret = new fernet.Secret(fernetKey);
                const token = new fernet.Token({ secret: secret });
                const encryptedString = token.encode(base64Data);

                const encryptedBlob = new Blob([encryptedString], { type: 'text/plain' });
                const { error: secureErr } = await supabase.storage.from('vault-files').upload(secureStoragePath, encryptedBlob, { contentType: 'text/plain' });
                if (secureErr) throw new Error("Secure Upload Failed: " + secureErr.message);

                // 4. Hit API Route (Saves standard metadata)
                const res = await fetch('/api/documents/upload', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        company_id: session.company_id, folder_id: currentFolderId, uploaded_by: session.id,
                        name: file.name, file_path: secureStoragePath, mime_type: file.type || 'application/octet-stream',
                        file_size_bytes: file.size, dek_ref: fernetKey, index: '99', security: 'Fernet Encrypted'
                    })
                });

                if (!res.ok) throw new Error('DB API Sync failed');
                const { id: docId } = await res.json();

                // 5. Explicitly update the original path in DB just in case the API doesn't know about it yet
                await supabase.from('documents').update({ original_file_path: originalStoragePath }).eq('id', docId);

                // 6. Update UI
                setUploadQueue(prev => prev.map((it, idx) => idx === i ? { ...it, progress: 100, status: 'completed' } : it));
                setFiles(prev => [...prev, {
                    id: docId, parentId: currentFolderId, index: '99', name: file.name,
                    type: file.name.split('.').pop().toLowerCase() || 'file',
                    size: formatBytes(file.size),
                    uploadedBy: session.name, dateCreated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    file_path: secureStoragePath, original_file_path: originalStoragePath, dek_ref: fernetKey, mime_type: file.type
                }]);
            } catch (err) {
                console.error('Upload failed:', err);
                alert("Upload error for " + file.name + ": " + err.message);
                setUploadQueue(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'error' } : it));
            }
        }
        setTimeout(() => { setUploadQueue([]); setIsUploadModalOpen(false); e.target.value = ''; }, 1500);
    };

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;
        try {
            const peers = files.filter(f => f.parentId === currentFolderId && !deletedIds.has(f.id));
            const newIndex = currentFolderId === null ? (peers.reduce((m, it) => Math.max(m, parseInt(it.index) || 0), 0) + 1).toString() : '99';

            const { data: dbFolder, error } = await supabase.from('folders').insert({
                company_id: session.company_id, parent_folder_id: currentFolderId,
                name: newFolderName.trim(), index_number: parseInt(newIndex) || 1, created_by: session.id,
            }).select().single();

            if (error) throw error; // Fails loudly if RLS blocks it!

            setFiles(prev => [...prev, {
                id: dbFolder.id, parentId: dbFolder.parent_folder_id || null, index: newIndex.toString(),
                name: dbFolder.name, type: 'folder', size: '--', uploadedBy: session.name,
                dateCreated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            }]);
            setNewFolderName(''); setIsNewFolderOpen(false);
        } catch (err) {
            alert("Failed to create folder: " + err.message);
        }
    };
    //const handleCreateFolder = async (e) => { /* Your Folder create logic */ };

    // const executeDownload = async (type) => {
    //     setIsDownloadMenuOpen(false);
    //     for (let id of selectedIds) {
    //         const file = files.find(f => f.id === id);
    //         if (!file || file.type === 'folder') continue;

    //         setDownloading(prev => ({ ...prev, [file.id]: true }));
    //         try {
    //             if (type === 'secure') {
    //                 // Generates the .vdr keycard for your Electron App
    //                 const blob = new Blob([file.id], { type: 'text/plain' });
    //                 const url = URL.createObjectURL(blob);
    //                 const a = document.createElement('a'); a.href = url; a.download = `${file.name}.vdr`;
    //                 document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    //                 await supabase.from('documents').update({ is_downloaded: true }).eq('id', file.id);
    //             }
    //             else if (type === 'original') {
    //                 // NEW FAST PATH: Direct Original Bucket Download!
    //                 if (file.original_file_path) {
    //                     const { data, error } = await supabase.storage.from('original-files').download(file.original_file_path);
    //                     if (error) throw error;
    //                     const url = URL.createObjectURL(data);
    //                     const a = document.createElement('a'); a.href = url; a.download = file.name;
    //                     document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    //                 } else {
    //                     // FALLBACK: For old files uploaded before we added the dual-bucket feature
    //                     const { data, error } = await supabase.storage.from('vault-files').download(file.file_path);
    //                     if (error) throw error;
    //                     const text = await data.text();
    //                     const secret = new fernet.Secret(file.dek_ref);
    //                     const token = new fernet.Token({ secret: secret, token: text, ttl: 0 });
    //                     const decryptedBase64 = token.decode();
    //                     const byteCharacters = atob(decryptedBase64);
    //                     const byteNumbers = new Array(byteCharacters.length);
    //                     for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
    //                     const blob = new Blob([new Uint8Array(byteNumbers)], { type: file.mime_type || 'application/octet-stream' });
    //                     const url = URL.createObjectURL(blob);
    //                     const a = document.createElement('a'); a.href = url; a.download = file.name;
    //                     document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    //                 }
    //             }
    //         } catch (err) { alert(`Download failed for ${file.name}: ${err.message}`); }
    //         finally { setDownloading(prev => { const n = { ...prev }; delete n[file.id]; return n; }); }
    //     }
    // };


    const executeDownload = async (type) => {
        setIsDownloadMenuOpen(false);
        for (let id of selectedIds) {
            const file = files.find(f => f.id === id);
            if (!file || file.type === 'folder') continue;

            setDownloading(prev => ({ ...prev, [file.id]: true }));
            try {
                if (type === 'secure') {
                    // Generates the .vdr keycard for your Electron App
                    const blob = new Blob([file.id], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = `${file.name}.vdr`;
                    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
                    await supabase.from('documents').update({ is_downloaded: true }).eq('id', file.id);
                }
                else if (type === 'original') {
                    // 🔥 NEW FAST PATH: Direct Original Bucket Download!
                    if (file.original_file_path) {
                        const { data, error } = await supabase.storage.from('original-files').download(file.original_file_path);
                        if (error) throw error;
                        const url = URL.createObjectURL(data);
                        const a = document.createElement('a'); a.href = url; a.download = file.name;
                        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
                    } else {
                        // FALLBACK: For old files uploaded before we added the dual-bucket feature
                        const { data, error } = await supabase.storage.from('vault-files').download(file.file_path);
                        if (error) throw error;
                        const text = await data.text();
                        const secret = new fernet.Secret(file.dek_ref);
                        const token = new fernet.Token({ secret: secret, token: text, ttl: 0 });
                        const decryptedBase64 = token.decode();
                        const byteCharacters = atob(decryptedBase64);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
                        const blob = new Blob([new Uint8Array(byteNumbers)], { type: file.mime_type || 'application/octet-stream' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a'); a.href = url; a.download = file.name;
                        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
                    }
                }
            } catch (err) { alert(`Download failed for ${file.name}: ${err.message}`); }
            finally { setDownloading(prev => { const n = { ...prev }; delete n[file.id]; return n; }); }
        }
    };

    const handleExport = () => { /* Your CSV logic */ };
    const executeMoveToFolder = async () => {
        try {
            const docIds = [...selectedIds].filter(id => files.find(f => f.id === id)?.type !== 'folder');
            const folderIds = [...selectedIds].filter(id => files.find(f => f.id === id)?.type === 'folder');

            // Move documents
            if (docIds.length > 0) await supabase.from('documents').update({ folder_id: movingToFolderId }).in('id', docIds);
            // Move folders (update parent_folder_id)
            if (folderIds.length > 0) await supabase.from('folders').update({ parent_folder_id: movingToFolderId }).in('id', folderIds);

            setFiles(prev => prev.map(f => selectedIds.has(f.id) ? { ...f, parentId: movingToFolderId } : f));
            setSelectedIds(new Set());
            setIsMoveModalOpen(false);
        } catch (err) { alert('Move failed: ' + err.message); }
    };
    // const executeMoveToFolder = async () => {
    //     try {
    //         const docIds = [...selectedIds].filter(id => files.find(f => f.id === id)?.type !== 'folder');
    //         const folderIds = [...selectedIds].filter(id => files.find(f => f.id === id)?.type === 'folder');

    //         // Move documents
    //         if (docIds.length > 0) {
    //             const { error } = await supabase.from('documents').update({ folder_id: movingToFolderId }).in('id', docIds);
    //             if (error) throw new Error("Doc Move Error: " + error.message);
    //         }
    //         // Move folders
    //         if (folderIds.length > 0) {
    //             const { error } = await supabase.from('folders').update({ parent_folder_id: movingToFolderId }).in('id', folderIds);
    //             if (error) throw new Error("Folder Move Error: " + error.message);
    //         }

    //         setFiles(prev => prev.map(f => selectedIds.has(f.id) ? { ...f, parentId: movingToFolderId } : f));
    //         setSelectedIds(new Set());
    //         setIsMoveModalOpen(false);
    //     } catch (err) { alert('Move failed: ' + err.message); }
    // };

    const executeSoftDelete = async () => {
        try {
            const docIds = [...selectedIds].filter(id => files.find(f => f.id === id)?.type !== 'folder');
            const folderIds = [...selectedIds].filter(id => files.find(f => f.id === id)?.type === 'folder');

            if (docIds.length > 0) {
                await supabase.from('documents').update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: session.id }).in('id', docIds);
            }

            if (folderIds.length > 0) {
                await supabase.from('folders').update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: session.id }).in('id', folderIds);
            }

            // Add to trash tracker
            const allDeleted = [...docIds, ...folderIds];
            setDeletedIds(prev => { const n = new Set(prev); allDeleted.forEach(id => n.add(id)); return n; });

            // Update UI: Keep them in the files array, just mark them as deleted (don't filter them out!)
            setFiles(prev => prev.map(f => selectedIds.has(f.id) ? { ...f, deletedBy: session.name, deletedAt: new Date().toLocaleDateString() } : f));

            setSelectedIds(new Set());
            setIsDeleteModalOpen(false);
        } catch (err) {
            alert('Trash failed: ' + err.message);
            console.error('Trash failed', err);
        }
    };

    const executeRecover = async () => {
        try {
            const docIds = [...selectedIds].filter(id => files.find(f => f.id === id)?.type !== 'folder');
            const folderIds = [...selectedIds].filter(id => files.find(f => f.id === id)?.type === 'folder');

            if (docIds.length > 0) await supabase.from('documents').update({ is_deleted: false, deleted_at: null, deleted_by: null }).in('id', docIds);
            if (folderIds.length > 0) await supabase.from('folders').update({ is_deleted: false, deleted_at: null, deleted_by: null }).in('id', folderIds);

            setDeletedIds(prev => { const n = new Set(prev);[...docIds, ...folderIds].forEach(id => n.delete(id)); return n; });
            setSelectedIds(new Set());
        } catch (err) { alert('Recover failed: ' + err.message); }
    };

    const executePermanentDelete = async () => {
        try {
            const docIds = [...selectedIds].filter(id => files.find(f => f.id === id)?.type !== 'folder');
            const folderIds = [...selectedIds].filter(id => files.find(f => f.id === id)?.type === 'folder');

            if (docIds.length > 0) await supabase.from('documents').delete().in('id', docIds);
            if (folderIds.length > 0) await supabase.from('folders').delete().in('id', folderIds);

            setFiles(prev => prev.filter(f => !selectedIds.has(f.id)));
            setDeletedIds(prev => { const n = new Set(prev);[...docIds, ...folderIds].forEach(id => n.delete(id)); return n; });

            setSelectedIds(new Set());
            setIsPermDeleteModalOpen(false);
        } catch (err) { alert('Permanent delete failed: ' + err.message); }
    };
    // const executeSoftDelete = async () => {
    //     try {
    //         const docIds = [...selectedIds].filter(id => files.find(f => f.id === id)?.type !== 'folder');
    //         if (docIds.length > 0) {
    //             await supabase.from('documents').update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: session.id }).in('id', docIds);
    //             setDeletedIds(prev => { const n = new Set(prev); docIds.forEach(id => n.add(id)); return n; });
    //             setFiles(prev => prev.map(f => docIds.includes(f.id) ? { ...f, deletedBy: session.name, deletedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } : f));
    //         }
    //         setSelectedIds(new Set());
    //         setIsDeleteModalOpen(false);
    //     } catch (err) { console.error('Trash failed', err); }
    // };

    // const executeRecover = async () => {
    //     try {
    //         const docIds = [...selectedIds].filter(id => files.find(f => f.id === id)?.type !== 'folder');
    //         if (docIds.length > 0) {
    //             await supabase.from('documents').update({ is_deleted: false, deleted_at: null, deleted_by: null }).in('id', docIds);
    //             setDeletedIds(prev => { const n = new Set(prev); docIds.forEach(id => n.delete(id)); return n; });
    //         }
    //         setSelectedIds(new Set());
    //     } catch (err) { console.error('Recover failed', err); }
    // };

    // const executePermanentDelete = async () => {
    //     try {
    //         const docIds = [...selectedIds].filter(id => files.find(f => f.id === id)?.type !== 'folder');
    //         if (docIds.length > 0) {
    //             await supabase.from('documents').delete().in('id', docIds);
    //             setFiles(prev => prev.filter(f => !docIds.includes(f.id)));
    //             setDeletedIds(prev => { const n = new Set(prev); docIds.forEach(id => n.delete(id)); return n; });
    //         }
    //         setSelectedIds(new Set());
    //         setIsPermDeleteModalOpen(false);
    //     } catch (err) { console.error('Permanent delete failed', err); }
    // };

    if (loading) return <div className="flex items-center justify-center w-full h-full bg-[#FAFBFD]"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" /></div>;

    return (
        <div className="flex w-full h-full bg-[#F8F9FB] font-sans">

            {/* Hidden Inputs */}
            <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* ── TOP ACTION BAR (Exact Firmata Match) ── */}
                <div className="flex items-center px-6 py-4 bg-white border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        {/* 1. UPLOAD BUTTON */}
                        {!['trash', 'bookmarks', 'downloads'].includes(currentView) && canUploadHere && (
                            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                Upload
                            </button>
                        )}

                        {/* 2. ADD FOLDER BUTTON (Now independent!) */}
                        {!['trash', 'bookmarks', 'downloads'].includes(currentView) && canCreateFolder && (
                            <button onClick={() => setIsNewFolderOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                                Add Folder
                            </button>
                        )}
                        {/* {!['trash', 'bookmarks', 'downloads'].includes(currentView) && canUploadHere && (
                            <>
                                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                    Upload
                                </button>

                               
                                <button onClick={() => setIsNewFolderOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                                    Add Folder
                                </button>
                            </>
                        )} */}

                        {/* Download Dropdown Logic */}
                        {!['trash', 'bookmarks', 'downloads'].includes(currentView) && (canDownloadSecureSelected || canDownloadOriginalSelected) && (
                            <div className="relative">
                                <button onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                    Download
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform ${isDownloadMenuOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9" /></svg>
                                </button>

                                {isDownloadMenuOpen && (
                                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
                                        {canDownloadSecureSelected && (
                                            <button onClick={() => executeDownload('secure')} className="w-full text-left px-4 py-2 text-[12px] font-bold text-slate-700 hover:bg-slate-50">Download Secure (.vdr)</button>
                                        )}
                                        {canDownloadOriginalSelected && (
                                            <button onClick={() => executeDownload('original')} className="w-full text-left px-4 py-2 text-[12px] font-bold text-slate-700 hover:bg-slate-50">Download Original</button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {!['trash', 'bookmarks', 'downloads'].includes(currentView) && canUser('can_export') && (
                            <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                Export
                            </button>
                        )}

                        {/* {currentView !== 'trash' && canEditSelected && selectedIds.size > 0 && (
                            <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                                Delete
                            </button>
                        )} */}
                        {/* 🔥 Switched from canEditSelected to canDeleteSelected */}
                        {currentView !== 'trash' && canDeleteSelected && selectedIds.size > 0 && (
                            <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                                Delete
                            </button>
                        )}
                        {currentView !== 'trash' && canMergeFolder && selectedIds.size > 0 && (
                            <button onClick={() => setIsMoveModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="5 9 2 12 5 15" /><polyline points="9 5 12 2 15 5" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="12" y1="2" x2="12" y2="22" /></svg>
                                Move Items
                            </button>
                        )}
                        {currentView === 'trash' && (
                            <>
                                <button disabled={selectedIds.size === 0} onClick={executeRecover} className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold rounded-lg transition-colors ${selectedIds.size === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                                    Recover
                                </button>
                                <button disabled={selectedIds.size === 0} onClick={() => setIsPermDeleteModalOpen(true)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold rounded-lg transition-colors ${selectedIds.size === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-rose-600 hover:bg-rose-50'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                                    Permanent Delete
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* ── BREADCRUMBS & LIST ── */}
                <div className="flex-1 flex flex-col p-6 overflow-hidden">
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <button onClick={() => setCurrentFolderId(null)} className={`text-[14px] font-black ${currentFolderId === null ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>home</button>
                        {breadcrumbPath.map(crumb => (
                            <React.Fragment key={crumb.id}>
                                <span className="text-slate-300 font-black">&gt;</span>
                                <button onClick={() => setCurrentFolderId(crumb.id)} className={`text-[14px] font-black ${currentFolderId === crumb.id ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>{crumb.name}</button>
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="flex-1 overflow-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white border-b border-slate-100">
                                <tr>
                                    {selectionEnabled ? (
                                        <th className="py-4 px-5 w-10">
                                            <input type="checkbox" checked={selectedIds.size === filteredItems.length && filteredItems.length > 0} onChange={handleSelectAll} className="w-4 h-4 rounded border-slate-300 accent-slate-900" />
                                        </th>
                                    ) : null}
                                    <th className="py-4 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center w-16">Index</th>
                                    <th className="py-4 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
                                    {currentView !== 'trash' && (
                                        <th className="py-4 px-2 w-8 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Star</th>
                                    )}
                                    {currentView === 'trash' ? (
                                        <>
                                            <th className="py-4 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Deleted By</th>
                                            <th className="py-4 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Deleted At</th>
                                        </>
                                    ) : (
                                        <th className="py-4 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Created At</th>
                                    )}
                                    <th className="py-4 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Size</th>
                                    {currentView !== 'trash' && (
                                        <th className="py-4 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Permission Details</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredItems.map(item => {
                                    const isChecked = selectedIds.has(item.id);
                                    const isFolder = item.type === 'folder';
                                    const isDL = downloading[item.id];

                                    return (
                                        <tr key={item.id} className={`group transition-colors ${selectionEnabled ? 'cursor-pointer' : ''} ${isChecked ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`} onClick={selectionEnabled ? () => handleItemClick(item) : undefined}>
                                            {selectionEnabled ? (
                                                <td className="py-4 px-5" onClick={e => e.stopPropagation()}>
                                                    <input type="checkbox" checked={isChecked} onChange={e => handleToggleSelect(item.id, e)} className="w-4 h-4 rounded border-slate-300 accent-slate-900" />
                                                </td>
                                            ) : null}
                                            <td className="py-4 px-3 text-center text-[12px] font-mono font-semibold text-slate-500">
                                                {item.displayIndex || '—'}
                                            </td>
                                            <td className="py-4 px-3">
                                                <div className="flex items-center gap-3">
                                                    {isFolder ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#fcd34d"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" /></svg>
                                                    ) : (
                                                        <div className="w-5 h-5 bg-slate-100 rounded text-[8px] font-black text-slate-500 flex items-center justify-center">{item.type.toUpperCase().slice(0, 3)}</div>
                                                    )}
                                                    <span className="text-[13px] font-semibold text-slate-800">{item.name}</span>
                                                    {isDL && <span className="ml-2 text-[10px] text-emerald-600 font-bold animate-pulse">Downloading...</span>}
                                                </div>
                                            </td>
                                            {currentView !== 'trash' && (
                                                <td className="py-4 px-2 text-center" onClick={e => handleToggleBookmark(item, e)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={bookmarkedIds.has(item.id) ? "#fbbf24" : "none"} stroke={bookmarkedIds.has(item.id) ? "#fbbf24" : "#cbd5e1"} strokeWidth="2.5" className="cursor-pointer transition-colors hover:stroke-amber-400 mx-auto">
                                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                    </svg>
                                                </td>
                                            )}
                                            {currentView === 'trash' ? (
                                                <>
                                                    <td className="py-4 px-3 text-[12px] font-medium text-slate-500">{item.deletedBy}</td>
                                                    <td className="py-4 px-3 text-[12px] font-medium text-slate-500">{item.deletedAt}</td>
                                                </>
                                            ) : (
                                                <td className="py-4 px-3 text-[12px] font-medium text-slate-500">{item.dateCreated}</td>
                                            )}
                                            <td className="py-4 px-3 text-[12px] font-medium text-slate-500">{item.size}</td>
                                            {currentView !== 'trash' && (
                                                <td className="py-4 px-3">
                                                    <div className="flex items-center gap-5">
                                                        {canUser('can_view', item) ? <FaEye className="text-slate-600 text-[15px]" title="View" /> : <FaEye className="text-slate-200 text-[15px]" title="No View Access" />}
                                                        {canUser('can_edit', item) ? <FaEdit className="text-slate-600 text-[15px]" title="Edit" /> : <FaEdit className="text-slate-200 text-[15px]" title="No Edit Access" />}
                                                        {item.type === 'folder' && (canUser('can_upload', item) ? <FaUpload className="text-slate-600 text-[15px]" title="Upload" /> : <FaUpload className="text-slate-200 text-[15px]" title="No Upload Access" />)}
                                                        {canUser('can_download_secure', item) ? <FaShieldAlt className="text-slate-600 text-[15px]" title="Download Secure" /> : <FaShieldAlt className="text-slate-200 text-[15px]" title="No Secure DL Access" />}
                                                        {canUser('can_download_original', item) ? <FaDownload className="text-slate-600 text-[15px]" title="Download Original" /> : <FaDownload className="text-slate-200 text-[15px]" title="No Original DL Access" />}
                                                        {canUser('can_delete', item) ? <FaTrash className="text-slate-600 text-[14px]" title="Delete" /> : <FaTrash className="text-slate-200 text-[14px]" title="No Delete Access" />}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isMoveModalOpen && (
                <Modal onClose={() => setIsMoveModalOpen(false)}>
                    <h3 className="text-[15px] font-black mb-4">Move {selectedIds.size} items to...</h3>
                    <div className="space-y-1 max-h-64 overflow-y-auto mb-4">
                        <button onClick={() => setMovingToFolderId(null)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[12.5px] font-semibold ${movingToFolderId === null ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-700'}`}>
                            Root Directory
                        </button>

                        {/* Only show folders we can move to (not deleted, not currently selected) */}
                        {files.filter(f => f.type === 'folder' && !deletedIds.has(f.id) && !selectedIds.has(f.id)).map(folder => (
                            <button key={folder.id} onClick={() => setMovingToFolderId(folder.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[12.5px] font-semibold ${movingToFolderId === folder.id ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-700'}`}>
                                <span className="truncate">{folder.name}</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsMoveModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 font-bold rounded-xl text-[13px]">Cancel</button>
                        <button onClick={executeMoveToFolder} className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-[13px]">Move Here</button>
                    </div>
                </Modal>
            )}


            {/* Modals */}
            {isPermDeleteModalOpen && (
                <Modal onClose={() => setIsPermDeleteModalOpen(false)}>
                    <h3 className="text-[16px] font-black text-slate-900 mb-2">Permanently Delete?</h3>
                    <p className="text-[13px] text-slate-500 mb-6">Are you sure you want to permanently delete these items? This action cannot be undone.</p>
                    <div className="flex gap-2">
                        <button onClick={() => setIsPermDeleteModalOpen(false)} className="flex-1 py-3 bg-slate-200 text-slate-700 cursor-pointer hover:bg-slate-300 font-bold rounded-xl text-[14px]">Cancel</button>
                        <button onClick={executePermanentDelete} className="flex-1 py-3 bg-rose-500 text-white cursor-pointer hover:bg-rose-600 font-bold rounded-xl text-[14px]">Delete</button>
                    </div>
                </Modal>
            )}

            {isDeleteModalOpen && (
                <Modal onClose={() => setIsDeleteModalOpen(false)}>
                    <h3 className="text-[16px] font-black text-slate-900 mb-2">Send to Trash?</h3>
                    <p className="text-[13px] text-slate-500 mb-6">These files will be moved to the Trash bin.</p>
                    <div className="flex gap-2">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-slate-200 text-slate-700 cursor-pointer hover:bg-slate-300 font-bold rounded-xl text-[14px]">Cancel</button>
                        <button onClick={executeSoftDelete} className="flex-1 py-3 bg-slate-800 text-white cursor-pointer hover:bg-slate-900 font-bold rounded-xl text-[14px]">Send to Trash</button>
                    </div>
                </Modal>
            )}

            {isNewFolderOpen && (
                <Modal onClose={() => setIsNewFolderOpen(false)}>
                    <h3 className="text-[16px] font-black mb-4">Create New Folder</h3>
                    <input type="text" placeholder="Folder name..." value={newFolderName} onChange={e => setNewFolderName(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl mb-4 focus:border-slate-400 focus:outline-none" />
                    <button onClick={handleCreateFolder} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl">Create</button>
                </Modal>
            )}

            {isUploadModalOpen && (
                <Modal onClose={() => setIsUploadModalOpen(false)}>
                    <h3 className="text-[16px] font-black text-slate-800 mb-5">Secure Upload</h3>
                    <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-3 p-10 border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100">
                        <span className="text-[13px] font-bold text-slate-700">Click to Browse Files</span>
                        <span className="text-[11px] text-slate-400">Files are AES-256 Encrypted on upload</span>
                    </div>
                    {uploadQueue.length > 0 && (
                        <div className="mt-4 space-y-2 max-h-48 overflow-auto">
                            {uploadQueue.map(item => (
                                <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-semibold text-slate-700 truncate">{item.name}</p>
                                    </div>
                                    {item.status === 'completed' ? <span className="text-emerald-500 text-xs font-bold">Done</span> : <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />}
                                </div>
                            ))}
                        </div>
                    )}
                </Modal>
            )}

        </div>
    );
}

function Modal({ children, onClose, maxWidth = 'max-w-lg' }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-[3px]" />
            <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} p-6 z-10`}>
                {children}
            </div>
        </div>
    );
}

// Subcomponent for Right Sidebar
function PermRow({ label, hasAccess }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-semibold text-slate-600">{label}</span>
            {hasAccess ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            )}
        </div>
    );
}


// "use client";

// import React, { useState, useMemo, useRef, useEffect, Suspense } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';
// import { supabase } from '@/utils/supabase/client';
// import fernet from 'fernet';

// export default function DocumentsPage() {
//     return (
//         <Suspense fallback={<div className="flex items-center justify-center w-full h-full bg-[#FAFBFD]"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" /></div>}>
//             <UnifiedWorkspace />
//         </Suspense>
//     );
// }

// function UnifiedWorkspace() {
//     const router = useRouter();
//     const searchParams = useSearchParams();
//     const currentView = searchParams.get('view') || 'files';
//     const [session, setSession] = useState(null);

//     // Core Data
//     const [files, setFiles] = useState([]);
//     const [mergedPerms, setMergedPerms] = useState({}); // Stores merged ABAC rules

//     // UI State
//     const [loading, setLoading] = useState(true);
//     const [currentFolderId, setCurrentFolderId] = useState(null);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [selectedIds, setSelectedIds] = useState(new Set());
//     const [deletedIds, setDeletedIds] = useState(new Set());
//     const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
//     const [downloadedIds, setDownloadedIds] = useState(new Set());
//     const [downloading, setDownloading] = useState({});

//     // Modals
//     const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//     const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
//     const [newFolderName, setNewFolderName] = useState('');
//     const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//     const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
//     const [movingToFolderId, setMovingToFolderId] = useState(null);
//     const [uploadQueue, setUploadQueue] = useState([]);

//     const fileInputRef = useRef(null);
//     const folderInputRef = useRef(null);

//     // ── SESSION ──────────────────────────────────────────────────────────────
//     useEffect(() => {
//         const raw = localStorage.getItem('vdr_session');
//         if (!raw) { router.push('/login'); return; }
//         setSession(JSON.parse(raw));
//     }, [router]);

//     // ── SMART FETCH (ABAC ENGINE) ────────────────────────────────────────────
//     useEffect(() => {
//         if (!session) return;
//         (async () => {
//             setLoading(true);
//             try {
//                 const isGodMode = session.role === 'super_admin';
//                 let myPerms = {};

//                 // If mortal, build the Merged Permission Object via User Groups
//                 if (!isGodMode) {
//                     const { data: myGroups } = await supabase.from('user_groups').select('group_id').eq('user_id', session.id);
//                     const groupIds = (myGroups || []).map(g => g.group_id);

//                     if (groupIds.length > 0) {
//                         const { data: perms } = await supabase.from('permissions').select('*').in('group_id', groupIds);
//                         (perms || []).forEach(p => {
//                             const key = p.scope === 'folder' ? `fol_${p.folder_id}` : `doc_${p.document_id}`;
//                             if (!myPerms[key]) {
//                                 myPerms[key] = { ...p };
//                             } else {
//                                 // Merge overlapping rules (Logical OR takes highest privilege)
//                                 myPerms[key].can_view = myPerms[key].can_view || p.can_view;
//                                 myPerms[key].can_edit = myPerms[key].can_edit || p.can_edit;
//                                 myPerms[key].can_upload = myPerms[key].can_upload || p.can_upload;
//                                 myPerms[key].can_download_secure = myPerms[key].can_download_secure || p.can_download_secure;
//                                 myPerms[key].can_download_original = myPerms[key].can_download_original || p.can_download_original;
//                             }
//                         });
//                     }
//                 }

//                 const [{ data: foldersData }, { data: docsData }, { data: usersData }] = await Promise.all([
//                     supabase.from('folders').select('*').eq('company_id', session.company_id),
//                     supabase.from('documents').select('*').eq('company_id', session.company_id),
//                     supabase.from('users').select('id, name').eq('company_id', session.company_id),
//                 ]);

//                 const userMap = {};
//                 (usersData || []).forEach(u => userMap[u.id] = u.name);

//                 // Map Folders (Always visible so users can navigate the structure)
//                 const mappedFolders = (foldersData || []).map(f => ({
//                     id: f.id, parentId: f.parent_folder_id || null, index: f.index_number ? f.index_number.toString() : '1',
//                     name: f.name, type: 'folder', size: '--', uploadedBy: userMap[f.created_by] || 'System',
//                     dateCreated: new Date(f.created_at).toLocaleDateString()
//                 }));

//                 // Map Docs (ABAC Filter: Mortals ONLY see docs they have can_view rights to)
//                 const mappedDocs = (docsData || [])
//                     .filter(doc => isGodMode || myPerms[`doc_${doc.id}`]?.can_view)
//                     .map(doc => ({
//                         id: doc.id, parentId: doc.folder_id || null, index: doc.index ? doc.index.toString().replace('.0', '') : '99',
//                         name: doc.name, type: doc.name.split('.').pop().toLowerCase() || 'file',
//                         rawSize: doc.file_size_bytes || 0,
//                         size: doc.file_size_bytes > 1024 * 1024 ? `${(doc.file_size_bytes / (1024 * 1024)).toFixed(1)} MB` : `${(doc.file_size_bytes / 1024).toFixed(0)} KB`,
//                         uploadedBy: userMap[doc.uploaded_by] || 'System',
//                         dateCreated: new Date(doc.created_at).toLocaleDateString(),
//                         is_bookmarked: doc.is_bookmarked, is_downloaded: doc.is_downloaded, is_deleted: doc.is_deleted,
//                         file_path: doc.file_path, dek_ref: doc.dek_ref, mime_type: doc.mime_type
//                     }));

//                 setMergedPerms(myPerms);
//                 setFiles([...mappedFolders, ...mappedDocs]);
//                 setBookmarkedIds(new Set((docsData || []).filter(d => d.is_bookmarked).map(d => d.id)));
//                 setDownloadedIds(new Set((docsData || []).filter(d => d.is_downloaded).map(d => d.id)));
//                 setDeletedIds(new Set((docsData || []).filter(d => d.is_deleted).map(d => d.id)));
//             } catch (err) { console.error('Fetch error:', err); }
//             finally { setLoading(false); }
//         })();
//     }, [session]);

//     // ── PERMISSION CHECK HELPER ──────────────────────────────────────────────
//     const canUser = (action, item = null) => {
//         if (!session) return false;
//         if (session.role === 'super_admin') return true; // God Mode

//         // Global context checks
//         if (!item) {
//             // Can upload to Root? (Usually Admins only)
//             if (action === 'can_upload' && currentFolderId === null) return session.role === 'admin';
//             return false;
//         }

//         // Specific Item Checks
//         const key = item.type === 'folder' ? `fol_${item.id}` : `doc_${item.id}`;
//         return mergedPerms[key]?.[action] === true;
//     };

//     // ── DERIVED STATE ────────────────────────────────────────────────────────
//     const breadcrumbPath = useMemo(() => {
//         const path = []; let id = currentFolderId;
//         while (id !== null) {
//             const folder = files.find(f => f.id === id);
//             if (folder) { path.unshift(folder); id = folder.parentId; } else break;
//         }
//         return path;
//     }, [currentFolderId, files]);

//     const currentItems = useMemo(() => {
//         if (currentView === 'trash') return files.filter(f => deletedIds.has(f.id));
//         if (currentView === 'bookmarks') return files.filter(f => bookmarkedIds.has(f.id) && !deletedIds.has(f.id));
//         if (currentView === 'downloads') return files.filter(f => downloadedIds.has(f.id) && !deletedIds.has(f.id));
//         return files.filter(f => f.parentId === currentFolderId && !deletedIds.has(f.id));
//     }, [currentFolderId, files, currentView, deletedIds, bookmarkedIds, downloadedIds]);

//     const filteredItems = currentItems.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

//     // For Modals
//     const selectedItemsArray = files.filter(f => selectedIds.has(f.id));
//     const canEditAllSelected = selectedItemsArray.every(item => canUser('can_edit', item));
//     const availableFoldersForMove = files.filter(f => f.type === 'folder' && !deletedIds.has(f.id) && !selectedIds.has(f.id));

//     // ── HANDLERS ─────────────────────────────────────────────────────────────
//     const handleToggleSelect = (id, e) => {
//         e.stopPropagation();
//         setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
//     };

//     const handleSelectAll = () => setSelectedIds(prev => prev.size === filteredItems.length ? new Set() : new Set(filteredItems.map(f => f.id)));

//     const handleItemClick = (item) => {
//         if (item.type === 'folder') {
//             if (currentView !== 'files') router.push('/documents?view=files');
//             setCurrentFolderId(item.id); setSelectedIds(new Set()); setSearchQuery('');
//         } else {
//             setSelectedIds(new Set([item.id]));
//         }
//     };

//     const generateNewIndex = () => {
//         const peers = files.filter(f => f.parentId === currentFolderId && !deletedIds.has(f.id));
//         if (currentFolderId === null) return (peers.reduce((m, it) => Math.max(m, parseInt(it.index) || 0), 0) + 1).toString();

//         const parent = files.find(f => f.id === currentFolderId);
//         const prefix = parent?.index?.endsWith('.0') ? parent.index.slice(0, -2) : (parent?.index ?? '1');
//         const max = peers.reduce((m, it) => Math.max(m, parseInt(it.index.split('.').pop()) || 0), 0);
//         return `${prefix}.${max + 1}`;
//     };

//     const handleCreateFolder = async (e) => {
//         e.preventDefault();
//         if (!newFolderName.trim()) return;
//         const newIndex = generateNewIndex();

//         const { data: dbFolder, error } = await supabase.from('folders').insert({
//             company_id: session.company_id, parent_folder_id: currentFolderId,
//             name: newFolderName.trim(), index_number: parseInt(newIndex.split('.')[0]) || 1, created_by: session.id,
//         }).select().single();

//         if (error) { alert('Failed to create folder'); return; }

//         setFiles(prev => [...prev, {
//             id: dbFolder.id, parentId: dbFolder.parent_folder_id || null, index: newIndex.toString(),
//             name: dbFolder.name, type: 'folder', size: '--', uploadedBy: session.name,
//             dateCreated: new Date().toLocaleDateString()
//         }]);
//         setNewFolderName(''); setIsNewFolderOpen(false);
//     };

//     const handleFileChange = async (e) => {
//         const chosenFiles = Array.from(e.target.files);
//         if (chosenFiles.length === 0 || !session) return;

//         setUploadQueue(chosenFiles.map((f, i) => ({
//             id: `up-${Date.now()}-${i}`, name: f.name, progress: 0, status: 'uploading',
//             size: f.size > 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` : `${(f.size / 1024).toFixed(0)} KB`
//         })));

//         const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
//             const reader = new FileReader();
//             reader.onload = () => resolve(reader.result.split(',')[1]);
//             reader.onerror = reject;
//             reader.readAsDataURL(file);
//         });

//         for (let i = 0; i < chosenFiles.length; i++) {
//             const file = chosenFiles[i];
//             try {
//                 // Fernet Encryption
//                 const randomBytes = window.crypto.getRandomValues(new Uint8Array(32));
//                 const fernetKey = btoa(String.fromCharCode(...randomBytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
//                 const base64Data = await readFileAsBase64(file);
//                 const secret = new fernet.Secret(fernetKey);
//                 const token = new fernet.Token({ secret: secret });
//                 const encryptedString = token.encode(base64Data);

//                 const encryptedBlob = new Blob([encryptedString], { type: 'text/plain' });
//                 const newIndex = generateNewIndex();
//                 const storagePath = `${session.company_id}/${Date.now()}_${file.name}`;

//                 const { error: storageErr } = await supabase.storage.from('vault-files').upload(storagePath, encryptedBlob, { contentType: 'text/plain' });
//                 if (storageErr) throw new Error("Bucket Upload Failed: " + storageErr.message);

//                 const res = await fetch('/api/documents/upload', {
//                     method: 'POST', headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({
//                         company_id: session.company_id, folder_id: currentFolderId, uploaded_by: session.id,
//                         name: file.name, file_path: storagePath, mime_type: file.type || 'application/octet-stream',
//                         file_size_bytes: file.size, dek_ref: fernetKey, index: newIndex, security: 'Fernet Encrypted'
//                     })
//                 });

//                 if (!res.ok) throw new Error('DB Sync failed');
//                 const { id: docId } = await res.json();

//                 setUploadQueue(prev => prev.map((it, idx) => idx === i ? { ...it, progress: 100, status: 'completed' } : it));
//                 setFiles(prev => [...prev, {
//                     id: docId, parentId: currentFolderId, index: newIndex.toString(), name: file.name,
//                     type: file.name.split('.').pop().toLowerCase() || 'file',
//                     size: file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${(file.size / 1024).toFixed(0)} KB`,
//                     uploadedBy: session.name, dateCreated: new Date().toLocaleDateString(), file_path: storagePath, dek_ref: fernetKey, mime_type: file.type
//                 }]);
//             } catch (err) {
//                 console.error('Upload failed:', err);
//                 setUploadQueue(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'error' } : it));
//             }
//         }
//         setTimeout(() => { setUploadQueue([]); setIsUploadModalOpen(false); }, 1500);
//     };

//     const handleDownload = async (file, type) => {
//         setDownloading(prev => ({ ...prev, [file.id]: true }));
//         try {
//             if (type === 'secure') {
//                 const blob = new Blob([file.id], { type: 'text/plain' });
//                 const url = URL.createObjectURL(blob);
//                 const a = document.createElement('a'); a.href = url; a.download = `${file.name}.vdr`;
//                 document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
//                 await supabase.from('documents').update({ is_downloaded: true }).eq('id', file.id);
//             } else if (type === 'original') {
//                 const { data, error } = await supabase.storage.from('vault-files').download(file.file_path);
//                 if (error) throw error;
//                 const text = await data.text();
//                 const secret = new fernet.Secret(file.dek_ref);
//                 const token = new fernet.Token({ secret: secret, token: text, ttl: 0 });
//                 const decryptedBase64 = token.decode();
//                 const byteCharacters = atob(decryptedBase64);
//                 const byteNumbers = new Array(byteCharacters.length);
//                 for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
//                 const blob = new Blob([new Uint8Array(byteNumbers)], { type: file.mime_type || 'application/octet-stream' });
//                 const url = URL.createObjectURL(blob);
//                 const a = document.createElement('a'); a.href = url; a.download = file.name;
//                 document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
//             }
//         } catch (err) { alert('Download failed. ' + err.message); }
//         finally { setDownloading(prev => { const n = { ...prev }; delete n[file.id]; return n; }); }
//     };

//     const handleExport = () => {
//         const exportFiles = selectedIds.size > 0 ? files.filter(f => selectedIds.has(f.id)) : filteredItems;
//         if (exportFiles.length === 0) return alert('No files to export.');
//         let csv = 'Name,Type,Size,Uploaded By,Date Created,Status\n';
//         exportFiles.forEach(f => { csv += `"${f.name}","${f.type}","${f.size}","${f.uploadedBy}","${f.dateCreated}","${deletedIds.has(f.id) ? 'Trash' : 'Active'}"\n`; });
//         const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement('a'); a.href = url; a.download = `vdr_export_${Date.now()}.csv`;
//         a.click(); URL.revokeObjectURL(url);
//     };

//     const executeMoveToFolder = async () => {
//         try {
//             const docIds = [...selectedIds].filter(id => files.find(f => f.id === id)?.type !== 'folder');
//             if (docIds.length > 0) await supabase.from('documents').update({ folder_id: movingToFolderId }).in('id', docIds);
//             setFiles(prev => prev.map(f => selectedIds.has(f.id) && f.type !== 'folder' ? { ...f, parentId: movingToFolderId } : f));
//             setSelectedIds(new Set());
//         } catch (err) { console.error('Move failed:', err); } finally { setIsMoveModalOpen(false); }
//     };

//     const executeSoftDelete = async () => {
//         try {
//             const docIds = [...selectedIds].filter(id => files.find(f => f.id === id)?.type !== 'folder');
//             if (docIds.length > 0) await supabase.from('documents').update({ is_deleted: true, deleted_at: new Date().toISOString() }).in('id', docIds);
//             setDeletedIds(prev => { const n = new Set(prev); selectedIds.forEach(id => n.add(id)); return n; });
//             setSelectedIds(new Set());
//             setIsDeleteModalOpen(false);
//         } catch (err) { console.error('Trash failed', err); }
//     };

//     // ── RENDER ───────────────────────────────────────────────────────────────
//     if (loading) return <div className="flex items-center justify-center w-full h-full bg-[#FAFBFD]"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" /></div>;

//     // Check Contextual Nav Rights
//     const canUploadHere = currentFolderId === null ? (session.role === 'super_admin' || session.role === 'admin') : canUser('can_upload', { type: 'folder', id: currentFolderId });

//     return (
//         <div className="flex flex-col h-full w-full bg-[#F8F9FB] overflow-hidden">
//             <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />

//             {/* Top Bar */}
//             <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200 shadow-sm z-10">
//                 <div className="flex items-center gap-3">
//                     <span className="text-[14px] font-black text-slate-800 tracking-tight">
//                         {currentView === 'trash' ? 'Trash Bin' : currentView === 'bookmarks' ? 'My Bookmarks' : currentView === 'downloads' ? 'Recent Downloads' : 'Workspace'}
//                     </span>
//                     {currentView === 'files' && breadcrumbPath.map((item, idx) => (
//                         <React.Fragment key={item.id}>
//                             <span className="text-slate-300">/</span>
//                             <button onClick={() => setCurrentFolderId(item.id)} className="text-[13px] font-bold text-slate-500 hover:text-slate-800 transition-colors">{item.name}</button>
//                         </React.Fragment>
//                     ))}
//                     {currentFolderId !== null && (
//                         <button onClick={() => setCurrentFolderId(files.find(f => f.id === currentFolderId)?.parentId ?? null)} className="ml-2 px-2 py-1 bg-slate-100 text-[10px] font-bold text-slate-500 rounded-md hover:bg-slate-200">Back</button>
//                     )}
//                 </div>
//                 <div className="relative w-64">
//                     <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-4 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none" />
//                 </div>
//             </div>

//             {/* Contextual Nav Bar */}
//             <div className="flex items-center px-8 py-3 bg-white border-b border-slate-100">
//                 <div className="flex gap-2">
//                     {canUploadHere && (
//                         <>
//                             <button onClick={() => setIsUploadModalOpen(true)} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors">Upload Files</button>
//                             <button onClick={() => setIsNewFolderOpen(true)} className="px-4 py-2 bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors">New Folder</button>
//                         </>
//                     )}
//                     {(session.role === 'super_admin' || session.role === 'admin' || session.role === 'subadmin') && (
//                         <button onClick={handleExport} className="ml-2 px-4 py-2 text-blue-700 bg-blue-50 border border-blue-100 text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors">Export Index (CSV)</button>
//                     )}
//                 </div>
//             </div>

//             {/* Selection Action Bar */}
//             {selectedIds.size > 0 && (
//                 <div className="bg-amber-50/80 border-b border-amber-100 px-8 py-2.5 flex items-center gap-4">
//                     <span className="text-[12px] font-black text-amber-800">{selectedIds.size} items selected</span>
//                     {canEditAllSelected && currentView !== 'trash' && (
//                         <>
//                             <button onClick={() => setIsMoveModalOpen(true)} className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 text-[11px] font-bold rounded-lg shadow-sm">Move</button>
//                             <button onClick={() => setIsDeleteModalOpen(true)} className="px-4 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold rounded-lg">Trash</button>
//                         </>
//                     )}
//                     <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-[11px] font-bold text-amber-700 hover:underline">Clear Selection</button>
//                 </div>
//             )}

//             {/* Unified Table */}
//             <div className="flex-1 overflow-auto p-8">
//                 {filteredItems.length === 0 ? (
//                     <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
//                         <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="opacity-30"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
//                         <p className="text-[14px] font-bold text-slate-500">This directory is empty</p>
//                     </div>
//                 ) : (
//                     <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden pb-10">
//                         <table className="w-full text-left border-collapse">
//                             <thead className="bg-slate-50 border-b border-slate-100">
//                                 <tr>
//                                     <th className="p-4 w-12"><input type="checkbox" checked={selectedIds.size === filteredItems.length && filteredItems.length > 0} onChange={handleSelectAll} className="w-4 h-4 rounded border-slate-300 accent-slate-900" /></th>
//                                     <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Index</th>
//                                     <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
//                                     <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Size</th>
//                                     <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
//                                     <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-slate-50">
//                                 {filteredItems.map(item => {
//                                     const isChecked = selectedIds.has(item.id);
//                                     const isFolder = item.type === 'folder';
//                                     const iconMap = { pdf: 'bg-rose-50 text-rose-600', xlsx: 'bg-emerald-50 text-emerald-600', docx: 'bg-indigo-50 text-indigo-600' };
//                                     const iconClass = isFolder ? 'bg-amber-50 text-amber-500 border-amber-100' : (iconMap[item.type] || 'bg-slate-50 text-slate-400 border-slate-200');

//                                     return (
//                                         <tr key={item.id} onClick={() => handleItemClick(item)} className={`group cursor-pointer transition-colors ${isChecked ? 'bg-slate-50' : 'hover:bg-slate-50/60'}`}>
//                                             <td className="p-4" onClick={e => e.stopPropagation()}><input type="checkbox" checked={isChecked} onChange={e => handleToggleSelect(item.id, e)} className="w-4 h-4 rounded accent-slate-900" /></td>
//                                             <td className="p-4 text-[12px] font-mono font-semibold text-slate-400">{item.index}</td>
//                                             <td className="p-4">
//                                                 <div className="flex items-center gap-3">
//                                                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border text-[9px] font-black ${iconClass}`}>
//                                                         {isFolder ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" /></svg> : item.type.toUpperCase().slice(0, 3)}
//                                                     </div>
//                                                     <p className="text-[13px] font-bold text-slate-700 truncate max-w-[280px]">{item.name}</p>
//                                                 </div>
//                                             </td>
//                                             <td className="p-4 text-[12px] font-medium text-slate-500 text-center">{item.size}</td>
//                                             <td className="p-4 text-[12px] font-semibold text-slate-500">{item.dateCreated}</td>

//                                             <td className="p-4" onClick={e => e.stopPropagation()}>
//                                                 <div className="flex items-center justify-center gap-2">
//                                                     {!isFolder && canUser('can_download_secure', item) && (
//                                                         <button onClick={() => handleDownload(item, 'secure')} disabled={downloading[item.id]} className="px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-sm hover:bg-slate-700 disabled:opacity-50">
//                                                             Secure (.vdr)
//                                                         </button>
//                                                     )}
//                                                     {!isFolder && canUser('can_download_original', item) && (
//                                                         <button onClick={() => handleDownload(item, 'original')} disabled={downloading[item.id]} className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-lg hover:bg-emerald-100 disabled:opacity-50">
//                                                             Original
//                                                         </button>
//                                                     )}
//                                                     {isFolder && (
//                                                         <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Folder</span>
//                                                     )}
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     );
//                                 })}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </div>

//             {/* Modals (New Folder, Upload, Delete, Move) */}
//             {isNewFolderOpen && (
//                 <Modal onClose={() => setIsNewFolderOpen(false)}>
//                     <h3 className="text-[16px] font-black mb-4">Create New Folder</h3>
//                     <input type="text" placeholder="Folder name..." value={newFolderName} onChange={e => setNewFolderName(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl mb-4 focus:border-slate-400 focus:outline-none" />
//                     <button onClick={handleCreateFolder} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl">Create</button>
//                 </Modal>
//             )}

//             {isDeleteModalOpen && (
//                 <Modal onClose={() => setIsDeleteModalOpen(false)}>
//                     <h3 className="text-[16px] font-black text-rose-600 mb-2">Send to Trash?</h3>
//                     <p className="text-[13px] text-slate-500 mb-6">These files will be moved to the Trash bin.</p>
//                     <div className="flex gap-2">
//                         <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-slate-100 font-bold rounded-xl">Cancel</button>
//                         <button onClick={executeSoftDelete} className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl">Send to Trash</button>
//                     </div>
//                 </Modal>
//             )}

//             {isUploadModalOpen && (
//                 <Modal onClose={() => setIsUploadModalOpen(false)}>
//                     <h3 className="text-[16px] font-black text-slate-800 mb-5">Secure Upload</h3>
//                     <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-3 p-10 border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100">
//                         <span className="text-[13px] font-bold text-slate-700">Click to Browse Files</span>
//                         <span className="text-[11px] text-slate-400">Files are AES-256 Encrypted on upload</span>
//                     </div>
//                     {uploadQueue.length > 0 && (
//                         <div className="mt-4 space-y-2 max-h-48 overflow-auto">
//                             {uploadQueue.map(item => (
//                                 <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
//                                     <div className="flex-1 min-w-0">
//                                         <p className="text-[12px] font-semibold text-slate-700 truncate">{item.name}</p>
//                                     </div>
//                                     {item.status === 'completed' ? <span className="text-emerald-500 text-xs font-bold">Done</span> : <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />}
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </Modal>
//             )}

//             {isMoveModalOpen && (
//                 <Modal onClose={() => setIsMoveModalOpen(false)}>
//                     <h3 className="text-[15px] font-black mb-4">Move {selectedIds.size} items to...</h3>
//                     <div className="space-y-1 max-h-64 overflow-y-auto mb-4">
//                         <button onClick={() => setMovingToFolderId(null)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[12.5px] font-semibold ${movingToFolderId === null ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-700'}`}>
//                             Root Directory
//                         </button>
//                         {availableFoldersForMove.map(folder => (
//                             <button key={folder.id} onClick={() => setMovingToFolderId(folder.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[12.5px] font-semibold ${movingToFolderId === folder.id ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-700'}`}>
//                                 <span className="truncate">{folder.name}</span>
//                             </button>
//                         ))}
//                     </div>
//                     <div className="flex gap-2">
//                         <button onClick={() => setIsMoveModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 font-bold rounded-xl">Cancel</button>
//                         <button onClick={executeMoveToFolder} className="flex-1 py-2.5 bg-slate-900 text-white font-bold rounded-xl">Move Here</button>
//                     </div>
//                 </Modal>
//             )}

//         </div>
//     );
// }

// function Modal({ children, onClose, maxWidth = 'max-w-lg' }) {
//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//             <div onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-[3px]" />
//             <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} p-6 z-10`}>
//                 {children}
//             </div>
//         </div>
//     );
// }