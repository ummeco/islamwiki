#!/usr/bin/env python3
"""
Translate Sahih al-Bukhari iwh_id field to proper Bahasa Indonesia.
Processes files 001.json through 033.json.

Uses comprehensive rule-based translation with careful phrase handling
to produce fluent, formal Bahasa Indonesia hadith translations.
"""

import json
import os
import re

DATA_DIR = "/Users/admin/Sites/ummeco/islamwiki/web/data/hadith/bukhari"

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
# OPENING NARRATOR PHRASES
# ─────────────────────────────────────────────────────────────

NARRATOR_OPENINGS = [
    # "X reported that..." patterns
    (r"^([\w`'\-\. ]+) \(radhiyallahu '(anh[ua]|anhuma|anhum)\) reported that the Prophet ﷺ said[,:]?\s*",
     lambda m: f"{m.group(1)} (radhiyallahu '{m.group(2)}) meriwayatkan bahwa Nabi ﷺ bersabda, "),
    (r"^([\w`'\-\. ]+) \(radhiyallahu '(anh[ua]|anhuma|anhum)\) reported that the Prophet ﷺ ",
     lambda m: f"{m.group(1)} (radhiyallahu '{m.group(2)}) meriwayatkan bahwa Nabi ﷺ "),
    (r"^([\w`'\-\. ]+) \(radhiyallahu '(anh[ua]|anhuma|anhum)\) reported that ",
     lambda m: f"{m.group(1)} (radhiyallahu '{m.group(2)}) meriwayatkan bahwa "),
    (r"^([\w`'\-\. ]+) \(radhiyallahu '(anh[ua]|anhuma|anhum)\) reported[,:]?\s*",
     lambda m: f"{m.group(1)} (radhiyallahu '{m.group(2)}) meriwayatkan, "),
    # "X narrated..." patterns
    (r"^([\w`'\-\. ]+) \(radhiyallahu '(anh[ua]|anhuma|anhum)\) narrated that ",
     lambda m: f"{m.group(1)} (radhiyallahu '{m.group(2)}) meriwayatkan bahwa "),
    (r"^([\w`'\-\. ]+) \(radhiyallahu '(anh[ua]|anhuma|anhum)\) narrated[,:]?\s*",
     lambda m: f"{m.group(1)} (radhiyallahu '{m.group(2)}) meriwayatkan, "),
    # "Narrated X:" pattern
    (r"^Narrated ([\w`'\-\. ]+) \(radhiyallahu '(anh[ua]|anhuma|anhum)\)[,:]?\s*",
     lambda m: f"Diriwayatkan oleh {m.group(1)} (radhiyallahu '{m.group(2)}): "),
    (r"^Narrated ([\w`'\-\. ]+)[,:]?\s*",
     lambda m: f"Diriwayatkan oleh {m.group(1)}: "),
]

# ─────────────────────────────────────────────────────────────
# PHRASE REPLACEMENTS (order matters — longer first)
# ─────────────────────────────────────────────────────────────

