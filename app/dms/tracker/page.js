"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaArrowLeft, FaSearch, FaEllipsisV, FaDownload, FaTimes, FaRegClock } from "react-icons/fa";

export default function TrackerPage() {
  const [requests, setRequests] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsMounted(true);
    // Load requests, sort by newest (descending ID)
    const savedRequests = JSON.parse(localStorage.getItem('dms_all_requests') || "[]");
    setRequests(savedRequests.sort((a, b) => b.id - a.id));
  }, []);

  const handleUpdateStatus = (id, newStatus) => {
    const allReqs = JSON.parse(localStorage.getItem('dms_all_requests') || "[]");
    const updatedAll = allReqs.map(r => r.id === id ? { ...r, status: newStatus } : r);
    localStorage.setItem('dms_all_requests', JSON.stringify(updatedAll));
    
    setRequests(updatedAll.sort((a, b) => b.id - a.id));
    
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest({ ...selectedRequest, status: newStatus });
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusDot = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const filteredRequests = requests.filter(r => 
    r.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = requests.filter(r => r.status?.toLowerCase() === 'pending').length;

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-[#f8fafc] text-gray-900 font-sans">
      {/* Header Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-white z-40 py-4 px-4 md:px-8 flex justify-between items-center border-b border-gray-200 shadow-sm">
        <div className="flex items-center">
          <Link href="/dms/marketplace" className="flex items-center text-gray-500 hover:text-gray-900 transition-colors group mr-8">
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Back to Marketplace</span>
          </Link>
          <div className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-400 uppercase tracking-widest">
            <span className="text-[#b48629]">Diligence & Access</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="/dms/marketplace" className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
            Marketplace
          </Link>
          <Link href="/dms/tracker" className="text-sm text-[#b48629] font-bold transition-colors border-b-2 border-[#b48629] pb-1">
            Tracker
          </Link>
          <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-sm font-bold text-gray-600">
            AM
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="pt-24 px-4 md:px-8 pb-12 max-w-[1400px] mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Deal Access Requests</h1>
            <p className="text-gray-500 text-sm">Review investor profiles and control access to the data room.</p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search investors or companies..." 
                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded text-sm focus:outline-none focus:border-[#b48629] focus:ring-1 focus:ring-[#b48629] w-64"
              />
            </div>
            <select className="bg-white border border-gray-200 rounded py-2 px-3 text-sm focus:outline-none focus:border-[#b48629]">
              <option>All statuses</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
            <button className="flex items-center gap-2 bg-white border border-gray-200 rounded py-2 px-4 text-sm font-medium hover:bg-gray-50 transition-colors">
              <FaDownload className="text-gray-500" /> Export
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          
          {/* Table Toolbar */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm text-gray-900">All requests</span>
              <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">{requests.length}</span>
            </div>
            {pendingCount > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                <FaRegClock /> {pendingCount} awaiting review
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-[10px] uppercase tracking-widest text-gray-500">
                  <th className="py-4 px-6 font-bold">Date Submitted</th>
                  <th className="py-4 px-6 font-bold">Deal / Project</th>
                  <th className="py-4 px-6 font-bold">Full Name & Email</th>
                  <th className="py-4 px-6 font-bold">Company & Title</th>
                  <th className="py-4 px-6 font-bold">Investor Type</th>
                  <th className="py-4 px-6 font-bold">Status</th>
                  <th className="py-4 px-6 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-500 text-sm">
                      No access requests found.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr 
                      key={req.id} 
                      onClick={() => setSelectedRequest(req)}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedRequest?.id === req.id ? 'bg-blue-50/50' : ''}`}
                    >
                      <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">
                        {req.dateSubmitted || 'Just now'}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">{req.projectName || 'Unknown'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {req.fullName?.split(' ').map(n => n[0]).join('') || '??'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{req.fullName}</p>
                            <p className="text-xs text-gray-500">{req.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm font-bold text-gray-900">{req.company}</p>
                        <p className="text-xs text-gray-500">{req.jobTitle}</p>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {req.investorType}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(req.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(req.status)}`}></span>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center text-gray-400">
                        <button className="hover:text-gray-900 p-2"><FaEllipsisV /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Side Panel (Drawer) for Request Details */}
      {selectedRequest && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-50 transition-opacity"
            onClick={() => setSelectedRequest(null)}
          ></div>
          
          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-200">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Request Details</h2>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-900 bg-white border border-gray-200 p-1.5 rounded transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* Status Badge */}
              <div className="mb-6 flex justify-between items-center">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedRequest.status)}`}>
                  <span className={`w-2 h-2 rounded-full ${getStatusDot(selectedRequest.status)}`}></span>
                  {selectedRequest.status}
                </span>
                <span className="text-xs text-gray-500 font-medium">{selectedRequest.dateSubmitted || 'Just now'}</span>
              </div>

              {/* Profile Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold">
                    {selectedRequest.fullName?.split(' ').map(n => n[0]).join('') || '??'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedRequest.fullName}</h3>
                    <p className="text-sm text-gray-500">{selectedRequest.jobTitle} at {selectedRequest.company}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-900">{selectedRequest.email}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Investor Type</p>
                      <p className="text-sm font-medium text-gray-900">{selectedRequest.investorType}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Target Deal</p>
                      <p className="text-sm font-medium text-[#b48629]">{selectedRequest.projectName}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Investment Range</p>
                    <p className="text-sm font-medium text-gray-900">{selectedRequest.investmentRange}</p>
                  </div>
                </div>
              </div>

              {/* Message Box */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2 ml-1">Investment Mandate / Message</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 leading-relaxed min-h-[120px]">
                  {selectedRequest.message || <span className="text-gray-400 italic">No message provided.</span>}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-6 border-t border-gray-200 bg-white grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleUpdateStatus(selectedRequest.id, 'Rejected')}
                className="py-2.5 px-4 bg-white border border-gray-200 text-red-600 hover:bg-red-50 text-sm font-bold rounded transition-colors"
              >
                Reject Access
              </button>
              <button 
                onClick={() => handleUpdateStatus(selectedRequest.id, 'Approved')}
                className="py-2.5 px-4 bg-[#0b1120] hover:bg-gray-800 text-white text-sm font-bold rounded transition-colors"
              >
                Approve Access
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
