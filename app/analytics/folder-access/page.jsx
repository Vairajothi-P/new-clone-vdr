"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function FolderAccessPage() {
    const router = useRouter();
    const [session, setSession] = useState(null);
    const [groups, setGroups] = useState([]);
    const [folders, setFolders] = useState([]);
    const [permissions, setPermissions] = useState([]);
    
    const [selectedAction, setSelectedAction] = useState('All Action');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [loading, setLoading] = useState(true);

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

    // Apply Filter
    const filteredTableData = tableData.filter(row => {
        if (selectedAction === 'All Action') return true;
        return row.permDetails[selectedAction] === true;
    });

    const handleExport = () => {
        if (!filteredTableData || filteredTableData.length === 0) return;

        const headers = ['Index', 'Folder Name', `Group: ${selectedGroupName} (%)`, 'View', 'Upload', 'Edit', 'Secure Download', 'Original Download', 'Delete'];
        const csvRows = [headers.join(',')];

        filteredTableData.forEach(row => {
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
            <div className="flex items-end gap-6 mb-6">
                <div className="pb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                </div>

                {/* Action Dropdown */}
                <div className="relative flex flex-col gap-1 w-48">
                    <span className="text-[10px] text-gray-400 font-medium">Action</span>
                    <select 
                        value={selectedAction}
                        onChange={(e) => setSelectedAction(e.target.value)}
                        className="border-b border-gray-300 pb-1 text-sm text-gray-700 outline-none bg-transparent cursor-pointer appearance-none"
                    >
                        <option value="All Action">All Action</option>
                        <option value="view">View</option>
                        <option value="upload">Upload</option>
                        <option value="edit">Edit</option>
                        <option value="download_secure">Secure Download</option>
                        <option value="download_original">Original Download</option>
                        <option value="delete">Delete</option>
                    </select>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-0 bottom-2 text-gray-400 pointer-events-none">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>

                {/* Group Dropdown */}
                <div className="relative flex flex-col gap-1 w-48">
                    <span className="text-[10px] text-gray-400 font-medium">Group</span>
                    <select 
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        className="border-b border-gray-300 pb-1 text-sm text-gray-700 outline-none bg-transparent cursor-pointer appearance-none"
                    >
                        {groups.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-0 bottom-2 text-gray-400 pointer-events-none">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-500 font-medium text-sm">Loading data...</div>
            ) : (
                <>
                    {/* Table Section */}
                    <div className="w-full text-sm mt-8 border-t border-gray-100">
                        {/* Table Header */}
                        <div className="grid grid-cols-2 px-4 py-4 text-gray-700 font-semibold border-b border-gray-100">
                            <div className="flex items-center gap-2 cursor-pointer select-none">
                                Name
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                    <line x1="12" y1="19" x2="12" y2="5" />
                                    <polyline points="5 12 12 5 19 12" />
                                </svg>
                            </div>
                            <div className="text-right pr-12">{selectedGroupName}</div>
                        </div>

                        {/* Table Body */}
                        <div className="flex flex-col">
                            {filteredTableData.length === 0 ? (
                                <div className="py-8 text-center text-gray-500">No folders found for this filter.</div>
                            ) : (
                                filteredTableData.map((row, index) => (
                                    <div 
                                        key={row.id} 
                                        className={`grid grid-cols-2 px-4 py-4 border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}
                                    >
                                        <div className="text-gray-500 font-medium">{row.name}</div>
                                        <div className="text-right pr-12">
                                            <span 
                                                className="text-gray-600 underline cursor-pointer hover:text-[var(--brand)] font-medium transition-colors"
                                                onClick={() => setIsModalOpen(true)}
                                            >
                                                {row.percentage}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Modal Overlay */}
                    {isModalOpen && (
                        <div className="fixed inset-0 bg-gray-900/40 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col relative overflow-hidden">
                                
                                {/* Close Button */}
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>

                                <div className="flex-1 overflow-auto p-8">
                                    {/* Modal Table Header */}
                                    <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] gap-8 items-center border-b border-gray-100 pb-4 mb-4 text-xs font-semibold text-gray-600 pr-8">
                                        <div className="text-gray-800">Index and Name</div>
                                        <div className="flex justify-center w-8" title="View"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></div>
                                        <div className="flex justify-center w-8" title="Upload"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg></div>
                                        <div className="flex justify-center w-8" title="Secure Download"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div>
                                        <div className="flex justify-center w-8" title="Original Download"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></div>
                                        <div className="flex justify-center w-8" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></div>
                                        <div className="flex justify-center w-8" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></div>
                                    </div>

                                    {/* Modal Table Body */}
                                    <div className="flex flex-col gap-2">
                                        {tableData.map((row) => (
                                            <div key={row.id} className="grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] gap-8 items-center bg-gray-50/50 py-3 rounded-md pr-8">
                                                <div className="flex items-center gap-3 px-4 text-sm text-gray-700">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                                    </svg>
                                                    <span className="font-semibold text-gray-800">{row.index}</span>
                                                    <span>{row.name}</span>
                                                </div>
                                                
                                                <div className="flex justify-center w-8">
                                                    {row.permDetails.view && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"/></svg>}
                                                </div>
                                                <div className="flex justify-center w-8">
                                                    {row.permDetails.upload && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"/></svg>}
                                                </div>
                                                <div className="flex justify-center w-8">
                                                    {row.permDetails.download_secure && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"/></svg>}
                                                </div>
                                                <div className="flex justify-center w-8">
                                                    {row.permDetails.download_original && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"/></svg>}
                                                </div>
                                                <div className="flex justify-center w-8">
                                                    {row.permDetails.delete && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"/></svg>}
                                                </div>
                                                <div className="flex justify-center w-8">
                                                    {row.permDetails.edit && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"/></svg>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
