import { NextRequest, NextResponse } from 'next/server';

// Vercel Hobby: 10s timeout per serverless function
// We fetch with 4s to stay safe
export const maxDuration = 8;

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'No URL' }, { status: 400 });

  // Basic URL validation
  try { new URL(url); } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ClipMateBot/1.0; +https://clipmate.app)',
        Accept: 'text/html',
      },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) return NextResponse.json({ title: '', image: '' });

    const html = await res.text();

    const title =
      extract(html, /property="og:title"\s+content="([^"]+)"/i) ||
      extract(html, /content="([^"]+)"\s+property="og:title"/i) ||
      extract(html, /<title[^>]*>([^<]+)<\/title>/i) ||
      '';

    const image =
      extract(html, /property="og:image"\s+content="([^"]+)"/i) ||
      extract(html, /content="([^"]+)"\s+property="og:image"/i) ||
      '';

    return NextResponse.json({
      title: title.trim().slice(0, 200),
      image: image.trim(),
    });
  } catch {
    return NextResponse.json({ title: '', image: '' });
  }
}

function extract(html: string, re: RegExp): string {
  return html.match(re)?.[1] || '';
}
