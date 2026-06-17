// "use client";

// import Link from 'next/link';
// import { usePathname, useSearchParams } from 'next/navigation';
// // import { useState } from 'react';
// import { useState, useEffect } from 'react';
// import { supabase } from '@/utils/supabase/client';

// export default function GroupsSidebar({ isOpen = true, onToggle }) {
//     const pathname = usePathname();
//     const searchParams = useSearchParams();
//     const currentView = searchParams.get('view') || 'members';

//     const [groupCount, setGroupCount] = useState(5);
//     const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
//     const [newGroupName, setNewGroupName] = useState('');
//     const [toastMessage, setToastMessage] = useState('');
//     const [showToast, setShowToast] = useState(false);

//     const [navItems, setNavItems] = useState([
//         {
//             name: 'Sub Admin',
//             href: '/groups/subadmin?view=members',
//             icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
//             badge: groupCount,
//             isActive: currentView === 'members'
//         }
//     ]);

//     const handleCreateGroup = () => {
//         if (!newGroupName.trim()) return;

//         // Create new group object
//         const newGroup = {
//             name: newGroupName,
//             href: `/groups/${newGroupName.toLowerCase().replace(/\s+/g, '-')}?view=members`,
//             icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
//             badge: 0,
//             isActive: false
//         };

//         // Add to navItems
//         setNavItems([...navItems, newGroup]);

//         // Reset form
//         setNewGroupName('');
//         setIsAddGroupModalOpen(false);

//         // Show toast
//         setToastMessage(`Group "${newGroupName}" created successfully!`);
//         setShowToast(true);
//         setTimeout(() => setShowToast(false), 3000);
//     };

//     const handleKeyPress = (e) => {
//         if (e.key === 'Enter') {
//             handleCreateGroup();
//         }
//     };

//     return (
//         <>
//             <aside className={`${isOpen ? 'w-64 border-r' : 'w-0 border-r-0'} transition-all duration-300 overflow-hidden bg-white border-gray-200 shrink-0 h-full hidden md:flex flex-col justify-between`}>
//                 <div className="w-64 flex-1 flex flex-col h-full overflow-y-auto">
//                     {/* Header - Groups */}
//                     <div className="p-5 flex items-center justify-between">
//                         <h2 className="text-[15px] font-bold text-gray-800 tracking-tight uppercase">Groups</h2>
//                     </div>

//                     {/* Sub Header - Active Members */}
//                     <div className="px-5 pb-5 border-b border-gray-100">
//                         <h2 className="text-[15px] font-bold text-gray-800 tracking-tight uppercase">Active Members</h2>
//                     </div>

//                     {/* Navigation Items */}
//                     <nav className="flex flex-col py-1">
//                         {navItems.map((item) => {
//                             const active = item.name.toLowerCase() === currentView.toLowerCase();
//                             return (
//                                 <Link
//                                     key={item.name}
//                                     href={item.href}
//                                     className={`flex items-center justify-between px-6 py-2.5 text-[14px] font-bold transition-colors ${active
//                                         ? 'text-slate-900 bg-slate-50 border-r-2 border-slate-900'
//                                         : 'text-gray-600 hover:bg-gray-50'
//                                         }`}
//                                 >
//                                     <div className="flex items-center gap-3">
//                                         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? 'text-slate-800' : 'text-gray-400'}>
//                                             {item.icon}
//                                         </svg>
//                                         <span>{item.name}</span>
//                                     </div>
//                                     {item.badge !== undefined && item.badge > 0 && (
//                                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-slate-200 text-slate-800' : 'bg-gray-100 text-gray-500'
//                                             }`}>
//                                             {item.badge}
//                                         </span>
//                                     )}
//                                 </Link>
//                             );
//                         })}
//                     </nav>
//                 </div>

