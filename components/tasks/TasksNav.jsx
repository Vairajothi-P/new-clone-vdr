"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTasks } from './TasksContext';

export default function TasksNav() {
  const pathname = usePathname();
  const { viewMode } = useTasks();

  const tabs = viewMode === 'Buyer' 
    ? [ { id: 'board', label: 'My Tasks', path: '/tasks/board' } ]
    : [
        { id: 'board', label: 'Task Board', path: '/tasks/board' },
        { id: 'control-center', label: 'Control Center', path: '/tasks/control-center' }
      ];

  return (
    <div className="bg-white border-b border-slate-200 px-8 lg:px-10 shrink-0">
      <div className="flex space-x-2 mt-2 mb-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {tabs.map(tab => {
          const isActive = pathname === tab.path || pathname.startsWith(`${tab.path}/`);
          return (
            <Link
              key={tab.id}
              href={tab.path}
              className={`whitespace-nowrap px-4 py-2 rounded-lg font-medium text-[13px] transition-colors duration-200 ${
                isActive
                  ? 'bg-[var(--brand-50,theme(colors.blue.50))] text-[var(--brand,theme(colors.blue.700))] shadow-sm border border-[var(--brand-100,theme(colors.blue.100))]'
                  : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
