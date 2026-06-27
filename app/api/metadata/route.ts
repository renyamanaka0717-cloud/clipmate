import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 8;

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'No URL' }, { status: 400 });

  try { new URL(url); } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) return NextResponse.json({ title: '', image: '' });

    const html = await res.text();

    const title =
      extract(html, /property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
      extract(html, /content=["']([^"']+)["']\s+property=["']og:title["']/i) ||
      extract(html, /name=["']twitter:title["']\s+content=["']([^"']+)["']/i) ||
      extract(html, /content=["']([^"']+)["']\s+name=["']twitter:title["']/i) ||
      extract(html, /<title[^>]*>([^<]+)<\/title>/i) ||
      '';

    const image =
      extract(html, /property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
      extract(html, /content=["']([^"']+)["']\s+property=["']og:image["']/i) ||
      extract(html, /name=["']twitter:image["']\s+content=["']([^"']+)["']/i) ||
      extract(html, /content=["']([^"']+)["']\s+name=["']twitter:image["']/i) ||
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
  return html.match(re)?.[1]?.replace(/&amp;/g, '&').replace(/&quot;/g, '"') || '';
}
