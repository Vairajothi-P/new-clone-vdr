// "use client";

// import { useState, useEffect } from "react";
// import { useParams } from "next/navigation";
// import { supabase } from "@/utils/supabase/client";
// import { FaUserPlus, FaCog } from "react-icons/fa";

// export default function DynamicGroupPage() {
//     const params = useParams();
//     const groupSlug = params.slug;

//     const [members, setMembers] = useState([]);
//     const [groupData, setGroupData] = useState(null);
//     const [loading, setLoading] = useState(true);

//     // RESTORED UI STATES
//     const [showPermissionPage, setShowPermissionPage] = useState(false);
//     const [showInviteModal, setShowInviteModal] = useState(false);
//     const [inviteEmail, setInviteEmail] = useState("");
//     const [inviteDescription, setInviteDescription] = useState("");
//     const [selectedPermissions, setSelectedPermissions] = useState([]);
//     const [showToast, setShowToast] = useState(false);

//     // Permission Categories
//     const workspacePermissions = ["Documents", "Groups", "Settings"];
//     const filePermissions = ["Create Workspace", "Edit Workspace", "Delete Workspace", "Manage Members", "View Reports"];

//     useEffect(() => {
//         const fetchGroupAndMembers = async () => {
//             setLoading(true);
//             try {
//                 const decodedName = groupSlug.replace(/-/g, ' ');
//                 const { data: group } = await supabase.from("groups").select("*").ilike('name', decodedName).single();

//                 if (group) {
//                     setGroupData(group);
//                     const { data: users } = await supabase.from("users").select("*").ilike('role', group.name);
//                     setMembers(users || []);
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         };
//         if (groupSlug) fetchGroupAndMembers();
//     }, [groupSlug]);
//     useEffect(() => {
//         const fetchGroupMembers = async () => {
//             setLoading(true);

//             try {
//                 const searchName = decodeURIComponent(groupSlug)
//                     .replace(/[-_]/g, " ")
//                     .trim()
//                     .toLowerCase();

//                 console.log("SEARCH NAME:", searchName);

//                 // Get all groups
//                 const { data: groups, error: groupsError } = await supabase
//                     .from("groups")
//                     .select("*");

//                 if (groupsError) {
//                     console.error("GROUPS ERROR:", groupsError);
//                     setMembers([]);
//                     return;
//                 }

//                 // Match slug with group name
//                 const group = groups.find(
//                     (g) =>
//                         g.name
//                             ?.toLowerCase()
//                             .replace(/[-_]/g, " ")
//                             .trim() === searchName
//                 );

//                 console.log("FOUND GROUP:", group);

//                 if (!group) {
//                     console.error("Group not found");
//                     setMembers([]);
//                     return;
//                 }

//                 setGroupData(group);

//                 // Fetch users matching role = group.name
//                 const { data: users, error: usersError } = await supabase
//                     .from("users")
//                     .select(`
//                         id,
//                         name,
//                         email,
//                         phone_number,
//                         status
//                     `)
//                     .eq("role", group.name);

//                 console.log("USERS DATA:", users);
//                 console.log("USERS ERROR:", usersError);

//                 if (usersError) {
//                     setMembers([]);
//                     return;
//                 }

//                 setMembers(users || []);

//             } catch (err) {
//                 console.error("CATCH ERROR:", err);
//                 setMembers([]);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (groupSlug) {
//             fetchGroupMembers();
//         }
//     }, [groupSlug]);



//     const handleInviteSubmit = () => {
//         setShowInviteModal(false);
//         setInviteEmail("");
//         setInviteDescription("");
//         alert("Invitation Sent Successfully!");
//     };

//     return (
//         <div className="flex-1 flex flex-col h-screen overflow-hidden font sans">

//             {/* TOAST NOTIFICATION */}
//             {showToast && (
//                 <div className="fixed top-8 right-8 bg-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl z-[100] animate-bounce font-black uppercase text-xs tracking-widest">
//                     Permission Applied Successfully
//                 </div>
//             )}

//             {/* DYNAMIC HEADER */}
//             <div className="pt-12 px-12 pb-8">
//                 <h1 className="text-5xl font-black text-black uppercase tracking-tighter">
//                     {groupData ? `${groupData.name} Members` : "Loading..."}
//                 </h1>
//                 <p className="text-gray-400 mt-2 font-black text-xs tracking-[0.3em] uppercase">
//                     {groupData?.description || "Administration & Access Management"}
//                 </p>
//             </div>

