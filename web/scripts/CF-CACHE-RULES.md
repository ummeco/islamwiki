# Cloudflare Cache Rules for islam.wiki

Configure in Cloudflare Dashboard > islam.wiki zone > Caching > Cache Rules.

## Rule 1: Static Content Pages (Browser TTL: 1 day, Edge TTL: 7 days)

**When:** URI Path matches `/hadith/*` OR `/seerah/*` OR `/people/*` OR `/books/*` OR `/history/*` OR `/articles/*` OR `/videos/*` OR `/audio/*` OR `/sects/*` OR `/wiki/*`

**Then:**
- Cache eligibility: Eligible for cache
- Edge TTL: 7 days
- Browser TTL: 1 day

## Rule 2: Quran Pages (Browser TTL: 7 days, Edge TTL: 30 days)

**When:** URI Path matches `/quran/*`

**Then:**
- Cache eligibility: Eligible for cache
- Edge TTL: 30 days
- Browser TTL: 7 days

Quran text is immutable, so longer TTLs are safe.

## Rule 3: API Routes (No Cache)

**When:** URI Path starts with `/api/`

**Then:**
- Cache eligibility: Bypass cache

API routes handle their own rate limiting and must not be cached.

## Rule 4: Static Assets (Browser TTL: 30 days)

**When:** URI Path matches `/fonts/*` OR `/_next/static/*`

**Then:**
- Cache eligibility: Eligible for cache
- Edge TTL: 365 days
- Browser TTL: 30 days

Next.js static assets have content hashes in filenames, so aggressive caching is safe.

## Notes

- Vercel already sets `s-maxage` on SSG pages, but Cloudflare rules override for consistency.
- On-demand revalidation (ISR) automatically purges Vercel's CDN. Cloudflare will serve stale
  until Edge TTL expires. For instant updates, use Cloudflare API to purge specific URLs.
- Home page (`/`) is not cached aggressively as it may have dynamic search results.