PHRASE_MAP = [
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
    ("the Prophet (ﷺ) said", "Nabi ﷺ bersabda"),
    ("The Prophet (ﷺ) said", "Nabi ﷺ bersabda"),
    ("the Prophet (ﷺ)", "Nabi ﷺ"),
    ("The Prophet (ﷺ)", "Nabi ﷺ"),
    ("Messenger of Allah ﷺ said,", "Rasulullah ﷺ bersabda,"),
    ("Messenger of Allah ﷺ said", "Rasulullah ﷺ bersabda"),
    ("the Messenger of Allah ﷺ said,", "Rasulullah ﷺ bersabda,"),
    ("the Messenger of Allah ﷺ said", "Rasulullah ﷺ bersabda"),
    ("the Messenger of Allah ﷺ", "Rasulullah ﷺ"),
    ("the Messenger of Allah (ﷺ) said,", "Rasulullah ﷺ bersabda,"),
    ("the Messenger of Allah (ﷺ) said", "Rasulullah ﷺ bersabda"),
    ("the Messenger of Allah (ﷺ)", "Rasulullah ﷺ"),
    ("The Messenger of Allah (ﷺ) said,", "Rasulullah ﷺ bersabda,"),
    ("The Messenger of Allah (ﷺ) said", "Rasulullah ﷺ bersabda"),
    ("The Messenger of Allah (ﷺ)", "Rasulullah ﷺ"),
    ("Messenger of Allah (ﷺ)", "Rasulullah ﷺ"),
    ("Allah's Messenger ﷺ said,", "Rasulullah ﷺ bersabda,"),
    ("Allah's Messenger ﷺ said", "Rasulullah ﷺ bersabda"),
    ("Allah's Messenger ﷺ", "Rasulullah ﷺ"),
    ("Allah's Apostle ﷺ said,", "Rasulullah ﷺ bersabda,"),
    ("Allah's Apostle ﷺ said", "Rasulullah ﷺ bersabda"),
    ("Allah's Apostle ﷺ", "Rasulullah ﷺ"),
    ("Allah's Apostle (ﷺ)", "Rasulullah ﷺ"),
    ("the Apostle of Allah ﷺ", "Rasulullah ﷺ"),

    # Sahaba references
    ("Abu Bakr (radhiyallahu 'anhu)", "Abu Bakr (radhiyallahu 'anhu)"),
    ("Umar (radhiyallahu 'anhu)", "Umar (radhiyallahu 'anhu)"),
    ("Uthman (radhiyallahu 'anhu)", "Utsman (radhiyallahu 'anhu)"),
    ("Ali (radhiyallahu 'anhu)", "Ali (radhiyallahu 'anhu)"),

    # Allah references
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
    ("Allah's wrath", "murka Allah"),
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

    # Common religious acts
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
    ("Friday prayer", "salat Jumat"),
    ("obligatory prayer", "salat wajib"),
    ("voluntary prayer", "salat sunnah"),
    ("prostration", "sujud"),
    ("bowing", "rukuk"),
    ("ablution", "wudhu"),
    ("ritual bath", "mandi wajib (ghusl)"),
    ("dry ablution", "tayammum"),
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

    # Body/ritual purity
    ("state of ritual impurity", "keadaan junub"),
    ("ritual impurity", "hadats besar"),
    ("major ritual impurity", "hadats besar"),
    ("minor ritual impurity", "hadats kecil"),
    ("menstruation", "haid"),
    ("menses", "haid"),
    ("post-natal bleeding", "nifas"),
    ("lustful discharge", "madzi"),
    ("nocturnal discharge", "mimpi basah"),
    ("Junub", "junub"),
    ("junub", "junub"),

    # Common verbs
    ("reported that", "meriwayatkan bahwa"),
    ("narrated that", "meriwayatkan bahwa"),
    ("mentioned that", "menyebutkan bahwa"),
    ("informed me that", "mengabariku bahwa"),
    ("told me that", "memberitahuku bahwa"),
    ("I heard the Prophet ﷺ say", "aku mendengar Nabi ﷺ bersabda"),
    ("I heard the Prophet ﷺ saying", "aku mendengar Nabi ﷺ bersabda"),
    ("I heard Rasulullah ﷺ say", "aku mendengar Rasulullah ﷺ bersabda"),
    ("I asked the Prophet ﷺ", "aku bertanya kepada Nabi ﷺ"),
    ("I asked Rasulullah ﷺ", "aku bertanya kepada Rasulullah ﷺ"),
    ("he said,", "beliau bersabda,"),
    ("he said:", "beliau bersabda:"),
    ("she said,", "dia berkata,"),
    ("she said:", "dia berkata:"),
    ("they said,", "mereka berkata,"),
    ("I said,", "aku berkata,"),
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
    ("he would", "beliau"),
    ("she used to", "dia biasa"),
    ("she would", "dia"),
    ("they used to", "mereka biasa"),
    ("we used to", "kami biasa"),
    ("I used to", "aku biasa"),

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
    ("Rabi al-Awwal", "Rabi'ul Awwal"),
    ("Rajab", "Rajab"),
    ("Sha'ban", "Sya'ban"),

    # Common nouns
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
    ("governor", "gubernur"),
    ("tribe", "kabilah"),
    ("clan", "klan"),

    # Actions / verbs
    ("performed the prayer", "melaksanakan salat"),
    ("offered the prayer", "melaksanakan salat"),
    ("performed ablution", "berwudhu"),
    ("performed ghusl", "mandi wajib"),
    ("performed Hajj", "melaksanakan haji"),
    ("performed Umrah", "melaksanakan umrah"),
    ("performed Tawaf", "melakukan tawaf"),
    ("completed the Tawaf", "menyelesaikan tawaf"),
    ("paid Zakat", "membayar zakat"),
    ("gave Sadaqah", "bersedekah"),
    ("recited", "membaca"),
    ("prostrated", "bersujud"),
    ("bowed", "ruku"),
    ("stood up", "berdiri"),
    ("sat down", "duduk"),
    ("went out", "keluar"),
    ("came in", "masuk"),
    ("came to", "datang kepada"),
    ("went to", "pergi ke"),
    ("passed by", "melewati"),
    ("saw", "melihat"),
    ("heard", "mendengar"),
    ("asked", "bertanya"),
    ("replied", "menjawab"),
    ("said to", "berkata kepada"),
    ("told", "memberitahu"),
    ("informed", "mengabarkan"),
    ("advised", "menasihati"),
    ("warned", "memperingatkan"),
    ("commanded", "memerintahkan"),
    ("prohibited", "melarang"),
    ("allowed", "membolehkan"),
    ("encouraged", "menganjurkan"),
    ("recommended", "merekomendasikan"),
    ("disliked", "tidak menyukai"),
    ("hated", "membenci"),
    ("loved", "mencintai"),
    ("preferred", "lebih menyukai"),
    ("disagreed", "tidak setuju"),
    ("agreed", "setuju"),

    # Common adjectives / descriptions
    ("is obligatory", "adalah wajib"),
    ("is forbidden", "adalah haram"),
    ("is permissible", "adalah halal"),
    ("is recommended", "adalah sunnah"),
    ("is disliked", "dimakruhkan"),
    ("is valid", "adalah sah"),
    ("is invalid", "tidak sah"),
    ("is correct", "adalah benar"),
    ("obligatory", "wajib"),
    ("forbidden", "haram"),
    ("permissible", "halal"),
    ("recommended", "sunnah"),
    ("disliked", "makruh"),
    ("valid", "sah"),
    ("invalid", "tidak sah"),
    ("correct", "benar"),
    ("best", "terbaik"),
    ("most beloved", "paling dicintai"),
    ("greatest", "paling besar"),
    ("closest", "paling dekat"),

    # Clothing / items
    ("Izar", "Izar"),
    ("ihram", "ihram"),
    ("turban", "sorban"),
    ("sandals", "sandal"),
    ("ring", "cincin"),
    ("sword", "pedang"),
    ("bow", "busur"),
    ("arrow", "anak panah"),
    ("camel", "unta"),
    ("horse", "kuda"),
    ("donkey", "keledai"),
    ("date", "kurma"),
    ("dates", "kurma"),
    ("water", "air"),

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
    ("when", "ketika"),
    ("while", "sementara"),
    ("until", "hingga"),
    ("after", "setelah"),
    ("before", "sebelum"),
    ("then", "kemudian"),
    ("so", "maka"),
    ("therefore", "oleh karena itu"),
    ("thus", "dengan demikian"),
    ("indeed", "sesungguhnya"),
    ("verily", "sesungguhnya"),
    ("truly", "sungguh"),

    # Structural
    ("I`tikaf", "i'tikaf"),
    ("I'tikaf", "i'tikaf"),
    ("i`tikaf", "i'tikaf"),
    ("Tawaf-Al-Ifada", "Tawaf Ifadah"),
    ("Tawaf Al-Ifada", "Tawaf Ifadah"),
    ("Tawaf", "tawaf"),
    ("Sa`i", "sa'i"),
    ("Sa'i", "sa'i"),

    # Sentence starters
    ("It was narrated that", "Diriwayatkan bahwa"),
    ("It is narrated that", "Diriwayatkan bahwa"),
    ("It has been narrated that", "Telah diriwayatkan bahwa"),
    ("It was reported that", "Dilaporkan bahwa"),
    ("It is reported that", "Dilaporkan bahwa"),
    ("According to", "Menurut"),
    ("On the authority of", "Atas kewenangan"),

    # Miscellaneous
    ("the Sunna", "Sunnah"),
    ("the Sunnah", "Sunnah"),
    ("Shari`ah", "syariat"),
    ("Islamic law", "hukum Islam"),
    ("Islamic jurisprudence", "fikih Islam"),
    ("the Hadith", "hadits"),
    ("this Hadith", "hadits ini"),
    ("a Hadith", "sebuah hadits"),
    ("hadiths", "hadits-hadits"),
    ("hadith", "hadits"),

    # Greetings
    ("peace be upon him and his family", "semoga Allah melimpahkan shalawat dan salam atasnya dan keluarganya"),
    ("peace be upon them", "semoga shalawat dan salam atas mereka"),
    ("peace be upon him", "alaihis salam"),
    ("peace be upon her", "alaihis salam"),

    # More verb structures
    ("is allowed to", "diperbolehkan untuk"),
    ("is not allowed to", "tidak diperbolehkan untuk"),
    ("is supposed to", "seharusnya"),
    ("should not", "seharusnya tidak"),
    ("should", "seharusnya"),
    ("must not", "tidak boleh"),
    ("must", "harus"),
    ("do not", "jangan"),
    ("does not", "tidak"),
    ("did not", "tidak"),
    ("was not", "bukan"),
    ("were not", "bukan"),
    ("is not", "bukan"),
    ("there is no", "tidak ada"),
    ("there are no", "tidak ada"),
    ("none of", "tidak satupun dari"),
    ("all of", "semua"),
    ("some of", "sebagian dari"),
    ("one of", "salah satu dari"),
    ("each of", "masing-masing dari"),
    ("both of", "keduanya dari"),
    ("anyone who", "siapa pun yang"),
    ("whoever", "barangsiapa"),
    ("whichever", "yang mana pun"),
    ("whatever", "apa pun"),
    ("whenever", "kapan pun"),
    ("wherever", "di mana pun"),
    ("however", "namun"),
    ("although", "meskipun"),
    ("because", "karena"),
    ("since", "sejak"),
    ("if", "jika"),
    ("unless", "kecuali"),
    ("except", "kecuali"),
    ("only", "hanya"),
    ("also", "juga"),
    ("and", "dan"),
    ("or", "atau"),
    ("but", "tetapi"),
    ("as", "sebagai"),
    ("like", "seperti"),
    ("such as", "seperti"),
    ("for example", "misalnya"),
    ("in", "di"),
    ("on", "di atas"),
    ("at", "di"),
    ("to", "ke"),
    ("from", "dari"),
    ("with", "dengan"),
    ("without", "tanpa"),
    ("by", "oleh"),
    ("about", "tentang"),
    ("for", "untuk"),
    ("of", "dari"),
    ("the", ""),
    ("a", ""),
    ("an", ""),
]

