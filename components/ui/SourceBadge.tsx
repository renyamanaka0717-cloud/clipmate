import { SourceType } from '@/types';
import { SOURCE_LABELS } from '@/lib/urlParser';

const SOURCE_EMOJI: Record<SourceType, string> = {
  instagram: '📸',
  tiktok: '🎵',
  threads: '🧵',
  youtube: '▶️',
  pinterest: '📌',
  x: '✖️',
  other: '🔗',
};

const SOURCE_CLASS: Record<SourceType, string> = {
  instagram: 'bg-gradient-to-r from-pink-500 to-purple-500 text-white',
  tiktok: 'bg-black text-white',
  threads: 'bg-black text-white',
  youtube: 'bg-red-600 text-white',
  pinterest: 'bg-red-700 text-white',
  x: 'bg-zinc-900 text-white',
  other: 'bg-gray-400 text-white',
};

interface Props {
  type: SourceType;
  size?: 'sm' | 'md';
}

export default function SourceBadge({ type, size = 'sm' }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${SOURCE_CLASS[type]} ${
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'
      }`}
    >
      <span>{SOURCE_EMOJI[type]}</span>
      <span>{SOURCE_LABELS[type]}</span>
    </span>
  );
}
