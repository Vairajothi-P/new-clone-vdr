import React from 'react';
import { Bell, MessageSquare, FileText, CheckSquare, Clock } from 'lucide-react';

export const metadata = {
  title: 'Notifications | Communication',
};

export default function NotificationsPage() {
  const notifications = [
    { id: 1, type: 'mention', title: 'Sarah Jenkins mentioned you', description: 'In "Legal Team": @Michael can you check this NDA?', time: '10 mins ago', icon: <MessageSquare size={18} />, color: 'bg-blue-100 text-blue-600' },
    { id: 2, type: 'document', title: 'New document uploaded', description: 'Alex uploaded "Financial_Model_v3.xlsx" in Finance Team', time: '1 hour ago', icon: <FileText size={18} />, color: 'bg-emerald-100 text-emerald-600' },
    { id: 3, type: 'approval', title: 'Approval Request', description: 'Pending approval for SPA_Draft_v1.pdf', time: '3 hours ago', icon: <CheckSquare size={18} />, color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="w-full h-full p-8 flex flex-col bg-[#F8F9FB] overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
              <Bell size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Notifications</h1>
              <p className="text-sm text-slate-500">You have 3 unread notifications.</p>
            </div>
          </div>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-800">Mark all as read</button>
        </div>

        <div className="divide-y divide-slate-100">
          {notifications.map(notif => (
            <div key={notif.id} className="p-6 hover:bg-slate-50 transition-colors flex gap-4 cursor-pointer">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.color}`}>
                {notif.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-slate-800">{notif.title}</h3>
                  <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={12}/> {notif.time}</span>
                </div>
                <p className="text-sm text-slate-600">{notif.description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
