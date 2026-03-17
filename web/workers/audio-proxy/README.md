# Islam.wiki Audio Proxy Worker

Cloudflare Worker that lazy-fills Quran audio from everyayah.com to R2.

## Deploy

```bash
cd web/workers/audio-proxy
pnpm install
pnpm deploy  # production: islamwiki-audio.{account}.workers.dev + audio.islam.wiki custom domain
```

## Setup required

1. Create R2 bucket `islamwiki-audio` in Cloudflare dashboard
2. Set custom domain `audio.islam.wiki` → Worker in CF dashboard
3. Set `NEXT_PUBLIC_AUDIO_BASE_URL=https://audio.islam.wiki` in Vercel env vars

## How it works

- Request: `GET /audio/Alafasy_128kbps/001001.mp3`
- Check R2 for cached file
- If miss: fetch from `https://everyayah.com/data/Alafasy_128kbps/001001.mp3`, store in R2, serve
- If hit: serve from R2 with `Cache-Control: max-age=31536000, immutable`
- After first play, all subsequent listens are free (no everyayah.com bandwidth)
