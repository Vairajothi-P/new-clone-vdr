"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { FaUserPlus, FaCog } from "react-icons/fa";
import { NAV_ITEMS } from "@/lib/nav-items";

const PERMISSION_SECTIONS = [
    {
        label: "Workspace",
        scope: "workspace",
        description: "Control access to navigation modules and group management",
        subPerms: [
            {
                key: "can_access_groups",
                label: "Groups",
                desc: "Can access the Groups module and manage group settings",
                nested: [
                    { key: "can_add_members", label: "Add Members", desc: "Can invite & add users to groups" },
                    { key: "can_remove_members", label: "Remove Members", desc: "Can remove users from groups" },
                    { key: "can_create_group", label: "Create Group", desc: "Can create new groups" },
                    { key: "can_delete_group", label: "Delete Group", desc: "Can delete existing groups" },
                ]
            },
            {
                key: "can_access_settings",
                label: "Settings",
                desc: "Can access the Settings module and workspace configurations",
                nested: [
                    { key: "can_access_branding", label: "Branding", desc: "Can customize workspace branding" },
                    { key: "can_access_watermarks", label: "Watermarks", desc: "Can configure document watermarks" }
                ]
            }
        ],
    },
];

const DEFAULT_PERMS = {
    can_view: false,
    can_edit: false,
    can_download: false,
    can_delete: false,
    can_add_members: false,
    can_remove_members: false,
};

