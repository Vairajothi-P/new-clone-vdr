"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';

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
                        .select('document_id, opened_at')
                        .in('document_id', docIds);
                    if (accessError) throw accessError;
                    setRawAccessLogs(accessLogs || []);

                    // Fetch Edit Logs (Downloads)
                    const { data: editLogs, error: editError } = await supabase
                        .from('document_edit_logs')
                        .select('document_id, action_type, changed_at')
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
                                <div className="text-gray-600 underline cursor-pointer hover:text-gray-900 font-medium">
                                    {file.viewCount}
                                </div>
                                <div className="text-gray-500">{file.downloadOriginalCount}</div>
                                <div className="text-gray-500">{file.downloadPdfCount}</div>
                                <div className="text-gray-500 font-semibold">{file.totalActivityCount}</div>
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
        </div>
    );
}
