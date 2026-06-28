'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Paperclip, Layers } from 'lucide-react';
import { Link2 } from 'lucide-react';
import {
  SiInstagram,
  SiTiktok,
  SiThreads,
  SiYoutube,
  SiPinterest,
  SiX,
} from 'react-icons/si';
import SourceBadge from '@/components/ui/SourceBadge';
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

export default function ItemCard({ item, isNew, showList, listTitle }: Props) {
  const [imgError, setImgError] = useState(false);
  const hasThumbnail = Boolean(item.thumbnailUrl) && !imgError;
  const { Icon, bg } = SNS[item.sourceType] ?? SNS.other;

  return (
    <Link href={`/items/${item.id}`}>
      <div
        className={`bg-white rounded-[20px] shadow-sm border overflow-hidden transition-all active:scale-[0.98] ${
          isNew ? 'border-pink-200 ring-2 ring-pink-100' : 'border-gray-100'
        }`}
      >
        {/* Thumbnail */}
        <div className="relative w-full aspect-video">
          {hasThumbnail ? (
            <>
              <Image
                src={item.thumbnailUrl!}
                alt={item.title || 'thumbnail'}
                fill
                className="object-cover"
                onError={() => setImgError(true)}
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </>
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: bg + '15' }}
            >
              {item.sourceType === 'other' ? (
                <Paperclip size={40} strokeWidth={1.5} style={{ color: bg }} />
              ) : (
                <Icon size={44} color={bg} />
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-3.5 pt-3 pb-3.5 space-y-1.5">
          {/* Title */}
          <p className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2">
            {item.title || item.url}
          </p>

          {/* Description */}
          {item.description && (
            <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Memo */}
          {item.memo && (
            <p className="text-[11px] text-gray-400 line-clamp-1 italic">
              {item.memo}
            </p>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {item.tags.slice(0, 3).map((tag) => (
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

          {/* Footer: source badge + list name + date */}
          <div className="flex items-center gap-2 pt-1">
            <SourceBadge type={item.sourceType} size="sm" />
            {showList && listTitle && (
              <span className="flex items-center gap-1 text-[10px] text-gray-400">
                <Layers size={9} strokeWidth={2} className="flex-shrink-0" />
                {listTitle}
              </span>
            )}
            <span className="ml-auto text-[10px] text-gray-400 flex-shrink-0">
              {formatDate(item.createdAt)}
            </span>
          </div>
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