//             <div className="flex-1 overflow-y-auto px-12 pb-12 mt-4 font-sans">
//                 {!showPermissionPage ? (
//                     <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-12">

//                         {/* ACTION BUTTONS (RESTORED) */}
//                         <div className="flex items-center gap-12 mb-12">
//                             <button onClick={() => setShowInviteModal(true)} className="flex items-center gap-3 text-black font-black uppercase text-[11px] tracking-[0.2em] hover:opacity-50 transition-all">
//                                 <FaUserPlus size={22} className="text-slate-900" /> <span>Invite Member</span>
//                             </button>
//                             <button onClick={() => setShowPermissionPage(true)} className="flex items-center gap-3 text-black font-black uppercase text-[11px] tracking-[0.2em] hover:opacity-50 transition-all">
//                                 <FaCog size={22} className="text-slate-900" /> <span>Edit Permission</span>
//                             </button>
//                         </div>

//                         {/* TABLE */}
//                         <div className="overflow-x-auto">
//                             <table className="w-full text-left">
//                                 <thead>
//                                     <tr className="border-b-4 border-gray-50">
//                                         <th className="py-6 font-black text-black text-[10px] uppercase tracking-[0.3em]">Name</th>
//                                         <th className="py-6 font-black text-black text-[10px] uppercase tracking-[0.3em]">Email Address</th>
//                                         <th className="py-6 font-black text-black text-[10px] uppercase tracking-[0.3em]">Phone Number</th>
//                                         <th className="py-6 font-black text-black text-[10px] uppercase tracking-[0.3em]">Status</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-gray-50">
//                                     {loading ? (
//                                         <tr><td colSpan="3" className="py-24 text-center font-black text-gray-200 uppercase tracking-[0.5em] text-xl">Decrypting...</td></tr>
//                                     ) : members.length === 0 ? (
//                                         <tr><td colSpan="3" className="py-24 text-center font-black text-gray-300 uppercase tracking-widest font sans">No members assigned to this sector</td></tr>
//                                     ) : (
//                                         members.map((member) => (
//                                             <tr key={member.id} className="group hover:bg-gray-50/80 transition-all duration-300">
//                                                 <td className="py-7 font-black text-black text-base tracking-tight">{member.name}</td>
//                                                 <td className="py-7 text-gray-500 font-bold text-sm tracking-wide">{member.email}</td>
//                                                 <td className="py-7 text-gray-500 font-bold text-sm tracking-wide">
//                                                     {member.phone_number}
//                                                 </td>
//                                                 <td className="py-7 text-sm">
//                                                     <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] ${member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//                                                         {member.status}
//                                                     </span>
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 ) : (
//                     /* RESTORED PERMISSION PAGE DESIGN */
//                     <div className="bg-white rounded-[2.5rem] p-16 shadow-2xl border border-gray-100 animate-in slide-in-from-right-10 duration-500">
//                         <div className="flex justify-between items-start mb-16">
//                             <div>
//                                 <h2 className="text-5xl font-black text-black uppercase font sans tracking-tighter">Group Permissions</h2>
//                                 <p className="text-gray-400 font-black mt-3 uppercase text-[10px] tracking-[0.4em] font sans border-b-2 border-black/10 pb-4 inline-block">
//                                     Configuring access for @{groupData?.name}
//                                 </p>
//                             </div>
//                             <button onClick={() => setShowPermissionPage(false)} className="bg-black text-white px-12 py-4 rounded-[1.2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-all shadow-xl">
//                                 Back to List
//                             </button>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
//                             {/* Workspace Permissions */}
//                             <div className="space-y-6">
//                                 <h3 className="font-black text-black uppercase text-xs tracking-widest mb-8 flex items-center gap-3">
//                                     <span className="w-8 h-1 bg-black"></span> Workspace Settings
//                                 </h3>
//                                 {workspacePermissions.map(p => (
//                                     <label key={p} className="flex items-center gap-5 p-6 border-2 border-gray-50 rounded-2xl cursor-pointer hover:border-black transition-all group">
//                                         <input type="checkbox" className="w-6 h-6 accent-black" />
//                                         <span className="font-black text-gray-700 uppercase text-xs tracking-widest group-hover:text-black">{p} Access</span>
//                                     </label>
//                                 ))}
//                             </div>

//                             {/* File Permissions */}
//                             <div className="space-y-6">
//                                 <h3 className="font-black text-black uppercase text-xs tracking-widest mb-8 flex items-center gap-3">
//                                     <span className="w-8 h-1 bg-black"></span> File & Resource control
//                                 </h3>
//                                 {filePermissions.map(p => (
//                                     <label key={p} className="flex items-center gap-5 p-6 border-2 border-gray-50 rounded-2xl cursor-pointer hover:border-black transition-all group">
//                                         <input type="checkbox" className="w-6 h-6 accent-black" />
//                                         <span className="font-black text-gray-700 uppercase text-xs tracking-widest group-hover:text-black">{p}</span>
//                                     </label>
//                                 ))}
//                             </div>
//                         </div>

//                         <button onClick={() => { setShowToast(true); setTimeout(() => setShowToast(false), 3000); setShowPermissionPage(false); }}
//                             className="mt-20 bg-black text-white px-16 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:bg-gray-800 transition-all block mx-auto">
//                             Submit All Permissions
//                         </button>
//                     </div>
//                 )}
//             </div>

//             {/* RESTORED INVITE MODAL DESIGN */}
//             {showInviteModal && (
//                 <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
//                     <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] p-12 relative overflow-hidden animate-in zoom-in-95 duration-300">
//                         <button onClick={() => setShowInviteModal(false)} className="absolute top-8 right-10 text-3xl text-gray-300 hover:text-black font-light">✕</button>

//                         <h2 className="text-4xl font-black text-black uppercase font sans tracking-tighter mb-2">Member Invite</h2>
//                         <p className="text-gray-400 font-black mb-10 text-[10px] tracking-[0.3em] uppercase font sans">Sector: <span className="text-black">@{groupData?.name}</span></p>

//                         <div className="space-y-8">
//                             <div>
//                                 <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-3 font sans">Candidate Email</label>
//                                 <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} type="email" placeholder="USER@VDR.COM"
//                                     className="w-full bg-gray-50 border-none rounded-2xl p-5 font-black text-black text-sm outline-none focus:ring-4 focus:ring-black/5 placeholder:text-gray-300" />
//                             </div>

//                             <div>
//                                 <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-3 font sans">Brief Message</label>
//                                 <textarea value={inviteDescription} onChange={e => setInviteDescription(e.target.value)} rows="4" placeholder="DESCRIBE THE ROLE..."
//                                     className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold text-black text-sm outline-none focus:ring-4 focus:ring-black/5 resize-none placeholder:text-gray-300" />
//                             </div>

//                             <button onClick={handleInviteSubmit}
//                                 className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">
//                                 Dispatch Invitation
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }



