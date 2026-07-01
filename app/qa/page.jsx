"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import { supabase } from "@/utils/supabase/client";
import { FaFilter, FaDownload, FaSyncAlt, FaSearch, FaChevronRight, FaRegFolder, FaRegFileAlt, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

function QAPageContent() {
  const searchParams = useSearchParams();
  const fileIdParam = searchParams.get('fileId');
  const folderIdParam = searchParams.get('folderId');

  const [activeTab, setActiveTab] = useState("Questions");
  const [activeFolderId, setActiveFolderId] = useState(folderIdParam || null);
  const [activeDocId, setActiveDocId] = useState(fileIdParam || null);
  
  const [qaData, setQaData] = useState([]);
  const [sidebarItems, setSidebarItems] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState("");

  // For viewing/answering a specific thread
  const [selectedThread, setSelectedThread] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

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

      // Store all items, flat structure
      // We will render them recursively using parentId
      setSidebarItems(items);
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
          documents(id, name),
          qna_messages(id, sender, text, created_at, is_user)
        `)
        .order('created_at', { ascending: false });

      if (activeDocId) {
        query = query.eq('file_id', activeDocId);
      } else if (activeFolderId) {
        // If clicking a folder, maybe we only want to show questions that are not linked to a specific file, or we just don't filter to allow seeing them.
        // Let's filter by file_id IS NULL if we want folder-level questions.
        query = query.is('file_id', null);
      }

      const { data: threads, error } = await query;

      if (error) throw error;

      const formattedData = (threads || []).map((t, idx) => {
        const msgs = t.qna_messages || [];
        const firstMsg = msgs.length > 0 ? msgs[0] : null;

        let assigneeStr = "N/A";
        let displayQuestion = t.subject || (firstMsg ? firstMsg.text : "No Question");
        const match = displayQuestion.match(/^\[Assigned to: (.*?)\] (.*)$/s);
        if (match) {
          assigneeStr = match[1];
          displayQuestion = match[2];
        }
        
        const answerMsg = msgs.find(m => m.is_user === false);
        const answeredByStr = answerMsg ? answerMsg.sender : "-";

        const sessionStr = localStorage.getItem('vdr_session');
        const session = sessionStr ? JSON.parse(sessionStr) : {};
        const currentUser = session.name || session.email || "User";
        const askedByStr = firstMsg?.sender || "Unknown";
        const isMyQuestion = (askedByStr === currentUser);
        const isAssignedToMe = assigneeStr !== "N/A" ? (assigneeStr === currentUser) : true;
        
        let actionStr = "Answer / Assign";
        if (t.status === "Answered") actionStr = "View";
        else if (isMyQuestion) actionStr = "View (Awaiting Answer)";
        else if (!isAssignedToMe) actionStr = "View (Assigned)";

        return {
          id: t.id,
          displayId: idx + 1,
          question: displayQuestion,
          fileName: t.documents?.name || "Folder / General",
          askedBy: askedByStr,
          assignee: assigneeStr,
          answeredBy: answeredByStr,
          askedOn: new Date(t.created_at).toLocaleString(),
          status: t.status === "Answered" ? "Answered" : "Submitted",
          action: actionStr,
          messages: msgs
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
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const sessionStr = localStorage.getItem('vdr_session');
      if (!sessionStr) return;
      const session = JSON.parse(sessionStr);
      const { data } = await supabase.from('users').select('id, name, role').eq('company_id', session.company_id).in('role', ['admin', 'super_admin']);
      if (data) setAdmins(data);
    } catch (err) {
      console.error("Error fetching admins:", err);
    }
  };

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

  const handleAskQuery = async () => {
    if (!questionText.trim()) return;
    setIsSubmitting(true);
    try {
      const sessionStr = localStorage.getItem('vdr_session');
      const session = sessionStr ? JSON.parse(sessionStr) : { name: "User" };
      const senderName = session.name || session.email || "User";

      const finalQuestionText = selectedAssignee ? `[Assigned to: ${selectedAssignee}] ${questionText}` : questionText;

      // 1. Insert Thread
      const { data: threadData, error: threadErr } = await supabase
        .from('qna_threads')
        .insert({
          file_id: activeDocId || null,
          subject: finalQuestionText,
          status: answerText.trim() ? 'Answered' : 'Open'
        })
        .select()
        .single();
        
      if (threadErr) throw threadErr;

      // 2. Insert Messages
      const msgs = [
        { thread_id: threadData.id, sender: senderName, text: finalQuestionText, is_user: true }
      ];
      if (answerText.trim()) {
        msgs.push({ thread_id: threadData.id, sender: senderName, text: answerText, is_user: false });
      }

      const { error: msgErr } = await supabase.from('qna_messages').insert(msgs);
      if (msgErr) throw msgErr;

      // Reset and refresh
      setQuestionText("");
      setAnswerText("");
      setIsModalOpen(false);
      fetchQAData();

    } catch (err) {
      console.error("Error saving Q&A:", err);
      alert("Failed to save query.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedThread) return;
    setIsReplying(true);
    try {
      const sessionStr = localStorage.getItem('vdr_session');
      const session = sessionStr ? JSON.parse(sessionStr) : { name: "User" };
      const senderName = session.name || session.email || "User";

      // 1. Insert Reply
      const { error: msgErr } = await supabase.from('qna_messages').insert([{
        thread_id: selectedThread.id,
        sender: senderName,
        text: replyText,
        is_user: false // Assuming reply from admin/assignee
      }]);

      if (msgErr) throw msgErr;

      // 2. Update status if it was not Answered
      if (selectedThread.status !== 'Answered') {
        await supabase.from('qna_threads').update({ status: 'Answered' }).eq('id', selectedThread.id);
      }

      setReplyText("");
      // Refetch and update selectedThread messages
      await fetchQAData();
      
      // Need to update selectedThread with new messages (temporary local update or let fetchQAData handle and we close/reopen, but let's just close or refresh)
      // We will just close the modal for simplicity, or we can fetch the updated thread.
      setSelectedThread(null);

    } catch (err) {
      console.error("Error sending reply:", err);
      alert("Failed to send reply.");
    } finally {
      setIsReplying(false);
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
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 mb-2 ${
              !activeDocId && !activeFolderId
                ? "bg-[var(--brand)]/10 text-[var(--brand)] font-semibold shadow-sm border border-[var(--brand)]/20" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
            }`}
          >
            <FaRegFolder className={`w-4 h-4 ${!activeDocId && !activeFolderId ? 'text-[var(--brand)]' : 'text-slate-400'}`} />
            <span className="truncate flex-1 text-left">All Documents</span>
          </button>

          {sidebarItems
            .filter((item) => !item.parentId)
            .map((item) => {
              const renderSidebarItem = (node, depth = 0) => {
                const isFolder = node.type === 'folder';
                const isExpanded = !!expandedFolders[node.id];
                const isActive = activeDocId === node.id || activeFolderId === node.id;
                const hasChildren = sidebarItems.some((child) => child.parentId === node.id);

                return (
                  <div key={node.id} className="flex flex-col gap-0.5 w-full">
                    <button
                      onClick={() => {
                        if (isFolder) {
                          setExpandedFolders(prev => ({ ...prev, [node.id]: !prev[node.id] }));
                          handleSidebarClick(node);
                        } else {
                          handleSidebarClick(node);
                        }
                      }}
                      style={{ paddingLeft: `${0.75 + depth * 1.25}rem` }}
                      className={`flex items-center gap-2 py-2 pr-3 rounded-lg text-sm transition-all duration-200 group ${
                        isActive
                          ? "bg-[var(--brand)]/10 text-[var(--brand)] font-semibold shadow-sm border border-[var(--brand)]/20" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                      }`}
                    >
                      {isFolder ? (
                        <FaChevronRight className={`w-2.5 h-2.5 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''} ${isActive ? 'text-[var(--brand)]' : 'text-slate-400 group-hover:text-slate-500'}`} />
                      ) : (
                        <div className="w-2.5 h-2.5 flex-shrink-0" />
                      )}
                      
                      {isFolder 
                        ? <FaRegFolder className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[var(--brand)]' : 'text-slate-400'}`} /> 
                        : <FaRegFileAlt className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[var(--brand)]' : 'text-slate-400'}`} />
                      }
                      <span className="truncate flex-1 text-left" title={node.name}>{node.name}</span>
                    </button>

                    {/* Render children if expanded */}
                    {isFolder && isExpanded && hasChildren && (
                      <div className="flex flex-col gap-0.5 mt-0.5 relative before:absolute before:left-[1.35rem] before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200/60">
                        {sidebarItems
                          .filter((child) => child.parentId === node.id)
                          .map((child) => renderSidebarItem(child, depth + 1))}
                      </div>
                    )}
                  </div>
                );
              };

              return renderSidebarItem(item);
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
          <div className="flex items-center gap-2">
            {(activeDocId || activeFolderId) && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[var(--brand)] hover:bg-[var(--brand-secondary)] rounded-xl shadow-lg shadow-[var(--brand)]/20 hover:shadow-[var(--brand)]/40 hover:scale-[1.02] transition-all">
                ASK QUERY
              </button>
            )}
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[var(--brand)] bg-white border border-[var(--brand)]/30 rounded-xl shadow-sm hover:bg-[var(--brand)]/5 hover:scale-[1.02] transition-all">
              EXPORT DATA <FaDownload className="w-3.5 h-3.5" />
            </button>
          </div>
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
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-200/80 overflow-auto min-h-[300px] relative">
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
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Answered By</th>
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
                    <td className="px-4 py-4 text-sm text-slate-600 font-semibold whitespace-nowrap">
                      {item.answeredBy !== "-" ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-[var(--brand)]/10 flex items-center justify-center text-[9px] font-bold text-[var(--brand)]">
                            {item.answeredBy.charAt(0)}
                          </div>
                          {item.answeredBy}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">-</span>
                      )}
                    </td>
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
                      <button 
                        onClick={() => setSelectedThread(item)}
                        className="text-slate-600 font-bold hover:text-[var(--brand)] transition-colors flex items-center gap-1"
                      >
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

      {/* Ask Query Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-[500px] max-w-full mx-4 p-6 flex flex-col gap-5">
            <h3 className="text-lg font-bold text-slate-800">Ask New Query</h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-600">Assign To (Optional)</label>
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] bg-white"
              >
                <option value="">Select Assignee</option>
                {admins.map(admin => (
                  <option key={admin.id} value={admin.name}>{admin.name} ({admin.role})</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-600">Question <span className="text-red-500">*</span></label>
              <textarea 
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Type your question here..."
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] min-h-[80px]"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-600">Answer (Optional)</label>
              <textarea 
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Provide an answer if already known..."
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] min-h-[80px]"
              />
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                onClick={handleAskQuery}
                disabled={isSubmitting || !questionText.trim()}
                className="px-5 py-2 text-sm font-bold text-white bg-[var(--brand)] hover:bg-[var(--brand-secondary)] rounded-xl transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Thread / Answer Modal */}
      {selectedThread && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-[600px] max-w-full max-h-full flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{selectedThread.question}</h3>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5"><FaRegFileAlt className="w-3 h-3"/> {selectedThread.fileName}</span>
                  <span>•</span>
                  <span>Asked by {selectedThread.askedBy}</span>
                </div>
              </div>
              <button onClick={() => setSelectedThread(null)} className="text-slate-400 hover:text-slate-600 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 bg-[#F8F9FB]">
              {selectedThread.messages?.map((msg, i) => (
                <div key={msg.id || i} className={`flex flex-col max-w-[85%] ${msg.is_user ? 'self-end items-end' : 'self-start items-start'}`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[11px] font-bold text-slate-500">{msg.sender}</span>
                    <span className="text-[10px] text-slate-400">{new Date(msg.created_at || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className={`px-4 py-3 rounded-2xl text-sm ${msg.is_user ? 'bg-[var(--brand)] text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {(!selectedThread.messages || selectedThread.messages.length === 0) && (
                <div className="text-center text-slate-500 text-sm py-4">No messages yet.</div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-200/80 bg-white">
              <div className="flex flex-col gap-2">
                {(() => {
                  const sessionStr = localStorage.getItem('vdr_session');
                  const session = sessionStr ? JSON.parse(sessionStr) : {};
                  const senderName = session.name || session.email || "User";
                  const isMyQuestion = selectedThread.askedBy === senderName;
                  const isAssignedToMe = selectedThread.assignee !== "N/A" ? selectedThread.assignee === senderName : true;

                  if (isMyQuestion) {
                    return (
                      <div className="text-center text-sm text-amber-600 font-medium py-3 flex flex-col items-center">
                        You cannot answer your own question.
                        <div className="mt-3 w-full flex justify-end">
                          <button 
                            onClick={() => setSelectedThread(null)}
                            className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (!isAssignedToMe) {
                    return (
                      <div className="text-center text-sm text-slate-500 font-medium py-3 flex flex-col items-center">
                        This question is assigned to {selectedThread.assignee}.
                        <div className="mt-3 w-full flex justify-end">
                          <button 
                            onClick={() => setSelectedThread(null)}
                            className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <>
                      <textarea 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply or answer..."
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] min-h-[80px]"
                      />
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setSelectedThread(null)}
                          className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        >
                          Close
                        </button>
                        <button 
                          onClick={handleReply}
                          disabled={isReplying || !replyText.trim()}
                          className="px-4 py-2 text-sm font-bold text-white bg-[var(--brand)] hover:bg-[var(--brand-secondary)] rounded-xl transition-colors disabled:opacity-50"
                        >
                          {isReplying ? "Sending..." : "Send Reply"}
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QAPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center w-full h-full bg-[#FAFBFD]"><div className="w-8 h-8 border-4 border-slate-200 border-t-[var(--brand)] rounded-full animate-spin" /></div>}>
      <QAPageContent />
    </Suspense>
  );
}
