#!/usr/bin/env python3
"""
Fix broken JSON translation files caused by unescaped double quotes
and invalid escape sequences in content_id / title_id fields.
"""
import json
import re
import glob
import os
import sys

def fix_invalid_escapes(text):
    """Replace invalid JSON escape sequences like \\' with '"""
    # Replace \\' (backslash-apostrophe) — not valid JSON
    result = re.sub(r"\\\'", "'", text)
    # Replace other common invalid escapes from AI output
    result = re.sub(r"\\(?![\"\\\/bfnrtu])", r"", result)
    return result

def extract_and_fix_string_value(raw_content, field_name):
    """
    Extract the raw value of a JSON string field, handling unescaped quotes.
    Returns (fixed_content, was_modified) or (original, False) if field not found.
    """
    # Find the field
    marker = f'"{field_name}": "'
    start_idx = raw_content.find(marker)
    if start_idx == -1:
        return raw_content, False

    value_start = start_idx + len(marker)

    # Scan the string value carefully
    i = value_start
    chars = []
    modified = False

    while i < len(raw_content):
        c = raw_content[i]

        if c == '\\':
            # Escape sequence
            if i + 1 < len(raw_content):
                next_c = raw_content[i + 1]
                if next_c in '"\\nrtbf/':
                    chars.append(c)
                    chars.append(next_c)
                    i += 2
                    continue
                elif next_c == 'u' and i + 5 < len(raw_content):
                    # Unicode escape \uXXXX
                    hex_part = raw_content[i+2:i+6]
                    if all(hc in '0123456789abcdefABCDEF' for hc in hex_part):
                        chars.extend([c, next_c] + list(hex_part))
                        i += 6
                        continue
                    else:
                        # Invalid unicode escape - keep backslash, continue
                        chars.append(c)
                        i += 1
                        continue
                else:
                    # Invalid escape (like \') - remove backslash
                    chars.append(next_c)
                    i += 2
                    modified = True
                    continue
            else:
                chars.append(c)
                i += 1
                continue

        elif c == '"':
            # Could this be the closing quote of the string?
            rest = raw_content[i + 1:]
            # The closing quote is followed by optional whitespace + (,\n or \n})
            # Check what comes after this quote
            rest_stripped = rest.lstrip(' \t')
            if rest_stripped and rest_stripped[0] in ',}':
                # This is the closing quote — end of string
                chars.append(c)
                break
            elif rest_stripped and rest_stripped[0] == '\n':
                # Newline after — likely closing quote
                chars.append(c)
                break
            elif not rest_stripped:
                # End of file
                chars.append(c)
                break
            else:
                # Unescaped quote inside the string — escape it
                chars.append('\\')
                chars.append('"')
                i += 1
                modified = True
                continue

        chars.append(c)
        i += 1

    if not modified:
        return raw_content, False

    fixed_value = ''.join(chars)
    # Reconstruct: everything before value_start + fixed_value + rest of file from i+1
    new_content = raw_content[:value_start] + fixed_value + raw_content[i + 1:]
    return new_content, True


def fix_json_file(filepath):
    """Attempt to fix a broken JSON chapter file. Returns status string."""
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()

    # First: try to parse as-is
    try:
        json.loads(original)
        return 'ok'
    except json.JSONDecodeError:
        pass

    # Fix 1: invalid escape sequences
    content = fix_invalid_escapes(original)
    try:
        json.loads(content)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return 'fixed_escape'
    except json.JSONDecodeError:
        pass

    # Fix 2: unescaped quotes in string fields
    any_modified = False
    for field in ['content_id', 'title_id', 'content_en', 'title_en']:
        content, modified = extract_and_fix_string_value(content, field)
        if modified:
            any_modified = True
        try:
            json.loads(content)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return f'fixed_unescaped_quotes (fields modified)'
        except json.JSONDecodeError:
            pass

    # Fix 3: completely malformed — try loading with json5-style leniency
    # For "Expecting property name" errors (like enjoy-your-life/059.json)
    # The file might be a JSON fragment or have trailing content
    try:
        # Try to extract valid JSON object
        # Find first { and last }
        first_brace = content.find('{')
        last_brace = content.rfind('}')
        if first_brace != -1 and last_brace != -1:
            candidate = content[first_brace:last_brace + 1]
            parsed = json.loads(candidate)
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(parsed, f, ensure_ascii=False, indent=2)
            return 'fixed_extracted'
    except (json.JSONDecodeError, ValueError):
        pass

    return 'FAILED'


def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    books_dir = os.path.join(base_dir, 'web', 'data', 'books')

    all_files = glob.glob(os.path.join(books_dir, '*', '*.json'))
    broken = []
    for f in all_files:
        if '/source/' in f or '\\source\\' in f:
            continue
        try:
            json.load(open(f, encoding='utf-8'))
        except json.JSONDecodeError:
            broken.append(f)

    print(f'Found {len(broken)} broken JSON files')

    stats = {'ok': 0, 'fixed_escape': 0, 'fixed_unescaped_quotes (fields modified)': 0,
             'fixed_extracted': 0, 'FAILED': 0}

    failed_files = []
    for filepath in sorted(broken):
        result = fix_json_file(filepath)
        rel = os.path.relpath(filepath, base_dir)
        if result == 'FAILED':
            print(f'  ❌ FAILED: {rel}')
            failed_files.append(filepath)
        else:
            print(f'  ✅ {result}: {rel}')
        key = result if result in stats else result.split(' ')[0]
        stats[result] = stats.get(result, 0) + 1

    print(f'\nSummary: {dict(stats)}')
    if failed_files:
        print('\nFailed files — need manual fix:')
        for f in failed_files:
            print(f'  {f}')

    # Final verification
    remaining_broken = 0
    for f in all_files:
        if '/source/' in f:
            continue
        try:
            json.load(open(f, encoding='utf-8'))
        except json.JSONDecodeError:
            remaining_broken += 1

    print(f'\nRemaining broken after fix: {remaining_broken}')


if __name__ == '__main__':
    main()
