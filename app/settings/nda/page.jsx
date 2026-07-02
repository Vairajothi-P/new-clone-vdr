"use client";

import React, { useState, useEffect } from 'react';
import { Pencil, UploadCloud, FileText, Bold, Italic, Underline, Link2, List, ListOrdered, Image as ImageIcon, Quote, Table, Undo, Redo, Check, X, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NdaSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' or 'users'

  const [showNdaAt, setShowNdaAt] = useState('First time workspace open');
  const [ndaText, setNdaText] = useState('Download Our NDA...');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [ndaUsers, setNdaUsers] = useState([
    { id: 1, name: 'John Doe', datetime: '2023-10-25 10:30 AM', ndaAttached: 'Yes', status: 'Accepted' },
    { id: 2, name: 'Jane Smith', datetime: '2023-10-26 02:15 PM', ndaAttached: 'Yes', status: 'Pending' },
    { id: 3, name: 'Mike Ross', datetime: '2023-10-27 09:00 AM', ndaAttached: 'No', status: 'Pending' },
  ]);

  const editorRef = React.useRef(null);

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedFile(file);

      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setNdaText(event.target.result.replace(/\n/g, '<br>'));
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
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  useEffect(() => {
    if (showEditor && editorRef.current && editorRef.current.innerHTML !== ndaText) {
      editorRef.current.innerHTML = ndaText;
    }
  }, [showEditor, ndaText]);

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setShowEditor(false);
  };

  const handleSaveTerms = () => {
    setShowEditor(false);
    setToastMessage('Saved successfully!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="p-8 max-w-5xl">

      {toastMessage && (
        <div className="fixed top-8 right-8 z-50 flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 border border-green-200 rounded-xl shadow-lg animate-in slide-in-from-top-4 fade-in duration-300">
          <Check size={18} className="text-green-500" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      <div className="mb-8 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Non - disclosure Agreement (NDA)</h1>
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-4 text-[15px] font-semibold transition-all relative ${activeTab === 'settings' ? 'text-[var(--brand)]' : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            NDA Settings
            {activeTab === 'settings' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--brand)] rounded-t-full"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 text-[15px] font-semibold transition-all relative ${activeTab === 'users' ? 'text-[var(--brand)]' : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            NDA Users
            {activeTab === 'users' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--brand)] rounded-t-full"></span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'settings' && (
        <div className="animate-in fade-in duration-300">
          <div className="mb-10">
            <h3 className="text-[15px] font-bold text-gray-900 mb-3">Upload NDA Document</h3>
            <p className="text-[13px] text-gray-500 mb-4">Upload a text file (.txt) containing the NDA content.</p>

            {!uploadedFile ? (
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--brand)] text-white text-sm font-semibold rounded-lg shadow-md shadow-[var(--brand)]/20 hover:bg-[var(--brand)]/90 transition-all cursor-pointer">
                <UploadCloud size={18} />
                <span>Select File</span>
                <input type="file" className="hidden" accept=".txt,text/plain" onChange={handleFileUpload} />
              </label>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm max-w-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-400">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowEditor(true)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                    <button
                      onClick={handleRemoveFile}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h3 className="text-[15px] font-bold text-gray-900 mb-3">Show NDA at</h3>
            <select
              value={showNdaAt}
              onChange={(e) => setShowNdaAt(e.target.value)}
              className="w-80 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[14px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 appearance-none shadow-sm"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
            >
              <option value="First time workspace open">First time workspace open</option>
              <option value="Every time workspace open">Every time workspace open</option>
            </select>
          </div>

          {showEditor && (
            <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
              <h3 className="text-[15px] font-bold text-gray-900 mb-3">Edit terms here</h3>
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="border-b border-gray-100 p-2 flex flex-wrap items-center gap-1 bg-gray-50/50">
                  <select
                    onChange={(e) => handleFormat('formatBlock', e.target.value)}
                    className="px-3 py-1.5 text-[13px] text-gray-600 bg-transparent border-none focus:outline-none cursor-pointer hover:bg-gray-100 rounded"
                    defaultValue="P"
                  >
                    <option value="P">Paragraph</option>
                    <option value="H1">Heading 1</option>
                    <option value="H2">Heading 2</option>
                  </select>
                  <div className="w-px h-5 bg-gray-200 mx-1"></div>
                  <button onMouseDown={(e) => { e.preventDefault(); handleFormat('bold'); }} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"><Bold size={16} /></button>
                  <button onMouseDown={(e) => { e.preventDefault(); handleFormat('italic'); }} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"><Italic size={16} /></button>
                  <button onMouseDown={(e) => { e.preventDefault(); handleFormat('underline'); }} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"><Underline size={16} /></button>
                  <div className="w-px h-5 bg-gray-200 mx-1"></div>
                  <button onMouseDown={(e) => { e.preventDefault(); handleFormat('insertUnorderedList'); }} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"><List size={16} /></button>
                  <button onMouseDown={(e) => { e.preventDefault(); handleFormat('insertOrderedList'); }} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"><ListOrdered size={16} /></button>
                  <div className="w-px h-5 bg-gray-200 mx-1"></div>
                  <button onMouseDown={(e) => { e.preventDefault(); const url = prompt('Enter image URL:'); if (url) handleFormat('insertImage', url); }} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"><ImageIcon size={16} /></button>
                  <button onMouseDown={(e) => { e.preventDefault(); handleFormat('formatBlock', 'BLOCKQUOTE'); }} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"><Quote size={16} /></button>
                  <button onMouseDown={(e) => { e.preventDefault(); handleFormat('insertHTML', '<table border="1" style="width:100%; border-collapse: collapse; margin: 10px 0;"><tr><td style="padding: 8px;">Cell 1</td><td style="padding: 8px;">Cell 2</td></tr><tr><td style="padding: 8px;">Cell 3</td><td style="padding: 8px;">Cell 4</td></tr></table><br/>'); }} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"><Table size={16} /></button>
                  <div className="w-px h-5 bg-gray-200 mx-1"></div>
                  <button onMouseDown={(e) => { e.preventDefault(); handleFormat('undo'); }} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"><Undo size={16} /></button>
                  <button onMouseDown={(e) => { e.preventDefault(); handleFormat('redo'); }} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"><Redo size={16} /></button>
                </div>
                <div
                  ref={editorRef}
                  className="w-full min-h-[250px] p-4 text-[14px] text-gray-800 focus:outline-none overflow-y-auto"
                  contentEditable={true}
                  onBlur={(e) => setNdaText(e.currentTarget.innerHTML)}
                  style={{ minHeight: '250px' }}
                ></div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowEditor(false)}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTerms}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[var(--brand)] text-white text-sm font-semibold rounded-lg shadow-md shadow-[var(--brand)]/20 hover:bg-[var(--brand)]/90 transition-all"
                >
                  <Check size={16} />
                  Save Terms
                </button>
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
                    <th className="px-6 py-4 text-[13px] font-bold text-gray-600 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-4 text-[13px] font-bold text-gray-600 uppercase tracking-wider">NDA Attached</th>
                    <th className="px-6 py-4 text-[13px] font-bold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[13px] font-bold text-gray-600 uppercase tracking-wider text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ndaUsers.map((u, index) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-[14px] text-gray-500 font-medium">{index + 1}</td>
                      <td className="px-6 py-4">
                        <span className="text-[14px] font-semibold text-gray-900">{u.name}</span>
                      </td>
                      <td className="px-6 py-4 text-[14px] text-gray-600">{u.datetime}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-semibold ${u.ndaAttached === 'Yes' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                          {u.ndaAttached}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold ${u.status === 'Accepted' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                          {u.status === 'Accepted' && <Check size={12} strokeWidth={3} />}
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          disabled={u.status !== 'Accepted'}
                          className={`inline-flex items-center justify-center p-2 rounded-lg transition-all ${u.status === 'Accepted'
                            ? 'bg-[var(--brand)] text-white hover:bg-[var(--brand)]/90 shadow-sm hover:shadow-md'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          title={u.status === 'Accepted' ? 'Download Signed Document' : 'Pending Acceptance'}
                        >
                          <Download size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {ndaUsers.length === 0 && (
              <div className="p-12 text-center">
                <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-gray-900 font-bold mb-1">No NDA Users Found</h3>
                <p className="text-gray-500 text-sm">When users are invited and attached to an NDA, they will appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
