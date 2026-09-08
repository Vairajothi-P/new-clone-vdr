import React from 'react';
import { Users, FileText, CheckSquare, Settings, AlertCircle, Info, Paperclip, Pin } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function ContextPanel({ channelName, channelType }) {
  return (
    <div className="w-[320px] flex-shrink-0 border-l border-slate-200 bg-white h-full flex flex-col hidden lg:flex">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <h3 className="font-semibold text-slate-800">Details</h3>
        <button className="text-slate-400 hover:text-slate-600"><Settings size={18} /></button>
      </div>

      <Tabs defaultValue="about" className="flex-1 flex flex-col">
        <div className="px-4 pt-3 border-b border-slate-100">
          <TabsList className="w-full grid grid-cols-3 bg-transparent">
            <TabsTrigger value="about" className="data-[state=active]:bg-slate-100 data-[state=active]:shadow-none">About</TabsTrigger>
            <TabsTrigger value="members" className="data-[state=active]:bg-slate-100 data-[state=active]:shadow-none">Members</TabsTrigger>
            <TabsTrigger value="files" className="data-[state=active]:bg-slate-100 data-[state=active]:shadow-none">Files</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <TabsContent value="about" className="p-4 space-y-6 mt-0">
            <div>
              <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-2">
                <Info size={16} className="text-slate-400"/> Channel Info
              </h4>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                This channel is for all {channelName} communications related to Project Phoenix.
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-2">
                <AlertCircle size={16} className="text-slate-400"/> Linked Workflows
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm p-2 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100 cursor-pointer hover:bg-indigo-100">
                  <span className="flex items-center gap-2"><CheckSquare size={14} /> Pending Approvals</span>
                  <span className="bg-indigo-200 px-1.5 rounded-sm font-medium">2</span>
                </div>
                <div className="flex items-center justify-between text-sm p-2 bg-orange-50 text-orange-700 rounded-md border border-orange-100 cursor-pointer hover:bg-orange-100">
                  <span className="flex items-center gap-2"><CheckSquare size={14} /> Active Tasks</span>
                  <span className="bg-orange-200 px-1.5 rounded-sm font-medium">5</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-2">
                <Pin size={16} className="text-slate-400"/> Pinned Messages
              </h4>
              <div className="text-sm text-slate-500 italic p-4 text-center border border-dashed border-slate-200 rounded-lg">
                No pinned messages yet.
              </div>
            </div>
          </TabsContent>

          <TabsContent value="members" className="p-4 mt-0">
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                      U{i}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">User Name {i}</p>
                      <p className="text-[10px] text-slate-400">Deal Member</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="files" className="p-4 mt-0">
             <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg hover:shadow-sm cursor-pointer transition-shadow">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-slate-800 truncate">NDA_Draft_v{i}.pdf</p>
                    <p className="text-xs text-slate-400">Shared 2 days ago</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
