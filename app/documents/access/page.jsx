"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';

export default function AccessPage() {
    const router = useRouter();
    const [session, setSession] = useState(null);
    const [users, setUsers] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [permissions, setPermissions] = useState({}); // { [userId_docId]: { can_read, can_edit, perm_id } }
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState({}); // { [userId_docId]: true }
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // ── SESSION ──────────────────────────────────────────────────────────────
    useEffect(() => {
        const raw = localStorage.getItem('vdr_session');
        if (!raw) { router.push('/login'); return; }
        const s = JSON.parse(raw);
        if (s.role !== 'admin') { router.push('/documents'); return; }
        setSession(s);
    }, [router]);

    // ── FETCH ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!session) return;
        fetchAll();
    }, [session]);

    const fetchAll = useCallback(async () => {
        if (!session) return;
        setLoading(true);
        try {
            const [{ data: usersData }, { data: docsData }, { data: permsData }] = await Promise.all([
                supabase.from('users').select('id, name, email, role').eq('company_id', session.company_id).neq('id', session.id),
                supabase.from('documents').select('id, name, folder_id, index').eq('company_id', session.company_id).eq('is_deleted', false).order('index'),
                supabase.from('document_permissions').select('id, doc_id, user_id, can_read, can_edit'),
            ]);

            setUsers(usersData || []);
            setDocuments(docsData || []);

            // Build permission map
            const map = {};
            (permsData || []).forEach(p => {
                map[`${p.user_id}_${p.doc_id}`] = {
                    can_read: p.can_read,
                    can_edit: p.can_edit,
                    perm_id: p.id,
                };
            });
            setPermissions(map);

            if (usersData?.length > 0 && !selectedUser) {
                setSelectedUser(usersData[0].id);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [session, selectedUser]);

    // ── TOGGLE PERMISSION ────────────────────────────────────────────────────
    const togglePermission = async (userId, docId, field) => {
        const key = `${userId}_${docId}`;
        const current = permissions[key] || { can_read: false, can_edit: false, perm_id: null };
        const saveKey = `${key}_${field}`;

        // Optimistic update logic
        let newRead = current.can_read;
        let newEdit = current.can_edit;

        if (field === 'can_edit') {
            newEdit = !current.can_edit;
            if (newEdit) newRead = true; // edit implies read
        } else {
            newRead = !current.can_read;
            if (!newRead) newEdit = false; // removing read removes edit too
        }

        // Optimistic UI update
        setPermissions(prev => ({
            ...prev,
            [key]: { ...current, can_read: newRead, can_edit: newEdit },
        }));

        setSaving(prev => ({ ...prev, [saveKey]: true }));

        try {
            if (current.perm_id) {
                // Update existing
                if (!newRead && !newEdit) {
                    // Remove permission entirely
                    await supabase.from('document_permissions').delete().eq('id', current.perm_id);
                    setPermissions(prev => {
                        const next = { ...prev };
                        delete next[key];
                        return next;
                    });
                } else {
                    await supabase.from('document_permissions')
                        .update({ can_read: newRead, can_edit: newEdit })
                        .eq('id', current.perm_id);
                }
            } else if (newRead || newEdit) {
                // Insert new
                const { data } = await supabase.from('document_permissions')
                    .insert({ doc_id: docId, user_id: userId, can_read: newRead, can_edit: newEdit })
                    .select('id').single();
                setPermissions(prev => ({
                    ...prev,
                    [key]: { can_read: newRead, can_edit: newEdit, perm_id: data?.id },
                }));
            }
        } catch (err) {
            console.error('Permission update failed:', err);
            // Revert on error
            setPermissions(prev => ({ ...prev, [key]: current }));
        } finally {
            setSaving(prev => { const n = { ...prev }; delete n[saveKey]; return n; });
        }
    };

    // ── GRANT ALL / REVOKE ALL ───────────────────────────────────────────────
    const grantAll = async (userId) => {
        const ops = documents.map(doc => togglePermission(userId, doc.id, 'can_read'));
        await Promise.all(ops);
    };

    const revokeAll = async (userId) => {
        const toRevoke = documents.filter(doc => {
            const p = permissions[`${userId}_${doc.id}`];
            return p?.can_read || p?.can_edit;
        });
        for (const doc of toRevoke) {
            const key = `${userId}_${doc.id}`;
            const current = permissions[key];
            if (current?.perm_id) {
                await supabase.from('document_permissions').delete().eq('id', current.perm_id);
            }
        }
        setPermissions(prev => {
            const next = { ...prev };
            toRevoke.forEach(doc => delete next[`${userId}_${doc.id}`]);
            return next;
        });
    };

    // ── FILTERED DOCS ────────────────────────────────────────────────────────
    const filteredDocs = documents.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeUser = users.find(u => u.id === selectedUser);

    // ── COUNT HELPERS ────────────────────────────────────────────────────────
    const getUserAccessCount = (userId) =>
        documents.filter(d => permissions[`${userId}_${d.id}`]?.can_read).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-full bg-[#FAFBFD]">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative flex w-full h-full bg-[#F8F9FB] overflow-hidden text-slate-800 font-sans">

            {/* ── LEFT: USER LIST ─────────────────────────────────────────── */}
            <aside className="w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col h-full overflow-hidden">
                <div className="px-5 pt-5 pb-3 border-b border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Users</p>
                    <p className="text-[11px] text-slate-400 mt-1">{users.length} member{users.length !== 1 ? 's' : ''}</p>
                </div>

                <div className="flex-1 overflow-y-auto py-2 px-2">
                    {users.length === 0 ? (
                        <p className="text-[11px] text-slate-400 text-center py-8 px-3">No other users in your organization.</p>
                    ) : (
                        users.map(user => {
                            const isActive = selectedUser === user.id;
                            const accessCount = getUserAccessCount(user.id);
                            return (
                                <button
                                    key={user.id}
                                    onClick={() => setSelectedUser(user.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all mb-0.5
                                        ${isActive ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-700'}`}
                                >
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black shrink-0
                                        ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-[12.5px] font-bold truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
                                            {user.name}
                                        </p>
                                        <p className={`text-[10.5px] truncate ${isActive ? 'text-white/60' : 'text-slate-400'}`}>
                                            {user.email}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] font-black shrink-0 px-1.5 py-0.5 rounded-md
                                        ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        {accessCount}/{documents.length}
                                    </span>
                                </button>
                            );
                        })
                    )}
                </div>
            </aside>

            {/* ── RIGHT: PERMISSION MATRIX ────────────────────────────────── */}
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-slate-200 bg-white">
                    <div className="flex items-center gap-3">
                        {activeUser && (
                            <>
                                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-[12px] font-black text-white shrink-0">
                                    {activeUser.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="text-[14px] font-black text-slate-800">{activeUser.name}</p>
                                    <p className="text-[11px] text-slate-400">{activeUser.email}</p>
                                </div>
                            </>
                        )}
                        {!activeUser && (
                            <p className="text-[13px] font-black text-slate-400 uppercase tracking-widest">Access Control</p>
                        )}
                    </div>

                    {/* Right controls */}
                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <div className="relative w-48">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            <input
                                type="text"
                                placeholder="Search documents..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-semibold text-slate-700 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
                            />
                        </div>

                        {selectedUser && (
                            <>
                                <button
                                    onClick={() => grantAll(selectedUser)}
                                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11.5px] font-bold rounded-xl hover:bg-emerald-100 transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                    Grant All Read
                                </button>
                                <button
                                    onClick={() => revokeAll(selectedUser)}
                                    className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 border border-rose-100 text-rose-600 text-[11.5px] font-bold rounded-xl hover:bg-rose-100 transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                    Revoke All
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto px-7 py-5">
                    {!selectedUser ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-30"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                            <p className="text-[13px] font-bold">Select a user to manage access</p>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.04)] overflow-hidden">
                            <table className="w-full min-w-[600px] border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/60">
                                        <th className="py-3.5 px-4 w-20 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Index</th>
                                        <th className="py-3.5 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document</th>
                                        <th className="py-3.5 px-3 w-32 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Read Access</th>
                                        <th className="py-3.5 px-3 w-32 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Edit Access</th>
                                        <th className="py-3.5 px-3 w-24 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredDocs.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-20 text-center">
                                                <p className="text-[13px] font-bold text-slate-400">
                                                    {searchQuery ? 'No documents match your search' : 'No documents found'}
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredDocs.map(doc => {
                                            const key = `${selectedUser}_${doc.id}`;
                                            const perm = permissions[key] || { can_read: false, can_edit: false };
                                            const isSavingRead = saving[`${key}_can_read`];
                                            const isSavingEdit = saving[`${key}_can_edit`];
                                            const ext = doc.name.split('.').pop().toLowerCase();

                                            // Status badge
                                            let statusLabel = 'No Access';
                                            let statusClass = 'bg-slate-100 text-slate-400';
                                            if (perm.can_edit) { statusLabel = 'Can Edit'; statusClass = 'bg-blue-50 text-blue-600 border border-blue-100'; }
                                            else if (perm.can_read) { statusLabel = 'Read Only'; statusClass = 'bg-emerald-50 text-emerald-600 border border-emerald-100'; }

                                            // File icon color
                                            const iconMap = {
                                                pdf: 'bg-rose-50 border-rose-100 text-rose-600',
                                                xlsx: 'bg-emerald-50 border-emerald-100 text-emerald-600',
                                                xls: 'bg-emerald-50 border-emerald-100 text-emerald-600',
                                                docx: 'bg-indigo-50 border-indigo-100 text-indigo-600',
                                                doc: 'bg-indigo-50 border-indigo-100 text-indigo-600',
                                                pptx: 'bg-orange-50 border-orange-100 text-orange-600',
                                                png: 'bg-purple-50 border-purple-100 text-purple-600',
                                                jpg: 'bg-purple-50 border-purple-100 text-purple-600',
                                            };
                                            const iconClass = iconMap[ext] || 'bg-slate-50 border-slate-200 text-slate-400';

                                            return (
                                                <tr key={doc.id} className="group hover:bg-slate-50/60 transition-all duration-150">
                                                    <td className="py-3.5 px-4 text-center font-mono text-[11.5px] font-semibold text-slate-400">
                                                        {doc.index || '—'}
                                                    </td>
                                                    <td className="py-3.5 px-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[9px] font-black border ${iconClass}`}>
                                                                {ext.toUpperCase().slice(0, 3)}
                                                            </div>
                                                            <p className="font-semibold text-[13px] text-slate-700 truncate max-w-[280px]">{doc.name}</p>
                                                        </div>
                                                    </td>

                                                    {/* Read toggle */}
                                                    <td className="py-3.5 px-3 text-center">
                                                        <button
                                                            onClick={() => togglePermission(selectedUser, doc.id, 'can_read')}
                                                            disabled={isSavingRead || isSavingEdit}
                                                            className={`relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none
                                                                ${perm.can_read ? 'bg-slate-900' : 'bg-slate-200'}
                                                                ${(isSavingRead || isSavingEdit) ? 'opacity-60' : ''}`}
                                                        >
                                                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200
                                                                ${perm.can_read ? 'translate-x-5' : 'translate-x-0'}`} />
                                                        </button>
                                                    </td>

                                                    {/* Edit toggle */}
                                                    <td className="py-3.5 px-3 text-center">
                                                        <button
                                                            onClick={() => togglePermission(selectedUser, doc.id, 'can_edit')}
                                                            disabled={isSavingRead || isSavingEdit}
                                                            className={`relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none
                                                                ${perm.can_edit ? 'bg-blue-600' : 'bg-slate-200'}
                                                                ${(isSavingRead || isSavingEdit) ? 'opacity-60' : ''}`}
                                                        >
                                                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200
                                                                ${perm.can_edit ? 'translate-x-5' : 'translate-x-0'}`} />
                                                        </button>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="py-3.5 px-3 text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10.5px] font-bold ${statusClass}`}>
                                                            {(isSavingRead || isSavingEdit) ? (
                                                                <span className="flex items-center gap-1">
                                                                    <svg className="animate-spin w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                                                    Saving
                                                                </span>
                                                            ) : statusLabel}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Footer */}
                    {selectedUser && (
                        <div className="mt-3 px-1">
                            <p className="text-[11.5px] text-slate-400 font-semibold">
                                {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''}
                                {searchQuery && ` matching "${searchQuery}"`}
                                {' · '}
                                {getUserAccessCount(selectedUser)} with read access
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}