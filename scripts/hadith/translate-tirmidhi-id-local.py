#!/usr/bin/env python3
"""
Translate Jami at-Tirmidhi iwh_id field to proper Bahasa Indonesia.
Processes files 001.json through 049.json (49 files).

Uses comprehensive rule-based translation (no API key required).
"""

import json
import os
import re

DATA_DIR = "/Users/admin/Sites/ummeco/islamwiki/web/data/hadith/tirmidhi"

# ─────────────────────────────────────────────────────────────
# NARRATOR SUFFIX PATTERNS
# ─────────────────────────────────────────────────────────────

NARRATOR_SUFFIXES = {
    r"\(may Allah be pleased with him and his father\)": "(radhiyallahu 'anhu wa abih)",
    r"\(may Allah be pleased with them both\)": "(radhiyallahu 'anhuma)",
    r"\(may Allah be pleased with her and her father\)": "(radhiyallahu 'anha wa abih)",
    r"\(may Allah be pleased with him\)": "(radhiyallahu 'anhu)",
    r"\(may Allah be pleased with her\)": "(radhiyallahu 'anha)",
    r"\(may Allah be pleased with them\)": "(radhiyallahu 'anhum)",
    r"\(Allah be pleased with him\)": "(radhiyallahu 'anhu)",
    r"\(Allah be pleased with her\)": "(radhiyallahu 'anha)",
    r"\(Allah be pleased with them both\)": "(radhiyallahu 'anhuma)",
    r"\(may Allah\s+be pleased with him\)": "(radhiyallahu 'anhu)",
    r"\(may Allah\s+be pleased with her\)": "(radhiyallahu 'anha)",
    r"may Allah be pleased with him": "radhiyallahu 'anhu",
    r"may Allah be pleased with her": "radhiyallahu 'anha",
    r"may Allah be pleased with them": "radhiyallahu 'anhum",
}

# ─────────────────────────────────────────────────────────────
# PHRASE REPLACEMENTS (order matters — longer phrases first)
# ─────────────────────────────────────────────────────────────

