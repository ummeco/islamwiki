#!/usr/bin/env python3
"""
Phase B final pass: handle remaining ~440 hadiths.
- Map remaining unmapped topics
- Map by chapter_en keywords
- Apply general Islamic refs to truly topicless hadiths
"""
import json, os, re

DATA_DIR = os.path.join(os.path.dirname(__file__), '../../web/data')
HADITH_DIR = os.path.join(DATA_DIR, 'hadith')

COLLECTIONS = ['bukhari','muslim','abu-dawud','tirmidhi','nasai','ibn-majah',
               'muwatta','darimi','musnad-ahmad','riyadh-salihin','bulugh-maram','shamail']

# Remaining unmapped topics
EXTRA_TOPIC_REFS = {
    'allahss-attributes': ['2:255', '3:2', '6:102', '7:180', '17:110', '20:8', '57:3', '59:22', '59:23', '59:24', '112:1', '112:2', '112:3', '112:4'],
    'dress-code': ['7:26', '7:31', '7:32', '24:31', '33:59'],
    'prophets-and-messengers': ['4:164', '6:83', '6:84', '6:85', '6:86', '21:25', '40:78'],
    'circumcision': ['2:124', '16:123', '22:78'],
    'qadar': ['3:145', '3:154', '4:78', '6:59', '9:51', '35:11', '54:49', '57:22', '57:23', '64:11'],
    'niyyah': ['1:5', '2:272', '4:100', '9:107', '22:37', '39:11'],
    'oaths-and-vows': ['2:224', '2:225', '5:89', '16:91', '16:94', '66:2'],
    'hypocrisy': ['2:8', '2:9', '2:10', '4:61', '4:142', '4:145', '9:77', '33:73', '63:1'],
    'friday-prayer': ['62:9', '62:10', '62:11'],
    'signs-of-allah': ['2:164', '3:190', '10:6', '13:3', '16:12', '30:20', '30:22', '30:23', '41:53', '51:20', '51:21'],
    'seerah': ['3:31', '4:80', '33:21', '33:40', '33:56', '48:8', '48:9', '53:3', '53:4'],
    'belief-in-fate': ['3:145', '3:154', '4:78', '9:51', '35:11', '54:49', '57:22', '57:23', '64:11'],
    'manners-and-etiquette': ['3:159', '7:199', '17:37', '31:18', '31:19', '49:11', '49:12'],
    'prophet-isa': ['3:45', '3:46', '3:47', '3:48', '3:49', '4:157', '4:171', '19:30', '19:31', '19:33', '43:63'],
    'dreams': ['6:60', '10:64', '12:4', '12:5', '12:6', '39:42', '48:27'],
    'signs-of-qiyamah': ['6:158', '16:27', '21:96', '21:97', '27:82', '33:63', '41:47', '47:18', '54:1'],
    'ikhlas': ['1:5', '2:139', '4:146', '6:162', '6:163', '7:29', '39:2', '39:3', '39:11', '98:5', '112:1'],
    'riba': ['2:275', '2:276', '2:278', '2:279', '3:130', '4:161'],
    'shaking-hands': ['4:86', '24:61'],
}

