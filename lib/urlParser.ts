import { SourceType } from '@/types';

export function detectSourceType(url: string): SourceType {
  try {
    const u = new URL(url);
    const host = u.hostname.replace('www.', '');
    if (host.includes('instagram.com')) return 'instagram';
    if (host.includes('tiktok.com')) return 'tiktok';
    if (host.includes('threads.net')) return 'threads';
    if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube';
    if (host.includes('pinterest.com') || host.includes('pin.it')) return 'pinterest';
    if (host.includes('twitter.com') || host.includes('x.com')) return 'x';
    return 'other';
  } catch {
    return 'other';
  }
}

export const SOURCE_LABELS: Record<SourceType, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  threads: 'Threads',
  youtube: 'YouTube',
  pinterest: 'Pinterest',
  x: 'X',
  other: 'その他',
};

export const SOURCE_COLORS: Record<SourceType, string> = {
  instagram: 'from-pink-500 to-purple-600',
  tiktok: 'bg-black',
  threads: 'bg-black',
  youtube: 'bg-red-600',
  pinterest: 'bg-red-600',
  x: 'bg-black',
  other: 'bg-gray-500',
};

export const SOURCE_BG: Record<SourceType, string> = {
  instagram: 'bg-gradient-to-r from-pink-500 to-purple-600',
  tiktok: 'bg-black',
  threads: 'bg-black',
  youtube: 'bg-red-600',
  pinterest: 'bg-red-700',
  x: 'bg-zinc-900',
  other: 'bg-gray-500',
};

export async function fetchUrlMetadata(url: string): Promise<{
  title?: string;
  thumbnailUrl?: string;
  sourceType: SourceType;
}> {
  const sourceType = detectSourceType(url);
  try {
    const res = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`);
    if (res.ok) {
      const data = await res.json();
      return { title: data.title, thumbnailUrl: data.image, sourceType };
    }
  } catch {
    // ignore
  }
  return { sourceType };
}
