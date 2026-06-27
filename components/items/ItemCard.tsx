'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Item, SourceType } from '@/types';

interface Props {
  item: Item;
  isNew?: boolean;
  showList?: boolean;
  listTitle?: string;
}

const SNS: Record<SourceType, { bg: string; symbol: string; gradient?: boolean }> = {
  instagram: { bg: '',       symbol: '◻', gradient: true },
  tiktok:    { bg: '#000',   symbol: '♪' },
  youtube:   { bg: '#dc2626',symbol: '▶' },
  threads:   { bg: '#1c1c1e',symbol: '@' },
  pinterest: { bg: '#b91c1c',symbol: 'P' },
  x:         { bg: '#18181b',symbol: 'X' },
  other:     { bg: '#9ca3af',symbol: '↗' },
};

function SnsOverlay({ type }: { type: SourceType }) {
  const cfg = SNS[type] ?? SNS.other;
  const style = cfg.gradient
    ? {}
    : { backgroundColor: cfg.bg };
  return (
    <div
      className={`w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-md ${
        cfg.gradient ? 'bg-gradient-to-br from-pink-500 to-purple-600' : ''
      }`}
      style={style}
    >
      <span className="text-white font-bold leading-none" style={{ fontSize: 8 }}>
        {cfg.symbol}
      </span>
    </div>
  );
}

export default function ItemCard({ item, isNew, showList, listTitle }: Props) {
  const [imgError, setImgError] = useState(false);
  const hasThumbnail = Boolean(item.thumbnailUrl) && !imgError;

  return (
    <Link href={`/items/${item.id}`}>
      <div
        className={`bg-white rounded-[18px] shadow-sm border flex gap-3 p-3 transition-all active:scale-[0.98] ${
          isNew ? 'border-pink-200 ring-2 ring-pink-100' : 'border-gray-100'
        }`}
      >
        {/* Thumbnail — stretches to card height, min 80px */}
        <div className="relative flex-shrink-0 w-[80px] self-stretch min-h-[80px] rounded-xl overflow-hidden bg-gray-100">
          {hasThumbnail ? (
            <Image
              src={item.thumbnailUrl!}
              alt={item.title || 'thumbnail'}
              fill
              className="object-cover"
              onError={() => setImgError(true)}
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl opacity-15">📎</span>
            </div>
          )}
          {/* SNS icon — top-left overlay */}
          <div className="absolute top-1 left-1">
            <SnsOverlay type={item.sourceType} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-1 py-0.5">
          {/* Title + Date */}
          <div className="flex items-start gap-2">
            <p className="flex-1 text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2">
              {item.title || item.url}
            </p>
            <span className="text-[10px] text-gray-400 flex-shrink-0 mt-px whitespace-nowrap">
              {formatDate(item.createdAt)}
            </span>
          </div>

          {/* Location */}
          {item.locationName && (
            <p className="text-[11px] text-gray-500 line-clamp-1">
              📍 {item.locationName}
            </p>
          )}

          {/* Memo */}
          {item.memo && (
            <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
              💬 {item.memo}
            </p>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-auto pt-0.5">
              {item.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag.name}
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: tag.color + '22', color: tag.color }}
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* List name (optional) */}
          {showList && listTitle && (
            <p className="text-[10px] text-gray-400 mt-auto">📋 {listTitle}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

function formatDate(d: Date): string {
  const now = new Date();
  const days = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (days === 0) return '今日';
  if (days === 1) return '昨日';
  if (days < 7) return `${days}日前`;
  return d.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
}