"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { FaUserPlus, FaCog } from "react-icons/fa";

export default function DynamicGroupPage() {
    const params = useParams();
    const groupSlug = params.slug;

    const [members, setMembers] = useState([]);
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);

    // RESTORED UI STATES
    const [showPermissionPage, setShowPermissionPage] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteDescription, setInviteDescription] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [showToast, setShowToast] = useState(false);

    // Permission Categories
    const workspacePermissions = ["Documents", "Groups", "Settings"];
    const filePermissions = ["Create Workspace", "Edit Workspace", "Delete Workspace", "Manage Members", "View Reports"];

    // 🔥 SINGLE WORKING EFFECT: Fetches group details & members by matching allowed columns
    useEffect(() => {
        const fetchGroupMembers = async () => {
            setLoading(true);
            try {
                const searchName = decodeURIComponent(groupSlug)
                    .replace(/[-_]/g, " ")
                    .trim()
                    .toLowerCase();

                // Get all groups
                const { data: groups, error: groupsError } = await supabase
                    .from("groups")
                    .select("*");

                if (groupsError) {
                    setMembers([]);
                    return;
                }

                // Match slug with group name
                const group = groups.find(
                    (g) =>
                        g.name
                            ?.toLowerCase()
                            .replace(/[-_]/g, " ")
                            .trim() === searchName
                );

                if (!group) {
                    setMembers([]);
                    return;
                }

                setGroupData(group);

                const roleValue = group.name.trim();

                // Query ONLY the allowed columns from users to avoid 404 permission errors
                const { data: users, error: usersError } = await supabase
                    .from("users")
                    .select(`
                        id,
                        name,
                        email,
                        phone_number,
                        status
                    `)
                    .eq("role", roleValue);

                if (usersError) {
                    console.error(usersError);
                    setMembers([]);
                    return;
                }

                setMembers(users || []);
            } catch (err) {
                console.error(err);
                setMembers([]);
            } finally {
                setLoading(false);
            }
        };

        if (groupSlug) {
            fetchGroupMembers();
        }
    }, [groupSlug]);

    // 🔥 UPDATED: Sends API request to route.js and saves details in invitations table
    const handleInviteSubmit = async () => {
        if (!inviteEmail.trim()) {
            alert("Please enter a candidate email.");
            return;
        }

        try {
            // Get current user session from local storage to find who is sending the invitation
            const rawSession = localStorage.getItem('vdr_session');
            if (!rawSession) {
                alert("Session not found. Please log in again.");
                return;
            }
            const session = JSON.parse(rawSession);
            const invitedBy = session.id;

            if (!groupData) {
                alert("Sector data is not loaded yet.");
                return;
            }

            // Dispatch request to invite backend API
            const response = await fetch('/api/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: inviteEmail,
                    description: inviteDescription,
                    group_id: groupData.id,
                    invited_by: invitedBy
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to dispatch invitation.");
            }

            // Success actions
            setShowInviteModal(false);
            setInviteEmail("");
            setInviteDescription("");
            alert("Invitation Dispatched and saved successfully!");
        } catch (err) {
            console.error("Invitation Dispatch Error:", err);
            alert("Error sending invitation: " + err.message);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden font sans">

            {/* TOAST NOTIFICATION */}
            {showToast && (
                <div className="fixed top-8 right-8 bg-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl z-[100] animate-bounce font-black uppercase text-xs tracking-widest">
                    Permission Applied Successfully
                </div>
            )}

            {/* DYNAMIC HEADER */}
            <div className="pt-12 px-12 pb-8">
                <h1 className="text-5xl font-black text-black uppercase tracking-tighter">
                    {groupData ? `${groupData.name} Members` : "Loading..."}
                </h1>
                <p className="text-gray-400 mt-2 font-black text-xs tracking-[0.3em] uppercase">
                    {groupData?.description || "Administration & Access Management"}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto px-12 pb-12 mt-4 font-sans">
                {!showPermissionPage ? (
                    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-12">

                        {/* ACTION BUTTONS (RESTORED) */}
                        <div className="flex items-center gap-12 mb-12">
                            <button onClick={() => setShowInviteModal(true)} className="flex items-center gap-3 text-black font-black uppercase text-[11px] tracking-[0.2em] hover:opacity-50 transition-all">
                                <FaUserPlus size={22} className="text-slate-900" /> <span>Invite Member</span>
                            </button>
                            <button onClick={() => setShowPermissionPage(true)} className="flex items-center gap-3 text-black font-black uppercase text-[11px] tracking-[0.2em] hover:opacity-50 transition-all">
                                <FaCog size={22} className="text-slate-900" /> <span>Edit Permission</span>
                            </button>
                        </div>

                        {/* TABLE */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b-4 border-gray-50">
                                        <th className="py-6 font-black text-black text-[10px] uppercase tracking-[0.3em]">Name</th>
                                        <th className="py-6 font-black text-black text-[10px] uppercase tracking-[0.3em]">Email Address</th>
                                        <th className="py-6 font-black text-black text-[10px] uppercase tracking-[0.3em]">Phone Number</th>
                                        <th className="py-6 font-black text-black text-[10px] uppercase tracking-[0.3em]">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        <tr><td colSpan="3" className="py-24 text-center font-black text-gray-200 uppercase tracking-[0.5em] text-xl">Decrypting...</td></tr>
                                    ) : members.length === 0 ? (
                                        <tr><td colSpan="3" className="py-24 text-center font-black text-gray-300 uppercase tracking-widest font sans">No members assigned to this sector</td></tr>
                                    ) : (
                                        members.map((member) => (
                                            <tr key={member.id} className="group hover:bg-gray-50/80 transition-all duration-300">
                                                <td className="py-7 font-black text-black text-base tracking-tight">{member.name}</td>
                                                <td className="py-7 text-gray-500 font-bold text-sm tracking-wide">{member.email}</td>
                                                <td className="py-7 text-gray-500 font-bold text-sm tracking-wide">
                                                    {member.phone_number}
                                                </td>
                                                <td className="py-7 text-sm">
                                                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] ${member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
                    /* RESTORED PERMISSION PAGE DESIGN */
                    <div className="bg-white rounded-[2.5rem] p-16 shadow-2xl border border-gray-100 animate-in slide-in-from-right-10 duration-500">
                        <div className="flex justify-between items-start mb-16">
                            <div>
                                <h2 className="text-5xl font-black text-black uppercase font sans tracking-tighter">Group Permissions</h2>
                                <p className="text-gray-400 font-black mt-3 uppercase text-[10px] tracking-[0.4em] font sans border-b-2 border-black/10 pb-4 inline-block">
                                    Configuring access for @{groupData?.name}
                                </p>
                            </div>
                            <button onClick={() => setShowPermissionPage(false)} className="bg-black text-white px-12 py-4 rounded-[1.2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-all shadow-xl">
                                Back to List
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            {/* Workspace Permissions */}
                            <div className="space-y-6">
                                <h3 className="font-black text-black uppercase text-xs tracking-widest mb-8 flex items-center gap-3">
                                    <span className="w-8 h-1 bg-black"></span> Workspace Settings
                                </h3>
                                {workspacePermissions.map(p => (
                                    <label key={p} className="flex items-center gap-5 p-6 border-2 border-gray-50 rounded-2xl cursor-pointer hover:border-black transition-all group">
                                        <input type="checkbox" className="w-6 h-6 accent-black" />
                                        <span className="font-black text-gray-700 uppercase text-xs tracking-widest group-hover:text-black">{p} Access</span>
                                    </label>
                                ))}
                            </div>

                            {/* File Permissions */}
                            <div className="space-y-6">
                                <h3 className="font-black text-black uppercase text-xs tracking-widest mb-8 flex items-center gap-3">
                                    <span className="w-8 h-1 bg-black"></span> File & Resource control
                                </h3>
                                {filePermissions.map(p => (
                                    <label key={p} className="flex items-center gap-5 p-6 border-2 border-gray-50 rounded-2xl cursor-pointer hover:border-black transition-all group">
                                        <input type="checkbox" className="w-6 h-6 accent-black" />
                                        <span className="font-black text-gray-700 uppercase text-xs tracking-widest group-hover:text-black">{p}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button onClick={() => { setShowToast(true); setTimeout(() => setShowToast(false), 3000); setShowPermissionPage(false); }}
                            className="mt-20 bg-black text-white px-16 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:bg-gray-800 transition-all block mx-auto">
                            Submit All Permissions
                        </button>
                    </div>
                )}
            </div>

            {/* RESTORED INVITE MODAL DESIGN */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] p-12 relative overflow-hidden animate-in zoom-in-95 duration-300">
                        <button onClick={() => setShowInviteModal(false)} className="absolute top-8 right-10 text-3xl text-gray-300 hover:text-black font-light">✕</button>

                        <h2 className="text-4xl font-black text-black uppercase font sans tracking-tighter mb-2">Member Invite</h2>
                        <p className="text-gray-400 font-black mb-10 text-[10px] tracking-[0.3em] uppercase font sans">Sector: <span className="text-black">@{groupData?.name}</span></p>

                        <div className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-3 font sans">Candidate Email</label>
                                <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} type="email" placeholder="USER@VDR.COM"
                                    className="w-full bg-gray-50 border-none rounded-2xl p-5 font-black text-black text-sm outline-none focus:ring-4 focus:ring-black/5 placeholder:text-gray-300" />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-3 font sans">Brief Message</label>
                                <textarea value={inviteDescription} onChange={e => setInviteDescription(e.target.value)} rows="4" placeholder="DESCRIBE THE ROLE..."
                                    className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold text-black text-sm outline-none focus:ring-4 focus:ring-black/5 resize-none placeholder:text-gray-300" />
                            </div>

                            <button onClick={handleInviteSubmit}
                                className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">
                                Dispatch Invitation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