# Chapter keyword → Quran refs
CHAPTER_KEYWORD_REFS = {
    'prayer': ['2:43', '2:238', '4:103', '11:114', '17:78', '20:14', '29:45'],
    'salah': ['2:43', '2:238', '4:103', '11:114', '17:78', '20:14'],
    'quran': ['2:2', '17:9', '17:88', '56:77', '56:78', '56:79'],
    'revelation': ['2:2', '2:97', '15:9', '17:105', '26:192', '26:193', '26:194'],
    'belief': ['2:177', '2:285', '4:136', '49:14', '49:15'],
    'faith': ['2:177', '2:285', '4:136', '49:14', '49:15'],
    'paradise': ['2:25', '3:133', '9:72', '13:35', '47:15', '55:46'],
    'hell': ['2:24', '4:56', '14:29', '19:86', '67:6', '78:21'],
    'knowledge': ['20:114', '35:28', '58:11', '96:1', '96:2'],
    'remembrance': ['2:152', '13:28', '33:41', '33:42', '87:15'],
    'fasting': ['2:183', '2:184', '2:185', '2:187'],
    'zakah': ['2:43', '2:177', '9:60', '9:103'],
    'pilgrimage': ['2:196', '2:197', '3:97', '22:27'],
    'hajj': ['2:196', '2:197', '3:97', '22:27'],
    'jihad': ['2:190', '2:216', '4:74', '4:95', '8:60', '9:29'],
    'food': ['2:168', '2:172', '2:173', '5:3', '5:88', '6:145'],
    'drink': ['2:219', '5:90', '16:67'],
    'marriage': ['2:221', '4:3', '4:4', '4:19', '24:32', '30:21'],
    'divorce': ['2:229', '2:230', '4:35', '65:1'],
    'inheritance': ['4:7', '4:11', '4:12', '4:176'],
    'manners': ['7:199', '16:90', '17:37', '31:18', '49:11'],
    'good': ['2:177', '3:92', '9:99', '16:97', '99:7'],
    'charity': ['2:261', '2:271', '3:92', '4:114', '9:60'],
    'medicine': ['16:69', '26:80'],
    'dreams': ['12:4', '12:5', '12:6', '39:42', '48:27'],
    'death': ['2:156', '3:185', '4:78', '6:61', '21:35', '39:42'],
    'resurrection': ['3:185', '16:38', '22:7', '36:51', '75:3'],
    'judgment': ['2:281', '3:161', '7:6', '18:49', '82:19', '99:7'],
    'angels': ['2:30', '2:97', '2:285', '6:61', '32:11', '35:1'],
    'prophet': ['3:31', '4:80', '33:21', '33:56', '48:8', '48:9'],
    'companions': ['9:100', '48:18', '48:29', '57:10', '59:8'],
    'women': ['2:228', '4:1', '4:3', '4:19', '4:34', '9:71', '24:31'],
    'children': ['2:233', '17:31', '18:46', '31:14'],
    'parents': ['2:83', '6:151', '17:23', '17:24', '31:14', '31:15'],
    'neighbor': ['4:36'],
    'justice': ['4:58', '4:135', '5:8', '16:90', '57:25'],
    'mosque': ['2:114', '9:17', '9:18', '24:36', '72:18'],
    'adhan': ['2:238', '5:58', '62:9'],
    'friday': ['62:9', '62:10', '62:11'],
    'hajj': ['2:196', '2:197', '3:97', '22:27'],
    'ablution': ['4:43', '5:6', '9:108'],
    'purification': ['2:222', '4:43', '5:6', '9:108'],
    'blood': ['2:173', '5:3', '6:145', '16:115'],
    'slaughter': ['5:3', '5:4', '6:118', '6:121', '22:36'],
    'hunting': ['5:4', '5:96'],
    'trade': ['2:275', '2:279', '4:29', '5:1', '83:1'],
    'business': ['2:275', '2:282', '4:29', '83:1'],
    'loan': ['2:282', '2:283'],
    'sunnah': ['4:80', '33:21', '53:3', '53:4'],
    'hadith': ['4:59', '4:83', '59:7'],
    'taqwa': ['2:197', '3:102', '4:131', '49:13', '65:3'],
    'sin': ['4:17', '4:31', '4:48', '39:53', '42:25'],
    'repentance': ['2:222', '3:135', '9:104', '39:53', '66:8'],
    'patience': ['2:153', '2:155', '2:177', '3:200', '16:96', '39:10'],
    'gratitude': ['2:152', '14:7', '16:78', '31:12'],
    'heart': ['2:7', '2:10', '3:8', '6:46', '13:28', '22:32', '26:89', '50:33'],
    'intention': ['1:5', '2:272', '4:100', '39:11'],
    'lie': ['3:61', '9:119', '22:30', '51:10'],
    'truth': ['3:17', '5:119', '9:119', '33:35', '39:33'],
    'shyness': ['7:26', '24:31', '33:35'],
    'generosity': ['2:177', '2:261', '3:92', '17:26', '25:67'],
    'anger': ['3:134', '7:154', '16:126', '41:34', '42:36'],
    'forgiving': ['2:263', '3:134', '4:149', '7:199', '16:126', '42:40', '45:14'],
    'introduction': ['1:1', '2:2', '3:31', '49:14'],  # generic for introductory chapters
    'appendix': ['3:31', '4:80', '33:21'],
    'book': ['2:2', '3:31', '56:77'],
    'miscellaneous': ['2:177', '3:31', '4:80', '33:21'],
}

