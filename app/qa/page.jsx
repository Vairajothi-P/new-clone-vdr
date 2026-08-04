"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import { supabase } from "@/utils/supabase/client";
import { 
  FaFilter, 
  FaDownload, 
  FaSyncAlt, 
  FaSearch, 
  FaChevronRight, 
  FaRegFolder, 
  FaRegFileAlt, 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaPaperclip,
  FaUserShield,
  FaUsers,
  FaUser,
  FaGlobeAmericas,
  FaTimes
} from "react-icons/fa";

// ── CUSTOM CLEAN ASSIGNEE SELECTOR (FOR MODAL) ───────────────────────────
function CustomAssigneeSelect({ value, onChange, admins = [], groups = [], allUsers = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const query = search.trim().toLowerCase();

  // Filter admins
  const filteredAdmins = admins.filter(a => 
    a.name?.toLowerCase().includes(query) || 
    a.email?.toLowerCase().includes(query) || 
    a.role?.toLowerCase().includes(query)
  );

  // Filter groups and their members
  const groupUserIds = new Set();
  const filteredGroups = groups.map(g => {
    const members = (allUsers || []).filter(u => u.groupIds?.includes(g.id));
    members.forEach(m => groupUserIds.add(m.id));
    const isGroupMatch = g.name?.toLowerCase().includes(query);
    const matchedMembers = members.filter(m => 
      isGroupMatch || 
      m.name?.toLowerCase().includes(query) || 
      m.email?.toLowerCase().includes(query)
    );
    return {
      ...g,
      members: query ? matchedMembers : members,
      showGroup: (query ? matchedMembers.length > 0 : members.length > 0)
    };
  }).filter(g => g.showGroup);

  // Filter other users
  const adminIds = new Set(admins.map(a => a.id));
  const otherUsers = (allUsers || []).filter(u => !groupUserIds.has(u.id) && !adminIds.has(u.id));
  const filteredOtherUsers = otherUsers.filter(u => 
    u.name?.toLowerCase().includes(query) || 
    u.email?.toLowerCase().includes(query) ||
    u.role?.toLowerCase().includes(query)
  );

  const selectedUserObj = (allUsers || []).find(u => u.name === value) || admins.find(a => a.name === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-2.5 px-3 text-sm bg-white border rounded-xl transition-all cursor-pointer ${
          isOpen 
            ? "border-[var(--brand)] ring-1 ring-[var(--brand)] shadow-xs" 
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
        }`}
      >
        <div className="flex items-center gap-2.5 truncate text-left">
          {!value ? (
            <div className="flex items-center gap-2.5 text-slate-600">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs flex-shrink-0">
                <FaGlobeAmericas className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-slate-700 text-xs">Without Assignee</span>
                <span className="text-[10px] text-slate-400">Open to anyone</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-semibold text-xs flex-shrink-0">
                {selectedUserObj?.name?.charAt(0).toUpperCase() || value.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-800 text-xs">{value}</span>
                  {selectedUserObj?.role && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] text-slate-500 bg-slate-100 border border-slate-200/60">
                      {selectedUserObj.role === 'super_admin' ? 'Super Admin' : selectedUserObj.role === 'admin' ? 'Admin' : selectedUserObj.role}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400">{selectedUserObj?.email || "Member"}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 text-slate-400 flex-shrink-0">
          {value && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="p-1 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="Clear selection"
            >
              <FaTimes className="w-3 h-3" />
            </span>
          )}
          <FaChevronRight className={`w-3 h-3 transition-transform duration-150 ${isOpen ? '-rotate-90 text-slate-600' : 'rotate-90'}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden flex flex-col max-h-[300px] animate-in fade-in duration-100">
          {/* Search Header */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10">
            <div className="relative flex items-center">
              <FaSearch className="absolute left-2.5 w-3 h-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search member..."
                className="w-full pl-7 pr-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
                autoFocus
              />
            </div>
          </div>

          {/* List options */}
          <div className="overflow-y-auto p-1 flex flex-col gap-0.5">
            {/* Without assignee */}
            <button
              type="button"
              onClick={() => { onChange(""); setIsOpen(false); }}
              className={`flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                !value 
                  ? "bg-slate-100 text-slate-900 font-semibold" 
                  : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center text-xs">
                  <FaGlobeAmericas className="w-3 h-3" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-800">Without Assignee</div>
                  <div className="text-[10px] text-slate-400">Open for anyone to answer</div>
                </div>
              </div>
              {!value && <FaCheckCircle className="w-3.5 h-3.5 text-slate-700" />}
            </button>

            {/* Administrators */}
            {filteredAdmins.length > 0 && (
              <div className="mt-1">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Administrators</span>
                  <span className="text-slate-400 font-normal">{filteredAdmins.length}</span>
                </div>
                {filteredAdmins.map(admin => {
                  const isSelected = value === admin.name;
                  return (
                    <button
                      key={admin.id}
                      type="button"
                      onClick={() => { onChange(admin.name); setIsOpen(false); }}
                      className={`w-full flex items-center justify-between p-1.5 px-2 rounded-lg text-left transition-colors cursor-pointer ${
                        isSelected 
                          ? "bg-slate-100 text-slate-900 font-semibold" 
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[9px]">
                          {admin.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <span className="text-xs text-slate-800">{admin.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-slate-500 bg-slate-100 px-1 py-0.2 rounded border border-slate-200/50">
                          {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                        </span>
                        {isSelected && <FaCheckCircle className="w-3 h-3 text-slate-700" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Groups and Members */}
            {filteredGroups.map(group => (
              <div key={group.id} className="mt-1 border-t border-slate-100 pt-1">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1">🏢 {group.name}</span>
                  <span className="text-slate-400 font-normal">{group.members.length}</span>
                </div>

                {/* Individual members */}
                {group.members.map(member => {
                  const isSelected = value === member.name;
                  return (
                    <button
                      key={`${group.id}-${member.id}`}
                      type="button"
                      onClick={() => { onChange(member.name); setIsOpen(false); }}
                      className={`w-full flex items-center justify-between p-1.5 px-2 rounded-lg text-left transition-colors cursor-pointer ${
                        isSelected 
                          ? "bg-slate-100 text-slate-900 font-semibold" 
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[9px]">
                          {member.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="text-xs text-slate-800">{member.name}</span>
                      </div>
                      {isSelected && <FaCheckCircle className="w-3 h-3 text-slate-700" />}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Other Users */}
            {filteredOtherUsers.length > 0 && (
              <div className="mt-1 border-t border-slate-100 pt-1">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Other Members</span>
                  <span className="text-slate-400 font-normal">{filteredOtherUsers.length}</span>
                </div>
                {filteredOtherUsers.map(user => {
                  const isSelected = value === user.name;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => { onChange(user.name); setIsOpen(false); }}
                      className={`w-full flex items-center justify-between p-1.5 px-2 rounded-lg text-left transition-colors cursor-pointer ${
                        isSelected 
                          ? "bg-slate-100 text-slate-900 font-semibold" 
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[9px]">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="text-xs text-slate-800">{user.name}</span>
                      </div>
                      {isSelected && <FaCheckCircle className="w-3 h-3 text-slate-700" />}
                    </button>
                  );
                })}
              </div>
            )}

            {filteredAdmins.length === 0 && filteredGroups.length === 0 && filteredOtherUsers.length === 0 && (
              <div className="py-4 text-center text-xs text-slate-400">
                No matching members found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── CUSTOM CLEAN ASSIGNEE FILTER (FOR TABLE TOOLBAR) ─────────────────────
function CustomAssigneeFilter({ value, onChange, admins = [], groups = [], allUsers = [], qaData = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const query = search.trim().toLowerCase();

  const knownAssignees = new Set([
    ...admins.map(a => a.name),
    ...allUsers.map(u => u.name),
    'all', 'N/A'
  ]);
  const extraAssignees = Array.from(new Set(
    qaData.map(item => item.assignee).filter(a => a && !knownAssignees.has(a))
  ));

  const filteredAdmins = admins.filter(a => a.name?.toLowerCase().includes(query));
  const filteredGroups = groups.map(g => {
    const members = (allUsers || []).filter(u => u.groupIds?.includes(g.id));
    const isGroupMatch = g.name?.toLowerCase().includes(query);
    const matchedMembers = members.filter(m => isGroupMatch || m.name?.toLowerCase().includes(query));
    return { ...g, members: query ? matchedMembers : members, show: (query ? matchedMembers.length > 0 : members.length > 0) };
  }).filter(g => g.show);

  const displayLabel = value === 'all' 
    ? 'All Assignees' 
    : value === 'N/A' 
    ? 'Without Assignee' 
    : value;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer ${
          value !== 'all'
            ? "bg-slate-100 text-slate-900 border-slate-300 font-bold"
            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-semibold"
        }`}
      >
        <FaUser className="w-3 h-3 text-slate-400" />
        <span className="max-w-[140px] truncate">{displayLabel}</span>
        <FaChevronRight className={`w-2.5 h-2.5 transition-transform duration-150 ${isOpen ? '-rotate-90 text-slate-600' : 'rotate-90 text-slate-400'}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden flex flex-col max-h-[300px] animate-in fade-in duration-100">
          <div className="p-2 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10">
            <div className="relative flex items-center">
              <FaSearch className="absolute left-2.5 w-3 h-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter assignees..."
                className="w-full pl-7 pr-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
                autoFocus
              />
            </div>
          </div>

          <div className="overflow-y-auto p-1 flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => { onChange('all'); setIsOpen(false); }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                value === 'all' ? "bg-slate-100 text-slate-900 font-bold" : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              <span>All Assignees</span>
              {value === 'all' && <FaCheckCircle className="w-3 h-3 text-slate-700" />}
            </button>

            <button
              type="button"
              onClick={() => { onChange('N/A'); setIsOpen(false); }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                value === 'N/A' ? "bg-slate-100 text-slate-900 font-bold" : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              <span>Without Assignee</span>
              {value === 'N/A' && <FaCheckCircle className="w-3 h-3 text-slate-700" />}
            </button>

            {filteredAdmins.length > 0 && (
              <div className="mt-1 pt-1 border-t border-slate-100">
                <div className="px-2 py-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Administrators</div>
                {filteredAdmins.map(admin => (
                  <button
                    key={admin.id}
                    type="button"
                    onClick={() => { onChange(admin.name); setIsOpen(false); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      value === admin.name ? "bg-slate-100 text-slate-900 font-bold" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="truncate">{admin.name}</span>
                    {value === admin.name && <FaCheckCircle className="w-3 h-3 text-slate-700" />}
                  </button>
                ))}
              </div>
            )}

            {filteredGroups.map(group => (
              <div key={group.id} className="mt-1 pt-1 border-t border-slate-100">
                <div className="px-2 py-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">🏢 {group.name}</div>
                {group.members.map(member => (
                  <button
                    key={`${group.id}-${member.id}`}
                    type="button"
                    onClick={() => { onChange(member.name); setIsOpen(false); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      value === member.name ? "bg-slate-100 text-slate-900 font-bold" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="truncate">{member.name}</span>
                    {value === member.name && <FaCheckCircle className="w-3 h-3 text-slate-700" />}
                  </button>
                ))}
              </div>
            ))}

            {extraAssignees.length > 0 && (
              <div className="mt-1 pt-1 border-t border-slate-100">
                <div className="px-2 py-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Other Assignees</div>
                {extraAssignees.map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => { onChange(a); setIsOpen(false); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      value === a ? "bg-slate-100 text-slate-900 font-bold" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="truncate">{a}</span>
                    {value === a && <FaCheckCircle className="w-3 h-3 text-slate-700" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [sidebarSearch, setSidebarSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [groups, setGroups] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [myGroupNames, setMyGroupNames] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState("");

  // For viewing/answering a specific thread
  const [selectedThread, setSelectedThread] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [askFile, setAskFile] = useState(null);
  const [replyFile, setReplyFile] = useState(null);

  // ── FILTER STATE ─────────────────────────────────────────────────────
  const [filterStatus, setFilterStatus] = useState('all');      // 'all' | 'Answered' | 'Submitted'
  const [filterDateRange, setFilterDateRange] = useState('all'); // 'all' | 'today' | 'last7' | 'last30' | 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('all');  // 'all' | assignee name
  const [tableSearch, setTableSearch] = useState('');

  // Fetch the sidebar documents and folders
  const fetchSidebarData = async () => {
    try {
      const sessionStr = localStorage.getItem('vdr_session');
      if (!sessionStr) return;
      const session = JSON.parse(sessionStr);

      const [foldersRes, docsRes] = await Promise.all([
        supabase.from('folders').select('id, name, parent_folder_id').eq('company_id', session.company_id).eq('workspace_id', session.active_workspace_id),
        supabase.from('documents').select('id, name, folder_id, is_deleted').eq('company_id', session.company_id).eq('workspace_id', session.active_workspace_id).eq('is_deleted', false)
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
        const isAdmin = session.role === 'super_admin' || session.role === 'admin';
        const isGroupAssigned = myGroupNames.some(gName => assigneeStr === gName || assigneeStr === `Group: ${gName}`);
        const isAssignedToMe = assigneeStr === "N/A" || assigneeStr === currentUser || assigneeStr === session.email || isAdmin || isGroupAssigned;
        
        let actionStr = "Answer / Assign";
        if (t.status === "Answered") actionStr = "View";
        else if (isMyQuestion) actionStr = "View (Awaiting Answer)";
        else if (!isAssignedToMe) actionStr = "View";

        return {
          id: t.id,
          displayId: idx + 1,
          question: displayQuestion,
          fileName: t.documents?.name || "Folder / General",
          askedBy: askedByStr,
          assignee: assigneeStr,
          answeredBy: answeredByStr,
          askedOn: new Date(t.created_at).toLocaleString(),
          rawDate: t.created_at,
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
    fetchAssignees();
  }, []);

  const fetchAssignees = async () => {
    try {
      const sessionStr = localStorage.getItem('vdr_session');
      if (!sessionStr) return;
      const session = JSON.parse(sessionStr);

      const [usersRes, groupsRes, ugRes] = await Promise.all([
        supabase
          .from('users')
          .select('id, name, email, role, workspace_id')
          .eq('company_id', session.company_id),
        supabase
          .from('groups')
          .select('id, name, role, workspace_id')
          .eq('company_id', session.company_id),
        supabase
          .from('user_groups')
          .select('user_id, group_id')
      ]);

      const usersList = usersRes.data || [];
      const groupsList = (groupsRes.data || []).filter(g => !g.workspace_id || !session.active_workspace_id || g.workspace_id === session.active_workspace_id);
      const ugList = ugRes.data || [];

      // Map users with their assigned groups
      const mappedUsers = usersList.map(user => {
        const userGroupIds = ugList
          .filter(ug => ug.user_id === user.id)
          .map(ug => ug.group_id);
        const userGroups = groupsList.filter(g => userGroupIds.includes(g.id));
        return {
          ...user,
          groupIds: userGroupIds,
          groups: userGroups
        };
      });

      // Filter for active workspace or all company users
      const workspaceUsers = mappedUsers.filter(u => 
        !u.workspace_id || !session.active_workspace_id || u.workspace_id === session.active_workspace_id || u.groups.length > 0
      );

      // Separate admins
      const adminList = workspaceUsers.filter(u => ['super_admin', 'admin'].includes(u.role));
      
      // Find current user's groups
      const currentLoggedIn = mappedUsers.find(u => u.id === session.id || u.email === session.email);
      const userGroupNames = currentLoggedIn ? currentLoggedIn.groups.map(g => g.name) : [];

      setAdmins(adminList);
      setGroups(groupsList);
      setAllUsers(workspaceUsers);
      setMyGroupNames(userGroupNames);
    } catch (err) {
      console.error("Error fetching assignees:", err);
    }
  };

  useEffect(() => {
    fetchQAData();
  }, [activeDocId, myGroupNames]); // Refetch when active doc or user group context changes

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

      let attachmentStr = "";
      if (askFile) {
        const path = `qa-attachments/${Date.now()}_${askFile.name}`;
        const { data: uploadData, error: uploadErr } = await supabase.storage.from('original-files').upload(path, askFile);
        if (uploadErr) throw uploadErr;
        attachmentStr = `|ATTACHMENT|${askFile.name}|${uploadData.path}`;
      }

      const finalQuestionText = selectedAssignee ? `[Assigned to: ${selectedAssignee}] ${questionText}` : questionText;

      // 1. Insert Thread
      const { data: threadData, error: threadErr } = await supabase
        .from('qna_threads')
        .insert({
          file_id: activeDocId || null,
          subject: finalQuestionText,
          status: 'Open'
        })
        .select()
        .single();
        
      if (threadErr) throw threadErr;

      // 2. Insert Messages
      const msgs = [
        { thread_id: threadData.id, sender: senderName, text: finalQuestionText + attachmentStr, is_user: true }
      ];

      const { error: msgErr } = await supabase.from('qna_messages').insert(msgs);
      if (msgErr) throw msgErr;

      // Reset and refresh
      setQuestionText("");
      setAskFile(null);
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
    if ((!replyText.trim() && !replyFile) || !selectedThread) return;
    setIsReplying(true);
    try {
      const sessionStr = localStorage.getItem('vdr_session');
      const session = sessionStr ? JSON.parse(sessionStr) : { name: "User" };
      const senderName = session.name || session.email || "User";

      let attachmentStr = "";
      if (replyFile) {
        const path = `qa-attachments/${Date.now()}_${replyFile.name}`;
        const { data: uploadData, error: uploadErr } = await supabase.storage.from('original-files').upload(path, replyFile);
        if (uploadErr) throw uploadErr;
        attachmentStr = `|ATTACHMENT|${replyFile.name}|${uploadData.path}`;
      }

      const userEmail = session.email || "";
      const isMyQuestion = (
        selectedThread.askedBy === senderName ||
        (userEmail && selectedThread.askedBy === userEmail) ||
        (session.name && selectedThread.askedBy?.toLowerCase() === session.name?.toLowerCase()) ||
        (session.email && selectedThread.askedBy?.toLowerCase() === session.email?.toLowerCase())
      );

      if (isMyQuestion) {
        alert("You cannot answer your own question.");
        return;
      }

      // 1. Insert Reply
      const { error: msgErr } = await supabase.from('qna_messages').insert([{
        thread_id: selectedThread.id,
        sender: senderName,
        text: replyText + attachmentStr,
        is_user: false
      }]);

      if (msgErr) throw msgErr;

      // 2. Update status
      if (selectedThread.status !== 'Answered') {
        await supabase.from('qna_threads').update({ status: 'Answered' }).eq('id', selectedThread.id);
      }

      setReplyText("");
      setReplyFile(null);
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

  const handleDownloadAttachment = async (path, name) => {
    try {
      const { data, error } = await supabase.storage.from('original-files').download(path);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading attachment:", err);
      alert("Failed to download attachment.");
    }
  };

  const handleExport = () => {
    if (qaData.length === 0) {
      alert("No data to export.");
      return;
    }
    
    const headers = ["ID", "Question", "File Name", "Asked By", "Assignee", "Answered By", "Asked On", "Status"];
    const csvRows = [headers.join(",")];
    
    qaData.forEach(item => {
      const row = [
        item.displayId,
        `"${(item.question || "").replace(/"/g, '""')}"`,
        `"${(item.fileName || "").replace(/"/g, '""')}"`,
        `"${(item.askedBy || "").replace(/"/g, '""')}"`,
        `"${(item.assignee || "").replace(/"/g, '""')}"`,
        `"${(item.answeredBy || "").replace(/"/g, '""')}"`,
        `"${(item.askedOn || "").replace(/"/g, '""')}"`,
        `"${(item.status || "").replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(","));
    });
    
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `qa_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredQaData = qaData.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterAssignee !== 'all') {
      if (filterAssignee === 'N/A') {
        if (item.assignee !== 'N/A' && item.assignee !== '' && item.assignee !== null) return false;
      } else if (item.assignee !== filterAssignee) {
        return false;
      }
    }
    
    if (filterDateRange !== 'all') {
      const itemDate = new Date(item.rawDate);
      const now = new Date();
      if (filterDateRange === 'today') {
        if (itemDate.toDateString() !== now.toDateString()) return false;
      } else if (filterDateRange === 'last7') {
        const diffTime = Math.abs(now - itemDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 7) return false;
      } else if (filterDateRange === 'last30') {
        const diffTime = Math.abs(now - itemDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 30) return false;
      } else if (filterDateRange === 'custom') {
        if (customStartDate) {
          const start = new Date(customStartDate);
          start.setHours(0, 0, 0, 0);
          if (itemDate < start) return false;
        }
        if (customEndDate) {
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          if (itemDate > end) return false;
        }
      }
    }
    return true;
  });

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
              value={sidebarSearch}
              onChange={e => setSidebarSearch(e.target.value)}
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

          {(() => {
            const searchTerm = sidebarSearch.trim().toLowerCase();

            // Helper: check if a node or any of its descendants match
            const doesNodeMatch = (node) => {
              if (node.name.toLowerCase().includes(searchTerm)) return true;
              const children = sidebarItems.filter(c => c.parentId === node.id);
              return children.some(c => doesNodeMatch(c));
            };

            // Get root items, filtered if search is active
            const rootItems = sidebarItems
              .filter(item => !item.parentId)
              .filter(item => !searchTerm || doesNodeMatch(item));

            return rootItems.map((item) => {
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
                    {isFolder && (isExpanded || searchTerm) && hasChildren && (
                      <div className="flex flex-col gap-0.5 mt-0.5 relative before:absolute before:left-[1.35rem] before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200/60">
                        {sidebarItems
                          .filter((child) => child.parentId === node.id)
                          .filter((child) => !searchTerm || doesNodeMatch(child))
                          .map((child) => renderSidebarItem(child, depth + 1))}
                      </div>
                    )}
                  </div>
                );
              };

              return renderSidebarItem(item);
            });
          })()}
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
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[var(--brand)] bg-white border border-[var(--brand)]/30 rounded-xl shadow-sm hover:bg-[var(--brand)]/5 hover:scale-[1.02] transition-all"
            >
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

          <div className="flex items-center gap-4 pb-3 flex-wrap">
            <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <FaFilter className="w-3 h-3" />
              <span className="text-xs font-semibold text-slate-600">Filter By:</span>
            </div>
            
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="Submitted">Submitted (Open)</option>
              <option value="Answered">Answered (Closed)</option>
            </select>

            <select 
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] cursor-pointer"
            >
              <option value="all">Any Date Range</option>
              <option value="today">Today</option>
              <option value="last7">Last 7 Days</option>
              <option value="last30">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>

            {filterDateRange === 'custom' && (
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)]"
                />
                <span className="text-xs text-slate-400 font-medium">to</span>
                <input 
                  type="date" 
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)]"
                />
              </div>
            )}
            
            <CustomAssigneeFilter 
              value={filterAssignee}
              onChange={setFilterAssignee}
              admins={admins}
              groups={groups}
              allUsers={allUsers}
              qaData={qaData}
            />

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
                {filteredQaData.map((item) => (
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
                    <td className="px-4 py-4 text-sm whitespace-nowrap">
                      {item.assignee === "N/A" || !item.assignee ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium text-slate-400 bg-slate-50 border border-slate-200/50">
                          <FaGlobeAmericas className="w-3 h-3 text-slate-400" />
                          Anyone
                        </span>
                      ) : item.assignee.startsWith("Group:") ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
                          <FaUsers className="w-3 h-3 text-slate-500" />
                          {item.assignee}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                            {item.assignee.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-800 text-xs">{item.assignee}</span>
                        </div>
                      )}
                    </td>
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
                
                {!loading && filteredQaData.length === 0 && (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-slate-500 font-medium">
                      {qaData.length > 0 ? "No questions match your current filters." : "No questions found."}
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
              <CustomAssigneeSelect 
                value={selectedAssignee}
                onChange={setSelectedAssignee}
                admins={admins}
                groups={groups}
                allUsers={allUsers}
              />
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
              <label className="text-sm font-semibold text-slate-600">Attachment (Optional)</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors text-sm text-slate-600 font-medium">
                  <FaPaperclip className="w-4 h-4 text-slate-400" />
                  <span className="truncate max-w-[200px]">{askFile ? askFile.name : "Select File"}</span>
                  <input type="file" className="hidden" onChange={(e) => setAskFile(e.target.files[0])} />
                </label>
                {askFile && (
                  <button onClick={() => setAskFile(null)} className="text-xs text-red-500 hover:underline">Remove</button>
                )}
              </div>
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
              {(() => {
                const sessionStr = localStorage.getItem('vdr_session');
                const session = sessionStr ? JSON.parse(sessionStr) : {};
                const currentUser = session.name || session.email || "User";
                
                return selectedThread.messages?.map((msg, i) => {
                  const isMine = msg.sender === currentUser;
                  const parts = (msg.text || "").split('|ATTACHMENT|');
                  const msgText = parts[0];
                  const attachment = parts.length > 1 ? parts[1].split('|') : null;
                  return (
                    <div key={msg.id || i} className={`flex flex-col max-w-[85%] ${isMine ? 'self-end items-end' : 'self-start items-start'}`}>
                      <div className={`flex items-center gap-2 mb-1 px-1 ${isMine ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[11px] font-bold text-slate-500">{isMine ? 'You' : msg.sender}</span>
                        <span className="text-[10px] text-slate-400">{new Date(msg.created_at || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className={`px-4 py-3 rounded-2xl text-sm flex flex-col gap-2 ${isMine ? 'bg-[var(--brand)] text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'}`}>
                        {msgText && <div className="whitespace-pre-wrap">{msgText}</div>}
                        {attachment && (
                          <button 
                            onClick={() => handleDownloadAttachment(attachment[1], attachment[0])}
                            className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-colors w-max ${isMine ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                            title="Download Attachment"
                          >
                            <FaPaperclip className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[200px] font-medium">{attachment[0]}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
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
                  const userEmail = session.email || "";

                  const isMyQuestion = (
                    selectedThread.askedBy === senderName ||
                    (userEmail && selectedThread.askedBy === userEmail) ||
                    (session.name && selectedThread.askedBy?.toLowerCase() === session.name?.toLowerCase()) ||
                    (session.email && selectedThread.askedBy?.toLowerCase() === session.email?.toLowerCase())
                  );
                  const isAdmin = session.role === 'super_admin' || session.role === 'admin';
                  const isGroupAssigned = myGroupNames.some(gName => selectedThread.assignee === gName || selectedThread.assignee === `Group: ${gName}`);
                  const isAssignedToMe = selectedThread.assignee === "N/A" || selectedThread.assignee === senderName || selectedThread.assignee === userEmail || isAdmin || isGroupAssigned;

                  // 1. Asker cannot answer their own question
                  if (isMyQuestion) {
                    return (
                      <div className="text-center text-sm text-slate-500 font-medium py-3 flex flex-col items-center gap-1">
                        <span>You asked this question. Waiting for assignee to answer.</span>
                        <div className="mt-2 w-full flex justify-end">
                          <button 
                            onClick={() => {
                              setSelectedThread(null);
                              setReplyFile(null);
                              setReplyText("");
                            }}
                            className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // 2. If assigned to someone else
                  if (!isAssignedToMe) {
                    return (
                      <div className="text-center text-sm text-slate-500 font-medium py-3 flex flex-col items-center gap-1">
                        <span>This question is assigned to {selectedThread.assignee}. You can only view.</span>
                        <div className="mt-2 w-full flex justify-end">
                          <button 
                            onClick={() => {
                              setSelectedThread(null);
                              setReplyFile(null);
                              setReplyText("");
                            }}
                            className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // 3. Authorized assignee / admin answering
                  return (
                    <>
                      <textarea 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your answer..."
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] min-h-[80px]"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors text-xs text-slate-600 font-medium">
                            <FaPaperclip className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate max-w-[150px]">{replyFile ? replyFile.name : "Attach File"}</span>
                            <input type="file" className="hidden" onChange={(e) => setReplyFile(e.target.files[0])} />
                          </label>
                          {replyFile && (
                            <button onClick={() => setReplyFile(null)} className="text-xs text-red-500 hover:underline">Remove</button>
                          )}
                        </div>
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => {
                              setSelectedThread(null);
                              setReplyFile(null);
                              setReplyText("");
                            }}
                            className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                          >
                            Close
                          </button>
                          <button 
                            onClick={handleReply}
                            disabled={isReplying || (!replyText.trim() && !replyFile)}
                            className="px-4 py-2 text-sm font-bold text-white bg-[var(--brand)] hover:bg-[var(--brand-secondary)] rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {isReplying ? "Sending..." : "Submit Answer"}
                          </button>
                        </div>
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