export default function DynamicGroupPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const groupSlug = params.slug;

    const [members, setMembers] = useState([]);
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showPermissionPage, setShowPermissionPage] = useState(searchParams.get('view') === 'permissions');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteDescription, setInviteDescription] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [inviting, setInviting] = useState(false);

    const [canAddMembers, setCanAddMembers] = useState(false);
    const [canRemoveMembers, setCanRemoveMembers] = useState(false);
    const [canEditPermissions, setCanEditPermissions] = useState(false);

    const [perms, setPerms] = useState({});
    const [permsLoading, setPermsLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [session, setSession] = useState(null);
    const [companyId, setCompanyId] = useState(null);

    useEffect(() => {
        const rawSession = localStorage.getItem("vdr_session");
        if (rawSession) {
            const parsedSession = JSON.parse(rawSession);
            setSession(parsedSession);
            setCompanyId(parsedSession.company_id);
        }
    }, []);

    useEffect(() => {
        if (!groupSlug || !companyId) return;

        const fetchGroupMembers = async () => {
            setMembers([]);
            setLoading(true);
            try {
                const { data: groups, error: groupsError } = await supabase
                    .from("groups")
                    .select("*")
                    .eq("company_id", companyId)
                    .eq("id", groupSlug);

                if (groupsError || !groups?.length) { setMembers([]); return; }

                const group = groups[0];
                setGroupData(group);

                const { data: ugRows } = await supabase
                    .from("user_groups")
                    .select("user_id")
                    .eq("group_id", group.id);

                const userIds = ugRows?.map(r => r.user_id) || [];
                if (!userIds.length) { setMembers([]); return; }

                const { data: users, error: usersError } = await supabase
                    .from("users")
                    .select("id, name, email, phone_number, status")
                    .in("id", userIds)
                    .eq("company_id", companyId);

                if (usersError) { setMembers([]); return; }
                setMembers(users || []);

            } catch (err) {
                console.error(err);
                setMembers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchGroupMembers();
    }, [groupSlug, companyId]);

    useEffect(() => {
        if (!session || !companyId) return;

        const checkGroupPermissions = async () => {
            if (session.role === 'super_admin') {
                setCanAddMembers(true);
                setCanRemoveMembers(true);
                setCanEditPermissions(true);
                return;
            }

            // const { data: ugRows } = await supabase
            //     .from('user_groups')
            //     .select('group_id')
            //     .eq('user_id', session.id);

            // const groupIds = ugRows?.map(r => r.group_id) || [];
            // if (!groupIds.length) return;

            const { data: ugRows } = await supabase.from('user_groups').select('group_id').eq('user_id', session.id);
            const groupIds = ugRows?.map(r => r.group_id) || [];
            if (!groupIds.length) return;

            const { data: perms } = await supabase
                .from('permissions')
                .select('can_add_members, can_remove_members, can_access_edit_permissions') // 🔥 Added column
                .eq('company_id', companyId)
                .eq('scope', 'workspace')
                .in('group_id', groupIds);

            if (perms && perms.length > 0) {
                setCanAddMembers(perms.some(p => p.can_add_members));
                setCanRemoveMembers(perms.some(p => p.can_remove_members));
                setCanEditPermissions(perms.some(p => p.can_access_edit_permissions)); // 🔥 Set state
            }

            // const { data: perms } = await supabase
            //     .from('permissions')
            //     .select('can_add_members, can_remove_members')
            //     .eq('company_id', companyId)
            //     .eq('scope', 'workspace')
            //     .in('group_id', groupIds);

            // if (perms && perms.length > 0) {
            //     setCanAddMembers(perms.some(p => p.can_add_members));
            //     setCanRemoveMembers(perms.some(p => p.can_remove_members));
            // }
        };

        checkGroupPermissions();
    }, [session, companyId]);

    useEffect(() => {
        if (!showPermissionPage || !groupData) return;
        const loadPerms = async () => {
            setPermsLoading(true);
            try {
                const { data, error } = await supabase
                    .from("permissions")
                    .select("*")
                    .eq("group_id", groupData.id)
                    .eq("company_id", groupData.company_id);
                if (error) throw error;

                const built = {};
                PERMISSION_SECTIONS.forEach(({ scope }) => {
                    const row = data?.find(r => r.scope === scope);
                    built[scope] = {
                        enabled: !!row,
                        can_add_members: row?.can_add_members ?? false,
                        can_remove_members: row?.can_remove_members ?? false,
                        can_create_group: row?.can_create_group ?? false,
                        can_delete_group: row?.can_delete_group ?? false,
                        can_access_documents: row?.can_access_documents ?? false,
                        can_access_groups: row?.can_access_groups ?? false,
                        can_access_edit_permissions: row?.can_access_edit_permissions ?? false,
                        can_access_settings: row?.can_access_settings ?? false,
                        can_access_branding: row?.can_access_branding ?? false,
                        can_access_watermarks: row?.can_access_watermarks ?? false,
                        existingId: row?.id ?? null,
                    };
                });

                const filesRow = data?.find(r => r.scope === 'files');
                built['files'] = {
                    enabled: !!filesRow,
                    can_create_folder: filesRow?.can_create_folder ?? false,
                    can_merge_folder: filesRow?.can_merge_folder ?? false,
                    can_delete_folder: filesRow?.can_delete_folder ?? false,
                    existingId: filesRow?.id ?? null,
                };

                setPerms(built);
            } catch (err) {
                console.error("Load perms error:", err);
            } finally {
                setPermsLoading(false);
            }
        };
        loadPerms();
    }, [showPermissionPage, groupData]);

    const toggleSection = (scope) => {
        setPerms(prev => {
            const current = prev[scope] || { ...DEFAULT_PERMS, enabled: false, existingId: null };
            return {
                ...prev,
                [scope]: {
                    ...current,
                    enabled: !current.enabled,
                    ...(!current.enabled ? {} : {
                        can_view: false, can_edit: false, can_download: false,
                        can_delete: false, can_add_members: false, can_remove_members: false,
                    }),
                }
            };
        });
    };

    const toggleSubPerm = (scope, key) => {
        setPerms(prev => ({
            ...prev,
            [scope]: { ...prev[scope], [key]: !prev[scope]?.[key] }
        }));
    };

    const handleSubmitPermissions = async () => {
        if (!groupData) return;
        setSaving(true);
        try {
            // for (const { scope } of PERMISSION_SECTIONS) {
            //     const s = perms[scope];
            const ALL_SECTIONS = [...PERMISSION_SECTIONS, { scope: 'files' }];
            for (const { scope } of ALL_SECTIONS) {
                const s = perms[scope];
                if (!s) continue;

                if (!s.enabled && !s.can_access_edit_permissions) {
                    if (s.existingId) {
                        const { error } = await supabase
                            .from("permissions").delete().eq("id", s.existingId);
                        if (error) throw error;
                    }
                    continue;
                }

                const payload = {
                    company_id: groupData.company_id,
                    group_id: groupData.id,
                    scope,
                    can_view: false,
                    can_add_members: s.can_add_members || false,
                    can_remove_members: s.can_remove_members || false,
                    can_create_group: s.can_create_group || false,
                    can_delete_group: s.can_delete_group || false,
                    can_access_documents: s.can_access_documents || false,
                    can_access_groups: s.can_access_groups || false,
                    can_access_edit_permissions: s.can_access_edit_permissions || false,
                    can_access_settings: s.can_access_settings || false,
                    can_access_branding: s.can_access_branding || false,
                    can_access_watermarks: s.can_access_watermarks || false,
                    folder_id: null,
                    document_id: null,
                    can_create_folder: s.can_create_folder || false,
                    can_merge_folder: s.can_merge_folder || false,
                    can_delete_folder: s.can_delete_folder || false,
                };

                if (s.existingId) {
                    const { error } = await supabase
                        .from("permissions")
                        .update({ ...payload, updated_at: new Date().toISOString() })
                        .eq("id", s.existingId);
                    if (error) throw error;
                } else {
                    const { data: inserted, error } = await supabase
                        .from("permissions").insert(payload).select("id").single();
                    if (error) throw error;
                    setPerms(prev => ({
                        ...prev,
                        [scope]: { ...prev[scope], existingId: inserted.id }
                    }));
                }
            }

            // File access permissions — DB save skipped for now (UI only)

            triggerToast("Permissions saved successfully");
            setShowPermissionPage(false);
        } catch (err) {
            console.error("Save perms error:", err);
            alert("Failed to save permissions: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleInviteSubmit = async () => {
        if (!inviteEmail.trim()) { alert("Please enter a candidate email."); return; }
        setInviting(true);
        try {
            const rawSession = localStorage.getItem("vdr_session");
            if (!rawSession) { alert("Session not found. Please log in again."); return; }
            const session = JSON.parse(rawSession);
            const response = await fetch("/api/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: inviteEmail, description: inviteDescription,
                    group_id: groupData.id, invited_by: session.id
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Failed to dispatch invitation.");
            setShowInviteModal(false);
            setInviteEmail("");
            setInviteDescription("");
            triggerToast("Invitation dispatched successfully");
        } catch (err) {
            console.error(err);
            alert("Error sending invitation: " + err.message);
        } finally {
            setInviting(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!groupData) return;
        const confirm = window.confirm("Are you sure you want to remove this member?");
        if (!confirm) return;

        try {
            const { error } = await supabase
                .from('user_groups')
                .delete()
                .eq('user_id', userId)
                .eq('group_id', groupData.id);

            if (error) throw error;

            setMembers(prev => prev.filter(m => m.id !== userId));
            triggerToast("Member removed successfully");
        } catch (err) {
            console.error(err);
            alert("Failed to remove member: " + err.message);
        }
    };

    const triggerToast = (msg) => {
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden font-sans bg-[#F8FAFC] relative">
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[var(--brand)]/10 to-transparent pointer-events-none transition-colors duration-500"></div>

            {/* TOAST */}
            {showToast && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[var(--brand-dark)] text-white px-6 py-3 rounded-full shadow-2xl z-[100] animate-in slide-in-from-bottom-8 fade-in duration-300 font-medium font-sans text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    {toastMsg}
                </div>
            )}

            {/* HEADER */}
            <div className="pt-10 px-10 pb-6 shrink-0 relative z-10">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-[var(--brand)] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                {groupData?.name?.charAt(0).toUpperCase() || "G"}
                            </div>
                            <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
                                {groupData ? `${groupData.name} Group` : "Loading..."}
                            </h1>
                        </div>
                        <p className="text-slate-500 text-sm font-medium ml-13 pl-13 max-w-2xl">
                            {groupData?.description || "Manage access and administration settings for members in this group."}
                        </p>
                    </div>

                    {!showPermissionPage && (
                        <div className="flex items-center gap-3">
                            {canAddMembers && (
                                <button onClick={() => setShowInviteModal(true)}
                                    className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-500 shadow-sm active:scale-95 cursor-pointer">
                                    <FaUserPlus size={14} className="text-slate-500" />
                                    <span>Invite Member</span>
                                </button>
                            )}
                            {/* <button onClick={() => setShowPermissionPage(true)}
                                className="flex items-center gap-2 bg-[var(--brand)] text-white px-4 py-2 rounded-xl font-medium text-sm hover:bg-[var(--brand-dark)] transition-all shadow-md active:scale-95">
                                <FaCog size={14} className="text-white/80" />
                                <span>Edit Permissions</span>
                            </button> */}

                            {canEditPermissions && (
                                <button onClick={() => setShowPermissionPage(true)}
                                    className="flex items-center gap-2 bg-gradient-to-r from-[var(--brand)] to-[var(--brand-secondary)] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-500 shadow-[0_8px_30px_rgba(var(--brand-rgb),0.14)] active:scale-95 cursor-pointer">
                                    <FaCog size={14} className="text-white/80" />
                                    <span>Edit Permissions</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-10 pb-12 mt-2">
                {!showPermissionPage ? (
                    /* MEMBERS TABLE CARD */
                    <div className="bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col min-h-[500px] hover:border-gray-300 transition-all duration-500">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-semibold text-sm text-slate-700">Active Members</h3>
                            <span className="bg-slate-200 text-slate-600 font-medium text-xs px-2.5 py-0.5 rounded-full">{members.length}</span>
                        </div>

                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="py-4 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider w-1/3">Name</th>
                                        <th className="py-4 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider w-1/3">Email Address</th>
                                        <th className="py-4 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider">Phone</th>
                                        <th className="py-4 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider text-center">Status</th>
                                        {canRemoveMembers && (
                                            <th className="py-4 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider text-right">Action</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr><td colSpan={canRemoveMembers ? 5 : 4} className="py-20 text-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto" /></td></tr>
                                    ) : members.length === 0 ? (
                                        <tr><td colSpan={canRemoveMembers ? 5 : 4} className="py-24 text-center font-medium text-slate-500 text-sm">No members assigned to this group yet.</td></tr>
                                    ) : (
                                        members.map((member) => (
                                            <tr key={member.id} className="group hover:bg-slate-50/50 transition-colors duration-200">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                            {member.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-slate-700 text-sm">{member.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-slate-500 text-sm">{member.email}</td>
                                                <td className="py-4 px-6 text-slate-500 text-sm">{member.phone_number || '—'}</td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${member.status === "active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}>
                                                        {member.status}
                                                    </span>
                                                </td>
                                                {canRemoveMembers && (
                                                    <td className="py-4 px-6 text-right">
                                                        <button onClick={() => handleRemoveMember(member.id)}
                                                            className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 w-8 h-8 rounded-lg flex items-center justify-center transition-all ml-auto" title="Remove member">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* PERMISSIONS CONFIGURATION CARD */
                    <div className="bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-gray-300 transition-all duration-500 p-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Permissions Matrix</h2>
                                <p className="text-slate-500 mt-1 text-sm">Configure granular access controls for {groupData?.name}</p>
                            </div>
                            <button onClick={() => setShowPermissionPage(false)}
                                className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium text-sm hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                                Cancel
                            </button>
                        </div>

                        {permsLoading ? (
                            <div className="py-24 flex justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" /></div>
                        ) : (
                            <div className="space-y-6 max-w-4xl">

                                {/* EDIT PERMISSIONS CARD — standalone like File Access Control */}
                                {(() => {
                                    const ws = perms['workspace'] || { enabled: false, existingId: null };
                                    const isOn = !!ws.can_access_edit_permissions;

                                    const handleToggleEditPerm = async () => {
                                        const newVal = !isOn;
                                        setPerms(prev => ({
                                            ...prev,
                                            workspace: { ...prev.workspace, can_access_edit_permissions: newVal }
                                        }));

                                        try {
                                            if (ws.existingId) {
                                                const { error } = await supabase
                                                    .from('permissions')
                                                    .update({ can_access_edit_permissions: newVal, updated_at: new Date().toISOString() })
                                                    .eq('id', ws.existingId);
                                                if (error) throw error;
                                            } else {
                                                const { data: inserted, error } = await supabase
                                                    .from('permissions')
                                                    .insert({
                                                        company_id: groupData.company_id,
                                                        group_id: groupData.id,
                                                        scope: 'workspace',
                                                        can_access_edit_permissions: newVal,
                                                        can_view: false,
                                                        can_add_members: false,
                                                        can_remove_members: false,
                                                        can_create_group: false,
                                                        can_delete_group: false,
                                                        can_access_documents: false,
                                                        can_access_groups: false,
                                                        can_access_settings: false,
                                                        can_access_branding: false,
                                                        can_access_watermarks: false,
                                                    })
                                                    .select('id')
                                                    .single();
                                                if (error) throw error;
                                                setPerms(prev => ({
                                                    ...prev,
                                                    workspace: { ...prev.workspace, existingId: inserted.id }
                                                }));
                                            }
                                            triggerToast("Permissions saved successfully");
                                        } catch (err) {
                                            console.error('Failed to save edit permission:', err);
                                            triggerToast("Failed to save: " + err.message);
                                            setPerms(prev => ({
                                                ...prev,
                                                workspace: { ...prev.workspace, can_access_edit_permissions: isOn }
                                            }));
                                        }
                                    };

                                    return (
                                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-base text-slate-800">Edit Permissions</p>
                                                    <p className="text-sm text-slate-500 mt-1">Allow this group to access and modify permission settings for other groups</p>
                                                </div>
                                                <button onClick={handleToggleEditPerm}
                                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-2 ${isOn ? 'bg-[var(--brand)]' : 'bg-slate-200'}`}>
                                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isOn ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })()}
                                {PERMISSION_SECTIONS.map(({ label, scope, description, subPerms }) => {
                                    const s = perms[scope] || { enabled: false, ...DEFAULT_PERMS, existingId: null };

                                    return (
                                        <div key={scope} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col">
                                            {/* Top Level Workspace Header */}
                                            <div className="flex items-center justify-between mb-6">
                                                <div>
                                                    <p className="font-semibold text-base text-slate-800">{label} Access Control</p>
                                                    <p className="text-sm text-slate-500 mt-1">{description}</p>
                                                </div>
                                                <button onClick={() => toggleSection(scope)}
                                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-2 ${s.enabled ? 'bg-[var(--brand)]' : 'bg-slate-200'}`}>
                                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${s.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                            </div>

                                            {/* Sub Modules (Groups, Settings) as Clean Cards */}
                                            {s.enabled && (
                                                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                    {subPerms.map((sub) => {
                                                        const isModuleOn = !!s[sub.key];

                                                        return (
                                                            <div key={sub.key} className={`border rounded-2xl transition-all duration-200 overflow-hidden ${isModuleOn ? 'border-slate-300 shadow-sm bg-white' : 'border-slate-200 bg-slate-50/50'}`}>

                                                                {/* Module Header */}
                                                                <div className="p-6 flex items-center justify-between">
                                                                    <div>
                                                                        <h4 className={`font-semibold ${isModuleOn ? 'text-slate-800' : 'text-slate-600'}`}>{sub.label} Module</h4>
                                                                        <p className="text-sm text-slate-500 mt-1">{sub.desc}</p>
                                                                    </div>
                                                                    <button onClick={() => toggleSubPerm(scope, sub.key)}
                                                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isModuleOn ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                                                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isModuleOn ? 'translate-x-4' : 'translate-x-0'}`} />
                                                                    </button>
                                                                </div>

                                                                {/* Granular Permissions (Shown if Module is ON) */}
                                                                {isModuleOn && sub.nested && sub.nested.length > 0 && (
                                                                    <div className="border-t border-slate-100 bg-slate-50/50 p-6 animate-in fade-in duration-300">
                                                                        <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-5">Granular Permissions</h5>
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
                                                                            {sub.nested.map(n => (
                                                                                <label key={n.key} className="flex items-start gap-3.5 cursor-pointer group">
                                                                                    <div className="mt-0.5 relative flex items-center justify-center">
                                                                                        <input type="checkbox" checked={!!s[n.key]} onChange={() => toggleSubPerm(scope, n.key)}
                                                                                            className="peer w-5 h-5 appearance-none border-2 border-slate-300 rounded-md checked:bg-[var(--brand)] checked:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-1 transition-all cursor-pointer" />
                                                                                        <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                                        </svg>
                                                                                    </div>
                                                                                    <div className="flex-1">
                                                                                        <span className={`block text-sm font-medium transition-colors ${s[n.key] ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-800'}`}>{n.label}</span>
                                                                                        <span className="block text-xs text-slate-500 mt-0.5">{n.desc}</span>
                                                                                    </div>
                                                                                </label>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* FILE ACCESS CARD — same style as Workspace Access Control */}
                                {
                                    (() => {
                                        const fs = perms['files'] || { enabled: false, can_create_folder: false, can_merge_folder: false, can_delete_folder: false, existingId: null };
                                        const folderPerms = [
                                            { key: 'can_create_folder', label: 'Create Folder', desc: 'Can create new folders in the workspace' },
                                            { key: 'can_merge_folder', label: 'Merge Folder', desc: 'Can merge folders together' },
                                            { key: 'can_delete_folder', label: 'Delete Folder', desc: 'Can permanently delete folders' },
                                        ];
                                        return (
                                            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div>
                                                        <p className="font-semibold text-base text-slate-800">File Access Control</p>
                                                        <p className="text-sm text-slate-500 mt-1">Manage folder-level permissions for this group</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => groupData?.id && router.push(`/documents/access?group=${groupData.id}`)}
                                                            title="Go to advanced file permissions"
                                                            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-[var(--brand-dark)] hover:text-white transition-colors">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                                        </button>
                                                        <button onClick={() => setPerms(prev => ({ ...prev, files: { ...(prev.files || {}), enabled: !fs.enabled } }))}
                                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-2 ${fs.enabled ? 'bg-[var(--brand)]' : 'bg-slate-200'}`}>
                                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${fs.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {fs.enabled && (
                                                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                        <div className="border rounded-2xl border-slate-300 shadow-sm bg-white overflow-hidden">
                                                            <div className="p-6">
                                                                <h4 className="font-semibold text-slate-800">Folder Permissions</h4>
                                                                <p className="text-sm text-slate-500 mt-1">Control what folder operations this group can perform</p>
                                                            </div>
                                                            <div className="border-t border-slate-100 bg-slate-50/50 p-6">
                                                                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-5">Granular Permissions</h5>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
                                                                    {folderPerms.map(fp => (
                                                                        <label key={fp.key} className="flex items-start gap-3.5 cursor-pointer group">
                                                                            <div className="mt-0.5 relative flex items-center justify-center">
                                                                                <input type="checkbox" checked={!!fs[fp.key]}
                                                                                    onChange={() => setPerms(prev => ({ ...prev, files: { ...prev.files, [fp.key]: !prev.files?.[fp.key] } }))}
                                                                                    className="peer w-5 h-5 appearance-none border-2 border-slate-300 rounded-md checked:bg-[var(--brand)] checked:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-1 transition-all cursor-pointer" />
                                                                                <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                                </svg>
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <span className={`block text-sm font-medium transition-colors ${fs[fp.key] ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-800'}`}>{fp.label}</span>
                                                                                <span className="block text-xs text-slate-500 mt-0.5">{fp.desc}</span>
                                                                            </div>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()
                                }
                            </div>
                        )}

                        <div className="mt-8 flex justify-end">
                            <button onClick={handleSubmitPermissions} disabled={saving || permsLoading}
                                className="bg-gradient-to-r from-[var(--brand)] to-[var(--brand-secondary)] text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-[0_8px_30px_rgba(var(--brand-rgb),0.14)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-500 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer">
                                {saving ? (
                                    <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Saving Changes...</>
                                ) : "Save Permissions"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* INVITE MODAL - Premium Glassmorphic */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-[var(--brand)]/20 backdrop-blur-sm flex items-center justify-center z-[200] p-6 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setShowInviteModal(false)}
                            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">✕</button>

                        <div className="w-10 h-10 rounded-xl bg-[var(--brand-50)] text-[var(--brand)] flex items-center justify-center mb-5">
                            <FaUserPlus size={16} />
                        </div>

                        <h2 className="text-xl font-semibold text-slate-800 mb-1">Invite Member</h2>
                        <p className="text-sm text-slate-500 mb-6">
                            Add a new member to <span className="font-semibold text-slate-700">{groupData?.name}</span>
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Candidate Email</label>
                                <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} type="email" placeholder="colleague@company.com"
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-slate-800 transition-colors placeholder:text-slate-400 placeholder:font-normal" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Message (Optional)</label>
                                <textarea value={inviteDescription} onChange={e => setInviteDescription(e.target.value)} rows="3" placeholder="Brief invitation message..."
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-slate-800 resize-none transition-colors placeholder:text-slate-400 placeholder:font-normal" />
                            </div>
                            <button onClick={handleInviteSubmit} disabled={inviting || !inviteEmail.trim()}
                                className="w-full bg-[var(--brand)] text-white py-3 rounded-xl font-medium text-sm shadow-md shadow-[0_8px_30px_rgba(var(--brand-rgb),0.14)] hover:bg-[var(--brand-dark)] transition-all active:scale-95 mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                                {inviting ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
                                ) : "Send Invitation"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

