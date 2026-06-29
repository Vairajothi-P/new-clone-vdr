"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { FaFilter, FaDownload, FaSyncAlt, FaSearch, FaChevronRight, FaRegFolder, FaRegFileAlt, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

export default function QAPage() {
  const [activeTab, setActiveTab] = useState("Questions");
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [activeDocId, setActiveDocId] = useState(null);
  
  const [qaData, setQaData] = useState([]);
  const [sidebarItems, setSidebarItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the sidebar documents and folders
  const fetchSidebarData = async () => {
    try {
      const sessionStr = localStorage.getItem('vdr_session');
      if (!sessionStr) return;
      const session = JSON.parse(sessionStr);

      const [foldersRes, docsRes] = await Promise.all([
        supabase.from('folders').select('id, name, parent_folder_id').eq('company_id', session.company_id),
        supabase.from('documents').select('id, name, folder_id, is_deleted').eq('company_id', session.company_id).eq('is_deleted', false)
      ]);

      const items = [];
      
      (foldersRes.data || []).forEach(f => {
        items.push({ id: f.id, name: f.name, type: 'folder', parentId: f.parent_folder_id });
      });

      (docsRes.data || []).forEach(d => {
        items.push({ id: d.id, name: d.name, type: 'file', parentId: d.folder_id });
      });

      // Simple flat list for now, or can be filtered by parentId
      // Let's just show top level documents and folders for demonstration
      const rootItems = items.filter(i => !i.parentId);
      setSidebarItems(rootItems.length > 0 ? rootItems : items);
    } catch (err) {
      console.error("Error fetching sidebar items:", err);
    }
  };

  const fetchQAData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('qna_threads')
        .select(`
          id,
          subject,
          status,
          created_at,
          documents!inner(id, name),
          qna_messages(sender, text)
        `)
        .order('created_at', { ascending: false });

      if (activeDocId) {
        query = query.eq('file_id', activeDocId);
      }

      const { data: threads, error } = await query;

      if (error) throw error;

      const formattedData = (threads || []).map((t, idx) => {
        const msgs = t.qna_messages || [];
        const firstMsg = msgs.length > 0 ? msgs[0] : null;

        return {
          id: t.id,
          displayId: idx + 1,
          question: t.subject || (firstMsg ? firstMsg.text : "No Question"),
          fileName: t.documents?.name || "Unknown File",
          askedBy: firstMsg?.sender || "Unknown",
          assignee: "N/A",
          askedOn: new Date(t.created_at).toLocaleString(),
          status: t.status === "Answered" ? "Answered" : "Submitted",
          action: t.status === "Answered" ? "View" : "Answer/Assign Question"
        };
      });

      setQaData(formattedData);
    } catch (err) {
      console.error("Error fetching QA data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSidebarData();
  }, []);

  useEffect(() => {
    fetchQAData();
  }, [activeDocId]); // Refetch when active doc changes

  const handleSidebarClick = (item) => {
    if (item.type === 'file') {
      setActiveDocId(item.id);
      setActiveFolderId(null);
    } else {
      setActiveFolderId(item.id);
      setActiveDocId(null);
    }
  };

  return (
    <div className="flex w-full h-full bg-[#F8F9FB] font-sans">
      
      {/* Sidebar / Left Menu */}
      <div className="w-[280px] bg-white border-r border-slate-200/80 flex flex-col h-full py-6 shadow-[4px_0_24px_rgba(0,0,0,0.01)] z-10">
        <h2 className="text-sm font-bold text-slate-800 px-6 mb-5 tracking-wide">Q & A Directory</h2>
        
        <div className="px-5 mb-6">
          <div className="relative group">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-[var(--brand)] transition-colors" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="px-6 mb-3 flex items-center gap-2 text-slate-400">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand)]"></div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Home Workspace</span>
        </div>

        <div className="flex flex-col px-3 gap-0.5 overflow-y-auto">
          {/* Show all button */}
          <button
            onClick={() => { setActiveDocId(null); setActiveFolderId(null); }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
              !activeDocId && !activeFolderId
                ? "bg-[var(--brand)]/10 text-[var(--brand)] font-semibold shadow-sm border border-[var(--brand)]/20" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
            }`}
          >
            <FaRegFolder className={`w-4 h-4 ${!activeDocId && !activeFolderId ? 'text-[var(--brand)]' : 'text-slate-400'}`} />
            <span className="truncate flex-1 text-left">All Documents</span>
          </button>

          {sidebarItems.map((item, idx) => {
            const isActive = activeDocId === item.id || activeFolderId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSidebarClick(item)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-[var(--brand)]/10 text-[var(--brand)] font-semibold shadow-sm border border-[var(--brand)]/20" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                }`}
              >
                {item.type === 'folder' 
                  ? <FaRegFolder className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[var(--brand)]' : 'text-slate-400'}`} /> 
                  : <FaRegFileAlt className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[var(--brand)]' : 'text-slate-400'}`} />
                }
                <span className="truncate flex-1 text-left" title={item.name}>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FB]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-slate-200/80 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--brand)]/10 flex items-center justify-center text-[var(--brand)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Q&A Management</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Manage and track document inquiries</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[var(--brand)] to-[var(--brand-secondary)] rounded-xl shadow-lg shadow-[var(--brand)]/20 hover:shadow-[var(--brand)]/40 hover:scale-[1.02] transition-all">
            EXPORT DATA <FaDownload className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filters & Tabs Bar */}
        <div className="bg-white border-b border-slate-200/80 px-8 flex items-end justify-between pt-4">
          
          <div className="flex gap-1">
            <button 
              onClick={() => setActiveTab("Questions")}
              className={`px-5 py-3 text-sm font-bold border-b-2 transition-all relative ${
                activeTab === "Questions" 
                  ? "border-[var(--brand)] text-[var(--brand)]" 
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-lg"
              }`}
            >
              All Questions
              {activeTab === "Questions" && <div className="absolute inset-0 bg-[var(--brand)]/5 rounded-t-lg -z-10"></div>}
            </button>
            <button 
              onClick={() => setActiveTab("Answers")}
              className={`px-5 py-3 text-sm font-bold border-b-2 transition-all relative ${
                activeTab === "Answers" 
                  ? "border-[var(--brand)] text-[var(--brand)]" 
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-lg"
              }`}
            >
              Answers
              {activeTab === "Answers" && <div className="absolute inset-0 bg-[var(--brand)]/5 rounded-t-lg -z-10"></div>}
            </button>
          </div>

          <div className="flex items-center gap-4 pb-3">
            <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <FaFilter className="w-3 h-3" />
              <span className="text-xs font-semibold text-slate-600">Filter By:</span>
            </div>
            
            <select className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] cursor-pointer">
              <option>Any Date Range</option>
              <option>Last 7 Days</option>
            </select>
            
            <select className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] cursor-pointer">
              <option>All Assignees</option>
            </select>

            <button onClick={fetchQAData} className="p-2 text-slate-400 hover:text-[var(--brand)] hover:bg-[var(--brand)]/10 rounded-lg transition-all" title="Refresh Data">
              <FaSyncAlt className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table Content Area */}
        <div className="flex-1 overflow-auto p-8">
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-200/80 overflow-hidden min-h-[300px] relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-50">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-[var(--brand)] rounded-full animate-spin"></div>
              </div>
            )}
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">ID</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Question</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">File Name</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Asked By</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Assignee</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Asked On</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {qaData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-slate-400 whitespace-nowrap">{item.displayId}</td>
                    <td className="px-4 py-4 text-sm text-slate-800 font-semibold max-w-[200px] truncate group-hover:text-[var(--brand)] transition-colors" title={item.question}>{item.question}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 truncate max-w-[200px]" title={item.fileName}>
                      <div className="flex items-center gap-2">
                        <FaRegFileAlt className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{item.fileName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                          {item.askedBy?.charAt(0) || '?'}
                        </div>
                        {item.askedBy}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-400 italic whitespace-nowrap">{item.assignee}</td>
                    <td className="px-4 py-4 text-sm text-slate-500 whitespace-nowrap">{item.askedOn}</td>
                    <td className="px-4 py-4 text-sm whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        item.status === 'Answered' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {item.status === 'Answered' ? <FaCheckCircle className="w-3 h-3" /> : <FaExclamationCircle className="w-3 h-3" />}
                        {item.status}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm whitespace-nowrap">
                      <button className="text-slate-600 font-bold hover:text-[var(--brand)] transition-colors flex items-center gap-1">
                        {item.action}
                        <FaChevronRight className="w-2.5 h-2.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {!loading && qaData.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                      No questions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
