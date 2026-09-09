"use client";

import React, { useState } from 'react';

export default function TaskNotificationPanel({ onClose }) {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'assignment',
      title: 'Task Assigned',
      message: "You have been assigned a task 'Review draft NDA'.",
      time: '10 min ago',
      unread: true,
      icon: (
        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        </div>
      )
    },
    {
      id: 2,
      type: 'view',
      title: 'Document View Required',
      message: "Please review the document 'NDA_Draft_v2.docx'.",
      time: '15 min ago',
      unread: true,
      icon: (
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
        </div>
      )
    },
    {
      id: 3,
      type: 'reminder',
      title: 'Reminder',
      message: "Task 'Financial DD Checklist' is due in 1 day.",
      time: '1 hr ago',
      unread: false,
      icon: (
        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
      )
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  return (
    <div className="w-80 bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          Notifications
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </h3>
        <button 
          onClick={markAllAsRead}
          className="text-xs font-semibold text-[var(--brand,theme(colors.blue.600))] hover:underline"
        >
          Mark all as read
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No new notifications.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 relative ${notification.unread ? 'bg-blue-50/30' : ''}`}
              >
                {notification.icon}
                
                <div className="flex-1 min-w-0 pr-4">
                  <p className={`text-sm mb-1 ${notification.unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed mb-1.5">
                    {notification.message}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {notification.time}
                  </p>
                </div>

                {notification.unread && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--brand,theme(colors.blue.600))]"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 text-center bg-slate-50/50">
        <button className="text-xs font-bold text-[var(--brand,theme(colors.blue.600))] hover:underline w-full py-1">
          View all notifications
        </button>
      </div>

    </div>
  );
}
