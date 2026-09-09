"use client";

import React from 'react';

export default function Stakeholders({ users }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-white">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Stakeholders & Workload</h2>
        </div>
        <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-[var(--brand)] bg-[var(--brand-50,theme(colors.blue.50))] border border-[var(--brand-200,theme(colors.blue.200))] rounded-lg hover:bg-[var(--brand-100,theme(colors.blue.100))] transition-colors shadow-sm">
          Invite Member
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Member</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Open Tasks</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Workload Capacity</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                      {user.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2.5 py-0.5 inline-flex text-xs font-bold rounded bg-[var(--brand-50,theme(colors.blue.50))] text-[var(--brand)] border border-[var(--brand-200,theme(colors.blue.200))]">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-slate-800">
                    {user.openTasks} tasks
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap w-64">
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-slate-100 rounded-full h-1.5 border border-slate-200">
                      <div 
                        className={`h-full rounded-full transition-all ${user.workload > 80 ? 'bg-red-500' : 'bg-[var(--brand,theme(colors.blue.600))]'}`} 
                        style={{ width: `${user.workload}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-bold w-10 text-right ${user.workload > 80 ? 'text-red-600' : 'text-slate-600'}`}>
                      {user.workload}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
