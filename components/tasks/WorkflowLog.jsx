"use client";

import React from 'react';

export default function WorkflowLog({ logs }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-white">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Workflow Audit Log</h2>
        </div>
        <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Timestamp</th>
              <th scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">User</th>
              <th scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              <th scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Task Reference</th>
              <th scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                  {new Date(log.timestamp).toLocaleString(undefined, {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600 border border-slate-200">
                      {log.user.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-800">{log.user}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-medium uppercase tracking-wider border bg-slate-50 text-slate-700 border-slate-200">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-[var(--brand)] hover:underline cursor-pointer">
                    {log.taskTitle}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 max-w-sm truncate">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
