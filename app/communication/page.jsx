import React from 'react';
import { MessageSquare, Users, FileText, Bell, PlusCircle, Megaphone, Upload } from 'lucide-react';
import { Card } from '@/components/ui/Card'; // Assuming existing Card component

export const metadata = {
  title: 'Communication | VDR Vault',
};

export default function CommunicationPage() {
  return (
    <div className="w-full h-full flex flex-col overflow-y-auto bg-[#F8F9FB]">
      <div className="p-8 max-w-6xl mx-auto w-full">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-md mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Deal Communication</h1>
          <p className="text-blue-100 max-w-2xl text-lg">
            Collaborate securely with internal teams, external advisors, and counterparties. 
            All communications are encrypted and audited.
          </p>
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button className="flex flex-col items-center justify-center gap-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-slate-700 hover:text-blue-600">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <PlusCircle size={24} />
            </div>
            <span className="font-medium">New Channel</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-slate-700 hover:text-blue-600">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
              <MessageSquare size={24} />
            </div>
            <span className="font-medium">Direct Message</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-slate-700 hover:text-blue-600">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
              <Megaphone size={24} />
            </div>
            <span className="font-medium">Announcement</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-slate-700 hover:text-blue-600">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
              <Upload size={24} />
            </div>
            <span className="font-medium">Share Document</span>
          </button>
        </div>

        {/* Stats Grid */}
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Channels</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">12</h3>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center shrink-0">
              <Bell size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Unread Messages</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">8</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Shared Documents</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">45</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center shrink-0">
              <MessageSquare size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Open Threads</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">3</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
