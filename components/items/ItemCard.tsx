'use client';

import Link from 'next/link';
import { Link2, MapPin, Layers } from 'lucide-react';
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

export default function ItemCard({ item, isNew, showList, listTitle }: Props) {
  const { Icon, bg } = SNS[item.sourceType] ?? SNS.other;

  return (
    <Link href={`/items/${item.id}`}>
      <div
        className="bg-white rounded-[18px] shadow-sm border flex gap-3 p-3 transition-all active:scale-[0.98]"
        style={isNew
          ? { borderColor: 'var(--color-primary-light)', boxShadow: '0 0 0 2px var(--color-primary-pale)' }
          : { borderColor: '#f3f4f6' }
        }
      >
        {/* SNS Icon */}
        <div
          className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center self-center"
          style={{ backgroundColor: bg + '18' }}
        >
          <Icon size={22} color={bg} />
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

          {(item.description || item.memo) && (
            <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
              {item.memo || item.description}
            </p>
          )}

          {item.locationName && (
            <p className="flex items-center gap-1 text-[11px] text-gray-500 line-clamp-1">
              <MapPin size={10} strokeWidth={2} className="flex-shrink-0" />
              {item.locationName}
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
            <p className="flex items-center gap-1 text-[10px] text-gray-400 mt-auto">
              <Layers size={9} strokeWidth={2} className="flex-shrink-0" />
              {listTitle}
            </p>
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
