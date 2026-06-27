import { SourceType } from '@/types';

export function detectSourceType(url: string): SourceType {
  try {
    const u = new URL(url);
    const host = u.hostname.replace('www.', '');
    if (host.includes('instagram.com')) return 'instagram';
    if (host.includes('tiktok.com')) return 'tiktok';
    if (host.includes('threads.net') || host.includes('threads.com')) return 'threads';
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

function getYouTubeVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0];
  } catch { /* ignore */ }
  return null;
}

function getDirectThumbnailUrl(url: string, sourceType: SourceType): string | null {
  if (sourceType === 'youtube') {
    const id = getYouTubeVideoId(url);
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
  return null;
}

export type UrlMetadata = {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  siteName?: string;
  resolvedUrl?: string;
  sourceType: SourceType;
};

export async function fetchUrlMetadata(url: string): Promise<UrlMetadata> {
  const sourceType = detectSourceType(url);
  const directThumb = getDirectThumbnailUrl(url, sourceType);

  try {
    const res = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`);
    if (res.ok) {
      const data = await res.json();
      return {
        title: data.title || undefined,
        description: data.description || undefined,
        thumbnailUrl: directThumb || data.image || undefined,
        siteName: data.siteName || undefined,
        resolvedUrl: data.resolvedUrl || undefined,
        sourceType,
      };
    }
  } catch { /* ignore */ }

  return { thumbnailUrl: directThumb || undefined, sourceType };
}