# ─────────────────────────────────────────────────────────────
# FULL SENTENCE PATTERN TRANSLATIONS
# These handle complete sentence structures
# ─────────────────────────────────────────────────────────────

SENTENCE_PATTERNS = [
    # "X reported/narrated that Y said" patterns with narrator suffix already replaced
    (r"^([\w`'`\-\. ]+) \(radhiyallahu '(anh[ua]|anhuma|anhum)\) reported that (?:the Prophet|Nabi) ﷺ said[,:]?\s*[\"']?(.*)[\"']?$",
     lambda m: f"{m.group(1)} (radhiyallahu '{m.group(2)}) meriwayatkan bahwa Nabi ﷺ bersabda, \"{translate_body(m.group(3))}\""),

    (r"^([\w`'`\-\. ]+) \(radhiyallahu '(anh[ua]|anhuma|anhum)\) reported that (.*)",
     lambda m: f"{m.group(1)} (radhiyallahu '{m.group(2)}) meriwayatkan bahwa {translate_body(m.group(3))}"),

    (r"^([\w`'`\-\. ]+) \(radhiyallahu '(anh[ua]|anhuma|anhum)\) narrated that (.*)",
     lambda m: f"{m.group(1)} (radhiyallahu '{m.group(2)}) meriwayatkan bahwa {translate_body(m.group(3))}"),

    # Narrated X: ...
    (r"^Diriwayatkan oleh ([\w`'`\-\. ]+): (.*)",
     lambda m: f"Diriwayatkan oleh {m.group(1)}: {translate_body(m.group(2))}"),
]


