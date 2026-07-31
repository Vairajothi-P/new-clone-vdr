"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/utils/supabase/client";
import { Pencil, UploadCloud, Bold, Italic, Underline, List, ListOrdered, Check, Download, ShieldAlert, FileText } from 'lucide-react';

export default function NdaSettingsPage() {
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' or 'users'
  const [showNdaAt, setShowNdaAt] = useState('First time workspace open');
  const [ndaText, setNdaText] = useState('Download Our NDA...');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [ndaUsersList, setNdaUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const editorRef = React.useRef(null);

  // ── BACKEND API CALLS ──
  const fetchUsersAndInvites = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const rawSession = localStorage.getItem("vdr_session");
      if (!rawSession) return;
      const session = JSON.parse(rawSession);

      const res = await fetch('/api/settings/nda', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fetch_users', session })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      const sortedUsers = (data.users || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const mappedUsers = sortedUsers.map(u => ({
        id: u.id,
        name: u.name || u.email,
        email: u.email || '',
        dateAccepted: u.nda_accepted_at ? new Date(u.nda_accepted_at).toLocaleDateString() : 'N/A',
        timeAccepted: u.nda_accepted_at ? new Date(u.nda_accepted_at).toLocaleTimeString() : 'N/A',
        ndaAttached: (u.nda_status === 'accepted' || u.nda_status === 'pending') ? 'Yes' : 'No',
        status: u.nda_status === 'accepted' ? 'Accepted' : (u.nda_status === 'pending' ? 'Pending' : 'Not Required'),
        isRealUser: true,
        rawStatus: u.nda_status || 'not_required',
        signatureUrl: u.nda_signature_url || null,
        signaturePath: u.nda_signature_path || null,
        signatureType: u.nda_signature_type || null
      }));

      setNdaUsersList(mappedUsers);
    } catch (error) { console.error("Error fetching users:", error); } finally { setLoadingUsers(false); }
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsersAndInvites();
  }, [activeTab, fetchUsersAndInvites]);

  const handleRequireNdaForUser = async (userId) => {
    try {
      const rawSession = localStorage.getItem("vdr_session");
      const session = JSON.parse(rawSession);
      const res = await fetch('/api/settings/nda', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'require_nda', session, payload: { userId } })
      });
      if (!res.ok) throw new Error("Failed to update status");

      setToastMessage("User must now sign NDA on next login.");
      setTimeout(() => setToastMessage(''), 3000);
      fetchUsersAndInvites();
    } catch (err) { alert("Failed to update user status."); }
  };

  const handleSaveTerms = async () => {
    try {
      const rawSession = localStorage.getItem("vdr_session");
      if (!rawSession) { setToastMessage('Error: Please log in again'); return; }
      const session = JSON.parse(rawSession);

      const res = await fetch('/api/settings/nda', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_text', session, payload: { text: ndaText } })
      });
      if (!res.ok) throw new Error("Failed to save");

      setShowEditor(false);
      setToastMessage('NDA saved to Database successfully!');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      setToastMessage('Failed to save NDA');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  useEffect(() => {
    const fetchSavedNDA = async () => {
      const rawSession = localStorage.getItem("vdr_session");
      if (!rawSession) return;
      const session = JSON.parse(rawSession);

      const res = await fetch('/api/settings/nda', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fetch_text', session })
      });
      const data = await res.json();
      if (data.success && data.nda_text) setNdaText(data.nda_text);
    };
    fetchSavedNDA();
  }, []);

  // ── EDITOR LOGIC ──
  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedFile(file);
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setNdaText(event.target.result.replace(/\n/g, '<br>'));
          setShowEditor(true);
        };
        reader.readAsText(file);
      } else {
        alert("Please upload a valid text (.txt) file.");
        setUploadedFile(null);
      }
    }
  };

  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) editorRef.current.focus();
  };

  useEffect(() => {
    if (showEditor && editorRef.current && editorRef.current.innerHTML !== ndaText) {
      editorRef.current.innerHTML = ndaText;
    }
  }, [showEditor, ndaText]);

  const handleDownloadUserNDA = async (user) => {
    const companyName = "Organization NDA";
    const userName = user.name || "Authorized Signatory";
    const userEmail = user.email || "";
    const signDate = `${user.dateAccepted} at ${user.timeAccepted}`;
    const agreementContent = ndaText || "<p>No terms provided.</p>";
    
    // Resolve signature URL (if bucket is private, generate a 1-hour signed URL using signaturePath)
    let sigImgSrc = user.signatureUrl;
    if (user.signaturePath) {
      try {
        const { data: signedData } = await supabase.storage
          .from("signature_documents")
          .createSignedUrl(user.signaturePath, 3600);
        if (signedData?.signedUrl) {
          sigImgSrc = signedData.signedUrl;
        }
      } catch (e) {
        console.warn("Could not generate signed URL, falling back to stored signatureUrl", e);
      }
    }

    // Display signature image if available, else show legal execution text
    const sigElement = sigImgSrc
      ? `<img src="${sigImgSrc}" class="sig-image" alt="Digital Signature" />`
      : `<div class="sig-placeholder">Digitally Signed & Accepted by ${userName}</div>`;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to download/print the signed NDA document.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Signed NDA - ${userName}</title>
          <style>
              body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                  color: #1e293b;
                  line-height: 1.6;
                  padding: 40px;
                  max-w: 800px;
                  margin: 0 auto;
                  background: #ffffff;
              }
              .header {
                  text-align: center;
                  border-bottom: 2px solid #e2e8f0;
                  padding-bottom: 20px;
                  margin-bottom: 30px;
              }
              .header h1 {
                  font-size: 24px;
                  font-weight: 800;
                  margin: 0 0 8px 0;
                  color: #0f172a;
              }
              .header p {
                  font-size: 14px;
                  color: #64748b;
                  margin: 0;
              }
              .content {
                  font-size: 14px;
                  color: #0f172a;
                  margin-bottom: 40px;
              }
              .content h1, .content h2, .content h3 {
                  color: #0f172a;
              }
              .signature-box {
                  border-top: 2px solid #0f172a;
                  padding-top: 25px;
                  margin-top: 50px;
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-end;
                  page-break-inside: avoid;
              }
              .sig-details {
                  font-size: 13px;
              }
              .sig-details p {
                  margin: 5px 0;
              }
              .sig-details strong {
                  color: #0f172a;
              }
              .sig-image-wrapper {
                  text-align: right;
              }
              .sig-image {
                  max-height: 80px;
                  max-width: 240px;
                  border-bottom: 1px solid #cbd5e1;
                  padding-bottom: 6px;
                  margin-bottom: 6px;
                  display: block;
              }
              .sig-placeholder {
                  font-weight: 700;
                  color: #15803d;
                  border-bottom: 1px solid #cbd5e1;
                  padding-bottom: 6px;
                  margin-bottom: 6px;
                  font-size: 14px;
              }
              .sig-label {
                  font-size: 11px;
                  color: #64748b;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
              }
              .audit-footer {
                  margin-top: 40px;
                  padding-top: 15px;
                  border-top: 1px dashed #cbd5e1;
                  font-size: 11px;
                  color: #94a3b8;
                  text-align: center;
              }
              @media print {
                  body { padding: 0; }
              }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>NON-DISCLOSURE AGREEMENT (NDA)</h1>
              <p>Virtual Data Room • Cryptographically Executed Agreement Copy</p>
          </div>

          <div class="content">
              ${agreementContent}
          </div>

          <div class="signature-box">
              <div class="sig-details">
                  <p><strong>Digitally Signed By:</strong> ${userName}</p>
                  ${userEmail ? `<p><strong>Email Address:</strong> ${userEmail}</p>` : ""}
                  <p><strong>Legal Status:</strong> Accepted & Executed</p>
                  <p><strong>Execution Timestamp:</strong> ${signDate}</p>
              </div>
              <div class="sig-image-wrapper">
                  ${sigElement}
                  <div class="sig-label">Authorized Digital Signature</div>
              </div>
          </div>

          <div class="audit-footer">
              Executed via Virtual Data Room Platform • Document Audit Trail Active
          </div>

          <script>
              window.onload = function() {
                  setTimeout(function() {
                      window.print();
                  }, 350);
              };
          </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {toastMessage && (
        <div className="fixed top-8 right-8 z-50 flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 border border-green-200 rounded-xl shadow-lg animate-in slide-in-from-top-4 fade-in duration-300">
          <Check size={18} className="text-green-500" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      <div className="mb-8 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Non-Disclosure Agreement (NDA)</h1>
        <div className="flex gap-8">
          <button onClick={() => setActiveTab('settings')} className={`pb-4 text-[15px] font-semibold transition-all relative ${activeTab === 'settings' ? 'text-[var(--brand)]' : 'text-gray-500 hover:text-gray-700'}`}>
            NDA Settings
            {activeTab === 'settings' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--brand)] rounded-t-full"></span>}
          </button>
          <button onClick={() => setActiveTab('users')} className={`pb-4 text-[15px] font-semibold transition-all relative ${activeTab === 'users' ? 'text-[var(--brand)]' : 'text-gray-500 hover:text-gray-700'}`}>
            NDA Users
            {activeTab === 'users' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--brand)] rounded-t-full"></span>}
          </button>
        </div>
      </div>

      {activeTab === 'settings' && (
        <div className="animate-in fade-in duration-300">
          <div className="mb-10">
            <h3 className="text-[15px] font-bold text-gray-900 mb-3">NDA Document Content</h3>
            <p className="text-[13px] text-gray-500 mb-4">Upload a new text file (.txt) OR edit the currently active NDA.</p>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--brand)] text-white text-sm font-semibold rounded-lg shadow-md shadow-[var(--brand)]/20 hover:bg-[var(--brand)]/90 transition-all cursor-pointer">
                <UploadCloud size={18} />
                <span>Upload New File</span>
                <input type="file" className="hidden" accept=".txt,text/plain" onChange={handleFileUpload} />
              </label>
              <button onClick={() => setShowEditor(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-all shadow-sm">
                <Pencil size={16} className="text-blue-500" />
                <span>Preview & Edit Current NDA</span>
              </button>
            </div>
          </div>

          {/* <div className="mb-8">
            <h3 className="text-[15px] font-bold text-gray-900 mb-3">Show NDA at</h3>
            <select value={showNdaAt} onChange={(e) => setShowNdaAt(e.target.value)} className="w-80 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[14px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 appearance-none shadow-sm" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}>
              <option value="First time workspace open">First time workspace open</option>
              <option value="Every time workspace open">Every time workspace open</option>
            </select>
          </div> */}

          {showEditor && (
            <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
              <h3 className="text-[15px] font-bold text-gray-900 mb-3">Edit terms here</h3>
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <style>{`.editor-content ul { list-style-type: disc; margin-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 0.5rem; } .editor-content ol { list-style-type: decimal; margin-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 0.5rem; } .editor-content blockquote { border-left: 4px solid #e5e7eb; padding-left: 1rem; font-style: italic; color: #6b7280; margin-top: 0.5rem; margin-bottom: 0.5rem; }`}</style>
                <div className="border-b border-gray-100 p-2 flex flex-wrap items-center gap-1 bg-gray-50/50">
                  <select onChange={(e) => handleFormat('formatBlock', e.target.value)} className="px-3 py-1.5 text-[13px] text-gray-600 bg-transparent border-none focus:outline-none cursor-pointer hover:bg-gray-100 rounded" defaultValue="P"><option value="P">Paragraph</option><option value="H1">Heading 1</option><option value="H2">Heading 2</option></select>
                  <div className="w-px h-5 bg-gray-200 mx-1"></div>
                  <button title="Bold" onMouseDown={(e) => { e.preventDefault(); handleFormat('bold'); }} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"><Bold size={16} /></button>
                  <button title="Italic" onMouseDown={(e) => { e.preventDefault(); handleFormat('italic'); }} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"><Italic size={16} /></button>
                  <button title="Underline" onMouseDown={(e) => { e.preventDefault(); handleFormat('underline'); }} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"><Underline size={16} /></button>
                  <div className="w-px h-5 bg-gray-200 mx-1"></div>
                  <button title="Bullet List" onMouseDown={(e) => { e.preventDefault(); handleFormat('insertUnorderedList'); }} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"><List size={16} /></button>
                  <button title="Numbered List" onMouseDown={(e) => { e.preventDefault(); handleFormat('insertOrderedList'); }} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"><ListOrdered size={16} /></button>
                </div>
                <div ref={editorRef} className="editor-content w-full min-h-[250px] p-4 text-[14px] text-gray-800 focus:outline-none overflow-y-auto" contentEditable={true} onBlur={(e) => setNdaText(e.currentTarget.innerHTML)} style={{ minHeight: '250px' }}></div>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button onClick={() => setShowEditor(false)} className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={handleSaveTerms} className="flex items-center gap-2 px-6 py-2.5 bg-[var(--brand)] text-white text-sm font-semibold rounded-lg shadow-md shadow-[var(--brand)]/20 hover:bg-[var(--brand)]/90 transition-all"><Check size={16} /> Save Terms</button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="animate-in fade-in duration-300">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200">
                    <th className="px-6 py-4 text-[13px] font-bold text-gray-600 uppercase tracking-wider">S.No</th>
                    <th className="px-6 py-4 text-[13px] font-bold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-[13px] font-bold text-gray-600 uppercase tracking-wider">Date Accepted</th>
                    <th className="px-6 py-4 text-[13px] font-bold text-gray-600 uppercase tracking-wider">Time Accepted</th>
                    <th className="px-6 py-4 text-[13px] font-bold text-gray-600 uppercase tracking-wider">NDA Attached</th>
                    <th className="px-6 py-4 text-[13px] font-bold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[13px] font-bold text-gray-600 uppercase tracking-wider text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingUsers ? (
                    <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading users...</td></tr>
                  ) : ndaUsersList.map((u, index) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-[14px] text-gray-500 font-medium">{index + 1}</td>
                      <td className="px-6 py-4"><span className="text-[14px] font-semibold text-gray-900">{u.name}</span></td>
                      <td className="px-6 py-4 text-[14px] text-gray-600">{u.dateAccepted}</td>
                      <td className="px-6 py-4 text-[14px] text-gray-600">{u.timeAccepted}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-semibold ${u.ndaAttached === 'Yes' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{u.ndaAttached}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold ${u.status === 'Accepted' ? 'bg-green-100 text-green-700' : u.status === 'Pending' || u.status === 'Pending Invite' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                          {u.status === 'Accepted' && <Check size={12} strokeWidth={3} />}
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center flex justify-center gap-2">
                        <button disabled={u.status !== 'Accepted'} onClick={() => handleDownloadUserNDA(u)} className={`inline-flex items-center justify-center p-2 rounded-lg transition-all ${u.status === 'Accepted' ? 'bg-[var(--brand)] text-white hover:bg-[var(--brand)]/90 shadow-sm hover:shadow-md' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`} title={u.status === 'Accepted' ? 'Download Signed Document' : 'Pending Acceptance'}>
                          <Download size={16} />
                        </button>
                        {u.isRealUser && u.rawStatus !== 'pending' && u.rawStatus !== 'accepted' && (
                          <button onClick={() => handleRequireNdaForUser(u.id)} className="inline-flex items-center gap-1 px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold transition-all shadow-sm" title="Force old user to sign NDA on next login">
                            <ShieldAlert size={14} /> Require NDA
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!loadingUsers && ndaUsersList.length === 0 && (
              <div className="p-12 text-center">
                <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-gray-900 font-bold mb-1">No Users Found</h3>
                <p className="text-gray-500 text-sm">When users are registered or invited, they will appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}












// "use client";
// import { supabase } from "@/utils/supabase/client";
// import React, { useState, useEffect, useCallback } from 'react';
// import { Pencil, UploadCloud, FileText, Bold, Italic, Underline, List, ListOrdered, Image as ImageIcon, Quote, Table, Undo, Redo, Check, X, Download, ShieldAlert } from 'lucide-react';
// import { useRouter } from 'next/navigation';

// export default function NdaSettingsPage() {
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState('settings'); // 'settings' or 'users'

//   const [showNdaAt, setShowNdaAt] = useState('First time workspace open');
//   const [ndaText, setNdaText] = useState('Download Our NDA...');
//   const [uploadedFile, setUploadedFile] = useState(null);
//   const [showEditor, setShowEditor] = useState(false);
//   const [toastMessage, setToastMessage] = useState('');

//   // NEW: State for actual DB users and invites
//   const [ndaUsersList, setNdaUsersList] = useState([]);
//   const [loadingUsers, setLoadingUsers] = useState(false);

//   const editorRef = React.useRef(null);

//   // -------------------------------------------------------------
//   // DB FETCH: Get Company Users & Pending Invites
//   // -------------------------------------------------------------
//   // const fetchUsersAndInvites = useCallback(async () => {
//   //   setLoadingUsers(true);
//   //   try {
//   //     const rawSession = localStorage.getItem("vdr_session");
//   //     if (!rawSession) return;
//   //     const session = JSON.parse(rawSession);
//   //     const compId = session.company_id;

//   //     // 1. Fetch Registered Users in the company
//   //     const { data: usersData } = await supabase
//   //       .from('users')
//   //       .select('id, name, email, created_at, nda_status, nda_accepted_at')
//   //       .eq('company_id', compId);

//   //     // 2. Fetch pending invites (by finding groups this company owns)
//   //     const { data: groups } = await supabase.from('groups').select('id').eq('company_id', compId);
//   //     const groupIds = groups ? groups.map(g => g.id) : [];

//   //     let invitesData = [];
//   //     if (groupIds.length > 0) {
//   //       const { data: invites } = await supabase
//   //         .from('invitations')
//   //         .select('*')
//   //         .in('group_id', groupIds)
//   //         .eq('status', 'pending');
//   //       invitesData = invites || [];
//   //     }

//   //     // 3. Merge them into a clean array for the table
//   //     let combined = [];

//   //     if (usersData) {
//   //       combined = [...combined, ...usersData.map(u => ({
//   //         id: u.id,
//   //         name: u.name || u.email,
//   //         datetime: u.nda_accepted_at ? new Date(u.nda_accepted_at).toLocaleString() : 'N/A',
//   //         ndaAttached: (u.nda_status === 'accepted' || u.nda_status === 'pending') ? 'Yes' : 'No',
//   //         status: u.nda_status === 'accepted' ? 'Accepted' : (u.nda_status === 'pending' ? 'Pending' : 'Not Required'),
//   //         isRealUser: true,
//   //         rawStatus: u.nda_status || 'not_required'
//   //       }))];
//   //     }

//   //     if (invitesData) {
//   //       combined = [...combined, ...invitesData.map(i => ({
//   //         id: i.id,
//   //         name: i.email + " (Invite)",
//   //         datetime: new Date(i.created_at).toLocaleString(),
//   //         ndaAttached: i.requires_nda ? 'Yes' : 'No',
//   //         status: 'Pending Invite',
//   //         isRealUser: false,
//   //         rawStatus: 'invite'
//   //       }))];
//   //     }

//   //     setNdaUsersList(combined);
//   //   } catch (error) {
//   //     console.error("Error fetching users:", error);
//   //   } finally {
//   //     setLoadingUsers(false);
//   //   }
//   // }, []);

//   // -------------------------------------------------------------
//   // DB FETCH: Get ONLY Real Company Users (No Pending Invites)
//   // -------------------------------------------------------------
//   const fetchUsersAndInvites = useCallback(async () => {
//     setLoadingUsers(true);
//     try {
//       const rawSession = localStorage.getItem("vdr_session");
//       if (!rawSession) return;
//       const session = JSON.parse(rawSession);
//       const compId = session.company_id;

//       // 1. Fetch ONLY Registered Users in the company
//       const { data: usersData, error } = await supabase
//         .from('users')
//         .select('id, name, email, created_at, nda_status, nda_accepted_at')
//         .eq('company_id', compId);

//       if (error) throw error;

//       // 2. Map them cleanly for the table
//       const mappedUsers = (usersData || []).map(u => ({
//         id: u.id,
//         name: u.name || u.email, // Uses their real name
//         datetime: u.nda_accepted_at ? new Date(u.nda_accepted_at).toLocaleString() : 'N/A',
//         ndaAttached: (u.nda_status === 'accepted' || u.nda_status === 'pending') ? 'Yes' : 'No',
//         status: u.nda_status === 'accepted' ? 'Accepted' : (u.nda_status === 'pending' ? 'Pending' : 'Not Required'),
//         isRealUser: true,
//         rawStatus: u.nda_status || 'not_required'
//       }));

//       // 3. Update the state with ONLY the real users
//       setNdaUsersList(mappedUsers);

//     } catch (error) {
//       console.error("Error fetching users:", error);
//     } finally {
//       setLoadingUsers(false);
//     }
//   }, []);

//   // Fetch the data when the "users" tab is clicked
//   useEffect(() => {
//     if (activeTab === 'users') {
//       fetchUsersAndInvites();
//     }
//   }, [activeTab, fetchUsersAndInvites]);


//   // -------------------------------------------------------------
//   // FORCE OLD USER TO SIGN NDA
//   // -------------------------------------------------------------
//   const handleRequireNdaForUser = async (userId) => {
//     try {
//       const { error } = await supabase
//         .from('users')
//         .update({ nda_status: 'pending' }) // This locks them out next time they login!
//         .eq('id', userId);

//       if (error) throw error;

//       setToastMessage("User must now sign NDA on next login.");
//       setTimeout(() => setToastMessage(''), 3000);
//       fetchUsersAndInvites(); // Refresh table
//     } catch (err) {
//       console.error(err);
//       alert("Failed to update user status.");
//     }
//   };


//   // -------------------------------------------------------------
//   // FILE UPLOAD & EDITOR LOGIC
//   // -------------------------------------------------------------
//   // const handleFileUpload = (e) => {
//   //   if (e.target.files && e.target.files.length > 0) {
//   //     const file = e.target.files[0];
//   //     setUploadedFile(file);

//   //     if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
//   //       const reader = new FileReader();
//   //       reader.onload = (event) => {
//   //         setNdaText(event.target.result.replace(/\n/g, '<br>'));
//   //       };
//   //       reader.readAsText(file);
//   //     } else {
//   //       alert("Please upload a valid text (.txt) file.");
//   //       setUploadedFile(null);
//   //     }
//   //   }
//   // };

//   const handleFileUpload = (e) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const file = e.target.files[0];
//       setUploadedFile(file);

//       if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
//         const reader = new FileReader();
//         reader.onload = (event) => {
//           setNdaText(event.target.result.replace(/\n/g, '<br>'));
//           setShowEditor(true); // <-- This instantly opens the editor!
//         };
//         reader.readAsText(file);
//       } else {
//         alert("Please upload a valid text (.txt) file.");
//         setUploadedFile(null);
//       }
//     }
//   };

//   const handleFormat = (command, value = null) => {
//     document.execCommand(command, false, value);
//     if (editorRef.current) editorRef.current.focus();
//   };

//   const handleEditorImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         if (editorRef.current) editorRef.current.focus();
//         document.execCommand('insertImage', false, event.target.result);
//       };
//       reader.readAsDataURL(file);
//     }
//     e.target.value = null;
//   };

//   useEffect(() => {
//     if (showEditor && editorRef.current && editorRef.current.innerHTML !== ndaText) {
//       editorRef.current.innerHTML = ndaText;
//     }
//   }, [showEditor, ndaText]);

//   const handleRemoveFile = () => {
//     setUploadedFile(null);
//     setShowEditor(false);
//   };

//   const handleSaveTerms = async () => {
//     try {
//       const rawSession = localStorage.getItem("vdr_session");
//       if (!rawSession) {
//         setToastMessage('Error: Please log in again');
//         return;
//       }
//       const session = JSON.parse(rawSession);

//       const { error } = await supabase
//         .from('companies')
//         .update({ nda_text: ndaText })
//         .eq('id', session.company_id);

//       if (error) throw error;

//       setShowEditor(false);
//       setToastMessage('NDA saved to Database successfully!');
//       setTimeout(() => setToastMessage(''), 3000);
//     } catch (err) {
//       console.error("Error saving NDA:", err);
//       setToastMessage('Failed to save NDA');
//       setTimeout(() => setToastMessage(''), 3000);
//     }
//   };

//   useEffect(() => {
//     const fetchSavedNDA = async () => {
//       const rawSession = localStorage.getItem("vdr_session");
//       if (!rawSession) return;
//       const session = JSON.parse(rawSession);

//       const { data, error } = await supabase
//         .from('companies')
//         .select('nda_text')
//         .eq('id', session.company_id)
//         .single();

//       if (data && data.nda_text) {
//         setNdaText(data.nda_text);
//       }
//     };
//     fetchSavedNDA();
//   }, []);

//   return (
//     <div className="p-8 max-w-5xl">
//       {toastMessage && (
//         <div className="fixed top-8 right-8 z-50 flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 border border-green-200 rounded-xl shadow-lg animate-in slide-in-from-top-4 fade-in duration-300">
//           <Check size={18} className="text-green-500" />
//           <span className="font-semibold text-sm">{toastMessage}</span>
//         </div>
//       )}

//       <div className="mb-8 border-b border-gray-200">
//         <h1 className="text-2xl font-bold text-gray-900 mb-6">Non-Disclosure Agreement (NDA)</h1>
//         <div className="flex gap-8">
//           <button
//             onClick={() => setActiveTab('settings')}
//             className={`pb-4 text-[15px] font-semibold transition-all relative ${activeTab === 'settings' ? 'text-[var(--brand)]' : 'text-gray-500 hover:text-gray-700'}`}
//           >
//             NDA Settings
//             {activeTab === 'settings' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--brand)] rounded-t-full"></span>}
//           </button>
//           <button
//             onClick={() => setActiveTab('users')}
//             className={`pb-4 text-[15px] font-semibold transition-all relative ${activeTab === 'users' ? 'text-[var(--brand)]' : 'text-gray-500 hover:text-gray-700'}`}
//           >
//             NDA Users
//             {activeTab === 'users' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--brand)] rounded-t-full"></span>}
//           </button>
//         </div>
//       </div>

//       {activeTab === 'settings' && (
//         <div className="animate-in fade-in duration-300">
//           {/* <div className="mb-10">
//             <h3 className="text-[15px] font-bold text-gray-900 mb-3">Upload NDA Document</h3>
//             <p className="text-[13px] text-gray-500 mb-4">Upload a text file (.txt) containing the NDA content.</p>

//             {!uploadedFile ? (
//               <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--brand)] text-white text-sm font-semibold rounded-lg shadow-md shadow-[var(--brand)]/20 hover:bg-[var(--brand)]/90 transition-all cursor-pointer">
//                 <UploadCloud size={18} />
//                 <span>Select File</span>
//                 <input type="file" className="hidden" accept=".txt,text/plain" onChange={handleFileUpload} />
//               </label>
//             ) : (
//               <div className="flex flex-col gap-4">
//                 <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm max-w-md">
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
//                       <FileText size={20} />
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{uploadedFile.name}</p>
//                       <p className="text-xs text-gray-400">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <button onClick={() => setShowEditor(true)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold">
//                       <Pencil size={14} /> Edit
//                     </button>
//                     <button onClick={handleRemoveFile} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
//                       <X size={16} />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div> */}
//           <div className="mb-10">
//             <h3 className="text-[15px] font-bold text-gray-900 mb-3">NDA Document Content</h3>
//             <p className="text-[13px] text-gray-500 mb-4">Upload a new text file (.txt) OR edit the currently active NDA.</p>

//             <div className="flex items-center gap-4">
//               {/* Button 1: Upload New File */}
//               <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--brand)] text-white text-sm font-semibold rounded-lg shadow-md shadow-[var(--brand)]/20 hover:bg-[var(--brand)]/90 transition-all cursor-pointer">
//                 <UploadCloud size={18} />
//                 <span>Upload New File</span>
//                 <input type="file" className="hidden" accept=".txt,text/plain" onChange={handleFileUpload} />
//               </label>

//               {/* Button 2: Edit Existing DB Text */}
//               <button
//                 onClick={() => setShowEditor(true)}
//                 className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-all shadow-sm"
//               >
//                 <Pencil size={16} className="text-blue-500" />
//                 <span>Preview & Edit Current NDA</span>
//               </button>
//             </div>
//           </div>

//           <div className="mb-8">
//             <h3 className="text-[15px] font-bold text-gray-900 mb-3">Show NDA at</h3>
//             <select
//               value={showNdaAt}
//               onChange={(e) => setShowNdaAt(e.target.value)}
//               className="w-80 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[14px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 appearance-none shadow-sm"
//               style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
//             >
//               <option value="First time workspace open">First time workspace open</option>
//               <option value="Every time workspace open">Every time workspace open</option>
//             </select>
//           </div>

//           {showEditor && (
//             <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
//               <h3 className="text-[15px] font-bold text-gray-900 mb-3">Edit terms here</h3>
//               <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
//                 <style>{`
//                   .editor-content ul { list-style-type: disc; margin-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
//                   .editor-content ol { list-style-type: decimal; margin-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
//                   .editor-content blockquote { border-left: 4px solid #e5e7eb; padding-left: 1rem; font-style: italic; color: #6b7280; margin-top: 0.5rem; margin-bottom: 0.5rem; }
//                 `}</style>
//                 <div className="border-b border-gray-100 p-2 flex flex-wrap items-center gap-1 bg-gray-50/50">
//                   <select onChange={(e) => handleFormat('formatBlock', e.target.value)} className="px-3 py-1.5 text-[13px] text-gray-600 bg-transparent border-none focus:outline-none cursor-pointer hover:bg-gray-100 rounded" defaultValue="P">
//                     <option value="P">Paragraph</option>
//                     <option value="H1">Heading 1</option>
//                     <option value="H2">Heading 2</option>
//                   </select>
//                   <div className="w-px h-5 bg-gray-200 mx-1"></div>
//                   <button title="Bold" onMouseDown={(e) => { e.preventDefault(); handleFormat('bold'); }} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"><Bold size={16} /></button>
//                   <button title="Italic" onMouseDown={(e) => { e.preventDefault(); handleFormat('italic'); }} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"><Italic size={16} /></button>
//                   <button title="Underline" onMouseDown={(e) => { e.preventDefault(); handleFormat('underline'); }} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"><Underline size={16} /></button>
//                   <div className="w-px h-5 bg-gray-200 mx-1"></div>
//                   <button title="Bullet List" onMouseDown={(e) => { e.preventDefault(); handleFormat('insertUnorderedList'); }} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"><List size={16} /></button>
//                   <button title="Numbered List" onMouseDown={(e) => { e.preventDefault(); handleFormat('insertOrderedList'); }} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"><ListOrdered size={16} /></button>
//                 </div>
//                 <div
//                   ref={editorRef}
//                   className="editor-content w-full min-h-[250px] p-4 text-[14px] text-gray-800 focus:outline-none overflow-y-auto"
//                   contentEditable={true}
//                   onBlur={(e) => setNdaText(e.currentTarget.innerHTML)}
//                   style={{ minHeight: '250px' }}
//                 ></div>
//               </div>

//               <div className="mt-4 flex justify-end gap-3">
//                 <button onClick={() => setShowEditor(false)} className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors">
//                   Cancel
//                 </button>
//                 <button onClick={handleSaveTerms} className="flex items-center gap-2 px-6 py-2.5 bg-[var(--brand)] text-white text-sm font-semibold rounded-lg shadow-md shadow-[var(--brand)]/20 hover:bg-[var(--brand)]/90 transition-all">
//                   <Check size={16} /> Save Terms
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* NDA USERS TAB */}
//       {activeTab === 'users' && (
//         <div className="animate-in fade-in duration-300">
//           <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full text-left border-collapse">
//                 <thead>
//                   <tr className="bg-gray-50/80 border-b border-gray-200">
//                     <th className="px-6 py-4 text-[13px] font-bold text-gray-600 uppercase tracking-wider">S.No</th>
//                     <th className="px-6 py-4 text-[13px] font-bold text-gray-600 uppercase tracking-wider">Name</th>
//                     <th className="px-6 py-4 text-[13px] font-bold text-gray-600 uppercase tracking-wider">Date Accepted</th>
//                     <th className="px-6 py-4 text-[13px] font-bold text-gray-600 uppercase tracking-wider">NDA Attached</th>
//                     <th className="px-6 py-4 text-[13px] font-bold text-gray-600 uppercase tracking-wider">Status</th>
//                     <th className="px-6 py-4 text-[13px] font-bold text-gray-600 uppercase tracking-wider text-center">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {loadingUsers ? (
//                     <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading users...</td></tr>
//                   ) : ndaUsersList.map((u, index) => (
//                     <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
//                       <td className="px-6 py-4 text-[14px] text-gray-500 font-medium">{index + 1}</td>
//                       <td className="px-6 py-4">
//                         <span className="text-[14px] font-semibold text-gray-900">{u.name}</span>
//                       </td>
//                       <td className="px-6 py-4 text-[14px] text-gray-600">{u.datetime}</td>
//                       <td className="px-6 py-4">
//                         <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-semibold ${u.ndaAttached === 'Yes' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
//                           {u.ndaAttached}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold ${u.status === 'Accepted' ? 'bg-green-100 text-green-700' :
//                           u.status === 'Pending' || u.status === 'Pending Invite' ? 'bg-orange-100 text-orange-700' :
//                             'bg-gray-100 text-gray-600'
//                           }`}>
//                           {u.status === 'Accepted' && <Check size={12} strokeWidth={3} />}
//                           {u.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-center flex justify-center gap-2">
//                         {/* Download Signed Copy (Only if accepted) */}
//                         <button
//                           disabled={u.status !== 'Accepted'}
//                           className={`inline-flex items-center justify-center p-2 rounded-lg transition-all ${u.status === 'Accepted' ? 'bg-[var(--brand)] text-white hover:bg-[var(--brand)]/90 shadow-sm hover:shadow-md' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
//                           title={u.status === 'Accepted' ? 'Download Signed Document' : 'Pending Acceptance'}
//                         >
//                           <Download size={16} />
//                         </button>



//                         {/* Force User to Sign NDA */}
//                         {u.isRealUser && u.rawStatus !== 'pending' && (
//                           <button
//                             onClick={() => handleRequireNdaForUser(u.id)}
//                             className="inline-flex items-center gap-1 px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold transition-all shadow-sm"
//                             title={u.rawStatus === 'accepted' ? "Force user to sign updated agreement" : "Force old user to sign NDA on next login"}
//                           >
//                             <ShieldAlert size={14} /> Require NDA
//                           </button>
//                         )}

//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {!loadingUsers && ndaUsersList.length === 0 && (
//               <div className="p-12 text-center">
//                 <FileText size={48} className="mx-auto text-gray-300 mb-4" />
//                 <h3 className="text-gray-900 font-bold mb-1">No Users Found</h3>
//                 <p className="text-gray-500 text-sm">When users are registered or invited, they will appear here.</p>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }

