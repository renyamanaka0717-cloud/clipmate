'use client';

import Link from 'next/link';
import { Users, ChevronRight } from 'lucide-react';
import { List } from '@/types';
import ListIcon from './ListIcon';

const COLOR_CLASSES: Record<string, string> = {
  pink:   'bg-pink-100',
  purple: 'bg-purple-100',
  blue:   'bg-blue-100',
  green:  'bg-green-100',
  yellow: 'bg-yellow-100',
  orange: 'bg-orange-100',
  red:    'bg-red-100',
  gray:   'bg-gray-100',
};

export default function ListCard({ list }: { list: List }) {
  const bg = COLOR_CLASSES[list.color] || 'bg-pink-100';

  return (
    <Link href={`/lists/${list.id}`}>
      <div className={`${bg} rounded-3xl p-4 flex items-center gap-3 active:scale-[0.97] transition-all`}>
        <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/50">
          <ListIcon name={list.emoji} size={20} className="text-gray-700" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{list.title}</p>
          {list.visibility === 'shared' && (
            <p className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
              <Users size={10} strokeWidth={2} />
              共有中
            </p>
          )}
        </div>
        <ChevronRight size={16} className="text-gray-400 flex-shrink-0" strokeWidth={2} />
      </div>
    </Link>
  );
}
