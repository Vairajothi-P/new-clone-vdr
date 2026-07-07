"use client";

import React from 'react';

export default function GroupUsersPage() {
    return (
        <div className="p-8 bg-white min-h-full font-sans">
            {/* Header Section */}
            <div className="flex items-center gap-4 mb-8">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Groups & Users</h1>
                <button className="flex items-center gap-2 px-3 py-1.5 border border-orange-300 rounded text-xs font-semibold text-gray-700 hover:bg-orange-50 transition-colors">
                    EXPORT
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                    </svg>
                </button>
            </div>

            {/* Filter Section */}
            <div className="flex items-center gap-3 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                <div className="flex items-center gap-2 border-b border-gray-300 pb-1 w-48 text-sm">
                    <span className="text-gray-400 flex-1">Date range</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                </div>
            </div>

            {/* Table Section */}
            <div className="w-full text-sm">
                {/* Table Header */}
                <div className="grid grid-cols-2 px-4 py-3 text-gray-700 font-semibold border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        Group Name
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                            <line x1="12" y1="19" x2="12" y2="5" />
                            <polyline points="5 12 12 5 19 12" />
                        </svg>
                    </div>
                    <div>Login Count</div>
                </div>

                {/* Table Body */}
                <div className="flex flex-col">
                    <div className="grid grid-cols-2 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <div className="text-gray-500">Admin</div>
                        <div className="text-gray-600 underline cursor-pointer hover:text-gray-900 font-medium">93</div>
                    </div>
                    <div className="grid grid-cols-2 px-4 py-3 border-b border-gray-100">
                        <div className="text-gray-500">Investor</div>
                        <div className="text-gray-600 underline cursor-pointer hover:text-gray-900 font-medium">1</div>
                    </div>
                    <div className="grid grid-cols-2 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <div className="text-gray-500">Sub Admin</div>
                        <div className="text-gray-600 underline cursor-pointer hover:text-gray-900 font-medium">93</div>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-end gap-6 py-4 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                        <span>Items per page:</span>
                        <div className="flex items-center gap-1 border-b border-gray-300 pb-0.5 cursor-pointer text-gray-500">
                            10
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </div>
                    </div>
                    
                    <div className="text-gray-500">1-3 of 3</div>

                    <div className="flex items-center gap-4">
                        <button className="text-gray-300 hover:text-gray-500 transition-colors disabled:opacity-50" disabled>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <button className="text-gray-300 hover:text-gray-500 transition-colors disabled:opacity-50" disabled>
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
