import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 8;

function isBlockedUrl(rawUrl: string): boolean {
  let u: URL;
  try { u = new URL(rawUrl); } catch { return true; }

  if (!['http:', 'https:'].includes(u.protocol)) return true;

  const host = u.hostname.toLowerCase();
  if (host === 'localhost') return true;

  // Unwrap IPv6 brackets for analysis
  const h = host.startsWith('[') ? host.slice(1, -1) : host;

  // IPv4 private / loopback / reserved ranges
  const ipv4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = [+ipv4[1], +ipv4[2]];
    if (a === 0) return true;                           // 0.x.x.x
    if (a === 10) return true;                          // private
    if (a === 127) return true;                         // loopback
    if (a === 169 && b === 254) return true;            // link-local / AWS metadata
    if (a === 172 && b >= 16 && b <= 31) return true;  // private
    if (a === 192 && b === 168) return true;            // private
    if (a === 100 && b >= 64 && b <= 127) return true; // shared address space
    if (a >= 224) return true;                          // multicast & reserved
  }

  // IPv6 loopback and private ranges
  if (h === '::1' || h === '0:0:0:0:0:0:0:1') return true;
  if (h.startsWith('fc') || h.startsWith('fd')) return true; // ULA
  if (h.startsWith('fe80')) return true;                     // link-local

  return false;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'No URL' }, { status: 400 });

  try { new URL(url); } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  if (isBlockedUrl(url)) {
    return NextResponse.json({ error: 'Blocked URL' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(4000),
      redirect: 'follow',
    });

    const resolvedUrl = res.url !== url ? res.url : null;

    if (!res.ok) return NextResponse.json({ resolvedUrl });

    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('text/html') && !ct.includes('application/xhtml')) {
      return NextResponse.json({ resolvedUrl });
    }

    const html = await res.text();
    const base = res.url;

    const title =
      ex(html, /property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
      ex(html, /content=["']([^"']+)["']\s+property=["']og:title["']/i) ||
      ex(html, /name=["']twitter:title["']\s+content=["']([^"']+)["']/i) ||
      ex(html, /content=["']([^"']+)["']\s+name=["']twitter:title["']/i) ||
      ex(html, /<title[^>]*>([^<]+)<\/title>/i) ||
      '';

    const description =
      ex(html, /property=["']og:description["']\s+content=["']([^"']+)["']/i) ||
      ex(html, /content=["']([^"']+)["']\s+property=["']og:description["']/i) ||
      ex(html, /name=["']twitter:description["']\s+content=["']([^"']+)["']/i) ||
      ex(html, /content=["']([^"']+)["']\s+name=["']twitter:description["']/i) ||
      ex(html, /name=["']description["']\s+content=["']([^"']+)["']/i) ||
      ex(html, /content=["']([^"']+)["']\s+name=["']description["']/i) ||
      '';

    const rawImage =
      ex(html, /property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
      ex(html, /content=["']([^"']+)["']\s+property=["']og:image["']/i) ||
      ex(html, /name=["']twitter:image["']\s+content=["']([^"']+)["']/i) ||
      ex(html, /content=["']([^"']+)["']\s+name=["']twitter:image["']/i) ||
      '';

    const siteName =
      ex(html, /property=["']og:site_name["']\s+content=["']([^"']+)["']/i) ||
      ex(html, /content=["']([^"']+)["']\s+property=["']og:site_name["']/i) ||
      '';

    const canonical =
      ex(html, /rel=["']canonical["'][^>]*href=["']([^"'<]+)["']/i) ||
      ex(html, /href=["']([^"'<]+)["'][^>]*rel=["']canonical["']/i) ||
      null;

    // Resolve relative image URL and enforce http/https
    let image = rawImage.trim();
    if (image && !/^https?:\/\//.test(image)) {
      try { image = new URL(image, base).href; } catch { image = ''; }
    }
    if (image && !/^https?:\/\//.test(image)) image = '';

    return NextResponse.json({
      title: title.trim().slice(0, 200),
      description: description.trim().slice(0, 500),
      image,
      siteName: siteName.trim().slice(0, 100),
      canonical,
      resolvedUrl,
    });
  } catch {
    return NextResponse.json({ title: '', description: '', image: '', siteName: '', canonical: null, resolvedUrl: null });
  }
}

function ex(html: string, re: RegExp): string {
  return (html.match(re)?.[1] || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x2F;/g, '/')
    .replace(/\s+/g, ' ')
    .trim();
}
