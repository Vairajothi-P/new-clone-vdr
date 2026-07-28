"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaUserPlus, FaArrowLeft, FaPaperPlane, FaEnvelope, FaCheckCircle, FaFileSignature } from "react-icons/fa";

export default function InviteMemberPage() {
    const params = useParams();
    const router = useRouter();
    const groupSlug = params.slug;

    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteDescription, setInviteDescription] = useState("");
    const [requireNda, setRequireNda] = useState(true);
    const [inviting, setInviting] = useState(false);

    const [session, setSession] = useState(null);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const rawSession = localStorage.getItem("vdr_session");
        if (rawSession) setSession(JSON.parse(rawSession));
    }, []);

    // ── HITS DETAILS API JUST TO GET THE GROUP NAME ──
    useEffect(() => {
        if (!groupSlug || !session) return;
        const fetchGroup = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/groups/details', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session, groupSlug })
                });
                const data = await res.json();
                if (data.success) setGroupData(data.group);
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchGroup();
    }, [groupSlug, session]);

    const handleInviteSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(""); setSuccessMsg("");

        if (!inviteEmail.trim()) return setErrorMsg("Please enter a valid email address.");

        setInviting(true);
        try {
            const response = await fetch("/api/invite", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: inviteEmail, description: inviteDescription, group_id: groupData?.id,
                    invited_by: session.id, requires_nda: requireNda
                }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Failed to dispatch invitation.");

            setSuccessMsg(`Invitation sent successfully to ${inviteEmail}`);
            setInviteEmail(""); setInviteDescription(""); setRequireNda(true);
        } catch (err) {
            setErrorMsg("Error sending invitation: " + err.message);
        } finally {
            setInviting(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden font-sans bg-[#F8FAFC] relative">
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[var(--brand)]/10 to-transparent pointer-events-none" />

            <div className="pt-10 px-10 pb-6 shrink-0 relative z-10">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => router.push(`/groups/${groupSlug}`)} className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
                        <FaArrowLeft size={14} />
                    </button>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                            {loading ? "Loading..." : groupData?.name || "Group"} &rsaquo; Members
                        </p>
                        <h1 className="text-2xl font-semibold text-slate-800 tracking-tight flex items-center gap-3">
                            <span className="w-9 h-9 rounded-xl bg-[var(--brand)] text-white flex items-center justify-center shadow-sm">
                                <FaUserPlus size={15} />
                            </span>
                            Invite Member
                        </h1>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-10 pb-12">
                <div className="max-w-2xl mx-auto">
                    {successMsg && <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-4 mb-6 flex items-center gap-3 text-emerald-700 font-medium text-sm"><FaCheckCircle size={16} />{successMsg}</div>}
                    {errorMsg && <div className="bg-rose-50 border border-rose-200 rounded-2xl px-6 py-4 mb-6 flex items-center gap-3 text-rose-700 font-medium text-sm">⚠️ {errorMsg}</div>}

                    <div className="bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-3xl shadow-sm p-8 hover:border-gray-300 transition-all">
                        <form onSubmit={handleInviteSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Candidate Email <span className="text-rose-400">*</span></label>
                                <div className="relative">
                                    <FaEnvelope size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:border-[var(--brand)] outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message (Optional)</label>
                                <textarea value={inviteDescription} onChange={(e) => setInviteDescription(e.target.value)} rows={3} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-[var(--brand)] outline-none resize-none" />
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><FaFileSignature size={14} /></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">Require NDA Agreement</p>
                                        <p className="text-xs text-slate-500 font-medium">If enabled, user must sign NDA to complete registration.</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={requireNda} onChange={(e) => setRequireNda(e.target.checked)} />
                                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--brand)]"></div>
                                </label>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button type="button" onClick={() => router.push(`/groups/${groupSlug}`)} className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all">Cancel</button>
                                <button type="submit" disabled={inviting || !inviteEmail.trim()} className="flex-1 bg-[var(--brand)] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[var(--brand-dark)] transition-all flex justify-center items-center gap-2">
                                    {inviting ? "Sending..." : <><FaPaperPlane size={13} /> Send Invitation</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}







// "use client";

// import React, { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { supabase } from "@/utils/supabase/client";
// import { FaUserPlus, FaArrowLeft, FaPaperPlane, FaEnvelope, FaCheckCircle, FaFileSignature } from "react-icons/fa";

// export default function InviteMemberPage() {
//     const params = useParams();
//     const router = useRouter();
//     const groupSlug = params.slug;

//     const [groupData, setGroupData] = useState(null);
//     const [loading, setLoading] = useState(true);

//     const [inviteEmail, setInviteEmail] = useState("");
//     const [inviteDescription, setInviteDescription] = useState("");
//     const [requireNda, setRequireNda] = useState(true); // TOGGLE STATE (Default is ON)
//     const [inviting, setInviting] = useState(false);

//     const [session, setSession] = useState(null);
//     const [companyId, setCompanyId] = useState(null);

//     const [successMsg, setSuccessMsg] = useState("");
//     const [errorMsg, setErrorMsg] = useState("");

//     // Load session
//     useEffect(() => {
//         const rawSession = localStorage.getItem("vdr_session");
//         if (rawSession) {
//             const parsed = JSON.parse(rawSession);
//             setSession(parsed);
//             setCompanyId(parsed.company_id);
//         }
//     }, []);

//     // Fetch group data
//     useEffect(() => {
//         if (!groupSlug || !companyId) return;

//         const fetchGroup = async () => {
//             setLoading(true);
//             try {
//                 const { data: groups, error } = await supabase
//                     .from("groups")
//                     .select("*")
//                     .eq("company_id", companyId)
//                     .eq("id", groupSlug)
//                     .single();

//                 if (groups) setGroupData(groups);
//             } catch (err) {
//                 console.error(err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchGroup();
//     }, [groupSlug, companyId]);

//     const handleInviteSubmit = async (e) => {
//         e.preventDefault();
//         setErrorMsg("");
//         setSuccessMsg("");

//         if (!inviteEmail.trim()) return setErrorMsg("Please enter a valid email address.");

//         setInviting(true);
//         try {
//             const rawSession = localStorage.getItem("vdr_session");
//             if (!rawSession) return setErrorMsg("Session not found. Please log in again.");

//             const sessionData = JSON.parse(rawSession);

//             const response = await fetch("/api/invite", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     email: inviteEmail,
//                     description: inviteDescription,
//                     group_id: groupData?.id,
//                     invited_by: sessionData.id,
//                     requires_nda: requireNda // SENDS TOGGLE VALUE TO API
//                 }),
//             });

//             const result = await response.json();
//             if (!response.ok) throw new Error(result.error || "Failed to dispatch invitation.");

//             setSuccessMsg(`Invitation sent successfully to ${inviteEmail}`);
//             setInviteEmail("");
//             setInviteDescription("");
//             setRequireNda(true); // Reset toggle
//         } catch (err) {
//             console.error(err);
//             setErrorMsg("Error sending invitation: " + err.message);
//         } finally {
//             setInviting(false);
//         }
//     };

//     return (
//         <div className="flex-1 flex flex-col h-screen overflow-hidden font-sans bg-[#F8FAFC] relative">
//             <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[var(--brand)]/10 to-transparent pointer-events-none" />

//             <div className="pt-10 px-10 pb-6 shrink-0 relative z-10">
//                 <div className="flex items-center gap-4 mb-6">
//                     <button onClick={() => router.push(`/groups/${groupSlug}`)} className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
//                         <FaArrowLeft size={14} />
//                     </button>
//                     <div>
//                         <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
//                             {loading ? "Loading..." : groupData?.name || "Group"} &rsaquo; Members
//                         </p>
//                         <h1 className="text-2xl font-semibold text-slate-800 tracking-tight flex items-center gap-3">
//                             <span className="w-9 h-9 rounded-xl bg-[var(--brand)] text-white flex items-center justify-center shadow-sm">
//                                 <FaUserPlus size={15} />
//                             </span>
//                             Invite Member
//                         </h1>
//                     </div>
//                 </div>
//             </div>

//             <div className="flex-1 overflow-y-auto px-10 pb-12">
//                 <div className="max-w-2xl mx-auto">

//                     {successMsg && <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-4 mb-6 flex items-center gap-3 text-emerald-700 font-medium text-sm"><FaCheckCircle size={16} />{successMsg}</div>}
//                     {errorMsg && <div className="bg-rose-50 border border-rose-200 rounded-2xl px-6 py-4 mb-6 flex items-center gap-3 text-rose-700 font-medium text-sm">⚠️ {errorMsg}</div>}

//                     <div className="bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-3xl shadow-sm p-8 hover:border-gray-300 transition-all">
//                         <form onSubmit={handleInviteSubmit} className="space-y-6">

//                             <div>
//                                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Candidate Email <span className="text-rose-400">*</span></label>
//                                 <div className="relative">
//                                     <FaEnvelope size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
//                                     <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:border-[var(--brand)] outline-none" />
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message (Optional)</label>
//                                 <textarea value={inviteDescription} onChange={(e) => setInviteDescription(e.target.value)} rows={3} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-[var(--brand)] outline-none resize-none" />
//                             </div>

//                             {/* NDA TOGGLE IS BACK */}
//                             <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 flex items-center justify-between">
//                                 <div className="flex items-center gap-3">
//                                     <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
//                                         <FaFileSignature size={14} />
//                                     </div>
//                                     <div>
//                                         <p className="text-sm font-bold text-slate-800">Require NDA Agreement</p>
//                                         <p className="text-xs text-slate-500 font-medium">If enabled, user must sign NDA to complete registration.</p>
//                                     </div>
//                                 </div>
//                                 <label className="relative inline-flex items-center cursor-pointer">
//                                     <input
//                                         type="checkbox"
//                                         className="sr-only peer"
//                                         checked={requireNda}
//                                         onChange={(e) => setRequireNda(e.target.checked)}
//                                     />
//                                     <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--brand)]"></div>
//                                 </label>
//                             </div>

//                             <div className="flex items-center gap-3 pt-2">
//                                 <button type="button" onClick={() => router.push(`/groups/${groupSlug}`)} className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all">
//                                     Cancel
//                                 </button>
//                                 <button type="submit" disabled={inviting || !inviteEmail.trim()} className="flex-1 bg-[var(--brand)] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[var(--brand-dark)] transition-all flex justify-center items-center gap-2">
//                                     {inviting ? "Sending..." : <><FaPaperPlane size={13} /> Send Invitation</>}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }










// "use client";

// import React, { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { supabase } from "@/utils/supabase/client";
// import { FaUserPlus, FaArrowLeft, FaPaperPlane, FaEnvelope, FaCheckCircle } from "react-icons/fa";

// export default function InviteMemberPage() {
//     const params = useParams();
//     const router = useRouter();
//     const groupSlug = params.slug;

//     const [groupData, setGroupData] = useState(null);
//     const [loading, setLoading] = useState(true);

//     const [inviteEmail, setInviteEmail] = useState("");
//     const [inviteDescription, setInviteDescription] = useState("");
//     const [inviting, setInviting] = useState(false);

//     const [session, setSession] = useState(null);
//     const [companyId, setCompanyId] = useState(null);

//     const [successMsg, setSuccessMsg] = useState("");
//     const [errorMsg, setErrorMsg] = useState("");

//     // Load session
//     useEffect(() => {
//         const rawSession = localStorage.getItem("vdr_session");
//         if (rawSession) {
//             const parsed = JSON.parse(rawSession);
//             setSession(parsed);
//             setCompanyId(parsed.company_id);
//         }
//     }, []);

//     // Fetch group data
//     useEffect(() => {
//         if (!groupSlug || !companyId) return;

//         const fetchGroup = async () => {
//             setLoading(true);
//             try {
//                 const { data: groups, error } = await supabase
//                     .from("groups")
//                     .select("*")
//                     .eq("company_id", companyId)
//                     .eq("id", groupSlug)
//                     .single();

//                 if (error || !groups) {
//                     setGroupData(null);
//                 } else {
//                     setGroupData(groups);
//                 }
//             } catch (err) {
//                 console.error(err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchGroup();
//     }, [groupSlug, companyId]);

//     const handleInviteSubmit = async (e) => {
//         e.preventDefault();
//         setErrorMsg("");
//         setSuccessMsg("");

//         if (!inviteEmail.trim()) {
//             setErrorMsg("Please enter a valid email address.");
//             return;
//         }

//         setInviting(true);
//         try {
//             const rawSession = localStorage.getItem("vdr_session");
//             if (!rawSession) {
//                 setErrorMsg("Session not found. Please log in again.");
//                 return;
//             }
//             const sessionData = JSON.parse(rawSession);

//             const response = await fetch("/api/invite", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     email: inviteEmail,
//                     description: inviteDescription,
//                     group_id: groupData?.id,
//                     invited_by: sessionData.id,
//                 }),
//             });

//             const result = await response.json();
//             if (!response.ok) throw new Error(result.error || "Failed to dispatch invitation.");

//             // Success
//             setSuccessMsg(`Invitation sent successfully to ${inviteEmail}`);
//             setInviteEmail("");
//             setInviteDescription("");
//         } catch (err) {
//             console.error(err);
//             setErrorMsg("Error sending invitation: " + err.message);
//         } finally {
//             setInviting(false);
//         }
//     };

//     const handleBack = () => {
//         router.push(`/groups/${groupSlug}`);
//     };

//     return (
//         <div className="flex-1 flex flex-col h-screen overflow-hidden font-sans bg-[#F8FAFC] relative">
//             {/* Background gradient */}
//             <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[var(--brand)]/10 to-transparent pointer-events-none" />

//             {/* HEADER */}
//             <div className="pt-10 px-10 pb-6 shrink-0 relative z-10">
//                 <div className="flex items-center gap-4 mb-6">
//                     <button
//                         onClick={handleBack}
//                         className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 transition-all shadow-sm active:scale-95 cursor-pointer"
//                         title="Back to Group"
//                     >
//                         <FaArrowLeft size={14} />
//                     </button>
//                     <div>
//                         <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
//                             {loading ? "Loading..." : groupData?.name || "Group"} &rsaquo; Members
//                         </p>
//                         <h1 className="text-2xl font-semibold text-slate-800 tracking-tight flex items-center gap-3">
//                             <span className="w-9 h-9 rounded-xl bg-[var(--brand)] text-white flex items-center justify-center shadow-sm">
//                                 <FaUserPlus size={15} />
//                             </span>
//                             Invite Member
//                         </h1>
//                     </div>
//                 </div>
//             </div>

//             {/* CONTENT */}
//             <div className="flex-1 overflow-y-auto px-10 pb-12">
//                 <div className="max-w-2xl mx-auto">

//                     {/* Info Card */}
//                     <div className="bg-[var(--brand)]/5 border border-[var(--brand)]/15 rounded-2xl px-6 py-4 mb-6 flex items-start gap-3">
//                         <FaEnvelope className="text-[var(--brand)] mt-0.5 shrink-0" size={15} />
//                         <p className="text-sm text-slate-700">
//                             Invite a new member to join{" "}
//                             <span className="font-semibold text-slate-900">
//                                 {loading ? "this group" : groupData?.name || "this group"}
//                             </span>
//                             . They will receive an email with a link to join.
//                         </p>
//                     </div>

//                     {/* Success Message */}
//                     {successMsg && (
//                         <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-4 mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
//                             <FaCheckCircle className="text-emerald-500 shrink-0" size={16} />
//                             <p className="text-sm font-medium text-emerald-700">{successMsg}</p>
//                         </div>
//                     )}

//                     {/* Error Message */}
//                     {errorMsg && (
//                         <div className="bg-rose-50 border border-rose-200 rounded-2xl px-6 py-4 mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
//                             <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
//                             </svg>
//                             <p className="text-sm font-medium text-rose-700">{errorMsg}</p>
//                         </div>
//                     )}

//                     {/* Invite Form Card */}
//                     <div className="bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 hover:border-gray-300 transition-all duration-500">
//                         <form onSubmit={handleInviteSubmit} className="space-y-6">

//                             {/* Email Field */}
//                             <div>
//                                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
//                                     Candidate Email <span className="text-rose-400">*</span>
//                                 </label>
//                                 <div className="relative">
//                                     <FaEnvelope
//                                         size={14}
//                                         className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
//                                     />
//                                     <input
//                                         type="email"
//                                         value={inviteEmail}
//                                         onChange={(e) => setInviteEmail(e.target.value)}
//                                         placeholder="colleague@company.com"
//                                         required
//                                         className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Message Field */}
//                             <div>
//                                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
//                                     Invitation Message{" "}
//                                     <span className="text-slate-400 normal-case font-normal">(Optional)</span>
//                                 </label>
//                                 <textarea
//                                     value={inviteDescription}
//                                     onChange={(e) => setInviteDescription(e.target.value)}
//                                     rows={4}
//                                     placeholder="Write a brief message to the invitee explaining why they are being invited..."
//                                     className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10 resize-none transition-all placeholder:text-slate-400 placeholder:font-normal"
//                                 />
//                             </div>

//                             {/* Group Info (readonly) */}
//                             {groupData && (
//                                 <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
//                                     <div className="w-8 h-8 rounded-lg bg-[var(--brand)] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
//                                         {groupData.name?.charAt(0).toUpperCase()}
//                                     </div>
//                                     <div>
//                                         <p className="text-xs text-slate-500 font-medium">Inviting to group</p>
//                                         <p className="text-sm font-semibold text-slate-800">{groupData.name}</p>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Action Buttons */}
//                             <div className="flex items-center gap-3 pt-2">
//                                 <button
//                                     type="button"
//                                     onClick={handleBack}
//                                     className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 cursor-pointer"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     disabled={inviting || !inviteEmail.trim()}
//                                     className="flex-1 bg-gradient-to-r from-[var(--brand)] to-[var(--brand-secondary)] text-white py-3 rounded-xl font-semibold text-sm shadow-[0_8px_30px_rgba(var(--brand-rgb),0.2)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 flex justify-center items-center gap-2 cursor-pointer"
//                                 >
//                                     {inviting ? (
//                                         <>
//                                             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                                             Sending...
//                                         </>
//                                     ) : (
//                                         <>
//                                             <FaPaperPlane size={13} />
//                                             Send Invitation
//                                         </>
//                                     )}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>

//                     {/* Tip */}
//                     <p className="text-center text-xs text-slate-400 mt-5">
//                         The invitee will receive an email with a secure link to join <strong>{groupData?.name || "the group"}</strong>.
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// }
