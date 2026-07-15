"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { X } from "lucide-react";

export default function FileActivityPage() {
    // Raw Data States
    const [rawDocuments, setRawDocuments] = useState([]);
    const [rawFolders, setRawFolders] = useState([]);
    const [rawAccessLogs, setRawAccessLogs] = useState([]);
    const [rawEditLogs, setRawEditLogs] = useState([]);
    const [processedFiles, setProcessedFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter & UI States
    const [selectedFolder, setSelectedFolder] = useState('all');
    const [sortOrder, setSortOrder] = useState('asc');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isFolderDropdownOpen, setIsFolderDropdownOpen] = useState(false);

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(null); // 'view', 'download_original', 'download_pdf', 'total'
    const [selectedFile, setSelectedFile] = useState(null);
    const [modalData, setModalData] = useState([]);
    const [loadingModal, setLoadingModal] = useState(false);

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
                    // Fetch Access Logs (Views)
                    const { data: accessLogs, error: accessError } = await supabase
                        .from('document_access_logs')
                        .select('document_id, opened_at, user_id')
                        .in('document_id', docIds);
                    if (accessError) throw accessError;
                    setRawAccessLogs(accessLogs || []);

                    // Fetch Edit Logs (Downloads)
                    const { data: editLogs, error: editError } = await supabase
                        .from('document_edit_logs')
                        .select('document_id, action_type, changed_at, user_id')
                        .in('document_id', docIds);
                    if (editError) throw editError;
                    setRawEditLogs(editLogs || []);
                }
            } catch (err) {
                console.error("Failed to load file activity data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // 2. Process Data (Filter, Calculate, Sort)
    useEffect(() => {
        let docs = rawDocuments;

        // Apply Folder Filter
        if (selectedFolder !== 'all') {
            docs = docs.filter(d => d.folder_id === selectedFolder);
        }

        // Apply Date Filters
        let filteredAccessLogs = rawAccessLogs;
        let filteredEditLogs = rawEditLogs;

        if (startDate) {
            const start = new Date(startDate).getTime();
            filteredAccessLogs = filteredAccessLogs.filter(log => new Date(log.opened_at).getTime() >= start);
            filteredEditLogs = filteredEditLogs.filter(log => new Date(log.changed_at).getTime() >= start);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filteredAccessLogs = filteredAccessLogs.filter(log => new Date(log.opened_at).getTime() <= end.getTime());
            filteredEditLogs = filteredEditLogs.filter(log => new Date(log.changed_at).getTime() <= end.getTime());
        }

        // Map and Calculate Counts
        let mapped = docs.map(doc => {
            const viewCount = filteredAccessLogs.filter(log => log.document_id === doc.id).length;
            
            // Adjust action_type checks based on your actual db enums for download types
            const downloadOriginalCount = filteredEditLogs.filter(log => 
                log.document_id === doc.id && 
                (log.action_type === 'DOWNLOAD_ORIGINAL' || log.action_type === 'DOWNLOAD')
            ).length;

            const downloadPdfCount = filteredEditLogs.filter(log => 
                log.document_id === doc.id && 
                log.action_type === 'DOWNLOAD_PDF'
            ).length;

            const totalActivityCount = viewCount + downloadOriginalCount + downloadPdfCount;

            return {
                id: doc.id,
                name: doc.name,
                viewCount,
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

        setProcessedFiles(mapped);
        setCurrentPage(1); // Reset pagination on changes
    }, [rawDocuments, rawAccessLogs, rawEditLogs, selectedFolder, startDate, endDate, sortOrder]);

    // 3. Pagination Logic
    const totalItems = processedFiles.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentDisplayedFiles = processedFiles.slice(startIndex, endIndex);

    const handlePrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
    const handleNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));

    // 4. Export Logic
    const handleExport = () => {
        const csvHeader = "File Name,View Count,Download Original Count,Download PDF Count,Total Activity Count\n";
        const csvBody = processedFiles.map(f => 
            `"${f.name}",${f.viewCount},${f.downloadOriginalCount},${f.downloadPdfCount},${f.totalActivityCount}`
        ).join('\n');
        
        const blob = new Blob([csvHeader + csvBody], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'file_activity_analytics.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    // 5. Modal Logic
    const handleOpenModal = async (file, type) => {
        if (type === 'view' && file.viewCount === 0) return;
        if (type === 'download_original' && file.downloadOriginalCount === 0) return;
        if (type === 'download_pdf' && file.downloadPdfCount === 0) return;
        if (type === 'total' && file.totalActivityCount === 0) return;

        setSelectedFile(file);
        setModalType(type);
        setShowModal(true);
        setLoadingModal(true);
        setModalData([]);

        try {
            // Apply Date Filters for the specific file
            let filteredViews = rawAccessLogs.filter(log => log.document_id === file.id);
            let filteredEdits = rawEditLogs.filter(log => log.document_id === file.id);

            if (startDate) {
                const start = new Date(startDate).getTime();
                filteredViews = filteredViews.filter(log => new Date(log.opened_at).getTime() >= start);
                filteredEdits = filteredEdits.filter(log => new Date(log.changed_at).getTime() >= start);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                filteredViews = filteredViews.filter(log => new Date(log.opened_at).getTime() <= end.getTime());
                filteredEdits = filteredEdits.filter(log => new Date(log.changed_at).getTime() <= end.getTime());
            }

            let logsToShow = [];

            if (type === 'view') {
                logsToShow = filteredViews.map(log => ({ ...log, timestamp: log.opened_at, typeLabel: 'View' }));
            } else if (type === 'download_original') {
                logsToShow = filteredEdits
                    .filter(log => log.action_type === 'DOWNLOAD_ORIGINAL' || log.action_type === 'DOWNLOAD')
                    .map(log => ({ ...log, timestamp: log.changed_at, typeLabel: 'Download Original' }));
            } else if (type === 'download_pdf') {
                logsToShow = filteredEdits
                    .filter(log => log.action_type === 'DOWNLOAD_PDF')
                    .map(log => ({ ...log, timestamp: log.changed_at, typeLabel: 'Download PDF' }));
            } else if (type === 'total') {
                const views = filteredViews.map(log => ({ ...log, timestamp: log.opened_at, typeLabel: 'View' }));
                const dlOrig = filteredEdits
                    .filter(log => log.action_type === 'DOWNLOAD_ORIGINAL' || log.action_type === 'DOWNLOAD')
                    .map(log => ({ ...log, timestamp: log.changed_at, typeLabel: 'Download Original' }));
                const dlPdf = filteredEdits
                    .filter(log => log.action_type === 'DOWNLOAD_PDF')
                    .map(log => ({ ...log, timestamp: log.changed_at, typeLabel: 'Download PDF' }));
                logsToShow = [...views, ...dlOrig, ...dlPdf];
            }

            // Sort chronologically descending (newest first)
            logsToShow.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // Fetch user details
            const userIds = [...new Set(logsToShow.map(log => log.user_id).filter(Boolean))];
            let userMap = {};
            if (userIds.length > 0) {
                const { data: usersData, error: usersError } = await supabase
                    .from('users')
                    .select('id, name, email')
                    .in('id', userIds);
                
                if (usersError) throw usersError;
                (usersData || []).forEach(u => { userMap[u.id] = u; });
            }

            const mappedData = logsToShow.map(log => ({
                ...log,
                user: userMap[log.user_id] || { name: 'Unknown', email: '' }
            }));

            setModalData(mappedData);
        } catch (err) {
            console.error("Error loading modal data:", err);
        } finally {
            setLoadingModal(false);
        }
    };

    const getModalTitle = () => {
        if (modalType === 'view') return 'View Activity';
        if (modalType === 'download_original') return 'Download Original Activity';
        if (modalType === 'download_pdf') return 'Download PDF Activity';
        return 'Total Activity';
    };

    const getModalCount = () => {
        if (!selectedFile) return 0;
        if (modalType === 'view') return selectedFile.viewCount;
        if (modalType === 'download_original') return selectedFile.downloadOriginalCount;
        if (modalType === 'download_pdf') return selectedFile.downloadPdfCount;
        return selectedFile.totalActivityCount;
    };

    return (
        <div className="p-8 bg-white min-h-full font-sans">
            {/* Header Section */}
            <div className="flex items-center gap-4 mb-8">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">File Activity</h1>
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
            <div className="flex items-end gap-5 mb-6">
                <div className="pb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                </div>

                <div className="relative flex flex-col gap-1 w-48">
                    <span className="text-[10px] text-gray-400 font-medium">Folder</span>
                    <div 
                        className="flex items-center justify-between border-b border-gray-300 pb-1 text-sm text-gray-700 cursor-pointer"
                        onClick={() => setIsFolderDropdownOpen(!isFolderDropdownOpen)}
                    >
                        <span className="truncate pr-2">
                            {selectedFolder === 'all' 
                                ? 'All Folders' 
                                : rawFolders.find(f => f.id === selectedFolder)?.name || 'Unknown'}
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-400 transition-transform ${isFolderDropdownOpen ? 'rotate-180' : ''}`}>
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                    {isFolderDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 shadow-lg rounded-md z-50 max-h-48 overflow-y-auto">
                            <div 
                                className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer text-gray-700"
                                onClick={() => { setSelectedFolder('all'); setIsFolderDropdownOpen(false); }}
                            >
                                All Folders
                            </div>
                            {rawFolders.map(folder => (
                                <div 
                                    key={folder.id}
                                    className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer text-gray-700 truncate"
                                    onClick={() => { setSelectedFolder(folder.id); setIsFolderDropdownOpen(false); }}
                                    title={folder.name}
                                >
                                    {folder.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

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
                <div className="grid grid-cols-5 gap-4 px-4 py-3 text-gray-700 font-semibold border-b border-gray-100">
                    <div 
                        className="flex items-center gap-2 cursor-pointer hover:text-gray-900 select-none"
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    >
                        File Name
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                            className={`text-gray-400 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                        >
                            <line x1="12" y1="19" x2="12" y2="5" />
                            <polyline points="5 12 12 5 19 12" />
                        </svg>
                    </div>
                    <div>View Count</div>
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
                    ) : currentDisplayedFiles.length > 0 ? (
                        currentDisplayedFiles.map((file, index) => (
                            <div 
                                key={file.id} 
                                className={`grid grid-cols-5 gap-4 px-4 py-3 border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}
                            >
                                <div className="text-gray-500 truncate pr-4" title={file.name}>{file.name}</div>
                                <div 
                                    className="text-gray-600 underline cursor-pointer hover:text-gray-900 font-medium"
                                    onClick={() => handleOpenModal(file, 'view')}
                                >
                                    {file.viewCount}
                                </div>
                                <div 
                                    className="text-gray-600 underline cursor-pointer hover:text-gray-900 font-medium"
                                    onClick={() => handleOpenModal(file, 'download_original')}
                                >
                                    {file.downloadOriginalCount}
                                </div>
                                <div 
                                    className="text-gray-600 underline cursor-pointer hover:text-gray-900 font-medium"
                                    onClick={() => handleOpenModal(file, 'download_pdf')}
                                >
                                    {file.downloadPdfCount}
                                </div>
                                <div 
                                    className="text-gray-800 underline cursor-pointer hover:text-black font-semibold"
                                    onClick={() => handleOpenModal(file, 'total')}
                                >
                                    {file.totalActivityCount}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 text-center text-gray-400">
                            No files or activities found for the selected filters.
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

            {/* ── Activity Detail Modal ── */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}
                        style={{ animation: "slideUp 0.2s ease" }}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-[15px] font-bold text-gray-900">{getModalTitle()}</h2>
                                <p className="text-[12px] text-gray-400 mt-0.5">
                                    {selectedFile?.name} &middot; {getModalCount()} activities
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Table */}
                        <div className="overflow-y-auto flex-1 relative min-h-[200px]">
                            {loadingModal ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                                    <div className="w-6 h-6 border-2 border-gray-300 border-t-[var(--brand)] rounded-full animate-spin"></div>
                                </div>
                            ) : modalData.length === 0 ? (
                                <p className="px-6 py-10 text-center text-[13px] text-gray-400">No activity data found</p>
                            ) : (
                                <table className="w-full">
                                    <thead className="sticky top-0 bg-gray-50 border-b border-gray-100 z-10">
                                        <tr>
                                            <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-8">#</th>
                                            <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                            {(modalType === 'total' || modalType.includes('download')) && (
                                                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Action Type</th>
                                            )}
                                            <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {modalData.map((d, i) => (
                                            <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                                <td className="px-5 py-3 text-[12px] text-gray-400">{i + 1}</td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold uppercase shrink-0">
                                                            {(d.user.name || d.user.email || "?")[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-[13px] font-medium text-gray-800 leading-tight">{d.user.name || "Unknown"}</p>
                                                            <p className="text-[11px] text-gray-400 truncate max-w-[160px]">{d.user.email || ""}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {(modalType === 'total' || modalType.includes('download')) && (
                                                    <td className="px-5 py-3 text-[12px] text-gray-600">
                                                        <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700 text-[10px] font-medium tracking-wide">
                                                            {d.typeLabel}
                                                        </span>
                                                    </td>
                                                )}
                                                <td className="px-5 py-3 text-[12px] text-gray-500 whitespace-nowrap">
                                                    {d.timestamp
                                                        ? new Date(d.timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                                                        : "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                            <span className="text-[11px] text-gray-400">Chronological activity record</span>
                            <span className="text-[11px] font-semibold text-blue-500">{getModalCount()} total activities</span>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>

        </div>
    );
}