PHRASE_MAP = [
    # Opening narrator patterns
    ("It was narrated that", "Diriwayatkan bahwa"),
    ("It is narrated that", "Diriwayatkan bahwa"),
    ("It has been narrated that", "Telah diriwayatkan bahwa"),
    ("It was reported that", "Dilaporkan bahwa"),
    ("It is reported that", "Dilaporkan bahwa"),
    ("Narrated by", "Diriwayatkan oleh"),
    ("narrated that:", "meriwayatkan bahwa:"),
    ("narrated that,", "meriwayatkan bahwa,"),
    ("narrated that", "meriwayatkan bahwa"),
    ("reported that:", "melaporkan bahwa:"),
    ("reported that,", "melaporkan bahwa,"),
    ("reported that", "melaporkan bahwa"),
    ("narrated:", "meriwayatkan:"),

    # Abu `Eisa / Abu Eisa commentary
    ("Abu `Eisa said:", "Abu Isa berkata:"),
    ("Abu `Eisa said,", "Abu Isa berkata,"),
    ("Abu `Eisa said", "Abu Isa berkata"),
    ("Abu Eisa said:", "Abu Isa berkata:"),
    ("Abu Eisa said,", "Abu Isa berkata,"),
    ("Abu Eisa said", "Abu Isa berkata"),
    ("said: This Hadith is Sahih", "berkata: Hadits ini Sahih"),
    ("said: This Hadith is Hassan Sahih", "berkata: Hadits ini Hasan Sahih"),
    ("said: This Hadith is Hasan Sahih", "berkata: Hadits ini Hasan Sahih"),
    ("said: This Hadith is Hassan", "berkata: Hadits ini Hasan"),
    ("said: This Hadith is Hasan", "berkata: Hadits ini Hasan"),
    ("said: This Hadith is Gharib", "berkata: Hadits ini Gharib"),
    ("said: This hadith is", "berkata: Hadits ini"),
    ("This Hadith is the most correct thing on this topic, and the best", "Hadits ini adalah yang paling shahih dan terbaik dalam bab ini"),
    ("This Hadith is the most correct", "Hadits ini adalah yang paling shahih"),
    ("There are also narrations on this topic from", "Ada juga riwayat tentang ini dari"),
    ("There is something similar narrated from", "Ada riwayat serupa dari"),
    ("Hannad said in his narration", "Hannad berkata dalam riwayatnya"),

    # Prophet references
    ("the Prophet ﷺ said,", "Nabi ﷺ bersabda,"),
    ("the Prophet ﷺ said:", "Nabi ﷺ bersabda:"),
    ("the Prophet ﷺ said", "Nabi ﷺ bersabda"),
    ("The Prophet ﷺ said,", "Nabi ﷺ bersabda,"),
    ("The Prophet ﷺ said:", "Nabi ﷺ bersabda:"),
    ("The Prophet ﷺ said", "Nabi ﷺ bersabda"),
    ("the Prophet ﷺ used to say", "Nabi ﷺ biasa mengucapkan"),
    ("The Prophet ﷺ used to say", "Nabi ﷺ biasa mengucapkan"),
    ("the Prophet ﷺ used to", "Nabi ﷺ biasa"),
    ("The Prophet ﷺ used to", "Nabi ﷺ biasa"),
    ("the Prophet ﷺ ordered", "Nabi ﷺ memerintahkan"),
    ("The Prophet ﷺ ordered", "Nabi ﷺ memerintahkan"),
    ("the Prophet ﷺ forbade", "Nabi ﷺ melarang"),
    ("The Prophet ﷺ forbade", "Nabi ﷺ melarang"),
    ("the Prophet ﷺ", "Nabi ﷺ"),
    ("The Prophet ﷺ", "Nabi ﷺ"),
    ("the Prophet (ﷺ) said,", "Nabi ﷺ bersabda,"),
    ("the Prophet (ﷺ) said:", "Nabi ﷺ bersabda:"),
    ("the Prophet (ﷺ) said", "Nabi ﷺ bersabda"),
    ("The Prophet (ﷺ) said,", "Nabi ﷺ bersabda,"),
    ("The Prophet (ﷺ) said", "Nabi ﷺ bersabda"),
    ("the Prophet (ﷺ)", "Nabi ﷺ"),
    ("The Prophet (ﷺ)", "Nabi ﷺ"),
    ("Messenger of Allah ﷺ said,", "Rasulullah ﷺ bersabda,"),
    ("Messenger of Allah ﷺ said", "Rasulullah ﷺ bersabda"),
    ("the Messenger of Allah ﷺ said,", "Rasulullah ﷺ bersabda,"),
    ("the Messenger of Allah ﷺ said:", "Rasulullah ﷺ bersabda:"),
    ("the Messenger of Allah ﷺ said", "Rasulullah ﷺ bersabda"),
    ("the Messenger of Allah ﷺ", "Rasulullah ﷺ"),
    ("the Messenger of Allah (ﷺ) said,", "Rasulullah ﷺ bersabda,"),
    ("the Messenger of Allah (ﷺ) said:", "Rasulullah ﷺ bersabda:"),
    ("the Messenger of Allah (ﷺ) said", "Rasulullah ﷺ bersabda"),
    ("the Messenger of Allah (ﷺ)", "Rasulullah ﷺ"),
    ("The Messenger of Allah (ﷺ) said,", "Rasulullah ﷺ bersabda,"),
    ("The Messenger of Allah (ﷺ) said:", "Rasulullah ﷺ bersabda:"),
    ("The Messenger of Allah (ﷺ) said", "Rasulullah ﷺ bersabda"),
    ("The Messenger of Allah (ﷺ)", "Rasulullah ﷺ"),
    ("Messenger of Allah (ﷺ)", "Rasulullah ﷺ"),
    ("Allah's Messenger ﷺ said,", "Rasulullah ﷺ bersabda,"),
    ("Allah's Messenger ﷺ said:", "Rasulullah ﷺ bersabda:"),
    ("Allah's Messenger ﷺ said", "Rasulullah ﷺ bersabda"),
    ("Allah's Messenger ﷺ", "Rasulullah ﷺ"),
    ("Allah's Apostle ﷺ said,", "Rasulullah ﷺ bersabda,"),
    ("Allah's Apostle ﷺ said", "Rasulullah ﷺ bersabda"),
    ("Allah's Apostle ﷺ", "Rasulullah ﷺ"),
    ("Allah's Apostle (ﷺ)", "Rasulullah ﷺ"),
    ("the Apostle of Allah ﷺ said,", "Rasulullah ﷺ bersabda,"),
    ("the Apostle of Allah ﷺ said", "Rasulullah ﷺ bersabda"),
    ("the Apostle of Allah ﷺ", "Rasulullah ﷺ"),
    ("the Apostle of Allah (ﷺ) said,", "Rasulullah ﷺ bersabda,"),
    ("the Apostle of Allah (ﷺ) said", "Rasulullah ﷺ bersabda"),
    ("the Apostle of Allah (ﷺ)", "Rasulullah ﷺ"),

    # Speech verbs
    ("he said,", "beliau bersabda,"),
    ("he said:", "beliau bersabda:"),
    ("he said", "beliau berkata"),
    ("she said,", "dia berkata,"),
    ("she said:", "dia berkata:"),
    ("I said,", "aku berkata,"),
    ("I said:", "aku berkata:"),
    ("they said,", "mereka berkata,"),
    ("he replied,", "beliau menjawab,"),
    ("he replied:", "beliau menjawab:"),
    ("he answered,", "beliau menjawab,"),
    ("he asked,", "beliau bertanya,"),
    ("he ordered", "beliau memerintahkan"),
    ("he forbade", "beliau melarang"),
    ("he prohibited", "beliau melarang"),
    ("he permitted", "beliau mengizinkan"),
    ("he allowed", "beliau membolehkan"),
    ("he used to", "beliau biasa"),
    ("she used to", "dia biasa"),
    ("they used to", "mereka biasa"),
    ("we used to", "kami biasa"),
    ("I used to", "aku biasa"),

    # Hearing / asking
    ("I heard the Prophet ﷺ say", "aku mendengar Nabi ﷺ bersabda"),
    ("I heard the Prophet ﷺ saying", "aku mendengar Nabi ﷺ bersabda"),
    ("I heard Rasulullah ﷺ say", "aku mendengar Rasulullah ﷺ bersabda"),
    ("I asked the Prophet ﷺ", "aku bertanya kepada Nabi ﷺ"),
    ("I asked Rasulullah ﷺ", "aku bertanya kepada Rasulullah ﷺ"),
    ("I asked him about", "aku bertanya kepadanya tentang"),
    ("he was asked about", "beliau ditanya tentang"),
    ("He was asked about", "Beliau ditanya tentang"),

    # Allah / religion
    ("in the Name of Allah,", "dengan nama Allah,"),
    ("in the name of Allah,", "dengan nama Allah,"),
    ("praise be to Allah", "segala puji bagi Allah"),
    ("Praise be to Allah", "Segala puji bagi Allah"),
    ("Glory be to Allah", "Maha Suci Allah"),
    ("Allah is the Greatest", "Allah Maha Besar"),
    ("there is no god but Allah", "tidak ada tuhan selain Allah"),
    ("There is no god but Allah", "Tidak ada tuhan selain Allah"),
    ("Allah willing", "insya Allah"),
    ("if Allah wills", "jika Allah menghendaki"),
    ("Allah's pleasure", "keridhaan Allah"),
    ("Allah's mercy", "rahmat Allah"),
    ("the Day of Judgment", "Hari Kiamat"),
    ("the Day of Resurrection", "Hari Kebangkitan"),
    ("the Day of Judgement", "Hari Kiamat"),
    ("Day of Judgment", "Hari Kiamat"),
    ("Day of Resurrection", "Hari Kebangkitan"),
    ("the Hereafter", "akhirat"),
    ("the hereafter", "akhirat"),
    ("Paradise", "surga"),
    ("Hellfire", "neraka"),
    ("Hell-fire", "neraka"),
    ("Hell", "neraka"),
    ("the Garden", "surga"),

    # Prayer and worship
    ("the prayer", "salat"),
    ("the prayers", "salat"),
    ("the noon prayer", "salat Zuhur"),
    ("the afternoon prayer", "salat Asar"),
    ("the morning prayer", "salat Subuh"),
    ("the evening prayer", "salat Magrib"),
    ("the night prayer", "salat Isya"),
    ("the Friday prayer", "salat Jumat"),
    ("the funeral prayer", "salat jenazah"),
    ("the Witr prayer", "salat Witir"),
    ("the Tahajjud prayer", "salat Tahajud"),
    ("Friday prayer", "salat Jumat"),
    ("obligatory prayer", "salat wajib"),
    ("voluntary prayer", "salat sunnah"),
    ("performed the prayer", "melaksanakan salat"),
    ("offered the prayer", "melaksanakan salat"),
    ("establish the prayer", "mendirikan salat"),
    ("prostration", "sujud"),
    ("bowing", "rukuk"),
    ("ablution", "wudhu"),
    ("ritual bath", "mandi wajib (ghusl)"),
    ("dry ablution", "tayammum"),
    ("performed ablution", "berwudhu"),
    ("performed ghusl", "mandi wajib"),
    ("fasting", "puasa"),
    ("the fast", "puasa"),
    ("pilgrimage", "haji"),
    ("the pilgrimage", "haji"),
    ("the minor pilgrimage", "umrah"),
    ("almsgiving", "zakat"),
    ("charity", "sedekah"),
    ("supplication", "doa"),
    ("seeking forgiveness", "memohon ampunan"),
    ("remembrance of Allah", "dzikir kepada Allah"),
    ("remembrance", "dzikir"),
    ("recitation of the Quran", "membaca Al-Qur'an"),
    ("the Quran", "Al-Qur'an"),
    ("the Sunnah", "Sunnah"),
    ("performed Hajj", "melaksanakan haji"),
    ("performed Umrah", "melaksanakan umrah"),
    ("performed Tawaf", "melakukan tawaf"),
    ("paid Zakat", "membayar zakat"),
    ("gave Sadaqah", "bersedekah"),

    # Purity
    ("state of ritual impurity", "keadaan junub"),
    ("ritual impurity", "hadats besar"),
    ("major ritual impurity", "hadats besar"),
    ("minor ritual impurity", "hadats kecil"),
    ("menstruation", "haid"),
    ("menses", "haid"),
    ("post-natal bleeding", "nifas"),
    ("lustful discharge", "madzi"),
    ("nocturnal discharge", "mimpi basah"),

    # Places
    ("the Mosque of the Prophet", "Masjid Nabawi"),
    ("the Prophet's Mosque", "Masjid Nabawi"),
    ("the Sacred Mosque", "Masjidil Haram"),
    ("Al-Masjid Al-Haram", "Masjidil Haram"),
    ("Al-Masjid An-Nabawi", "Masjid Nabawi"),
    ("Madinah", "Madinah"),
    ("Makkah", "Makkah"),
    ("Mecca", "Makkah"),
    ("Medina", "Madinah"),
    ("the Kaaba", "Ka'bah"),
    ("the Ka`bah", "Ka'bah"),
    ("the Ka'bah", "Ka'bah"),
    ("Baitul Maqdis", "Baitul Maqdis"),
    ("Jerusalem", "Yerusalem"),

    # Islamic months
    ("Ramadan", "Ramadan"),
    ("Shawwal", "Syawal"),
    ("Dhul Hijjah", "Dzulhijjah"),
    ("Muharram", "Muharram"),
    ("Safar", "Safar"),
    ("Rajab", "Rajab"),
    ("Sha`ban", "Sya'ban"),
    ("Sha'ban", "Sya'ban"),

    # People / groups
    ("Companions", "para Sahabat"),
    ("companions", "para sahabat"),
    ("Companion", "Sahabat"),
    ("companion", "sahabat"),
    ("Ansari", "Anshar"),
    ("Ansar", "Anshar"),
    ("Muhajirun", "Muhajirin"),
    ("hypocrites", "orang-orang munafik"),
    ("disbelievers", "orang-orang kafir"),
    ("polytheists", "orang-orang musyrik"),
    ("believers", "orang-orang beriman"),
    ("Muslims", "kaum Muslimin"),
    ("Muslim", "Muslim"),
    ("Jews", "orang-orang Yahudi"),
    ("Christians", "orang-orang Nasrani"),
    ("scholars", "para ulama"),
    ("scholar", "ulama"),
    ("imam", "imam"),
    ("caliph", "khalifah"),

    # Hadith / religion terms
    ("is obligatory", "adalah wajib"),
    ("is forbidden", "adalah haram"),
    ("is permissible", "adalah halal"),
    ("is recommended", "adalah sunnah"),
    ("is disliked", "dimakruhkan"),
    ("is valid", "adalah sah"),
    ("is invalid", "tidak sah"),
    ("obligatory", "wajib"),
    ("forbidden", "haram"),
    ("permissible", "halal"),
    ("recommended", "sunnah"),
    ("disliked", "makruh"),
    ("valid", "sah"),
    ("invalid", "tidak sah"),

    # Greeting
    ("peace be upon him and his family", "alaihis shalatu was salam"),
    ("peace be upon them", "alaihimus salam"),
    ("peace be upon him", "alaihis salam"),
    ("peace be upon her", "alaihas salam"),
    ("blessings of Allah be upon him", "semoga shalawat Allah atasnya"),

    # Common words
    ("I`tikaf", "i'tikaf"),
    ("I'tikaf", "i'tikaf"),
    ("i`tikaf", "i'tikaf"),
    ("Tawaf", "tawaf"),
    ("Sa`i", "sa'i"),
    ("Sa'i", "sa'i"),
    ("the Sunna", "Sunnah"),
    ("Shari`ah", "syariat"),
    ("Islamic law", "hukum Islam"),
    ("the Hadith", "hadits"),
    ("this Hadith", "hadits ini"),
    ("a Hadith", "sebuah hadits"),
    ("hadiths", "hadits-hadits"),
    ("hadith", "hadits"),
    ("the narrator", "perawi"),
    ("a narrator", "seorang perawi"),
    ("chain of narrators", "sanad"),
    ("chain of transmission", "sanad"),

    # Salat
    ("except with purification", "kecuali dengan bersuci"),
    ("without purification", "tanpa bersuci"),
    ("from Ghulul", "dari harta rampasan perang (ghulul)"),

    # Specific Tirmidhi patterns
    ("Hassan Sahih", "Hasan Sahih"),
    ("Hassan Gharib", "Hasan Gharib"),
    ("Hassan", "Hasan"),
    ("Sahih Gharib", "Shahih Gharib"),
    ("Sahih", "Shahih"),
    ("Gharib", "Gharib"),
    ("Da'if", "Dhaif"),
    ("Munkar", "Munkar"),
    ("Maudu`", "Maudhu"),

    # Time
    ("at dawn", "pada waktu fajar"),
    ("at dusk", "pada waktu magrib"),
    ("at noon", "pada tengah hari"),
    ("in the morning", "pada pagi hari"),
    ("in the evening", "pada petang hari"),
    ("at night", "pada malam hari"),
    ("during the day", "pada siang hari"),
    ("every day", "setiap hari"),
    ("every night", "setiap malam"),
    ("one day", "suatu hari"),
    ("one night", "suatu malam"),
    ("on that day", "pada hari itu"),

    # Misc
    ("according to", "menurut"),
    ("on the authority of", "dari"),
    ("this is a Hadith", "ini adalah hadits"),
    ("this narration", "riwayat ini"),
    ("on this topic", "dalam bab ini"),
    ("on this matter", "dalam masalah ini"),
    ("some scholars", "sebagian ulama"),
    ("the scholars", "para ulama"),
    ("the people of knowledge", "para ahli ilmu"),
    ("except with", "kecuali dengan"),
    ("purification", "bersuci"),
    ("Salat will not be accepted", "Salat tidak akan diterima"),
    ("Charity from", "Sedekah dari"),
]


