'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Link2 } from 'lucide-react';
import {
  SiInstagram,
  SiTiktok,
  SiThreads,
  SiYoutube,
  SiPinterest,
  SiX,
} from 'react-icons/si';
import { Item, SourceType } from '@/types';

interface Props {
  item: Item;
  isNew?: boolean;
  showList?: boolean;
  listTitle?: string;
}

type SnsConfig = {
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  bg: string;
};

const SNS: Record<SourceType, SnsConfig> = {
  instagram: { Icon: SiInstagram, bg: '#C13584' },
  tiktok:    { Icon: SiTiktok,    bg: '#010101' },
  threads:   { Icon: SiThreads,   bg: '#101010' },
  youtube:   { Icon: SiYoutube,   bg: '#FF0000' },
  pinterest: { Icon: SiPinterest, bg: '#E60023' },
  x:         { Icon: SiX,         bg: '#101010' },
  other:     { Icon: Link2,       bg: '#9CA3AF' },
};

function SnsOverlay({ type }: { type: SourceType }) {
  const { Icon, bg } = SNS[type] ?? SNS.other;
  return (
    <div
      className="w-[20px] h-[20px] rounded-full flex items-center justify-center shadow-md"
      style={{ backgroundColor: bg }}
    >
      <Icon size={11} color="#fff" />
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
        {/* Thumbnail */}
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
          <div className="absolute top-1 left-1">
            <SnsOverlay type={item.sourceType} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-1 py-0.5">
          <div className="flex items-start gap-2">
            <p className="flex-1 text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2">
              {item.title || item.url}
            </p>
            <span className="text-[10px] text-gray-400 flex-shrink-0 mt-px whitespace-nowrap">
              {formatDate(item.createdAt)}
            </span>
          </div>

          {item.locationName && (
            <p className="text-[11px] text-gray-500 line-clamp-1">
              📍 {item.locationName}
            </p>
          )}

          {item.memo && (
            <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
              💬 {item.memo}
            </p>
          )}

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
