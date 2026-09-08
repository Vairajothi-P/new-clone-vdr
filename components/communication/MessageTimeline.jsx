"use client";

import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MessageTimeline({ messages }) {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <ScrollArea className="flex-1 bg-[#F8F9FB] p-6 relative">
      <div className="flex flex-col gap-2">
        {/* Unread Divider Example */}
        {/* 
        <div className="flex items-center gap-4 my-4">
          <div className="h-px bg-red-200 flex-1"></div>
          <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-full">New Messages</span>
          <div className="h-px bg-red-200 flex-1"></div>
        </div> 
        */}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} className="h-4" />
      </div>
    </ScrollArea>
  );
}
