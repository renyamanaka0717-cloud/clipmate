'use client';

import Link from 'next/link';
import { List } from '@/types';

const COLOR_CLASSES: Record<string, string> = {
  pink: 'bg-pink-100',
  purple: 'bg-purple-100',
  blue: 'bg-blue-100',
  green: 'bg-green-100',
  yellow: 'bg-yellow-100',
  orange: 'bg-orange-100',
  red: 'bg-red-100',
  gray: 'bg-gray-100',
};

export default function ListCard({ list }: { list: List }) {
  const bg = COLOR_CLASSES[list.color] || 'bg-pink-100';

  return (
    <Link href={`/lists/${list.id}`}>
      <div className={`${bg} rounded-3xl p-4 flex items-center gap-3 active:scale-[0.97] transition-all`}>
        <span className="text-3xl">{list.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{list.title}</p>
          {list.visibility === 'shared' && (
            <p className="text-[10px] text-gray-500 mt-0.5">👥 共有中</p>
          )}
        </div>
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </Link>
  );
}
