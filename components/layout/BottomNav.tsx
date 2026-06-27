'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Users, User } from 'lucide-react';

const tabs = [
  { href: '/home',   Icon: Home,   label: 'Home' },
  { href: '/search', Icon: Search, label: 'Search' },
  { href: '/shared', Icon: Users,  label: 'Shared' },
  { href: '/my',     Icon: User,   label: 'My' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 flex z-40 pb-safe">
      {tabs.map(({ href, Icon, label }) => {
        const active = pathname === href || (href !== '/home' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
              active ? 'text-pink-500' : 'text-gray-400'
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.2 : 1.6} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