# Generic fallback refs (for hadiths with nothing else)
# Based on the shahada and core of Islamic faith
GENERIC_REFS = ['1:1', '1:2', '1:3', '1:4', '1:5', '1:6', '1:7',
                '2:255', '3:31', '4:80', '33:21', '112:1', '112:2', '112:3', '112:4']


def sort_refs(refs):
    try:
        return sorted(set(refs), key=lambda x: (int(x.split(':')[0]), int(x.split(':')[1])))
    except:
        return list(set(refs))


def refs_from_chapter(chapter_en) -> list:
    if not chapter_en or not isinstance(chapter_en, str):
        return []
    ch = chapter_en.lower()
    found = set()
    for kw, refs in CHAPTER_KEYWORD_REFS.items():
        if kw in ch:
            found.update(refs)
    return list(found)


def process_collection(coll: str) -> tuple[int, int]:
    coll_dir = os.path.join(HADITH_DIR, coll)
    if not os.path.isdir(coll_dir):
        return 0, 0

    book_files = sorted(f for f in os.listdir(coll_dir) if f.endswith('.json'))
    total = 0
    updated = 0

    for book_file in book_files:
        path = os.path.join(coll_dir, book_file)
        try:
            data = json.load(open(path, encoding='utf-8'))
        except Exception:
            continue
        if not isinstance(data, list):
            continue

        changed = False
        for hadith in data:
            if not isinstance(hadith, dict):
                continue
            if hadith.get('quran_refs'):
                continue  # already has refs
            total += 1

            new_refs = set()
            # 1. Try extra topic mapping
            for t in hadith.get('topics', []):
                if t in EXTRA_TOPIC_REFS:
                    new_refs.update(EXTRA_TOPIC_REFS[t])

            # 2. Try chapter keyword mapping
            chapter_refs = refs_from_chapter(hadith.get('chapter_en', ''))
            new_refs.update(chapter_refs)

            # 3. Fallback — use generic Islamic refs
            if not new_refs:
                new_refs.update(GENERIC_REFS)

            hadith['quran_refs'] = sort_refs(list(new_refs))
            updated += 1
            changed = True

        if changed:
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                f.write('\n')

    return total, updated


def main():
    for coll in COLLECTIONS:
        total, updated = process_collection(coll)
        if updated:
            print(f'  {coll}: {updated}/{total} remaining hadiths filled')

    # Final count
    total_h = 0
    with_refs = 0
    for coll in COLLECTIONS:
        d = os.path.join(HADITH_DIR, coll)
        if not os.path.isdir(d): continue
        for f in os.listdir(d):
            if not f.endswith('.json'): continue
            try: data = json.load(open(os.path.join(d, f)))
            except: continue
            if isinstance(data, list):
                for h in data:
                    if isinstance(h, dict):
                        total_h += 1
                        if h.get('quran_refs'):
                            with_refs += 1

    print(f'\nFINAL: {with_refs}/{total_h} hadiths have quran_refs ({100*with_refs/total_h:.1f}%)')


if __name__ == '__main__':
    main()
