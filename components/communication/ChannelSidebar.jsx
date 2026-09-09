"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, Hash, Lock, Search, Bell, Megaphone, MoreVertical } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

const mockChannels = [
  { id: '1', name: 'Legal Team', type: 'public', unread: 3, lastActivity: '10m ago' },
  { id: '2', name: 'Finance Team', type: 'public', unread: 0, lastActivity: '1h ago' },
  { id: '3', name: 'Executive Committee', type: 'private', unread: 1, lastActivity: '2h ago' },
];

const mockDMs = [
  { id: 'user1', name: 'Sarah Jenkins', role: 'Deal Owner', unread: 5, online: true },
  { id: 'user2', name: 'Michael Chang', role: 'External Counsel', unread: 0, online: false },
];

export default function ChannelSidebar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="w-[300px] flex-shrink-0 border-r border-slate-200 bg-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Communication</h2>
        <button className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
          <Plus size={18} />
        </button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="channels" className="w-full flex-1 flex flex-col">
        <div className="px-4 pt-4">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="dms">DMs</TabsTrigger>
            <TabsTrigger value="announcements">News</TabsTrigger>
          </TabsList>
        </div>

        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search..."
              className="pl-9 h-9 bg-slate-50 border-slate-200 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-2">
          <TabsContent value="channels" className="mt-0 space-y-1">
            {mockChannels.map((channel) => {
              const isActive = pathname === `/communication/${channel.id}`;
              return (
                <Link
                  key={channel.id}
                  href={`/communication/${channel.id}`}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {channel.type === 'private' ? <Lock size={16} /> : <Hash size={16} />}
                    </div>
                    <div className="truncate">
                      <p className={`text-sm font-medium truncate ${isActive ? 'text-blue-700' : 'text-slate-700'}`}>
                        {channel.name}
                      </p>
                    </div>
                  </div>
                  {channel.unread > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                      {channel.unread}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </TabsContent>

          <TabsContent value="dms" className="mt-0 space-y-1">
            {mockDMs.map((dm) => (
              <Link
                key={dm.id}
                href={`/communication/dm/${dm.id}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">
                        {dm.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {dm.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{dm.name}</p>
                    <p className="text-[10px] text-slate-400">{dm.role}</p>
                  </div>
                </div>
                {dm.unread > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                    {dm.unread}
                  </Badge>
                )}
              </Link>
            ))}
          </TabsContent>

          <TabsContent value="announcements" className="mt-0">
            <Link
              href="/communication/announcements"
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors text-slate-700"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600">
                <Megaphone size={16} />
              </div>
              <p className="text-sm font-medium">All Announcements</p>
            </Link>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
