"use client";

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function GroupsSidebar({ isOpen = true, onToggle }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentView = searchParams.get('view') || 'members';

    const [groupCount, setGroupCount] = useState(5);
    const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);

    const [navItems, setNavItems] = useState([
        {
            name: 'Sub Admin',
            href: '/groups/subadmin?view=members',
            icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
            badge: groupCount,
            isActive: currentView === 'members'
        }
    ]);

    const handleCreateGroup = () => {
        if (!newGroupName.trim()) return;

        // Create new group object
        const newGroup = {
            name: newGroupName,
            href: `/groups/${newGroupName.toLowerCase().replace(/\s+/g, '-')}?view=members`,
            icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
            badge: 0,
            isActive: false
        };

        // Add to navItems
        setNavItems([...navItems, newGroup]);
        
        // Reset form
        setNewGroupName('');
        setIsAddGroupModalOpen(false);

        // Show toast
        setToastMessage(`Group "${newGroupName}" created successfully!`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleCreateGroup();
        }
    };

    return (
        <>
            <aside className={`${isOpen ? 'w-64 border-r' : 'w-0 border-r-0'} transition-all duration-300 overflow-hidden bg-white border-gray-200 shrink-0 h-full hidden md:flex flex-col justify-between`}>
                <div className="w-64 flex-1 flex flex-col h-full overflow-y-auto">
                    {/* Header - Groups */}
                    <div className="p-5 flex items-center justify-between">
                        <h2 className="text-[15px] font-bold text-gray-800 tracking-tight uppercase">Groups</h2>
                    </div>

                    {/* Sub Header - Active Members */}
                    <div className="px-5 pb-5 border-b border-gray-100">
                        <h2 className="text-[15px] font-bold text-gray-800 tracking-tight uppercase">Active Members</h2>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex flex-col py-1">
                        {navItems.map((item) => {
                            const active = item.name.toLowerCase() === currentView.toLowerCase();
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center justify-between px-6 py-2.5 text-[14px] font-bold transition-colors ${active
                                            ? 'text-slate-900 bg-slate-50 border-r-2 border-slate-900'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? 'text-slate-800' : 'text-gray-400'}>
                                            {item.icon}
                                        </svg>
                                        <span>{item.name}</span>
                                    </div>
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-slate-200 text-slate-800' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Add Groups Button Section */}
                <div className="p-5 border-t border-gray-100 w-64 bg-gray-50/30 select-none">
                    <button 
                        onClick={() => setIsAddGroupModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Groups
                    </button>
                </div>
            </aside>

            {/* Modal Overlay */}
            {isAddGroupModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-96 p-6 animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[18px] font-bold text-gray-800">Create New Group</h3>
                            <button 
                                onClick={() => {
                                    setIsAddGroupModalOpen(false);
                                    setNewGroupName('');
                                }}
                                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="mb-6">
                            <label className="block text-[13px] font-bold text-gray-700 mb-2">Group Name</label>
                            <input 
                                type="text"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter group name..."
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-[14px] text-black placeholder:text-black"
                            />
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    setIsAddGroupModalOpen(false);
                                    setNewGroupName('');
                                }}
                                className="flex-1 px-4 py-2.5 text-[13px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleCreateGroup}
                                disabled={!newGroupName.trim()}
                                className="flex-1 px-4 py-2.5 text-[13px] font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                            >
                                Create Group
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-bold text-[13px] animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
                    ✓ {toastMessage}
                </div>
            )}
        </>
    );
}