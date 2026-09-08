"use client";

import React, { useState } from 'react';
import { X, Send, User, CheckCircle, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function DocumentQnA({ documentId }) {
  const [question, setQuestion] = useState('');
  
  // Mock questions
  const questions = [
    {
      id: 'q1',
      author: 'Sarah Jenkins',
      text: 'Section 4.2 seems to contradict the previous clause regarding termination. Can we clarify this?',
      status: 'open',
      timestamp: '2 hours ago',
      replies: [
        { author: 'Michael Chang', text: 'Good catch. I will draft a revision to make it clear that 4.2 only applies post-closing.', timestamp: '1 hour ago' }
      ]
    },
    {
      id: 'q2',
      author: 'Alex River',
      text: 'Do we have the counterparty signatures for Exhibit A?',
      status: 'resolved',
      timestamp: '1 day ago',
      replies: [
        { author: 'Sarah Jenkins', text: 'Yes, they were uploaded to the data room this morning.', timestamp: '23 hours ago' }
      ]
    }
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-slate-200">
        <h3 className="font-semibold text-slate-800">Document Q&A</h3>
        <p className="text-xs text-slate-500">Ask questions contextually linked to this document version.</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {questions.map(q => (
            <div key={q.id} className="border border-slate-200 rounded-lg p-3 shadow-sm bg-slate-50/50">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                    <User size={12} className="text-slate-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{q.author}</span>
                </div>
                {q.status === 'resolved' 
                  ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] px-1.5 h-4"><CheckCircle size={10} className="mr-1"/> Resolved</Badge>
                  : <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[10px] px-1.5 h-4"><Clock size={10} className="mr-1"/> Open</Badge>
                }
              </div>
              
              <p className="text-sm text-slate-700 mb-3">{q.text}</p>
              
              {q.replies.length > 0 && (
                <div className="pl-4 border-l-2 border-slate-200 space-y-3 mt-3">
                  {q.replies.map((reply, i) => (
                    <div key={i}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-700">{reply.author}</span>
                        <span className="text-[10px] text-slate-400">{reply.timestamp}</span>
                      </div>
                      <p className="text-sm text-slate-600">{reply.text}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {q.status === 'open' && (
                <div className="mt-3 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Reply..." 
                    className="flex-1 text-xs border border-slate-200 rounded p-1.5 focus:outline-none focus:border-blue-500"
                  />
                  <button className="bg-slate-100 p-1.5 rounded text-slate-600 hover:bg-slate-200"><Send size={14} /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex gap-2">
          <textarea 
            placeholder="Ask a question about this document..."
            className="flex-1 text-sm border border-slate-300 rounded-lg p-2 resize-none outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button className="bg-blue-600 text-white p-2 rounded-lg h-auto self-end hover:bg-blue-700 transition-colors">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
