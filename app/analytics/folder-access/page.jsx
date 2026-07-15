"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { X, Check } from 'lucide-react';

export default function FolderAccessPage() {
    const router = useRouter();
    const [session, setSession] = useState(null);
    const [groups, setGroups] = useState([]);
    const [folders, setFolders] = useState([]);
    const [permissions, setPermissions] = useState([]);
    
    const [selectedAction, setSelectedAction] = useState('All Action');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    
    const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
    const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
    
    // Modal & UI States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFolderForModal, setSelectedFolderForModal] = useState(null);
    
    // Users Modal States
    const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
    const [selectedActionForUsers, setSelectedActionForUsers] = useState('');
    const [usersList, setUsersList] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const [loading, setLoading] = useState(true);

    const actionDropdownRef = useRef(null);
    const groupDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (actionDropdownRef.current && !actionDropdownRef.current.contains(event.target)) {
                setIsActionDropdownOpen(false);
            }
            if (groupDropdownRef.current && !groupDropdownRef.current.contains(event.target)) {
                setIsGroupDropdownOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsActionDropdownOpen(false);
                setIsGroupDropdownOpen(false);
                setIsModalOpen(false);
                setIsUsersModalOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    useEffect(() => {
        const rawSession = localStorage.getItem('vdr_session');
        if (!rawSession) {
            router.push('/login');
            return;
        }
        const s = JSON.parse(rawSession);
        setSession(s);

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Groups
                const { data: groupsData } = await supabase
                    .from('groups')
                    .select('id, name')
                    .eq('company_id', s.company_id)
                    .order('name');
                
                if (groupsData && groupsData.length > 0) {
                    setGroups(groupsData);
                    setSelectedGroupId(groupsData[0].id);
                }

                // Fetch Folders
                const { data: foldersData } = await supabase
                    .from('folders')
                    .select('id, name, index_number')
                    .eq('company_id', s.company_id)
                    .eq('is_deleted', false)
                    .order('index_number');
                
                setFolders(foldersData || []);

                // Fetch Permissions (Folder scope)
                const { data: permsData } = await supabase
                    .from('permissions')
                    .select('*')
                    .eq('company_id', s.company_id)
                    .eq('scope', 'folder');
                
                setPermissions(permsData || []);

            } catch (err) {
                console.error("Error fetching folder access data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    // Data Calculation
    const getFolderPermission = (folderId, groupId) => {
        const p = permissions.find(p => p.folder_id === folderId && p.group_id === groupId);
        if (!p) return { view: false, upload: false, edit: false, download_secure: false, download_original: false, delete: false };
        return {
            view: !!p.can_view,
            upload: !!p.can_upload,
            edit: !!p.can_edit,
            download_secure: !!p.can_download_secure,
            download_original: !!p.can_download_original,
            delete: !!p.can_delete
        };
    };

    const calculatePercentage = (perm) => {
        let score = 0;
        if (perm.view) score++;
        if (perm.upload) score++;
        if (perm.edit) score++;
        if (perm.download_secure) score++;
        if (perm.download_original) score++;
        if (perm.delete) score++;
        
        return ((score / 6) * 100).toFixed(2);
    };

    // Prepare table data
    const tableData = folders.map(f => {
        const perm = getFolderPermission(f.id, selectedGroupId);
        return {
            id: f.id,
            index: f.index_number || 1,
            name: f.name,
            percentage: calculatePercentage(perm),
            permDetails: perm
        };
    });

    const selectedGroupName = groups.find(g => g.id === selectedGroupId)?.name || 'Group';

    // Apply Filter, Sort, Pagination
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedAction, selectedGroupId, sortOrder]);

    let processedData = tableData.filter(row => {
        if (selectedAction === 'All Action') return true;
        return row.permDetails[selectedAction] === true;
    });

    if (sortOrder === 'asc') {
        processedData.sort((a, b) => a.name.localeCompare(b.name));
    } else {
        processedData.sort((a, b) => b.name.localeCompare(a.name));
    }

    const totalItems = processedData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentDisplayedData = processedData.slice(startIndex, endIndex);

    const handlePrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
    const handleNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));

    const handleExport = () => {
        if (!processedData || processedData.length === 0) return;

        const headers = ['Index', 'Folder Name', `Group: ${selectedGroupName} (%)`, 'View', 'Upload', 'Edit', 'Secure Download', 'Original Download', 'Delete'];
        const csvRows = [headers.join(',')];

        processedData.forEach(row => {
            const rowData = [
                row.index,
                `"${row.name}"`,
                row.percentage,
                row.permDetails.view ? 'Yes' : 'No',
                row.permDetails.upload ? 'Yes' : 'No',
                row.permDetails.edit ? 'Yes' : 'No',
                row.permDetails.download_secure ? 'Yes' : 'No',
                row.permDetails.download_original ? 'Yes' : 'No',
                row.permDetails.delete ? 'Yes' : 'No'
            ];
            csvRows.push(rowData.join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `folder_access_${selectedGroupName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenUsersModal = async (folderRow, actionKey) => {
        setIsUsersModalOpen(true);
        setSelectedFolderForModal(folderRow);
        setSelectedActionForUsers(actionKey);
        setLoadingUsers(true);
        setUsersList([]);
        
        try {
            const { data: userGroupsData, error: ugError } = await supabase
                .from('user_groups')
                .select('user_id')
                .eq('group_id', selectedGroupId);
                
            if (ugError) throw ugError;
            
            const groupUserIds = (userGroupsData || []).map(ug => ug.user_id);
            
            if (groupUserIds.length === 0) {
                setLoadingUsers(false);
                return;
            }

            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('id, name, email')
                .in('id', groupUserIds)
                .order('name');

            if (usersError) throw usersError;
            
            let lastActionMap = {};
            
            const { data: docsData } = await supabase
                .from('documents')
                .select('id')
                .eq('folder_id', folderRow.id)
                .eq('is_deleted', false);
                
            const docIds = (docsData || []).map(d => d.id);
            
            if (docIds.length > 0) {
                if (actionKey === 'view') {
                    const { data: accessLogs } = await supabase
                        .from('document_access_logs')
                        .select('user_id, opened_at')
                        .in('document_id', docIds)
                        .in('user_id', groupUserIds);
                        
                    (accessLogs || []).forEach(log => {
                        if (!lastActionMap[log.user_id] || new Date(log.opened_at) > new Date(lastActionMap[log.user_id])) {
                            lastActionMap[log.user_id] = log.opened_at;
                        }
                    });
                } else {
                    let typeFilter = [];
                    if (actionKey === 'upload') typeFilter = ['UPLOAD'];
                    else if (actionKey === 'edit') typeFilter = ['EDIT'];
                    else if (actionKey === 'download_secure') typeFilter = ['DOWNLOAD_PDF', 'DOWNLOAD_SECURE'];
                    else if (actionKey === 'download_original') typeFilter = ['DOWNLOAD_ORIGINAL', 'DOWNLOAD'];
                    else if (actionKey === 'delete') typeFilter = ['DELETE'];
                    
                    const { data: editLogs } = await supabase
                        .from('document_edit_logs')
                        .select('user_id, changed_at, action_type')
                        .in('document_id', docIds)
                        .in('user_id', groupUserIds);
                        
                    (editLogs || []).forEach(log => {
                        if (typeFilter.includes(log.action_type)) {
                            if (!lastActionMap[log.user_id] || new Date(log.changed_at) > new Date(lastActionMap[log.user_id])) {
                                lastActionMap[log.user_id] = log.changed_at;
                            }
                        }
                    });
                }
            }

            const formattedUsersList = (usersData || [])
                .filter(user => lastActionMap[user.id])
                .map(user => ({
                    ...user,
                    last_performed: lastActionMap[user.id]
                }))
                .sort((a, b) => new Date(b.last_performed) - new Date(a.last_performed));

            setUsersList(formattedUsersList);
        } catch (err) {
            console.error("Error fetching group users:", err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const actionNames = {
        view: 'View',
        upload: 'Upload',
        edit: 'Edit',
        download_secure: 'Secure Download',
        download_original: 'Original Download',
        delete: 'Delete'
    };

    const renderCheck = (row, actionKey) => {
        if (row.permDetails[actionKey]) {
            return (
                <div 
                    onClick={() => handleOpenUsersModal(row, actionKey)}
                    className="cursor-pointer hover:scale-125 transition-transform flex items-center justify-center p-1 rounded-full hover:bg-green-50"
                    title="View Users"
                >
                    <Check className="text-green-500" size={16} strokeWidth={3} />
                </div>
            );
        }
        return <X className="text-red-400 opacity-50" size={16} />;
    };

    return (
        <div className="p-8 bg-white min-h-full font-sans relative">
            {/* Header Section */}
            <div className="flex items-center gap-4 mb-8">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Folder Access</h1>
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-3 py-1.5 border border-orange-300 rounded text-xs font-semibold text-gray-700 hover:bg-orange-50 transition-colors"
                >
                    EXPORT
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
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

                {/* Action Filter */}
                <div className="relative flex flex-col gap-1 w-48" ref={actionDropdownRef}>
                    <span className="text-[10px] text-gray-400 font-medium">Action</span>
                    <div 
                        className="flex items-center justify-between border-b border-gray-300 pb-1 text-sm text-gray-700 cursor-pointer"
                        onClick={() => {
                            setIsActionDropdownOpen(!isActionDropdownOpen);
                            setIsGroupDropdownOpen(false);
                        }}
                    >
                        <span className="truncate pr-2">
                            {
                                [
                                    { value: 'All Action', label: 'All Action' },
                                    { value: 'view', label: 'View' },
                                    { value: 'upload', label: 'Upload' },
                                    { value: 'edit', label: 'Edit' },
                                    { value: 'download_secure', label: 'Secure Download' },
                                    { value: 'download_original', label: 'Original Download' },
                                    { value: 'delete', label: 'Delete' }
                                ].find(a => a.value === selectedAction)?.label || 'All Action'
                            }
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-400 transition-transform ${isActionDropdownOpen ? 'rotate-180' : ''}`}>
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                    {isActionDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 shadow-lg rounded-md z-50 max-h-48 overflow-y-auto">
                            {[
                                { value: 'All Action', label: 'All Action' },
                                { value: 'view', label: 'View' },
                                { value: 'upload', label: 'Upload' },
                                { value: 'edit', label: 'Edit' },
                                { value: 'download_secure', label: 'Secure Download' },
                                { value: 'download_original', label: 'Original Download' },
                                { value: 'delete', label: 'Delete' }
                            ].map(opt => (
                                <div 
                                    key={opt.value}
                                    className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer text-gray-700 truncate"
                                    onClick={() => { setSelectedAction(opt.value); setIsActionDropdownOpen(false); }}
                                    title={opt.label}
                                >
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Group Filter */}
                <div className="relative flex flex-col gap-1 w-48" ref={groupDropdownRef}>
                    <span className="text-[10px] text-gray-400 font-medium">Group</span>
                    <div 
                        className="flex items-center justify-between border-b border-gray-300 pb-1 text-sm text-gray-700 cursor-pointer"
                        onClick={() => {
                            setIsGroupDropdownOpen(!isGroupDropdownOpen);
                            setIsActionDropdownOpen(false);
                        }}
                    >
                        <span className="truncate pr-2">
                            {groups.find(g => g.id === selectedGroupId)?.name || 'Select Group'}
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-400 transition-transform ${isGroupDropdownOpen ? 'rotate-180' : ''}`}>
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                    {isGroupDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 shadow-lg rounded-md z-50 max-h-48 overflow-y-auto">
                            {groups.map(g => (
                                <div 
                                    key={g.id}
                                    className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer text-gray-700 truncate"
                                    onClick={() => { setSelectedGroupId(g.id); setIsGroupDropdownOpen(false); }}
                                    title={g.name}
                                >
                                    {g.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 min-h-[300px]">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-[var(--brand)] rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    {/* Table Section */}
                    <div className="w-full text-sm">
                        {/* Table Header */}
                        <div className="grid grid-cols-[minmax(150px,1fr)_repeat(7,minmax(80px,1fr))] gap-2 px-4 py-3 text-gray-700 font-semibold border-b border-gray-100 items-center">
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
                            <div className="text-center">View</div>
                            <div className="text-center">Upload</div>
                            <div className="text-center">Edit</div>
                            <div className="text-center">Secure DL</div>
                            <div className="text-center">Orig DL</div>
                            <div className="text-center">Delete</div>
                            <div className="text-center">Perm %</div>
                        </div>

                        {/* Table Body */}
                        <div className="flex flex-col relative min-h-[150px]">
                            {currentDisplayedData.length === 0 ? (
                                <div className="py-8 text-center text-gray-400">No folders found for this filter.</div>
                            ) : (
                                currentDisplayedData.map((row, index) => (
                                    <div 
                                        key={row.id} 
                                        className={`grid grid-cols-[minmax(150px,1fr)_repeat(7,minmax(80px,1fr))] gap-2 px-4 py-3 items-center border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}
                                    >
                                        <div className="text-gray-500 font-medium truncate pr-4" title={row.name}>{row.name}</div>
                                        <div className="flex justify-center">
                                            {renderCheck(row, 'view')}
                                        </div>
                                        <div className="flex justify-center">
                                            {renderCheck(row, 'upload')}
                                        </div>
                                        <div className="flex justify-center">
                                            {renderCheck(row, 'edit')}
                                        </div>
                                        <div className="flex justify-center">
                                            {renderCheck(row, 'download_secure')}
                                        </div>
                                        <div className="flex justify-center">
                                            {renderCheck(row, 'download_original')}
                                        </div>
                                        <div className="flex justify-center">
                                            {renderCheck(row, 'delete')}
                                        </div>
                                        <div className="text-center">
                                            <span 
                                                className="text-gray-600 underline cursor-pointer hover:text-gray-900 font-medium transition-colors"
                                                onClick={() => { setSelectedFolderForModal(row); setIsModalOpen(true); }}
                                            >
                                                {row.percentage}%
                                            </span>
                                        </div>
                                    </div>
                                ))
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

                    {/* Detail Modal */}
                    {isModalOpen && selectedFolderForModal && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
                            onClick={() => setIsModalOpen(false)}
                        >
                            <div
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden"
                                onClick={e => e.stopPropagation()}
                                style={{ animation: "slideUp 0.2s ease" }}
                            >
                                {/* Modal Header */}
                                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                    <div>
                                        <h2 className="text-[15px] font-bold text-gray-900">Folder Access</h2>
                                        <p className="text-[12px] text-gray-400 mt-0.5">
                                            {selectedFolderForModal.name} &middot; {selectedGroupName}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>

                                {/* Modal Content */}
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-5 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                                        <span className="text-[13px] font-semibold text-gray-600">Overall Access</span>
                                        <span className="text-[15px] font-bold text-[var(--brand)]">{selectedFolderForModal.percentage}%</span>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between px-2 py-2 border-b border-gray-50">
                                            <span className="text-[13px] text-gray-600">View</span>
                                            {selectedFolderForModal.permDetails.view ? <Check className="text-green-500" size={16} /> : <X className="text-red-400" size={16} />}
                                        </div>
                                        <div className="flex items-center justify-between px-2 py-2 border-b border-gray-50">
                                            <span className="text-[13px] text-gray-600">Upload</span>
                                            {selectedFolderForModal.permDetails.upload ? <Check className="text-green-500" size={16} /> : <X className="text-red-400" size={16} />}
                                        </div>
                                        <div className="flex items-center justify-between px-2 py-2 border-b border-gray-50">
                                            <span className="text-[13px] text-gray-600">Edit</span>
                                            {selectedFolderForModal.permDetails.edit ? <Check className="text-green-500" size={16} /> : <X className="text-red-400" size={16} />}
                                        </div>
                                        <div className="flex items-center justify-between px-2 py-2 border-b border-gray-50">
                                            <span className="text-[13px] text-gray-600">Secure Download</span>
                                            {selectedFolderForModal.permDetails.download_secure ? <Check className="text-green-500" size={16} /> : <X className="text-red-400" size={16} />}
                                        </div>
                                        <div className="flex items-center justify-between px-2 py-2 border-b border-gray-50">
                                            <span className="text-[13px] text-gray-600">Original Download</span>
                                            {selectedFolderForModal.permDetails.download_original ? <Check className="text-green-500" size={16} /> : <X className="text-red-400" size={16} />}
                                        </div>
                                        <div className="flex items-center justify-between px-2 py-2">
                                            <span className="text-[13px] text-gray-600">Delete</span>
                                            {selectedFolderForModal.permDetails.delete ? <Check className="text-green-500" size={16} /> : <X className="text-red-400" size={16} />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Users List Modal */}
                    {isUsersModalOpen && selectedFolderForModal && (
                        <div
                            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                            style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
                            onClick={() => setIsUsersModalOpen(false)}
                        >
                            <div
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
                                onClick={e => e.stopPropagation()}
                                style={{ animation: "slideUp 0.2s ease" }}
                            >
                                {/* Header */}
                                <div className="flex flex-col bg-gray-50 border-b border-gray-100 p-6 relative">
                                    <button 
                                        onClick={() => setIsUsersModalOpen(false)}
                                        className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                    <h2 className="text-lg font-bold text-gray-900 pr-8">
                                        Users with {actionNames[selectedActionForUsers]} Access
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {selectedFolderForModal.name} &middot; {selectedGroupName}
                                    </p>
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-auto p-6">
                                    {loadingUsers ? (
                                        <div className="flex justify-center items-center h-32">
                                            <div className="w-6 h-6 border-2 border-gray-300 border-t-[var(--brand)] rounded-full animate-spin"></div>
                                        </div>
                                    ) : usersList.length === 0 ? (
                                        <div className="text-center text-gray-500 py-12 bg-gray-50/50 rounded-xl border border-gray-100 border-dashed">
                                            No users have performed this action yet.
                                        </div>
                                    ) : (
                                        <div className="w-full text-sm">
                                            <div className="grid grid-cols-[60px_1fr_1.5fr_160px] px-4 py-3 text-xs uppercase tracking-wider font-bold text-gray-500 bg-gray-50 border-y border-gray-100">
                                                <div className="text-gray-400">S.No</div>
                                                <div>User Name</div>
                                                <div>Email</div>
                                                <div>Last Performed</div>
                                            </div>
                                            
                                            <div className="flex flex-col">
                                                {usersList.map((user, idx) => (
                                                    <div 
                                                        key={user.id} 
                                                        className={`grid grid-cols-[60px_1fr_1.5fr_160px] px-4 py-3 items-center border-b border-gray-100 hover:bg-blue-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                                                    >
                                                        <div className="text-gray-400 font-medium text-xs">{String(idx + 1).padStart(2, '0')}</div>
                                                        <div className="font-semibold text-gray-800 pr-4 truncate" title={user.name}>{user.name}</div>
                                                        <div className="text-gray-500 truncate pr-4" title={user.email}>{user.email}</div>
                                                        <div className="text-gray-500 text-xs">
                                                            {user.last_performed 
                                                                ? new Date(user.last_performed).toLocaleString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })
                                                                : 'Never'}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
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
                </>
            )}
        </div>
    );
}