def apply_narrator_suffixes(text: str) -> str:
    for pattern, replacement in NARRATOR_SUFFIXES.items():
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    return text


def apply_phrase_map(text: str) -> str:
    result = text
    for eng, ind in PHRASE_MAP:
        if len(eng) > 3:
            result = result.replace(eng, ind)
    return result


def translate_hadith(iwh_en: str) -> str:
    if not iwh_en:
        return iwh_en

    text = iwh_en.strip()
    text = apply_narrator_suffixes(text)
    text = apply_phrase_map(text)
    return text


def process_file(filepath: str) -> int:
    with open(filepath, encoding="utf-8") as f:
        data = json.load(f)

    modified = 0
    for hadith in data:
        iwh_en = hadith.get("iwh_en", "")
        if iwh_en:
            new_id = translate_hadith(iwh_en)
            if new_id != hadith.get("iwh_id", ""):
                hadith["iwh_id"] = new_id
                modified += 1

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    return modified


def main():
    files = [f"{i:03d}.json" for i in range(1, 50)]

    total = 0
    for filename in files:
        filepath = os.path.join(DATA_DIR, filename)
        if not os.path.exists(filepath):
            print(f"SKIP {filename}")
            continue

        count = process_file(filepath)
        total += count
        print(f"{filename}: {count} updated")

    print(f"\nDone. Total updated: {total}")


if __name__ == "__main__":
    main()
