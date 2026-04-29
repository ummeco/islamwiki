# Release islamwiki v0.1.0 — 2026-04-27

## Version (locked)
0.1.0

> Note: web/package.json is on 0.1.1 (P1 hotfix). v0.1.0 is the P3 release tag for the
> full P2 content + foundation build. The 0.1.1 web artifact is what ships.

## Features included

### P2 Phase 2 closeout
- CI quality gates, admin guard, legal pages, UI baseline (commit e1af920d)
- v0.1.1 Phase 1 Foundation Hardening closeout (commit 48bde034)
- Security: jwtDecode → jwtVerify in edge middleware (commit b59c4eb6)
- CORS header fix on remote schema (commit 8cda8f60)

### Content — Books
- 3 new books added + ar-risalah expanded to 26 chapters (commit 98932e0e)
- nuzhat-al-nazar chapters 019–020 added (commit 5803459a)
- zad-al-maad expanded to 29 chapters 018–028 (commit 6fb84802)
- sharh-al-mumti expanded to 21 chapters 014–020 (commit 123112b1)
- manhaj-al-salikeen expanded to 26 chapters 016–025 (commit 6fb84802)
- LP-C3 quality pass: 700+ chapters enriched across multiple batches (commits 7e18451e–47a87599)
- 2,111 AR-origin chapters tagged with content_ar_source: original (commit a93ea7d2)
- 8 EN-origin chapters expanded to ≥300 chars content_ar (commit 8657f252)

### Content — People (Scholars)
- 145 tabi'un scholars added across 5 batches (IDs 856–947, commits 08e4366c–7c6933f9)
- 27 tabi'un + tabi' tabi'un scholars (IDs 806–855, commit 08e4366c)
- 12 tabi'un scholars alongside book additions (commit 8661af83)
- Duplicate scholar ID fix: resolved 24 duplicate IDs 884–898 / 899–911 (commit 21782761)
- Total scholars: ~1,143+

### Hadith
- D3 isnad parser improvements + bulugh-maram re-parse (commits df467cd3, a93ea7d2)
- D1+D2: muttafaq badge, duplicates/variants UI, wiki page (commit a93ea7d2)
- isnad parser brace-cut + min name length fixes (commit af8605e4)

### Articles
- Quran/hadith/scholar cross-references added (FEAT-1, commit c584a9e2)

### SEO
- hreflang alternates on 8 index pages (commit af8605e4)

### Auth
- Password reset callback fixed for Hasura Auth redirect format (commit d411efec)

### Backend corpus migration
- islamwiki corpus schema: migration 0042_sprint9_islamwiki_corpus (ummat backend)

## Migrations
islamwiki data is in the ummat shared backend. No standalone migrations.
Requires ummat backend migration 0042 to be applied (included in ummat v0.1.0 release).

## Deploy sequence
1. Verify ummat backend v0.1.0 is deployed (migration 0042 must be live)
2. Deploy web: `vercel deploy --prod` from `islamwiki/web/` → ummat-islamwiki project
3. Smoke: load `https://islam.wiki`, verify book pages, scholar pages, hadith pages render
4. Check hreflang tags in page source
5. Announce

## Rollback plan
- **Web:** `vercel rollback` on ummat-islamwiki
- **Git:** `git revert <range>` on hotfix branch
- Content rollback: revert problematic data commits + redeploy (static content, no live DB writes)

## User communication
- **Channel:** islam.wiki site changelog
- **Message:** 1,143+ scholars documented, hundreds of book chapters expanded, and cross-referencing between scholars, hadith, and Quran now live.

## Tag command
```
git -C /Volumes/X9/Sites/ummeco/islamwiki tag v0.1.0 && git -C /Volumes/X9/Sites/ummeco/islamwiki push origin v0.1.0
```

## gh release create command
```
gh release create v0.1.0 \
  --repo ummeco/islamwiki \
  --title "islamwiki v0.1.0" \
  --notes-file /Volumes/X9/Sites/ummeco/islamwiki/.github/wiki/releases/release-islamwiki-v0.1.0-2026-04-27.md
```
