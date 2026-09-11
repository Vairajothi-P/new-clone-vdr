"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './merge.css';

export default function MergeLayout({ children }) {
  const pathname = usePathname() || '';

  const navLinks = [
    { name: 'Overview', href: '/bidding/merge' },
    { name: 'Data room', href: '/bidding/merge/data-room' },
    { name: 'Proposal', href: '/bidding/merge/proposal' },
    { name: 'Governance', href: '/bidding/merge/governance' },
    { name: 'Merger agreement', href: '/bidding/merge/agreement' },
    { name: 'Messages', href: '/bidding/merge/messages' },
  ];

  return (
    <div className="merge-container">
      <div className="subnav">
        {navLinks.map((link) => {
          // 'Overview' needs exact match, others need startsWith (or exact)
          const isActive =
            link.href === '/bidding/merge'
              ? pathname === '/bidding/merge'
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.name}
              href={link.href}
              className={isActive ? 'active' : ''}
            >
              {link.name}
            </Link>
          );
        })}
      </div>

      <div className="merge-content">
        {children}
      </div>
    </div>
  );
}
