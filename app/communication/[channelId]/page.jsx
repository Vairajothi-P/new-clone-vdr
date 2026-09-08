"use client"

import React, { useState, useEffect } from 'react';
import { use } from 'react';
import { Phone, Video, Search, MoreVertical, Hash, Lock } from 'lucide-react';
import MessageTimeline from '@/components/communication/MessageTimeline';
import RichComposer from '@/components/communication/RichComposer';
import ContextPanel from '@/components/communication/ContextPanel';

// Mock data
const MOCK_MESSAGES = [
  {
    id: 'm1',
    senderName: 'Sarah Jenkins',
    role: 'Deal Owner',
    text: 'Welcome to the Legal Team channel. Please upload the revised NDAs here.',
    timestamp: '10:00 AM',
    isMine: false,
    seen: true,
    reactions: [{ emoji: '👍', count: 2 }],
  },
  {
    id: 'm2',
    senderName: 'Michael Chang',
    role: 'External Counsel',
    text: 'I have reviewed the latest drafts. Attached are my comments.',
    timestamp: '10:15 AM',
    isMine: true,
    seen: true,
    attachments: [{ name: 'NDA_Comments_v2.pdf' }],
    threadCount: 1,
  },
  {
    id: 'm3',
    senderName: 'Alex River',
    role: 'Compliance',
    text: 'Looks good from a compliance perspective. We can proceed.',
    timestamp: '11:30 AM',
    isMine: false,
    seen: false,
  }
];

export default function ChannelPage({ params }) {
  // In Next.js 15, params is a Promise, so we must unwrap it using React.use()
  const unwrappedParams = use(params);
  const channelId = unwrappedParams.channelId;
  
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  
  // Mock channel details based on ID
  const isPrivate = channelId === '3';
  const channelName = channelId === '1' ? 'Legal Team' : channelId === '2' ? 'Finance Team' : 'Executive Committee';

  const handleSendMessage = (text) => {
    const newMessage = {
      id: Date.now().toString(),
      senderName: 'Michael Chang',
      role: 'External Counsel',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
      seen: false,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="flex w-full h-full">
      {/* Center Workspace (Main Chat Area) */}
      <div className="flex-1 flex flex-col min-w-0 h-full border-r border-slate-200">
        
        {/* Channel Header */}
        <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${isPrivate ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
              {isPrivate ? <Lock size={20} /> : <Hash size={20} />}
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-lg leading-tight">{channelName}</h1>
              <p className="text-xs text-slate-500 font-medium">12 members • 3 online</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors hidden sm:block">
              <Phone size={20} />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors hidden sm:block">
              <Video size={20} />
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <Search size={20} />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* Messages Timeline */}
        <MessageTimeline messages={messages} />

        {/* Composer */}
        <RichComposer onSend={handleSendMessage} />
      </div>

      {/* Right Sidebar (Context Panel) */}
      <ContextPanel channelName={channelName} channelType={isPrivate ? 'private' : 'public'} />
    </div>
  );
}
