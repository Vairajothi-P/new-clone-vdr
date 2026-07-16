"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { X, List, BarChart2 } from "lucide-react";

export default function FolderActivityPage() {
    // Raw Data States
    const [rawDocuments, setRawDocuments] = useState([]);
    const [rawFolders, setRawFolders] = useState([]);
    const [rawEditLogs, setRawEditLogs] = useState([]);
    const [processedFolders, setProcessedFolders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter & UI States
    const [sortOrder, setSortOrder] = useState('asc');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [modalData, setModalData] = useState([]);
    const [loadingModal, setLoadingModal] = useState(false);
    const [modalView, setModalView] = useState('table'); // 'table', 'chart'

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

                // Fetch Folders
                const { data: foldersData, error: foldersError } = await supabase
                    .from('folders')
                    .select('id, name')
                    .eq('company_id', companyId)
                    .eq('is_deleted', false);
                if (foldersError) throw foldersError;
                setRawFolders(foldersData || []);

                // Fetch Documents
                const { data: documentsData, error: docsError } = await supabase
                    .from('documents')
                    .select('id, name, folder_id')
                    .eq('company_id', companyId)
                    .eq('is_deleted', false);
                if (docsError) throw docsError;
                setRawDocuments(documentsData || []);

                const docIds = (documentsData || []).map(d => d.id);

                if (docIds.length > 0) {
                    // Fetch Edit Logs (Downloads)
                    const { data: editLogs, error: editError } = await supabase
                        .from('document_edit_logs')
                        .select('document_id, action_type, changed_at, user_id')
                        .in('document_id', docIds);
                    if (editError) throw editError;
                    setRawEditLogs(editLogs || []);
                }
            } catch (err) {
                console.error("Failed to load folder activity data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // 2. Process Data (Filter, Calculate, Sort)
    useEffect(() => {
        let folders = rawFolders;

        // Apply Search Filter
        if (searchQuery.trim() !== '') {
            folders = folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        // Apply Date Filters
        let filteredEditLogs = rawEditLogs;

        if (startDate) {
            const start = new Date(startDate).getTime();
            filteredEditLogs = filteredEditLogs.filter(log => new Date(log.changed_at).getTime() >= start);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filteredEditLogs = filteredEditLogs.filter(log => new Date(log.changed_at).getTime() <= end.getTime());
        }

        // Pre-map documents to folders for performance
        const folderDocMap = {};
        rawDocuments.forEach(doc => {
            if (!folderDocMap[doc.folder_id]) {
                folderDocMap[doc.folder_id] = new Set();
            }
            folderDocMap[doc.folder_id].add(doc.id);
        });

        // Map and Calculate Counts
        let mapped = folders.map(folder => {
            const docIdsSet = folderDocMap[folder.id] || new Set();

            const downloadEncryptedCount = filteredEditLogs.filter(log => 
                docIdsSet.has(log.document_id) && 
                log.action_type === 'DOWNLOAD_SECURE'
            ).length;

            const downloadOriginalCount = filteredEditLogs.filter(log => 
                docIdsSet.has(log.document_id) && 
                (log.action_type === 'DOWNLOAD_ORIGINAL' || log.action_type === 'DOWNLOAD')
            ).length;

            const downloadPdfCount = filteredEditLogs.filter(log => 
                docIdsSet.has(log.document_id) && 
                log.action_type === 'DOWNLOAD_PDF'
            ).length;

            const totalActivityCount = downloadEncryptedCount + downloadOriginalCount + downloadPdfCount;

            return {
                id: folder.id,
                name: folder.name,
                downloadEncryptedCount,
                downloadOriginalCount,
                downloadPdfCount,
                totalActivityCount
            };
        });

        // Sort
        if (sortOrder === 'asc') {
            mapped.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            mapped.sort((a, b) => b.name.localeCompare(a.name));
        }

        setProcessedFolders(mapped);
        setCurrentPage(1); // Reset pagination on changes
    }, [rawFolders, rawDocuments, rawEditLogs, searchQuery, startDate, endDate, sortOrder]);

    // 3. Pagination Logic
    const totalItems = processedFolders.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentDisplayedFolders = processedFolders.slice(startIndex, endIndex);

    const handlePrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
    const handleNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));

    // 4. Export Logic
    const handleExport = () => {
        const csvHeader = "Folder Name,Download Encrypted Count,Download Original Count,Download PDF Count,Total Activity Count\n";
        const csvBody = processedFolders.map(f => 
            `"${f.name}",${f.downloadEncryptedCount},${f.downloadOriginalCount},${f.downloadPdfCount},${f.totalActivityCount}`
        ).join('\n');
        
        const blob = new Blob([csvHeader + csvBody], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'folder_activity_analytics.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    // 5. Modal Logic
    const handleOpenModal = async (folder, type) => {
        if (type === 'download_secure' && folder.downloadEncryptedCount === 0) return;
        if (type === 'download_original' && folder.downloadOriginalCount === 0) return;
        if (type === 'download_pdf' && folder.downloadPdfCount === 0) return;
        if (type === 'total' && folder.totalActivityCount === 0) return;

        setSelectedFolder(folder);
        setModalType(type);
        setShowModal(true);
        setLoadingModal(true);
        setModalData([]);
        setModalView('table'); // default to table view

        try {
            // Get documents for this folder
            const folderDocIds = new Set(rawDocuments.filter(d => d.folder_id === folder.id).map(d => d.id));

            // Filter edit logs for this folder and apply date filters
            let filteredEdits = rawEditLogs.filter(log => folderDocIds.has(log.document_id));
            if (startDate) {
                const start = new Date(startDate).getTime();
                filteredEdits = filteredEdits.filter(log => new Date(log.changed_at).getTime() >= start);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                filteredEdits = filteredEdits.filter(log => new Date(log.changed_at).getTime() <= end.getTime());
            }

            // Filter by action type
            let logsToShow = [];
            if (type === 'download_secure') {
                logsToShow = filteredEdits.filter(log => log.action_type === 'DOWNLOAD_SECURE');
            } else if (type === 'download_original') {
                logsToShow = filteredEdits.filter(log => log.action_type === 'DOWNLOAD_ORIGINAL' || log.action_type === 'DOWNLOAD');
            } else if (type === 'download_pdf') {
                logsToShow = filteredEdits.filter(log => log.action_type === 'DOWNLOAD_PDF');
            } else if (type === 'total') {
                logsToShow = filteredEdits.filter(log => 
                    log.action_type === 'DOWNLOAD_SECURE' || 
                    log.action_type === 'DOWNLOAD_ORIGINAL' || log.action_type === 'DOWNLOAD' || 
                    log.action_type === 'DOWNLOAD_PDF'
                );
            }

            // Group by user
            const userCounts = {};
            logsToShow.forEach(log => {
                if (log.user_id) {
                    userCounts[log.user_id] = (userCounts[log.user_id] || 0) + 1;
                }
            });

            const userIds = Object.keys(userCounts);
            let userMap = {};
            if (userIds.length > 0) {
                const { data: usersData, error: usersError } = await supabase
                    .from('users')
                    .select('id, name, email')
                    .in('id', userIds);
                
                if (!usersError && usersData) {
                    usersData.forEach(u => { userMap[u.id] = u; });
                }
            }

            const mappedData = userIds.map(uid => ({
                user: userMap[uid] || { name: 'Unknown', email: '' },
                occurrences: userCounts[uid]
            })).sort((a, b) => b.occurrences - a.occurrences);

            setModalData(mappedData);
        } catch (err) {
            console.error("Error loading modal data:", err);
        } finally {
            setLoadingModal(false);
        }
    };

    return (
        <div className="p-8 bg-white min-h-full font-sans">
            {/* Header Section */}
            <div className="flex items-center gap-4 mb-8">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Folder Activity</h1>
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-3 py-1.5 border border-orange-300 rounded text-xs font-semibold text-gray-700 hover:bg-orange-50 transition-colors ml-2"
                >
                    EXPORT
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" x2="12" y1="15" y2="3" />
                    </svg>
                </button>
            </div>

            {/* Filter Section */}
            <div className="flex items-center gap-6 mb-8">
                <div className="text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" x2="20" y1="6" y2="6"/>
                        <line x1="8" x2="16" y1="12" y2="12"/>
                        <line x1="10" x2="14" y1="18" y2="18"/>
                    </svg>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center border-b border-gray-300 pb-2 hover:border-gray-400 transition-colors">
                        <span className="text-sm text-gray-400 mr-2">Date range</span>
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="text-sm text-gray-700 outline-none bg-transparent"
                            title="Start Date"
                        />
                        <span className="text-gray-400 text-sm mx-1">-</span>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="text-sm text-gray-700 outline-none bg-transparent"
                            title="End Date"
                        />
                    </div>
                </div>

                {/* Name Filter */}
                <div className="flex items-center justify-between border-b border-gray-300 pb-2 w-64 hover:border-gray-400 transition-colors">
                    <input 
                        type="text" 
                        placeholder="Name" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent outline-none text-sm text-gray-700 w-full placeholder-gray-500"
                    />
                    {searchQuery ? (
                        <X size={14} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setSearchQuery('')} />
                    ) : (
                        <X size={14} className="text-transparent" />
                    )}
                </div>

                {/* Refresh Button */}
                <button 
                    onClick={() => {
                        setSearchQuery('');
                        setStartDate('');
                        setEndDate('');
                    }}
                    className="p-2 border border-gray-100 rounded-md hover:bg-gray-50 transition-colors"
                    title="Reset Filters"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l5.67 5.67" />
                    </svg>
                </button>
            </div>

            {/* Table Section */}
            <div className="w-full text-sm">
                {/* Table Header */}
                <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-3 text-gray-700 font-semibold border-b border-gray-100">
                    <div 
                        className="flex items-center gap-2 cursor-pointer hover:text-gray-900 select-none"
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    >
                        Folder Name
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                            className={`text-gray-400 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                        >
                            <line x1="12" y1="19" x2="12" y2="5" />
                            <polyline points="5 12 12 5 19 12" />
                        </svg>
                    </div>
                    <div>Download Encrypted Count</div>
                    <div>Download Original Count</div>
                    <div>Download PDF Count</div>
                    <div>Total Activity Count</div>
                </div>

                {/* Table Body */}
                <div className="flex flex-col relative min-h-[250px]">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                            <div className="w-6 h-6 border-2 border-gray-300 border-t-[var(--brand)] rounded-full animate-spin"></div>
                        </div>
                    ) : currentDisplayedFolders.length > 0 ? (
                        currentDisplayedFolders.map((folder, index) => (
                            <div 
                                key={folder.id} 
                                className={`grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-3 border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}
                            >
                                <div className="text-gray-600 font-medium truncate pr-4" title={folder.name}>{folder.name}</div>
                                <div 
                                    className={`text-gray-800 ${folder.downloadEncryptedCount > 0 ? 'underline cursor-pointer hover:text-black font-semibold' : ''}`}
                                    onClick={() => handleOpenModal(folder, 'download_secure')}
                                >
                                    {folder.downloadEncryptedCount}
                                </div>
                                <div 
                                    className={`text-gray-800 ${folder.downloadOriginalCount > 0 ? 'underline cursor-pointer hover:text-black font-semibold' : ''}`}
                                    onClick={() => handleOpenModal(folder, 'download_original')}
                                >
                                    {folder.downloadOriginalCount}
                                </div>
                                <div 
                                    className={`text-gray-800 ${folder.downloadPdfCount > 0 ? 'underline cursor-pointer hover:text-black font-semibold' : ''}`}
                                    onClick={() => handleOpenModal(folder, 'download_pdf')}
                                >
                                    {folder.downloadPdfCount}
                                </div>
                                <div 
                                    className={`text-gray-900 font-semibold ${folder.totalActivityCount > 0 ? 'underline cursor-pointer hover:text-black' : ''}`}
                                    onClick={() => handleOpenModal(folder, 'total')}
                                >
                                    {folder.totalActivityCount}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 text-center text-gray-400">
                            No folders or activities found for the selected filters.
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

            {/* Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl min-h-[500px] flex flex-col overflow-hidden relative"
                        onClick={e => e.stopPropagation()}
                        style={{ animation: "slideUp 0.2s ease" }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 z-10"
                        >
                            <X size={16} strokeWidth={2.5} />
                        </button>

                        <div className="p-8 pb-4">
                            {/* Toggle Group */}
                            <div className="flex bg-gray-100/80 rounded-md p-1 w-fit border border-gray-200/50 mb-6 shadow-inner">
                                <button 
                                    className={`px-3 py-1.5 rounded-sm flex items-center justify-center transition-all ${modalView === 'table' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                                    onClick={() => setModalView('table')}
                                >
                                    <List size={16} />
                                </button>
                                <button 
                                    className={`px-3 py-1.5 rounded-sm flex items-center justify-center transition-all ${modalView === 'chart' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                                    onClick={() => setModalView('chart')}
                                >
                                    <BarChart2 size={16} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            {loadingModal ? (
                                <div className="flex items-center justify-center h-[350px]">
                                    <div className="w-8 h-8 border-4 border-gray-200 border-t-pink-400 rounded-full animate-spin"></div>
                                </div>
                            ) : modalData.length === 0 ? (
                                <div className="flex items-center justify-center h-[350px] text-gray-400">
                                    No data available.
                                </div>
                            ) : (
                                <div className="w-full h-[350px]">
                                    {modalView === 'table' ? (
                                        <div className="w-full h-full flex flex-col border border-gray-100 rounded-md overflow-hidden">
                                            <div className="grid grid-cols-3 gap-4 px-6 py-4 text-sm font-semibold text-gray-800 border-b border-gray-200 bg-gray-50/50">
                                                <div>Name</div>
                                                <div>Email</div>
                                                <div>Occurrences</div>
                                            </div>
                                            <div className="flex-1 overflow-y-auto">
                                                {modalData.map((d, i) => (
                                                    <div key={i} className={`grid grid-cols-3 gap-4 px-6 py-4 text-sm border-b border-gray-100 hover:bg-gray-50/30 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'}`}>
                                                        <div className="text-gray-700 font-medium truncate" title={d.user.name}>{d.user.name}</div>
                                                        <div className="text-gray-500 truncate" title={d.user.email}>{d.user.email}</div>
                                                        <div className="text-gray-700 font-medium">{d.occurrences}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex flex-col pt-4">
                                            <div className="flex justify-center items-center gap-2 mb-8 text-xs text-gray-500">
                                                <div className="w-8 h-3 bg-pink-400 opacity-80 rounded-[1px]"></div>
                                                <span>Total Occurences</span>
                                            </div>
                                            <div className="flex-1 flex w-full relative pl-8">
                                                {/* Y Axis Label */}
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-[11px] text-gray-500 tracking-wider">
                                                    Occurrences
                                                </div>
                                                
                                                {/* Y Axis Ticks */}
                                                <div className="flex flex-col justify-between text-[11px] text-gray-400 w-8 items-end pr-3 pb-8 h-full z-10 bg-white absolute left-6 top-0 bottom-0">
                                                    {Array.from({length: Math.max(...modalData.map(d => d.occurrences), 1) + 1}, (_, i) => i).slice().reverse().map((tick, i, arr) => (
                                                        <span key={tick} className="leading-none transform translate-y-[5px]">{tick}</span>
                                                    ))}
                                                </div>

                                                {/* Chart Area */}
                                                <div className="flex-1 relative h-full flex flex-col ml-14 border-l border-gray-200">
                                                    {/* Grid lines */}
                                                    <div className="absolute inset-0 pb-8 flex flex-col justify-between z-0">
                                                        {Array.from({length: Math.max(...modalData.map(d => d.occurrences), 1) + 1}, (_, i) => i).map((_, i) => (
                                                            <div key={i} className="w-full h-[1px] border-b border-dashed border-gray-200"></div>
                                                        ))}
                                                    </div>

                                                    {/* Bars Container */}
                                                    <div className="absolute inset-0 pb-8 flex items-end justify-around px-8 z-10">
                                                        {modalData.map((d, i) => (
                                                            <div key={i} className="flex flex-col items-center group relative h-full justify-end w-20">
                                                                {/* Tooltip */}
                                                                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-800 text-white text-[11px] px-2 py-1 rounded transition-opacity whitespace-nowrap pointer-events-none">
                                                                    {d.user.name}: {d.occurrences}
                                                                </div>
                                                                {/* Bar */}
                                                                <div 
                                                                    className="w-12 bg-pink-400/90 transition-all duration-500 ease-out hover:bg-pink-500 hover:scale-x-105 cursor-pointer rounded-t-[1px]" 
                                                                    style={{ height: `${(d.occurrences / Math.max(...modalData.map(x => x.occurrences), 1)) * 100}%` }}
                                                                ></div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* X Axis Ticks */}
                                                    <div className="absolute bottom-0 left-0 right-0 h-8 flex items-center justify-around px-8 border-t border-gray-200 bg-white z-20">
                                                        {modalData.map((d, i) => (
                                                            <div key={i} className="text-[11px] text-gray-500 truncate w-20 text-center" title={d.user.name}>
                                                                {d.user.name.split(' ')[0]}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-center mt-3 text-sm text-gray-500 font-medium">Users</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(16px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