//                 {/* Add Groups Button Section */}
//                 <div className="p-5 border-t border-gray-100 w-64 bg-gray-50/30 select-none">
//                     <button
//                         onClick={() => setIsAddGroupModalOpen(true)}
//                         className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
//                     >
//                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                             <line x1="12" y1="5" x2="12" y2="19" />
//                             <line x1="5" y1="12" x2="19" y2="12" />
//                         </svg>
//                         Add Groups
//                     </button>
//                 </div>
//             </aside>

//             {/* Modal Overlay */}
//             {isAddGroupModalOpen && (
//                 <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-xl shadow-2xl w-96 p-6 animate-in fade-in zoom-in-95 duration-200">
//                         {/* Modal Header */}
//                         <div className="flex items-center justify-between mb-4">
//                             <h3 className="text-[18px] font-bold text-gray-800">Create New Group</h3>
//                             <button
//                                 onClick={() => {
//                                     setIsAddGroupModalOpen(false);
//                                     setNewGroupName('');
//                                 }}
//                                 className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
//                             >
//                                 ×
//                             </button>
//                         </div>

//                         {/* Modal Body */}
//                         <div className="mb-6">
//                             <label className="block text-[13px] font-bold text-gray-700 mb-2">Group Name</label>
//                             <input
//                                 type="text"
//                                 value={newGroupName}
//                                 onChange={(e) => setNewGroupName(e.target.value)}
//                                 onKeyPress={handleKeyPress}
//                                 placeholder="Enter group name..."
//                                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-[14px] text-black placeholder:text-black"
//                             />
//                         </div>

//                         {/* Modal Footer */}
//                         <div className="flex gap-3">
//                             <button
//                                 onClick={() => {
//                                     setIsAddGroupModalOpen(false);
//                                     setNewGroupName('');
//                                 }}
//                                 className="flex-1 px-4 py-2.5 text-[13px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleCreateGroup}
//                                 disabled={!newGroupName.trim()}
//                                 className="flex-1 px-4 py-2.5 text-[13px] font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
//                             >
//                                 Create Group
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Toast Notification */}
//             {showToast && (
//                 <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-bold text-[13px] animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
//                     ✓ {toastMessage}
//                 </div>
//             )}
//         </>
//     );
// }



// ai code 

// "use client";

// import Link from 'next/link';
// import { usePathname, useSearchParams } from 'next/navigation';
// import { useState, useEffect } from 'react';
// import { supabase } from '@/utils/supabase/client';

// const GROUP_ICON = (
//     <>
//         <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
//         <circle cx="9" cy="7" r="4" />
//         <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
//         <path d="M16 3.13a4 4 0 0 1 0 7.75" />
//     </>
// );

// export default function GroupsSidebar({ isOpen = true, onToggle }) {
//     const pathname = usePathname();
//     const searchParams = useSearchParams();
//     const currentView = searchParams.get('view') || 'members';

//     const [navItems, setNavItems] = useState([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
//     const [newGroupName, setNewGroupName] = useState('');
//     const [newGroupDescription, setNewGroupDescription] = useState('');
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [toastMessage, setToastMessage] = useState('');
//     const [showToast, setShowToast] = useState(false);

//     // ─── GET dynamic groups from Supabase ──────────────────
//     useEffect(() => {
//         const fetchGroups = async () => {
//             setIsLoading(true);
//             try {
//                 // Simplified fetch to ensure names display correctly
//                 const { data, error } = await supabase
//                     .from('groups')
//                     .select('*')
//                     .order('created_at', { ascending: false });

//                 if (error) {
//                     console.error("Supabase Error:", error.message);
//                 } else if (data) {
//                     console.log("Groups loaded from DB:", data);
//                     const mapped = data.map(g => ({
//                         id: g.id,
//                         name: g.name,
//                         href: `/groups/${g.name.toLowerCase().replace(/\s+/g, '-')}?view=members`,
//                         icon: GROUP_ICON,
//                         badge: 0 
//                     }));
//                     setNavItems(mapped);
//                 }
//             } catch (err) {
//                 console.error("Fetch error:", err);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchGroups();
//     }, []);

//     // ─── INSERT New Group into Supabase ──────────────────────────────────────
//     const handleCreateGroup = async () => {
//         if (!newGroupName.trim() || isSubmitting) return;

