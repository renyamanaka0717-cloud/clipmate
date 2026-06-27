import { Link2 } from 'lucide-react';
import {
  SiInstagram,
  SiTiktok,
  SiThreads,
  SiYoutube,
  SiPinterest,
  SiX,
} from 'react-icons/si';
import { SourceType } from '@/types';
import { SOURCE_LABELS } from '@/lib/urlParser';

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

interface Props {
  type: SourceType;
  size?: 'sm' | 'md';
}

export default function SourceBadge({ type, size = 'sm' }: Props) {
  const { Icon, bg } = SNS[type] ?? SNS.other;
  const iconSize = size === 'sm' ? 10 : 12;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium text-white ${padding}`}
      style={{ backgroundColor: bg }}
    >
      <Icon size={iconSize} color="#fff" />
      {SOURCE_LABELS[type]}
    </span>
  );
}