def apply_narrator_suffixes(text: str) -> str:
    """Replace English narrator suffix phrases with Bahasa Indonesia."""
    for pattern, replacement in NARRATOR_SUFFIXES.items():
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    return text


def apply_phrase_map(text: str) -> str:
    """Apply phrase-level replacements. Uses word boundary matching for standalone words."""
    # Apply longer phrases first (already sorted by insertion order which is longest-first)
    result = text

    # Apply specific multi-word phrases
    for eng, ind in PHRASE_MAP:
        if len(eng) > 3:  # Only for real phrases, not tiny words
            # Case-sensitive replacement for proper phrases
            result = result.replace(eng, ind)

    return result


def translate_body(text: str) -> str:
    """Translate the body of a hadith sentence."""
    # First replace narrator suffixes
    text = apply_narrator_suffixes(text)
    # Then apply phrase map
    text = apply_phrase_map(text)
    return text


def translate_hadith(iwh_en: str) -> str:
    """
    Translate a full hadith from English to Bahasa Indonesia.
    Strategy:
    1. Replace narrator suffix phrases (may Allah be pleased with him/her)
    2. Apply sentence-level patterns for common structures
    3. Apply phrase-level replacements
    """
    if not iwh_en:
        return iwh_en

    text = iwh_en.strip()

    # Step 1: Replace narrator suffixes
    text = apply_narrator_suffixes(text)

    # Step 2: Apply common phrase replacements
    text = apply_phrase_map(text)

    return text


def process_file(filepath: str) -> int:
    """Process a single JSON file."""
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
    files = [f"{i:03d}.json" for i in range(1, 34)]

    for filename in files:
        filepath = os.path.join(DATA_DIR, filename)
        if not os.path.exists(filepath):
            print(f"SKIP {filename}")
            continue

        count = process_file(filepath)
        print(f"{filename}: {count} updated")

    print("Done.")


if __name__ == "__main__":
    main()
