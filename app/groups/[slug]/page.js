"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { FaUserPlus, FaCog } from "react-icons/fa";
import { NAV_ITEMS } from "@/lib/nav-items";

const PERMISSION_SECTIONS = [
    {
        label: "Groups",
        scope: "group",
        description: "Control group management access",
        subPerms: [
            { key: "can_add_members", label: "Add Members", desc: "Can invite & add users to groups" },
            { key: "can_remove_members", label: "Remove Members", desc: "Can remove users from groups" },
            { key: "can_create_group", label: "Create Group", desc: "Can create new groups" },
            { key: "can_delete_group", label: "Delete Group", desc: "Can delete existing groups" },
        ],
    },
    {
        label: "Settings",
        scope: "settings",
        description: "Grant access to workspace settings",
        subPerms: [],
    },
    {
        label: "Workspace",
        scope: "workspace",
        description: "Control access to navigation modules",
        // Dynamically built from NAV_ITEMS — add a new item in lib/nav-items.js and it appears here automatically
        subPerms: NAV_ITEMS.map(item => ({
            key: `can_access_${item.key}`,
            label: item.label,
            desc: `Can access the ${item.label} module`,
        })),
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

    const [canAddMembers, setCanAddMembers] = useState(false);
    const [canRemoveMembers, setCanRemoveMembers] = useState(false);

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
                return;
            }

            const { data: ugRows } = await supabase
                .from('user_groups')
                .select('group_id')
                .eq('user_id', session.id);

            const groupIds = ugRows?.map(r => r.group_id) || [];
            if (!groupIds.length) return;

            const { data: perms } = await supabase
                .from('permissions')
                .select('can_add_members, can_remove_members')
                .eq('company_id', companyId)
                .eq('scope', 'group')
                .in('group_id', groupIds);

            if (perms && perms.length > 0) {
                setCanAddMembers(perms.some(p => p.can_add_members));
                setCanRemoveMembers(perms.some(p => p.can_remove_members));
            }
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
                        can_access_settings: row?.can_access_settings ?? false,
                        workspace_id: row?.workspace_id ?? null,
                        existingId: row?.id ?? null,
                    };
                });
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
            for (const { scope } of PERMISSION_SECTIONS) {
                const s = perms[scope];
                if (!s) continue;

                if (!s.enabled) {
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
                    workspace_id: groupData.company_id,
                    scope,
                    can_view: scope === "settings" ? true : false,
                    can_add_members: s.can_add_members || false,
                    can_remove_members: s.can_remove_members || false,
                    can_access_documents: s.can_access_documents || false,
                    can_access_groups: s.can_access_groups || false,
                    can_access_settings: s.can_access_settings || false,
                    folder_id: null,
                    document_id: null,
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
        <div className="flex-1 flex flex-col h-screen overflow-hidden font-sans bg-[#F8F9FB] relative">

            {/* TOAST */}
            {showToast && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl z-[100] animate-in slide-in-from-bottom-8 fade-in duration-300 font-medium font-sans text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    {toastMsg}
                </div>
            )}

            {/* HEADER */}
            <div className="pt-10 px-10 pb-6 shrink-0 relative z-10">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
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
                                    className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95">
                                    <FaUserPlus size={14} className="text-slate-500" />
                                    <span>Invite Member</span>
                                </button>
                            )}
                            <button onClick={() => setShowPermissionPage(true)}
                                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-medium text-sm hover:bg-slate-800 transition-all shadow-md active:scale-95">
                                <FaCog size={14} className="text-white/80" />
                                <span>Edit Permissions</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-10 pb-12 mt-2">
                {!showPermissionPage ? (
                    /* MEMBERS TABLE CARD */
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
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
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
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
                                {PERMISSION_SECTIONS.map(({ label, scope, description, subPerms }) => {
                                    const s = perms[scope] || { enabled: false, ...DEFAULT_PERMS, existingId: null };
                                    const hasSubPerms = subPerms.length > 0;

                                    return (
                                        <div key={scope} className={`rounded-xl border transition-all duration-300 overflow-hidden ${s.enabled ? "border-slate-300 bg-white shadow-sm" : "border-slate-100 bg-slate-50/50"}`}>
                                            <div className="flex items-center justify-between px-6 py-5">
                                                <div>
                                                    <p className={`font-semibold text-sm ${s.enabled ? "text-slate-800" : "text-slate-500"}`}>{label} Access</p>
                                                    <p className="text-sm text-slate-500 mt-0.5">{description}</p>
                                                </div>
                                                <div className="flex items-center gap-5">
                                                    {!hasSubPerms && s.enabled && (
                                                        <span className="text-xs font-medium text-slate-500 bg-slate-100 rounded-md px-2.5 py-1">Full Access</span>
                                                    )}
                                                    <button onClick={() => toggleSection(scope)}
                                                        className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 ${s.enabled ? 'bg-slate-800' : 'bg-slate-300'}`}>
                                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${s.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                                    </button>
                                                </div>
                                            </div>

                                            {s.enabled && hasSubPerms && (
                                                <div className="px-6 pb-6 pt-2">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {subPerms.map(({ key, label: subLabel, desc }) => (
                                                            <div key={key} onClick={() => toggleSubPerm(scope, key)}
                                                                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all select-none group ${s[key] ? "border-slate-800 bg-slate-800/5" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                                                                <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-all shrink-0 border ${s[key] ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-300 group-hover:border-slate-400"}`}>
                                                                    {s[key] && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                                                </div>
                                                                <div>
                                                                    <span className={`block font-semibold text-sm ${s[key] ? "text-slate-800" : "text-slate-600"}`}>{subLabel}</span>
                                                                    <span className="block text-xs text-slate-500 mt-0.5">{desc}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* STANDALONE FILES ACCESS LINK */}
                                <div onClick={() => { if(groupData?.id) router.push(`/documents/access?group=${groupData.id}`) }}
                                     className="rounded-xl border border-slate-200 bg-white hover:border-slate-300 cursor-pointer transition-all duration-300 overflow-hidden group">
                                    <div className="flex items-center justify-between px-6 py-5">
                                        <div>
                                            <p className="font-semibold text-sm text-slate-800">Files Access</p>
                                            <p className="text-sm text-slate-500 mt-0.5">Navigate to advanced folder & document permissions</p>
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 flex justify-end">
                            <button onClick={handleSubmitPermissions} disabled={saving || permsLoading}
                                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium text-sm shadow-md shadow-slate-900/10 hover:shadow-lg hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
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
                <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-[200] p-6 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setShowInviteModal(false)}
                            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">✕</button>
                        
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
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
                            <button onClick={handleInviteSubmit}
                                className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium text-sm shadow-md shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95 mt-2">
                                Send Invitation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

