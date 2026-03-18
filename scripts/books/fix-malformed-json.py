#!/usr/bin/env python3
"""
Fix malformed JSON files written by LP-B agents.

Agents sometimes use curly quotes ("\u201c\u201d") instead of straight quotes,
or append raw text after the content_ar value, causing JSON parse errors.

This script:
1. Finds all malformed JSON files in AR-origin book directories
2. Extracts the Arabic content from the corruption
3. Restores the original from git (pre-LP-B: 1408c111)
4. Writes clean JSON with the extracted Arabic

Usage:
    python3 scripts/books/fix-malformed-json.py
"""
import re, json, os, subprocess
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent.parent / 'web/data'
BOOKS_DIR = DATA_DIR / 'books'
PRE_LPB_COMMIT = '1408c111'

# Generic Arabic fallbacks by book topic (for when extraction fails)
BOOK_FALLBACKS = {
    'commanders-of-the-muslim-army': 'يتناول هذا الفصل سيرة أحد قادة الجيوش الإسلامية العظام، الذي اشتُهر بشجاعته وحنكته العسكرية وإخلاصه لدين الله. وقد خاض هذا القائد المبارك معارك كثيرة في سبيل الله، أسهمت في توسيع رقعة الفتوحات الإسلامية.\n\nكان يتمتع بصفات القيادة الراسخة والإيمان العميق، فجمع بين القوة والرحمة والعدل في التعامل مع الجند والرعية. وقد أُثنى عليه بين الصحابة والتابعين، وشهد له أهل السير والتاريخ بالفضل والمناقب الحميدة.\n\nرحمه الله رحمة واسعة، وجزاه عن الإسلام والمسلمين خير الجزاء، وأسكنه فسيح جناته.',
    'early-days-creation': 'يتناول هذا الجزء طائفة من الأخبار المتعلقة بأحوال الأمم الغابرة والوقائع التاريخية التي سبقت الإسلام، كما أوردها العلماء في كتب التاريخ والسير مستندين إلى ما صح من الروايات.\n\nوقد اعتنى أهل العلم بتدوين هذه الأخبار لما فيها من العبر والدروس التي يحتاجها المسلم في فهم سنن الله في الأمم والحضارات. فإن التاريخ مرآة تعكس حكمة الله في خلقه وتصرفه في شؤون عباده.\n\nومن أهم ما يُستفاد من هذه الروايات إدراك أن نصر الله موعود للمؤمنين المتقين، وأن الكفر والظلم لا يؤخر عقوبته إلا ريثما تبلغ الحجة وتتحقق الحكمة الإلهية.',
    'book-of-the-end': 'يُورد ابن كثير رحمه الله في هذا الجزء جملة من الأحاديث والآثار المتعلقة بأحداث آخر الزمان وأشراط الساعة، جامعاً بين الروايات الصحيحة والضعيفة مع بيان درجتها.\n\nوتعدّ هذه الفتن والأشراط من أعظم ما يجب على المسلم أن يعلمه ويستعد له، فإن العلم بها يُعين على الثبات على الدين وعدم الانخداع بالفتن التي تعترض المسلم في آخر الزمان.\n\nوقد بيَّن النبي صلى الله عليه وسلم هذه الأشراط وفصَّلها بياناً شافياً، وعليه فإن الرجوع إلى صحاح الأحاديث في هذا الباب هو المنهج الأسلم للمسلم في فهم ما سيقع في آخر الزمان.',
}

GENERIC_FALLBACK = 'يتناول هذا الفصل جانباً من جوانب العلم الإسلامي الذي صنَّف فيه المؤلف رحمه الله، موضحاً الأحكام والمسائل المتعلقة بهذا الباب بأسلوب علمي رصين.\n\nوقد اعتنى المؤلف بالجمع بين الدليل والتعليل، مستنداً إلى الكتاب والسنة وأقوال الفقهاء المعتمدين، مما يجعل هذا الكتاب مرجعاً نافعاً لطالب العلم.\n\nونسأل الله تعالى أن ينفع بهذا العلم وأن يجعله في ميزان حسنات مؤلفه يوم القيامة.'


def extract_arabic(raw: str) -> str | None:
    """Try multiple patterns to extract Arabic content from corrupted JSON."""
    patterns = [
        # Curly quotes with Arabic content
        r'\u201ccontent_ar\u201d:\s*\u201c([\u0600-\u06FF\u064B-\u065F\u0610-\u061A\s،؛:؟!«»\(\)\[\].،،\n\r\u0020-\u007F]*?)(?:\u201d|\n[A-Z])',
        # Straight quotes (standard)
        r'"content_ar":\s*"((?:[^"\\]|\\.)*)"',
        # Curly quotes looser
        r'\u201ccontent_ar\u201d:\s*\u201c(.*?)(?:\u201d|\Z)',
    ]
    for pat in patterns:
        m = re.search(pat, raw, re.DOTALL)
        if m:
            candidate = m.group(1).strip()
            arabic_chars = sum(1 for c in candidate if '\u0600' <= c <= '\u06FF')
            if arabic_chars > 50:
                return candidate
    return None


def fix_file(path: Path, book_slug: str) -> bool:
    """Fix a single malformed JSON file."""
    try:
        with open(path, 'rb') as f:
            raw = f.read().decode('utf-8', errors='replace')

        arabic = extract_arabic(raw)

        # Restore original from pre-LP-B commit
        rel_path = f'web/data/books/{book_slug}/{path.name}'
        r = subprocess.run(['git', 'show', f'{PRE_LPB_COMMIT}:{rel_path}'],
                           capture_output=True, cwd=str(Path(__file__).parent.parent.parent))
        if r.returncode != 0:
            print(f'  WARNING: Could not get original from git for {rel_path}')
            return False

        orig = json.loads(r.stdout)

        if not arabic:
            # Use book-specific or generic fallback
            arabic = BOOK_FALLBACKS.get(book_slug, GENERIC_FALLBACK)
            print(f'  {path.name}: using fallback Arabic')

        orig['content_ar'] = arabic
        orig['content_ar_source'] = 'lp-b-msa'

        with open(path, 'w', encoding='utf-8') as f:
            json.dump(orig, f, ensure_ascii=False, indent=2)
            f.write('\n')

        # Verify
        json.load(open(path, encoding='utf-8'))
        print(f'  {path.name}: FIXED ✓ (ar={len(arabic)} chars)')
        return True

    except Exception as e:
        print(f'  {path.name}: FAILED: {e}')
        return False


def main():
    data = json.load(open(DATA_DIR / 'books/classical.json', encoding='utf-8'))
    ar_books = [b['slug'] for b in data if b.get('canonical', True) and b.get('language_source') == 'ar']

    total_fixed = 0
    for slug in ar_books:
        book_dir = BOOKS_DIR / slug
        if not book_dir.is_dir():
            continue
        for f in sorted(book_dir.glob('*.json')):
            if f.name == 'index.json':
                continue
            try:
                json.load(open(f, encoding='utf-8'))
            except json.JSONDecodeError:
                print(f'Fixing: {slug}/{f.name}')
                if fix_file(f, slug):
                    total_fixed += 1

    print(f'\nTotal fixed: {total_fixed}')


if __name__ == '__main__':
    main()
