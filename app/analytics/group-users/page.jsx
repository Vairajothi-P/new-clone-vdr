"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';

export default function GroupUsersPage() {
    const [rawGroups, setRawGroups] = useState([]);
    const [rawUserGroups, setRawUserGroups] = useState([]);
    const [rawLoginHistory, setRawLoginHistory] = useState([]);
    const [processedGroups, setProcessedGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Dynamic states
    const [sortOrder, setSortOrder] = useState('asc');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // 1. Fetch Raw Data Once
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const sessionRaw = localStorage.getItem('vdr_session');
                if (!sessionRaw) return;
                const session = JSON.parse(sessionRaw);
                const companyId = session.company_id;

                if (!companyId) return;

                // Fetch groups
                const { data: groupsData, error: groupsError } = await supabase
                    .from('groups')
                    .select('id, name')
                    .eq('company_id', companyId);
                
                if (groupsError) throw groupsError;

                const groupIds = (groupsData || []).map(g => g.id);
                setRawGroups(groupsData || []);

                // Fetch user_groups
                if (groupIds.length > 0) {
                    const { data: userGroupsData, error: ugError } = await supabase
                        .from('user_groups')
                        .select('user_id, group_id')
                        .in('group_id', groupIds);
                    if (ugError) throw ugError;
                    setRawUserGroups(userGroupsData || []);
                }

                // Fetch login history
                const { data: loginHistoryData, error: lhError } = await supabase
                    .from('login_history')
                    .select('user_id, created_at')
                    .eq('company_id', companyId)
                    .eq('action', 'LOGIN');
                
                if (lhError) throw lhError;
                setRawLoginHistory(loginHistoryData || []);

            } catch (err) {
                console.error("Failed to load group users data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // 2. Process Data (Filter by Date, Calculate Count, Sort)
    useEffect(() => {
        let history = rawLoginHistory;

        // Apply Date Filters
        if (startDate) {
            const start = new Date(startDate).getTime();
            history = history.filter(h => new Date(h.created_at).getTime() >= start);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            history = history.filter(h => new Date(h.created_at).getTime() <= end.getTime());
        }

        // Map and Calculate Counts
        let mapped = rawGroups.map(group => {
            const groupUsers = rawUserGroups
                .filter(ug => ug.group_id === group.id)
                .map(ug => ug.user_id);
            
            const loginCount = history
                .filter(log => groupUsers.includes(log.user_id))
                .length;

            return { id: group.id, name: group.name, loginCount };
        });

        // Sort
        if (sortOrder === 'asc') {
            mapped.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            mapped.sort((a, b) => b.name.localeCompare(a.name));
        }

        setProcessedGroups(mapped);
        setCurrentPage(1); // Reset to page 1 on filter/sort changes
    }, [rawGroups, rawUserGroups, rawLoginHistory, startDate, endDate, sortOrder]);

    // 3. Pagination Logic
    const totalItems = processedGroups.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentDisplayedGroups = processedGroups.slice(startIndex, endIndex);

    const handlePrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
    const handleNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));

    // 4. Export Logic
    const handleExport = () => {
        const csvHeader = "Group Name,Login Count\n";
        const csvBody = processedGroups.map(g => `"${g.name}",${g.loginCount}`).join('\n');
        const blob = new Blob([csvHeader + csvBody], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'group_users_analytics.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-8 bg-white min-h-full font-sans">
            {/* Header Section */}
            <div className="flex items-center gap-4 mb-8">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Groups & Users</h1>
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-3 py-1.5 border border-orange-300 rounded text-xs font-semibold text-gray-700 hover:bg-orange-50 transition-colors"
                >
                    EXPORT
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                    </svg>
                </button>
            </div>

            {/* Filter Section */}
            <div className="flex items-center gap-4 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 shrink-0">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-medium">Start Date</span>
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border-b border-gray-300 pb-1 text-sm text-gray-700 outline-none focus:border-[var(--brand)] bg-transparent"
                        />
                    </div>
                    <span className="text-gray-400 text-sm mt-3">-</span>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-medium">End Date</span>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border-b border-gray-300 pb-1 text-sm text-gray-700 outline-none focus:border-[var(--brand)] bg-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="w-full text-sm">
                {/* Table Header */}
                <div className="grid grid-cols-2 px-4 py-3 text-gray-700 font-semibold border-b border-gray-100">
                    <div 
                        className="flex items-center gap-2 cursor-pointer hover:text-gray-900 select-none"
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        title="Click to sort"
                    >
                        Group Name
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                            className={`text-gray-400 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                        >
                            <line x1="12" y1="19" x2="12" y2="5" />
                            <polyline points="5 12 12 5 19 12" />
                        </svg>
                    </div>
                    <div>Login Count</div>
                </div>

                {/* Table Body */}
                <div className="flex flex-col relative min-h-[150px]">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                            <div className="w-6 h-6 border-2 border-gray-300 border-t-[var(--brand)] rounded-full animate-spin"></div>
                        </div>
                    ) : currentDisplayedGroups.length > 0 ? (
                        currentDisplayedGroups.map((group, index) => (
                            <div 
                                key={group.id} 
                                className={`grid grid-cols-2 px-4 py-3 border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}
                            >
                                <div className="text-gray-500">{group.name}</div>
                                <div className="text-gray-600 underline cursor-pointer hover:text-gray-900 font-medium">
                                    {group.loginCount}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 text-center text-gray-400">
                            No groups found for the selected filters.
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-end gap-6 py-4 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                        <span>Items per page:</span>
                        <select 
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="border-b border-gray-300 pb-0.5 text-gray-500 outline-none bg-transparent cursor-pointer"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                    
                    <div className="text-gray-500">
                        {totalItems > 0 ? `${startIndex + 1}-${endIndex} of ${totalItems}` : '0 of 0'}
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handlePrevPage}
                            disabled={currentPage === 1 || totalItems === 0}
                            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <button 
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages || totalItems === 0}
                            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
