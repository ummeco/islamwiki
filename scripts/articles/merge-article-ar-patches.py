#!/usr/bin/env python3
"""
Merge Arabic translation patches into articles.json.

Agent output format: {"slug1": {"title_ar": "...", "content_ar": "..."}, "slug2": {...}}

Usage:
  python3 merge-article-ar-patches.py --from=/tmp/articles-ar-out-1.json
  python3 merge-article-ar-patches.py --scan  # auto-scan /tmp/articles-ar-out-*.json
"""

import json, os, sys, glob, re

ARTICLES_FILE = os.path.join(os.path.dirname(__file__), '../../web/data/articles/articles.json')

def load_patch(path):
    with open(path) as f:
        raw = f.read()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        fixed = re.sub(r'\\(?!["\\/bfnrtu])', r'\\\\', raw)
        try:
            return json.loads(fixed)
        except:
            print(f'  ERROR: could not parse {path}')
            return {}

def main():
    patch_files = []
    if '--scan' in sys.argv:
        patch_files = sorted(glob.glob('/tmp/articles-ar-out-*.json'))
    else:
        for arg in sys.argv[1:]:
            if arg.startswith('--from='):
                patch_files.append(arg[7:])

    if not patch_files:
        print('Usage: merge-article-ar-patches.py --from=/tmp/articles-ar-out-1.json ...')
        print('       merge-article-ar-patches.py --scan')
        sys.exit(1)

    with open(ARTICLES_FILE) as f:
        articles = json.load(f)

    article_map = {a['slug']: a for a in articles}
    total_updated = 0

    for path in patch_files:
        if not os.path.exists(path):
            print(f'Not found: {path}')
            continue
        patches = load_patch(path)
        if not patches:
            continue
        updated = 0
        for slug, data in patches.items():
            if slug not in article_map:
                continue
            if data.get('title_ar'):
                article_map[slug]['title_ar'] = data['title_ar']
            if data.get('content_ar'):
                article_map[slug]['content_ar'] = data['content_ar']
            if data.get('excerpt_ar'):
                article_map[slug]['excerpt_ar'] = data['excerpt_ar']
            updated += 1
        print(f'{os.path.basename(path)}: {updated} articles updated')
        total_updated += updated

    with open(ARTICLES_FILE, 'w') as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)

    print(f'\nTotal: {total_updated} articles updated in articles.json')

if __name__ == '__main__':
    main()