//         setIsSubmitting(true);
//         try {
//             const session = JSON.parse(localStorage.getItem('vdr_session'));

//             const { data, error } = await supabase
//                 .from('groups')
//                 .insert({
//                     name: newGroupName.trim(),
//                     description: newGroupDescription.trim() || null,
//                     company_id: session?.company_id,
//                     created_by: session?.id
//                 })
//                 .select()
//                 .single();

//             if (error) {
//                 alert(error.message);
//             } else {
//                 const newItem = {
//                     id: data.id,
//                     name: data.name,
//                     href: `/groups/${data.name.toLowerCase().replace(/\s+/g, '-')}?view=members`,
//                     icon: GROUP_ICON,
//                     badge: 0
//                 };

//                 setNavItems(prev => [newItem, ...prev]);
//                 setNewGroupName('');
//                 setNewGroupDescription('');
//                 setIsAddGroupModalOpen(false);
//                 setToastMessage(`Group "${data.name}" created successfully!`);
//                 setShowToast(true);
//                 setTimeout(() => setShowToast(false), 3000);
//             }
//         } catch (err) {
//             console.error("Create error:", err);
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     const handleKeyPress = (e) => {
//         if (e.key === 'Enter') handleCreateGroup();
//     };

//     return (
//         <>
//             <aside className={`${isOpen ? 'w-64 border-r' : 'w-0 border-r-0'} transition-all duration-300 overflow-hidden bg-white border-gray-200 shrink-0 h-full hidden md:flex flex-col justify-between`}>
//                 <div className="w-64 flex-1 flex flex-col h-full overflow-y-auto">
//                     <div className="p-5 flex items-center justify-between">
//                         <h2 className="text-[15px] font-bold text-gray-800 tracking-tight uppercase">Groups</h2>
//                     </div>

//                     <div className="px-5 pb-5 border-b border-gray-100">
//                         <h2 className="text-[15px] font-bold text-gray-800 tracking-tight uppercase">Active Members</h2>
//                     </div>

//                     <nav className="flex flex-col py-1">
//                         {isLoading ? (
//                             <div className="px-6 py-4 space-y-3">
//                                 <div className="h-4 bg-gray-200 animate-pulse rounded w-full"></div>
//                                 <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
//                                 <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
//                             </div>
//                         ) : navItems.length === 0 ? (
//                             <div className="px-6 py-10 text-gray-400 text-[13px] italic text-center">
//                                 No groups found in database.
//                             </div>
//                         ) : (
//                             navItems.map((item) => {
//                                 const active = pathname.includes(item.href.split('?')[0]);
//                                 return (
//                                     <Link
//                                         key={item.id}
//                                         href={item.href}
//                                         className={`flex items-center justify-between px-6 py-3 text-[14px] font-bold transition-all ${active
//                                                 ? 'text-slate-900 bg-slate-50 border-r-4 border-slate-900'
//                                                 : 'text-gray-600 hover:bg-gray-50'
//                                             }`}
//                                     >
//                                         <div className="flex items-center gap-3">
//                                             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? 'text-slate-800' : 'text-gray-400'}>
//                                                 {item.icon}
//                                             </svg>
//                                             <span className="truncate">{item.name}</span>
//                                         </div>
//                                         {item.badge > 0 && (
//                                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-slate-200 text-slate-800' : 'bg-gray-100 text-gray-500'}`}>
//                                                 {item.badge}
//                                             </span>
//                                         )}
//                                     </Link>
//                                 );
//                             })
//                         )}
//                     </nav>
//                 </div>

//                 <div className="p-5 border-t border-gray-100 w-64 bg-gray-50/30 select-none">
//                     <button 
//                         onClick={() => setIsAddGroupModalOpen(true)}
//                         className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
//                     >
//                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                             <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
//                         </svg>
//                         Add Groups
//                     </button>
//                 </div>
//             </aside>

//             {isAddGroupModalOpen && (
//                 <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-xl shadow-2xl w-96 p-6 animate-in fade-in zoom-in-95 duration-200">
//                         <div className="flex items-center justify-between mb-4">
//                             <h3 className="text-[18px] font-bold text-gray-800">Create New Group</h3>
//                             <button onClick={() => { setIsAddGroupModalOpen(false); setNewGroupName(''); }} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
//                         </div>

//                         <div className="space-y-4">
//                             <div>
//                                 <label className="block text-[13px] font-bold text-gray-700 mb-2">Group Name *</label>
//                                 <input 
//                                     type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} onKeyPress={handleKeyPress}
//                                     placeholder="Enter group name..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-black appearance-none"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-[13px] font-bold text-gray-700 mb-2">Description (Optional)</label>
//                                 <textarea 
//                                     value={newGroupDescription} onChange={(e) => setNewGroupDescription(e.target.value)}
//                                     placeholder="Brief group description..." rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-black resize-none"
//                                 />
//                             </div>
//                         </div>

//                         <div className="flex gap-3 mt-6">
//                             <button onClick={() => { setIsAddGroupModalOpen(false); setNewGroupName(''); }} className="flex-1 px-4 py-2.5 text-[13px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
//                             <button 
//                                 onClick={handleCreateGroup} disabled={!newGroupName.trim() || isSubmitting}
//                                 className="flex-1 px-4 py-2.5 text-[13px] font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors"
//                             >
//                                 {isSubmitting ? "Creating..." : "Create Group"}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {showToast && (
//                 <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-bold text-[13px] animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
//                     ✓ {toastMessage}
//                 </div>
//             )}
//         </>
//     );
// }






"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';

const GROUP_ICON = (
    <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>
);

const TRASH_ICON = (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6" /><path d="M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
);

export default function GroupsSidebar({ isOpen = true }) {
    const pathname = usePathname();
    const [navItems, setNavItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDescription, setNewGroupDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchGroups = async () => {
            setIsLoading(true);
            const session = JSON.parse(localStorage.getItem('vdr_session'));
            const userRole = session?.role;
            const userId = session?.id;
            const companyId = session?.company_id;

            if (userRole === 'external_user') {
                const { data: ugRows } = await supabase
                    .from('user_groups')
                    .select('group_id')
                    .eq('user_id', userId);

                const groupIds = ugRows?.map(r => r.group_id) || [];
                if (!groupIds.length) { setNavItems([]); setIsLoading(false); return; }

                const { data } = await supabase
                    .from('groups')
                    .select('*')
                    .in('id', groupIds)
                    .eq('company_id', companyId);

                setNavItems((data || []).map(g => ({
                    id: g.id, name: g.name, href: `/groups/${g.id}`
                })));

            } else {
                const { data } = await supabase
                    .from('groups')
                    .select('*')
                    .eq('company_id', companyId)
                    .order('created_at', { ascending: false });

                let groups = data || [];

                if (userRole === 'admin') {
                    groups = groups.filter(g => {
                        const n = g.name.trim().toLowerCase().replace(/\s+/g, '_');
                        return !['super_admin', 'admin'].includes(n);
                    });
                } else if (userRole === 'sub_admin') {
                    groups = groups.filter(g => {
                        const n = g.name.trim().toLowerCase().replace(/\s+/g, '_');
                        return !['super_admin', 'admin', 'sub_admin'].includes(n);
                    });
                }

                setNavItems(groups.map(g => ({
                    id: g.id, name: g.name, href: `/groups/${g.id}`
                })));
            }

            setIsLoading(false);
        };

        fetchGroups();
    }, []);

    const handleDeleteGroup = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        const { error } = await supabase
            .from("groups")
            .delete()
            .eq("id", deleteTarget.id);
        if (!error) {
            setNavItems(prev => prev.filter(g => g.id !== deleteTarget.id));
        }
        setIsDeleting(false);
        setDeleteTarget(null);
    };

    const handleCreateGroup = async () => {
        if (!newGroupName.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const session = JSON.parse(localStorage.getItem('vdr_session'));
            const { data, error } = await supabase.from('groups').insert({
                name: newGroupName.trim(),
                description: newGroupDescription.trim() || null,
                company_id: session?.company_id,
                created_by: session?.id
            }).select().single();

            if (!error && data) {
                setNavItems(prev => [{
                    id: data.id,
                    name: data.name,
                    href: `/groups/${data.id}`
                }, ...prev]);
                setIsAddGroupModalOpen(false);
                setNewGroupName('');
                setNewGroupDescription('');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <aside className={`${isOpen ? 'w-64 border-r' : 'w-0 border-r-0'} transition-all duration-300 bg-white flex flex-col h-screen sticky top-0 shrink-0 font-sans`}>
                <div className="flex-1 overflow-y-auto">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-[14px] font-bold font-sans text-gray-800 tracking-tight uppercase">Active Members</h2>
                    </div>

                    <nav className="py-2">
                        {isLoading ? (
                            <div className="p-6 space-y-4 animate-pulse"><div className="h-4 bg-gray-100 rounded w-full"></div></div>
                        ) : (
                            navItems.map((item) => {
                                const active = pathname === item.href;
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className={`group flex items-center justify-between px-6 py-3 transition-all ${
                                            active
                                                ? 'bg-slate-50 border-r-2 border-slate-900 text-slate-900 font-bold'
                                                : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={active ? 'text-slate-900' : 'text-gray-400'}>
                                                {GROUP_ICON}
                                            </svg>
                                            <span className="text-[14px] font-sans truncate">{item.name}</span>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setDeleteTarget({ id: item.id, name: item.name });
                                            }}
                                            className="text-gray-800 hover:text-red-500 transition-colors"
                                            title="Delete group"
                                        >
                                            {TRASH_ICON}
                                        </button>
                                    </Link>
                                );
                            })
                        )}
                    </nav>
                </div>

                <div className="p-5 border-t border-gray-100 bg-gray-50/30">
                    <button onClick={() => setIsAddGroupModalOpen(true)} className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-bold font-sans text-[13px] hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Add Groups
                    </button>
                </div>
            </aside>

            {/* ── Delete Confirmation Modal ─────────────────────────────── */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl font-sans">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                                {TRASH_ICON}
                            </div>
                            <h3 className="text-[16px] font-bold font-sans text-gray-800">Delete Group</h3>
                        </div>
                        <p className="text-[14px] font-sans text-gray-600 mb-1">
                            Are you sure you want to delete
                        </p>
                        <p className="text-[14px] font-bold font-sans text-gray-900 mb-5">
                            "{deleteTarget.name}"?
                        </p>
                        <p className="text-[12px] font-sans text-red-500 mb-6">
                            ⚠ This action cannot be undone. All members in this group will be unlinked.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold font-sans text-[13px] hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteGroup}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold font-sans text-[13px] hover:bg-red-700 transition disabled:opacity-50"
                            >
                                {isDeleting ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add Group Modal ───────────────────────────────────────── */}
            {isAddGroupModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 font-sans">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold font-sans text-gray-800 uppercase ">Create New Group</h3>
                            <button onClick={() => setIsAddGroupModalOpen(false)} className="text-gray-400 hover:text-black font-sans">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold font-sans text-black uppercase tracking-widest mb-2">Group Name</label>
                                <input type="text" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Enter group name..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900 text-black font-sans" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold font-sans text-black uppercase tracking-widest mb-2">Description</label>
                                <textarea value={newGroupDescription} onChange={e => setNewGroupDescription(e.target.value)} placeholder="Description (Optional)" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900 resize-none text-black font-sans" rows="3" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setIsAddGroupModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold font-sans">Cancel</button>
                                <button onClick={handleCreateGroup} disabled={!newGroupName.trim() || isSubmitting} className="flex-1 py-3 bg-black text-white rounded-lg font-bold font-sans disabled:opacity-50">
                                    {isSubmitting ? "Creating..." : "Create"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
