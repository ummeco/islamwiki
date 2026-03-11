#!/usr/bin/env python3
"""Taxonomy tagging for 5 books: tafsir-ath-thalabi, tafsir-ibn-al-arabi,
al-arbaeen-an-nawawiyyah, al-aqeedah-al-wasitiyyah, fath-al-bari"""

import json
import os

BASE = os.path.join(os.path.dirname(__file__), "..", "web", "data", "books")

TAGS = {
    "tafsir-ath-thalabi": {
        1: {
            "subject_tags": ["tafsir", "quran", "biography"],
            "topic_tags": [],
            "era_tags": ["fifth-century-ah"],
            "madhab_tags": ["shafii"],
            "content_type_tags": ["biography-content", "commentary"],
            "keywords": ["ath-thalabi", "al-kashf-wal-bayan", "nishapur", "khurasan", "isra'iliyyat", "tafsir-compilation"],
        },
        2: {
            "subject_tags": ["tafsir", "quran"],
            "topic_tags": ["tawhid", "iman"],
            "era_tags": ["fifth-century-ah"],
            "madhab_tags": ["shafii"],
            "content_type_tags": ["commentary", "narration"],
            "keywords": ["surah-al-fatiha", "basmala", "hidayah", "qira'at", "al-fatiha", "guided-path", "seven-oft-repeated"],
        },
        3: {
            "subject_tags": ["tafsir", "quran", "comparative-religion"],
            "topic_tags": [],
            "era_tags": ["fifth-century-ah"],
            "madhab_tags": ["shafii"],
            "content_type_tags": ["commentary", "narration"],
            "keywords": ["isra'iliyyat", "ka'b-al-ahbar", "wahb-ibn-munabbih", "biblical-traditions", "qisas-al-anbiya", "ibn-kathir", "hadith-criticism"],
        },
        4: {
            "subject_tags": ["tafsir", "quran", "arabic-language"],
            "topic_tags": [],
            "era_tags": ["fifth-century-ah"],
            "madhab_tags": ["shafii"],
            "content_type_tags": ["commentary", "explanation"],
            "keywords": ["qira'at", "variant-readings", "al-qira'at-as-sab'", "arabic-grammar", "linguistic-analysis", "maliki-yawm-al-din", "basran-kufan-schools"],
        },
        5: {
            "subject_tags": ["tafsir", "quran"],
            "topic_tags": [],
            "era_tags": ["fifth-century-ah", "classical"],
            "madhab_tags": ["shafii"],
            "content_type_tags": ["commentary", "summary"],
            "keywords": ["al-wahidi", "al-baghawi", "ma'alim-at-tanzil", "scholarly-influence", "khurasani-tradition", "tafsir-abridgment"],
        },
    },
    "tafsir-ibn-al-arabi": {
        1: {
            "subject_tags": ["tafsir", "fiqh", "biography"],
            "topic_tags": [],
            "era_tags": ["sixth-century-ah"],
            "madhab_tags": ["maliki"],
            "content_type_tags": ["biography-content", "commentary"],
            "keywords": ["ibn-al-arabi-maliki", "ahkam-al-quran", "seville", "andalusia", "al-ghazali", "maliki-tafsir", "legal-commentary"],
        },
        2: {
            "subject_tags": ["tafsir", "fiqh", "usul-al-fiqh"],
            "topic_tags": [],
            "era_tags": ["sixth-century-ah"],
            "madhab_tags": ["maliki"],
            "content_type_tags": ["commentary", "ruling"],
            "keywords": ["ahkam-tafsir", "zahir", "hadith-criticism", "comparative-fiqh", "family-law", "methodology", "legal-verses"],
        },
        3: {
            "subject_tags": ["tafsir", "fiqh"],
            "topic_tags": ["tahara", "salah", "riba", "commerce"],
            "era_tags": ["sixth-century-ah"],
            "madhab_tags": ["maliki"],
            "content_type_tags": ["ruling", "commentary"],
            "keywords": ["tahara", "wudu", "prayer-rulings", "riba-al-fadl", "riba-an-nasi'ah", "commercial-law", "verse-5-6"],
        },
        4: {
            "subject_tags": ["tafsir", "fiqh"],
            "topic_tags": ["marriage", "divorce", "inheritance", "hudud"],
            "era_tags": ["sixth-century-ah"],
            "madhab_tags": ["maliki"],
            "content_type_tags": ["ruling", "commentary"],
            "keywords": ["marriage-conditions", "wali", "mahr", "divorce-idda", "triple-divorce", "inheritance-shares", "hudud-punishment"],
        },
        5: {
            "subject_tags": ["tafsir", "fiqh"],
            "topic_tags": [],
            "era_tags": ["sixth-century-ah", "classical"],
            "madhab_tags": ["maliki"],
            "content_type_tags": ["commentary", "summary"],
            "keywords": ["al-qurtubi", "al-shatibi", "maqasid-ash-shariah", "maliki-legal-tradition", "scholarly-legacy", "andalusian-scholarship"],
        },
    },
    "al-arbaeen-an-nawawiyyah": {
        1: {
            "subject_tags": ["hadith", "ethics", "aqeedah"],
            "topic_tags": ["iman"],
            "era_tags": ["seventh-century-ah"],
            "madhab_tags": ["shafii"],
            "content_type_tags": ["biography-content", "explanation"],
            "keywords": ["al-nawawi", "forty-hadith", "jawami-al-kalim", "hadith-curriculum", "sharh-sahih-muslim", "riyadh-as-salihin"],
        },
        2: {
            "subject_tags": ["hadith", "aqeedah", "ethics"],
            "topic_tags": ["iman", "ihsan", "innovations-in-religion"],
            "era_tags": ["seventh-century-ah"],
            "madhab_tags": ["shafii"],
            "content_type_tags": ["narration", "explanation"],
            "keywords": ["hadith-of-jibril", "five-pillars", "niyyah-intention", "halal-haram", "bid'ah", "iman-islam-ihsan"],
        },
        3: {
            "subject_tags": ["hadith", "ethics", "spirituality"],
            "topic_tags": ["sabr", "sincerity-ikhlas", "taziyat-al-nafs"],
            "era_tags": ["seventh-century-ah"],
            "madhab_tags": ["shafii"],
            "content_type_tags": ["narration", "explanation"],
            "keywords": ["ethics-of-heart", "avoiding-harm", "brotherhood", "certainty-doubt", "love-for-brother", "la-darar", "muslim-character"],
        },
        4: {
            "subject_tags": ["hadith", "ethics", "spirituality"],
            "topic_tags": ["tawakkul", "ihsan", "dhikr"],
            "era_tags": ["seventh-century-ah"],
            "madhab_tags": ["shafii"],
            "content_type_tags": ["narration", "explanation"],
            "keywords": ["anger-management", "tawakkul", "hayaa-modesty", "daily-worship", "ihsan", "prophetic-advice", "zuhd"],
        },
        5: {
            "subject_tags": ["hadith", "ethics", "fiqh"],
            "topic_tags": ["tawakkul", "sincerity-ikhlas", "tawhid"],
            "era_tags": ["seventh-century-ah"],
            "madhab_tags": ["shafii"],
            "content_type_tags": ["narration", "explanation"],
            "keywords": ["sadaqah", "birr-righteousness", "sunnah-adherence", "shahada-at-death", "trust-in-allah", "rights-of-others"],
        },
        6: {
            "subject_tags": ["hadith", "ethics", "aqeedah"],
            "topic_tags": ["sincerity-ikhlas", "iman"],
            "era_tags": ["seventh-century-ah"],
            "madhab_tags": ["shafii"],
            "content_type_tags": ["narration", "explanation"],
            "keywords": ["brotherhood-in-islam", "envy", "accountability", "hadith-qudsi", "allah-mercy", "ibn-rajab", "jami-al-ulum"],
        },
    },
    "al-aqeedah-al-wasitiyyah": {
        1: {
            "subject_tags": ["aqeedah"],
            "topic_tags": ["ahl-us-sunnah", "tawhid", "innovations-in-religion"],
            "era_tags": ["eighth-century-ah"],
            "madhab_tags": ["hanbali"],
            "content_type_tags": ["explanation", "refutation"],
            "keywords": ["ibn-taymiyyah", "wasatiyyah", "saved-sect", "ahl-us-sunnah", "middle-path", "salaf", "bid'ah"],
        },
        2: {
            "subject_tags": ["aqeedah"],
            "topic_tags": ["names-and-attributes", "tawhid"],
            "era_tags": ["eighth-century-ah"],
            "madhab_tags": ["hanbali"],
            "content_type_tags": ["explanation", "refutation"],
            "keywords": ["divine-attributes", "tashbih", "ta'til", "tahrif", "takyif", "bila-kayf", "athari-creed", "asma-was-sifat"],
        },
        3: {
            "subject_tags": ["aqeedah"],
            "topic_tags": ["day-of-judgment", "life-in-grave", "paradise", "hellfire", "intercession"],
            "era_tags": ["eighth-century-ah"],
            "madhab_tags": ["hanbali"],
            "content_type_tags": ["explanation", "narration"],
            "keywords": ["yawm-al-qiyamah", "al-ghayb", "azab-al-qabr", "bodily-resurrection", "sirat", "mizan", "intercession-shafa'ah"],
        },
        4: {
            "subject_tags": ["aqeedah"],
            "topic_tags": ["qadar", "iman"],
            "era_tags": ["eighth-century-ah"],
            "madhab_tags": ["hanbali"],
            "content_type_tags": ["explanation", "refutation"],
            "keywords": ["qadar", "divine-decree", "al-jabriyyah", "al-qadariyyah", "human-agency", "predestination", "al-lawh-al-mahfuz"],
        },
        5: {
            "subject_tags": ["aqeedah"],
            "topic_tags": ["prophethood", "iman"],
            "era_tags": ["eighth-century-ah"],
            "madhab_tags": ["hanbali"],
            "content_type_tags": ["explanation", "narration"],
            "keywords": ["prophethood", "khatam-al-nabiyyin", "seal-of-prophets", "isra-mi'raj", "love-of-prophet", "isma-prophets"],
        },
        6: {
            "subject_tags": ["aqeedah"],
            "topic_tags": ["companions", "ahl-us-sunnah", "imamate"],
            "era_tags": ["eighth-century-ah"],
            "madhab_tags": ["hanbali"],
            "content_type_tags": ["explanation", "refutation"],
            "keywords": ["sahabah-companions", "ahl-al-bayt", "abu-bakr", "rightly-guided-caliphs", "sunni-shia", "ijtihad", "honor-companions"],
        },
        7: {
            "subject_tags": ["aqeedah"],
            "topic_tags": ["ahl-us-sunnah", "innovations-in-religion", "tawhid"],
            "era_tags": ["eighth-century-ah"],
            "madhab_tags": ["hanbali"],
            "content_type_tags": ["explanation", "refutation"],
            "keywords": ["manhaj-ahl-us-sunnah", "khawarij", "murji'ah", "mu'tazilah", "salaf-methodology", "quran-sunnah", "middle-way"],
        },
    },
    "fath-al-bari": {
        1: {
            "subject_tags": ["hadith", "biography"],
            "topic_tags": ["hadith-collections", "narrators"],
            "era_tags": ["eighth-century-ah"],
            "madhab_tags": ["shafii"],
            "content_type_tags": ["biography-content", "commentary"],
            "keywords": ["ibn-hajar", "fath-al-bari", "sahih-al-bukhari", "hady-as-sari", "hadith-commentary", "mamluk-egypt"],
        },
        2: {
            "subject_tags": ["hadith", "fiqh"],
            "topic_tags": ["isnad", "narrators"],
            "era_tags": ["eighth-century-ah"],
            "madhab_tags": ["shafii"],
            "content_type_tags": ["commentary", "explanation"],
            "keywords": ["hadith-of-niyyah", "intention", "umar-ibn-khattab", "yahya-ibn-said", "legal-analysis", "chain-of-transmission", "prayer-fasting"],
        },
        3: {
            "subject_tags": ["hadith", "hadith-sciences"],
            "topic_tags": ["narrators", "isnad", "chain-of-transmission", "hadith-grading"],
            "era_tags": ["eighth-century-ah"],
            "madhab_tags": ["shafii"],
            "content_type_tags": ["explanation", "commentary"],
            "keywords": ["rijal", "narrator-criticism", "tahdhib-al-tahdhib", "taqrib-al-tahdhib", "thiqah-daif", "sanad-evaluation", "biographical-dictionaries"],
        },
        4: {
            "subject_tags": ["hadith", "fiqh"],
            "topic_tags": ["tahara", "salah"],
            "era_tags": ["eighth-century-ah"],
            "madhab_tags": ["shafii"],
            "content_type_tags": ["commentary", "ruling"],
            "keywords": ["comparative-fiqh", "hanafi-shafii", "maliki-hanbali", "chapter-headings", "al-bukhari-fiqh", "legal-differences", "dhahiri-ibn-hazm"],
        },
        5: {
            "subject_tags": ["hadith", "aqeedah"],
            "topic_tags": ["names-and-attributes", "day-of-judgment", "intercession"],
            "era_tags": ["eighth-century-ah"],
            "madhab_tags": ["shafii"],
            "content_type_tags": ["commentary", "explanation"],
            "keywords": ["ashari-theology", "ta'wil", "divine-attributes", "ru'yah-allah", "eschatology", "bila-kayf", "athari-ashari"],
        },
        6: {
            "subject_tags": ["hadith"],
            "topic_tags": ["hadith-collections", "hadith-sciences"],
            "era_tags": ["eighth-century-ah", "ottoman-era"],
            "madhab_tags": ["shafii"],
            "content_type_tags": ["commentary", "summary"],
            "keywords": ["scholarly-influence", "ottoman-scholarship", "indian-subcontinent", "deobandi", "ibn-battal", "hadith-curriculum", "classical-scholarship"],
        },
    },
}


def tag_file(path, tags):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    data["subject_tags"] = tags["subject_tags"]
    data["topic_tags"] = tags["topic_tags"]
    data["era_tags"] = tags["era_tags"]
    data["madhab_tags"] = tags["madhab_tags"]
    data["content_type_tags"] = tags["content_type_tags"]
    data["keywords"] = tags["keywords"]
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


total = 0
for book_slug, chapters in TAGS.items():
    book_dir = os.path.join(BASE, book_slug)
    for chapter_num, chapter_tags in chapters.items():
        filename = f"{chapter_num:03d}.json"
        filepath = os.path.join(book_dir, filename)
        if os.path.exists(filepath):
            tag_file(filepath, chapter_tags)
            print(f"  Tagged {book_slug}/{filename}")
            total += 1
        else:
            print(f"  MISSING: {book_slug}/{filename}")

print(f"\nDone. Tagged {total} chapter files.")
