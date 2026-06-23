"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { FaUserPlus, FaCog } from "react-icons/fa";

export default function ActivatePage() {

  // MULTI SELECT MEMBERS
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const [showToast, setShowToast] = useState(false);
  const [showPermissionPage, setShowPermissionPage] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteDescription, setInviteDescription] = useState("");
  const [inviteToast, setInviteToast] = useState(false);

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setMembers(data || []);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMembers();
  }, []);

  // Workspace permissions
  const workspacePermissions = [
    "Documents",
    "Groups",
    "Settings",
  ];

  // File permissions
  const filePermissions = [
    "Create Workspace",
    "Edit Workspace",
    "Delete Workspace",
    "Manage Members",
    "View Reports",
  ];

  // Permission checkbox
  const handleCheckboxChange = (value) => {
    if (selectedPermissions.includes(value)) {
      setSelectedPermissions(selectedPermissions.filter((item) => item !== value));
    } else {
      setSelectedPermissions([...selectedPermissions, value]);
    }
  };

  const handleInviteSubmit = () => {
    if (!inviteEmail.trim()) { alert("Please enter email"); return; }
    if (!inviteDescription.trim()) { alert("Please enter description"); return; }

    setInviteToast(true);
    setTimeout(() => setInviteToast(false), 3000);

    setInviteEmail("");
    setInviteDescription("");
    setShowInviteModal(false);
  };

  const handleSubmit = () => {
    if (selectedPermissions.length === 0) {
      alert("Please select permission type");
      return;
    }

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    setSelectedPermissions([]);
    setShowPermissionPage(false);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden font-sans bg-[#F8F9FB] relative">

      {/* PERMISSION TOAST */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl z-[100] animate-in slide-in-from-bottom-8 fade-in duration-300 font-medium font-sans text-sm flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Permission Applied Successfully
        </div>
      )}

      {/* INVITE TOAST */}
      {inviteToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl z-[100] animate-in slide-in-from-bottom-8 fade-in duration-300 font-medium font-sans text-sm flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Invitation Email Sent Successfully
        </div>
      )}

      {/* HEADER */}
      <div className="pt-10 px-10 pb-6 shrink-0 relative z-10">
        <div className="flex items-start justify-between">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        S
                    </div>
                    <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
                        Sub Admin Group
                    </h1>
                </div>
                <p className="text-slate-500 text-sm font-medium ml-13 pl-13 max-w-2xl">
                    Manage access and administration settings for sub-admin members.
                </p>
            </div>
            
            {!showPermissionPage && (
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowInviteModal(true)}
                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95">
                        <FaUserPlus size={14} className="text-slate-500" />
                        <span>Invite Member</span>
                    </button>
                    <button onClick={() => setShowPermissionPage(true)}
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-medium text-sm hover:bg-slate-800 transition-all shadow-md active:scale-95">
                        <FaCog size={14} className="text-white/80" />
                        <span>Edit Permissions</span>
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-10 pb-12 mt-2">
        {!showPermissionPage ? (
          /* MEMBERS TABLE CARD */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-semibold text-sm text-slate-700">Active Members</h3>
                <span className="bg-slate-200 text-slate-600 font-medium text-xs px-2.5 py-0.5 rounded-full">{members.length}</span>
            </div>
            
            <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="py-4 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider w-1/3">Name</th>
                            <th className="py-4 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider w-1/3">Email Address</th>
                            <th className="py-4 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider">Phone</th>
                            <th className="py-4 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan={4} className="py-20 text-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto" /></td></tr>
                        ) : members.length === 0 ? (
                            <tr><td colSpan={4} className="py-24 text-center font-medium text-slate-500 text-sm">No members assigned to this group yet.</td></tr>
                        ) : (
                            members.map((member) => (
                                <tr key={member.id} className="group hover:bg-slate-50/50 transition-colors duration-200">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                {member.name?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                            <span className="font-medium text-slate-700 text-sm">{member.name || "Unknown"}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-slate-500 text-sm">{member.email}</td>
                                    <td className="py-4 px-6 text-slate-500 text-sm">{member.phone_number || '—'}</td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${member.status === "active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}>
                                            {member.status || "inactive"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
          </div>
        ) : (
          /* PERMISSION PAGE */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Permissions Matrix</h2>
                    <p className="text-slate-500 mt-1 text-sm">Configure granular access controls for Sub Admin Group</p>
                </div>
                <button onClick={() => setShowPermissionPage(false)}
                    className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium text-sm hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                    Cancel
                </button>
            </div>

            <div className="space-y-6 max-w-4xl">
              {/* FILE PERMISSION TYPE */}
              <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${selectedPermissions.some((p) => filePermissions.includes(p)) ? "border-slate-300 bg-white shadow-sm" : "border-slate-100 bg-slate-50/50"}`}>
                  <div className="flex items-center justify-between px-6 py-5 cursor-pointer" onClick={() => {
                      if (selectedPermissions.some((p) => filePermissions.includes(p))) {
                          setSelectedPermissions(selectedPermissions.filter((item) => !filePermissions.includes(item)));
                      } else {
                          setSelectedPermissions([...selectedPermissions, ...filePermissions]);
                      }
                  }}>
                      <div>
                          <p className={`font-semibold text-sm ${selectedPermissions.some((p) => filePermissions.includes(p)) ? "text-slate-800" : "text-slate-500"}`}>File Permissions</p>
                          <p className="text-sm text-slate-500 mt-0.5">Access to specific files and folder operations</p>
                      </div>
                      <div className="flex items-center gap-5">
                          <button
                              className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 ${selectedPermissions.some((p) => filePermissions.includes(p)) ? 'bg-slate-800' : 'bg-slate-300'}`}>
                              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${selectedPermissions.some((p) => filePermissions.includes(p)) ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                      </div>
                  </div>

                  {selectedPermissions.some((p) => filePermissions.includes(p)) && (
                      <div className="px-6 pb-6 pt-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {filePermissions.map((permission, index) => (
                                  <div key={index} onClick={(e) => { e.stopPropagation(); handleCheckboxChange(permission); }}
                                      className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all select-none group ${selectedPermissions.includes(permission) ? "border-slate-800 bg-slate-800/5" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                                      <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-all shrink-0 border ${selectedPermissions.includes(permission) ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-300 group-hover:border-slate-400"}`}>
                                          {selectedPermissions.includes(permission) && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                      </div>
                                      <div>
                                          <span className={`block font-semibold text-sm ${selectedPermissions.includes(permission) ? "text-slate-800" : "text-slate-600"}`}>{permission}</span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
              </div>

              {/* WORKSPACE PERMISSION TYPE */}
              <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${selectedPermissions.some((p) => workspacePermissions.includes(p)) ? "border-slate-300 bg-white shadow-sm" : "border-slate-100 bg-slate-50/50"}`}>
                  <div className="flex items-center justify-between px-6 py-5 cursor-pointer" onClick={() => {
                      if (selectedPermissions.some((p) => workspacePermissions.includes(p))) {
                          setSelectedPermissions(selectedPermissions.filter((item) => !workspacePermissions.includes(item)));
                      } else {
                          setSelectedPermissions([...selectedPermissions, ...workspacePermissions]);
                      }
                  }}>
                      <div>
                          <p className={`font-semibold text-sm ${selectedPermissions.some((p) => workspacePermissions.includes(p)) ? "text-slate-800" : "text-slate-500"}`}>Workspace Permissions</p>
                          <p className="text-sm text-slate-500 mt-0.5">Access to core workspace modules and settings</p>
                      </div>
                      <div className="flex items-center gap-5">
                          <button
                              className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 ${selectedPermissions.some((p) => workspacePermissions.includes(p)) ? 'bg-slate-800' : 'bg-slate-300'}`}>
                              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${selectedPermissions.some((p) => workspacePermissions.includes(p)) ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                      </div>
                  </div>

                  {selectedPermissions.some((p) => workspacePermissions.includes(p)) && (
                      <div className="px-6 pb-6 pt-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {workspacePermissions.map((permission, index) => (
                                  <div key={index} onClick={(e) => { e.stopPropagation(); handleCheckboxChange(permission); }}
                                      className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all select-none group ${selectedPermissions.includes(permission) ? "border-slate-800 bg-slate-800/5" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                                      <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-all shrink-0 border ${selectedPermissions.includes(permission) ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-300 group-hover:border-slate-400"}`}>
                                          {selectedPermissions.includes(permission) && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                      </div>
                                      <div>
                                          <span className={`block font-semibold text-sm ${selectedPermissions.includes(permission) ? "text-slate-800" : "text-slate-600"}`}>{permission}</span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button onClick={handleSubmit}
                    className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium text-sm shadow-md shadow-slate-900/10 hover:shadow-lg hover:bg-slate-800 transition-all active:scale-95">
                    Save Permissions
                </button>
            </div>
          </div>
        )}
      </div>

      {/* INVITE MODAL - Premium Glassmorphic */}
      {showInviteModal && (
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-[200] p-6 animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 relative animate-in zoom-in-95 duration-200">
                  <button onClick={() => setShowInviteModal(false)}
                      className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">✕</button>
                  
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                      <FaUserPlus size={16} />
                  </div>
                  
                  <h2 className="text-xl font-semibold text-slate-800 mb-1">Invite Member</h2>
                  <p className="text-sm text-slate-500 mb-6">
                      Add a new member to <span className="font-semibold text-slate-700">Sub Admin Group</span>
                  </p>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Candidate Email</label>
                          <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} type="email" placeholder="colleague@company.com"
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-slate-800 transition-colors placeholder:text-slate-400 placeholder:font-normal" />
                      </div>
                      <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Message (Optional)</label>
                          <textarea value={inviteDescription} onChange={e => setInviteDescription(e.target.value)} rows="3" placeholder="Brief invitation message..."
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-slate-800 resize-none transition-colors placeholder:text-slate-400 placeholder:font-normal" />
                      </div>
                      <button onClick={handleInviteSubmit}
                          className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium text-sm shadow-md shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95 mt-2">
                          Send Invitation
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}
