import React from 'react';
import { Activity, Search, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const metadata = {
  title: 'Audit Trail | Communication',
};

export default function AuditTrailPage() {
  const auditLogs = [
    { id: '1', action: 'Message Deleted', entity: 'Message in "Legal Team"', user: 'Michael Chang', role: 'External Counsel', timestamp: 'Oct 24, 2026, 11:45 AM' },
    { id: '2', action: 'Channel Created', entity: 'Channel "Executive Committee"', user: 'Sarah Jenkins', role: 'Deal Owner', timestamp: 'Oct 23, 2026, 09:12 AM' },
    { id: '3', action: 'Member Added', entity: 'Alex River to "Legal Team"', user: 'Sarah Jenkins', role: 'Deal Owner', timestamp: 'Oct 23, 2026, 09:15 AM' },
    { id: '4', action: 'File Uploaded', entity: 'NDA_Draft_v2.pdf to "Legal Team"', user: 'Michael Chang', role: 'External Counsel', timestamp: 'Oct 22, 2026, 14:30 PM' },
  ];

  return (
    <div className="w-full h-full p-8 flex flex-col bg-[#F8F9FB] overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 text-white rounded-xl flex items-center justify-center">
              <Activity size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Audit Trail</h1>
              <p className="text-sm text-slate-500">Track all communication module activities for compliance.</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium">
            <Download size={16} /> Export CSV
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder="Search logs by action, user, or entity..." className="pl-9 bg-white" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Action</th>
                  <th className="px-6 py-4 font-semibold">Entity</th>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-800">{log.action}</td>
                    <td className="px-6 py-4 text-slate-600">{log.entity}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800">{log.user}</span>
                        <span className="text-[10px] text-slate-400">{log.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
