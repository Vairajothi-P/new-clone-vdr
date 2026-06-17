"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { FaUserPlus, FaCog } from "react-icons/fa";

const PERMISSION_SECTIONS = [
    {
        label: "Groups",
        scope: "group",
        description: "Control group management access",
        subPerms: [
            { key: "can_add_members", label: "Add Members", desc: "Can invite & add users to groups" },
            { key: "can_remove_members", label: "Remove Members", desc: "Can remove users from groups" },
        ],
    },
    {
        label: "Settings",
        scope: "settings",
        description: "Grant access to workspace settings",
        subPerms: [],
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
    const groupSlug = params.slug;

    const [members, setMembers] = useState([]);
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showPermissionPage, setShowPermissionPage] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteDescription, setInviteDescription] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState("");

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
                    scope,
                    can_view: scope === "settings" ? true : false,
                    can_edit: s.can_edit || false,
                    can_download: s.can_download || false,
                    can_delete: s.can_delete || false,
                    can_add_members: s.can_add_members || false,
                    can_remove_members: s.can_remove_members || false,
                    can_print: false,
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

    const triggerToast = (msg) => {
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden font-sans">

            {/* TOAST */}
            {showToast && (
                <div className="fixed top-8 right-8 bg-black text-white px-8 py-4 rounded-2xl shadow-2xl z-[100] animate-bounce font-black font-sans uppercase text-xs tracking-widest">
                    {toastMsg}
                </div>
            )}

            {/* HEADER */}
            <div className="pt-12 px-12 pb-8">
                <h1 className="text-5xl font-black font-sans text-black uppercase tracking-tighter">
                    {groupData ? `${groupData.name} Members` : "Loading..."}
                </h1>
                <p className="text-gray-400 mt-2 font-black font-sans text-xs tracking-[0.3em] uppercase">
                    {groupData?.description || "Administration & Access Management"}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto px-12 pb-12 mt-4 font-sans">

                {!showPermissionPage ? (
                    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-12">
                        <div className="flex items-center gap-12 mb-12">
                            <button onClick={() => setShowInviteModal(true)}
                                className="flex items-center gap-3 text-black font-black font-sans uppercase text-[11px] tracking-[0.2em] hover:opacity-50 transition-all">
                                <FaUserPlus size={22} className="text-slate-900" />
                                <span>Invite Member</span>
                            </button>
                            <button onClick={() => setShowPermissionPage(true)}
                                className="flex items-center gap-3 text-black font-black font-sans uppercase text-[11px] tracking-[0.2em] hover:opacity-50 transition-all">
                                <FaCog size={22} className="text-slate-900" />
                                <span>Edit Permission</span>
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b-4 border-gray-50">
                                        <th className="py-6 font-black font-sans text-black text-[10px] uppercase tracking-[0.3em]">Name</th>
                                        <th className="py-6 font-black font-sans text-black text-[10px] uppercase tracking-[0.3em]">Email Address</th>
                                        <th className="py-6 font-black font-sans text-black text-[10px] uppercase tracking-[0.3em]">Phone Number</th>
                                        <th className="py-6 font-black font-sans text-black text-[10px] uppercase tracking-[0.3em]">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        <tr><td colSpan="4" className="py-24 text-center font-black font-sans text-gray-200 uppercase tracking-[0.5em] text-xl">Decrypting...</td></tr>
                                    ) : members.length === 0 ? (
                                        <tr><td colSpan="4" className="py-24 text-center font-black font-sans text-gray-300 uppercase tracking-widest">No members assigned to this sector</td></tr>
                                    ) : (
                                        members.map((member) => (
                                            <tr key={member.id} className="group hover:bg-gray-50/80 transition-all duration-300">
                                                <td className="py-7 font-black font-sans text-black text-base tracking-tight">{member.name}</td>
                                                <td className="py-7 text-gray-500 font-bold font-sans text-sm tracking-wide">{member.email}</td>
                                                <td className="py-7 text-gray-500 font-bold font-sans text-sm tracking-wide">{member.phone_number}</td>
                                                <td className="py-7 text-sm">
                                                    <span className={`px-5 py-2 rounded-full text-[10px] font-black font-sans uppercase tracking-[0.15em] ${member.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                        {member.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                ) : (
                    <div className="bg-white rounded-[2.5rem] p-16 shadow-2xl border border-gray-100">

                        <div className="flex justify-between items-start mb-14">
                            <div>
                                <h2 className="text-5xl font-black font-sans text-black uppercase tracking-tighter">Group Permissions</h2>
                                <p className="text-gray-400 font-black font-sans mt-3 uppercase text-[10px] tracking-[0.4em] border-b-2 border-black/10 pb-4 inline-block">
                                    Configuring access for @{groupData?.name}
                                </p>
                            </div>
                            <button onClick={() => setShowPermissionPage(false)}
                                className="bg-black text-white px-12 py-4 rounded-[1.2rem] font-black font-sans uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-all shadow-xl">
                                Back to List
                            </button>
                        </div>

                        {permsLoading ? (
                            <div className="py-24 text-center font-black font-sans text-gray-200 uppercase tracking-[0.5em] text-xl">Loading...</div>
                        ) : (
                            <div className="space-y-5">
                                {PERMISSION_SECTIONS.map(({ label, scope, description, subPerms }) => {
                                    const s = perms[scope] || { enabled: false, ...DEFAULT_PERMS, existingId: null };
                                    const hasSubPerms = subPerms.length > 0;

                                    return (
                                        <div key={scope}
                                            className={`rounded-2xl border-2 transition-all duration-300 overflow-hidden ${s.enabled ? "border-black" : "border-gray-100"}`}>

                                            <div className="flex items-center justify-between px-8 py-6">
                                                <div className="flex items-center gap-5">
                                                    <div onClick={() => toggleSection(scope)}
                                                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer shrink-0 ${s.enabled ? "bg-black border-black" : "bg-white border-gray-300 hover:border-black"}`}>
                                                        {s.enabled && (
                                                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-black font-sans text-sm uppercase tracking-widest text-black">{label} Access</p>
                                                        <p className="font-bold font-sans text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">{description}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    {!hasSubPerms && s.enabled && (
                                                        <span className="text-[9px] font-black font-sans uppercase tracking-widest text-gray-400 border border-gray-200 rounded-full px-3 py-1">
                                                            Full Access
                                                        </span>
                                                    )}
                                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black font-sans uppercase tracking-widest ${s.enabled ? "bg-black text-white" : "bg-gray-100 text-gray-400"}`}>
                                                        {s.enabled ? "Enabled" : "Disabled"}
                                                    </span>
                                                </div>
                                            </div>

                                            {s.enabled && hasSubPerms && (
                                                <div className="px-8 pb-7 pt-1 border-t-2 border-gray-50">
                                                    <div className={`grid gap-4 ${subPerms.length === 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2"}`}>
                                                        {subPerms.map(({ key, label: subLabel, desc }) => (
                                                            <div key={key} onClick={() => toggleSubPerm(scope, key)}
                                                                className={`flex flex-col gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all select-none ${s[key] ? "border-black bg-black/5" : "border-gray-100 bg-white hover:border-gray-300"}`}>
                                                                <div className="flex items-center justify-between">
                                                                    <span className={`font-black font-sans text-[11px] uppercase tracking-widest ${s[key] ? "text-black" : "text-gray-500"}`}>
                                                                        {subLabel}
                                                                    </span>
                                                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${s[key] ? "bg-black border-black" : "bg-white border-gray-300"}`}>
                                                                        {s[key] && (
                                                                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <span className="font-bold font-sans text-[9px] uppercase tracking-wider text-gray-400">{desc}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <button onClick={handleSubmitPermissions} disabled={saving || permsLoading}
                            className="mt-14 bg-black text-white px-16 py-5 rounded-[1.5rem] font-black font-sans uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:bg-gray-800 transition-all block mx-auto disabled:opacity-40 disabled:cursor-not-allowed">
                            {saving ? "Saving..." : "Save Permissions"}
                        </button>
                    </div>
                )}
            </div>

            {/* ── INVITE MODAL ──────────────────────────────────────────────── */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-6">
                    <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] p-12 relative">
                        <button onClick={() => setShowInviteModal(false)}
                            className="absolute top-8 right-10 text-3xl text-gray-300 hover:text-black font-light font-sans">✕</button>
                        <h2 className="text-4xl font-black font-sans text-black uppercase tracking-tighter mb-2">Member Invite</h2>
                        <p className="text-gray-400 font-black font-sans mb-10 text-[10px] tracking-[0.3em] uppercase">
                            Sector: <span className="text-black">@{groupData?.name}</span>
                        </p>
                        <div className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-black font-sans text-black uppercase tracking-widest mb-3">Candidate Email</label>
                                <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} type="email" placeholder="USER@VDR.COM"
                                    className="w-full bg-gray-50 border-none rounded-2xl p-5 font-black font-sans text-black text-sm outline-none focus:ring-4 focus:ring-black/5 placeholder:text-gray-300" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black font-sans text-black uppercase tracking-widest mb-3">Brief Message</label>
                                <textarea value={inviteDescription} onChange={e => setInviteDescription(e.target.value)} rows="4" placeholder="DESCRIBE THE ROLE..."
                                    className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold font-sans text-black text-sm outline-none focus:ring-4 focus:ring-black/5 resize-none placeholder:text-gray-300" />
                            </div>
                            <button onClick={handleInviteSubmit}
                                className="w-full bg-black text-white py-6 rounded-2xl font-black font-sans uppercase tracking-[0.3em] text-xs shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">
                                Dispatch Invitation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
