#!/usr/bin/env python3
"""
Merge LP-C Arabic translation patches into book chapter JSON files.

Usage:
  python3 merge-lpc-ar-patches.py --from=/tmp/lpc-out-1.json [--from=/tmp/lpc-out-2.json ...]
  python3 merge-lpc-ar-patches.py --scan  # auto-scan /tmp/lpc-out-*.json

Patch format (output from agents):
  [
    {"slug": "book-slug", "file": "001.json", "title_ar": "...", "content_ar": "..."},
    ...
  ]
"""

import json, os, sys, glob

BASE = os.path.join(os.path.dirname(__file__), '../../web/data/books')

def fix_unescaped_quotes(raw):
    """Fix unescaped double quotes inside JSON string values."""
    result = []
    i = 0
    in_string = False
    escaped = False
    while i < len(raw):
        ch = raw[i]
        if escaped:
            result.append(ch)
            escaped = False
            i += 1
            continue
        if ch == '\\':
            result.append(ch)
            escaped = True
            i += 1
            continue
        if ch == '"':
            if not in_string:
                in_string = True
                result.append(ch)
            else:
                j = i + 1
                while j < len(raw) and raw[j] in ' \t\n\r':
                    j += 1
                if j < len(raw) and raw[j] in ',}]:\n':
                    in_string = False
                    result.append(ch)
                else:
                    result.append('\\"')
        else:
            result.append(ch)
        i += 1
    return ''.join(result)

def load_patch_file(path):
    with open(path) as f:
        raw = f.read()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Try fixing unescaped quotes (common in Arabic content)
        try:
            fixed = fix_unescaped_quotes(raw)
            return json.loads(fixed)
        except:
            pass
        # Try fixing invalid escape sequences
        import re
        fixed = re.sub(r'\\(?!["\\/bfnrtu])', r'\\\\', raw)
        try:
            return json.loads(fixed)
        except:
            # Try truncating at last complete object
            last = raw.rfind('\n  }')
            if last > 0:
                truncated = raw[:last+4]
                if truncated.rstrip().endswith(','):
                    truncated = truncated.rstrip()[:-1]
                truncated += '\n]'
                try:
                    data = json.loads(truncated)
                    print(f'  Warning: truncated {path} to {len(data)} entries')
                    return data
                except:
                    pass
            print(f'  ERROR: could not parse {path}')
            return []

def apply_patches(patches):
    updated = 0
    skipped = 0
    for p in patches:
        slug = p.get('slug')
        fname = p.get('file')
        title_ar = p.get('title_ar', '').strip()
        content_ar = p.get('content_ar', '').strip()

        if not slug or not fname or not content_ar:
            skipped += 1
            continue

        fpath = os.path.join(BASE, slug, fname)
        if not os.path.exists(fpath):
            print(f'  MISSING: {slug}/{fname}')
            skipped += 1
            continue

        with open(fpath) as f:
            chapter = json.load(f)

        # Update fields
        if title_ar:
            chapter['title_ar'] = title_ar
        chapter['content_ar'] = content_ar

        with open(fpath, 'w') as f:
            json.dump(chapter, f, ensure_ascii=False, indent=2)

        updated += 1

    return updated, skipped

def main():
    patch_files = []

    if '--scan' in sys.argv:
        patch_files = sorted(glob.glob('/tmp/lpc-out-*.json'))
    else:
        for arg in sys.argv[1:]:
            if arg.startswith('--from='):
                patch_files.append(arg[7:])

    if not patch_files:
        print('Usage: merge-lpc-ar-patches.py --from=/tmp/lpc-out-1.json [...]')
        print('       merge-lpc-ar-patches.py --scan')
        sys.exit(1)

    total_updated = 0
    total_skipped = 0

    for path in patch_files:
        if not os.path.exists(path):
            print(f'File not found: {path}')
            continue
        patches = load_patch_file(path)
        if not patches:
            continue
        updated, skipped = apply_patches(patches)
        print(f'{os.path.basename(path)}: {updated} updated, {skipped} skipped')
        total_updated += updated
        total_skipped += skipped

    print(f'\nTotal: {total_updated} chapters updated, {total_skipped} skipped')

if __name__ == '__main__':
    main()
