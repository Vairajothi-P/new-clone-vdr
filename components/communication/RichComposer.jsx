"use client";

import React, { useState } from 'react';
import { Paperclip, Smile, Send, Bold, Italic, List, AtSign } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function RichComposer({ onSend }) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && onSend) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-white border-t border-slate-200">
      <div className="flex flex-col border border-slate-300 rounded-xl bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all shadow-sm">
        
        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
          <button className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"><Bold size={16} /></button>
          <button className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"><Italic size={16} /></button>
          <button className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"><List size={16} /></button>
          <div className="w-px h-4 bg-slate-300 mx-1"></div>
          <button className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"><AtSign size={16} /></button>
        </div>

        {/* Input Area */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Shift + Enter for new line)"
          className="w-full min-h-[80px] max-h-[200px] p-3 resize-none outline-none text-sm bg-transparent"
          rows={1}
        />

        {/* Bottom Actions */}
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors relative group">
              <Paperclip size={18} />
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
            </button>
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors">
                  <Smile size={18} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" side="top">
                <div className="grid grid-cols-6 gap-2">
                  {['👍', '🔥', '🚀', '👀', '🎉', '👏', '❤️', '💯'].map(emoji => (
                    <button 
                      key={emoji} 
                      className="text-xl hover:bg-slate-100 rounded p-1"
                      onClick={() => setMessage(prev => prev + emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <button 
            onClick={handleSend}
            disabled={!message.trim()}
            className="p-2 rounded-full bg-blue-600 text-white disabled:bg-blue-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Send size={16} className="translate-x-[1px] translate-y-[-1px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
