'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Item } from '@/types';
import SourceBadge from '@/components/ui/SourceBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import { useUser } from '@/hooks/useUsers';

interface Props {
  item: Item;
  isNew?: boolean;
  showList?: boolean;
  listTitle?: string;
}

export default function ItemCard({ item, isNew, showList, listTitle }: Props) {
  const [imgError, setImgError] = useState(false);
  const addedByUser = useUser(item.addedBy);

  return (
    <Link href={`/items/${item.id}`}>
      <div
        className={`bg-white rounded-3xl shadow-sm border overflow-hidden transition-all active:scale-[0.98] ${
          isNew ? 'border-pink-300 ring-2 ring-pink-100' : 'border-gray-100'
        }`}
      >
        {/* Thumbnail */}
        {item.thumbnailUrl && !imgError ? (
          <div className="relative w-full aspect-video bg-gray-100">
            <Image
              src={item.thumbnailUrl}
              alt={item.title || 'thumbnail'}
              fill
              className="object-cover"
              onError={() => setImgError(true)}
              unoptimized
            />
          </div>
        ) : (
          <div className="w-full aspect-video bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
            <span className="text-4xl opacity-30">📎</span>
          </div>
        )}

        <div className="p-4">
          {/* Badges row */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <SourceBadge type={item.sourceType} />
            {item.status && <StatusBadge status={item.status} />}
            {showList && listTitle && (
              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{listTitle}</span>
            )}
          </div>

          {/* Title */}
          <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-1">
            {item.title || item.url}
          </p>

          {/* Memo */}
          {item.memo && (
            <p className="text-xs text-gray-500 line-clamp-1 mb-2">{item.memo}</p>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {item.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.name}
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: tag.color + '20', color: tag.color }}
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
            <span>{addedByUser?.displayName || '...'}</span>
            <span>{formatDate(item.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatDate(d: Date): string {
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'たった今';
  if (min < 60) return `${min}分前`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}時間前`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}日前`;
  return d.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
}
