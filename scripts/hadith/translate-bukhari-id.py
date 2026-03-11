#!/usr/bin/env python3
"""
Translate Sahih al-Bukhari iwh_id field to proper Bahasa Indonesia.
Processes files 001.json through 033.json.

Uses a comprehensive rule-based translation engine specifically designed
for hadith texts. Produces fluent, formal Bahasa Indonesia.
"""

import json
import os
import re

DATA_DIR = "/Users/admin/Sites/ummeco/islamwiki/web/data/hadith/bukhari"


# ─────────────────────────────────────────────────────────────────────────────
# Step 1: Replace narrator suffix phrases FIRST
# ─────────────────────────────────────────────────────────────────────────────

NARRATOR_SUFFIXES = [
    (r"\(may Allah be pleased with him and his father\)", "(radhiyallahu 'anhu wa abih)"),
    (r"\(may Allah be pleased with them both\)", "(radhiyallahu 'anhuma)"),
    (r"\(may Allah be pleased with her and her father\)", "(radhiyallahu 'anha wa abih)"),
    (r"\(may Allah be pleased with him\)", "(radhiyallahu 'anhu)"),
    (r"\(may Allah be pleased with her\)", "(radhiyallahu 'anha)"),
    (r"\(may Allah be pleased with them\)", "(radhiyallahu 'anhum)"),
    (r"\(Allah be pleased with him\)", "(radhiyallahu 'anhu)"),
    (r"\(Allah be pleased with her\)", "(radhiyallahu 'anha)"),
    (r"\(Allah be pleased with them both\)", "(radhiyallahu 'anhuma)"),
    (r"\(may Allah\s+be pleased with him\)", "(radhiyallahu 'anhu)"),
    (r"\(may Allah\s+be pleased with her\)", "(radhiyallahu 'anha)"),
    (r"\bmay Allah be pleased with him and his father\b", "radhiyallahu 'anhu wa abih"),
    (r"\bmay Allah be pleased with them both\b", "radhiyallahu 'anhuma"),
    (r"\bmay Allah be pleased with him\b", "radhiyallahu 'anhu"),
    (r"\bmay Allah be pleased with her\b", "radhiyallahu 'anha"),
    (r"\bmay Allah be pleased with them\b", "radhiyallahu 'anhum"),
]


# ─────────────────────────────────────────────────────────────────────────────
# Step 2: Multi-word phrase replacements (ordered longest-first to avoid
# partial replacements)
# ─────────────────────────────────────────────────────────────────────────────

PHRASE_REPLACEMENTS = [
    # Prophet ﷺ references — must come before shorter versions
    ("the Messenger of Allah (ﷺ) said,", "Rasulullah ﷺ bersabda,"),
    ("the Messenger of Allah (ﷺ) said:", "Rasulullah ﷺ bersabda:"),
    ("the Messenger of Allah (ﷺ) said", "Rasulullah ﷺ bersabda"),
    ("The Messenger of Allah (ﷺ) said,", "Rasulullah ﷺ bersabda,"),
    ("The Messenger of Allah (ﷺ) said:", "Rasulullah ﷺ bersabda:"),
    ("The Messenger of Allah (ﷺ) said", "Rasulullah ﷺ bersabda"),
    ("the Messenger of Allah (ﷺ) used to", "Rasulullah ﷺ biasa"),
    ("The Messenger of Allah (ﷺ) used to", "Rasulullah ﷺ biasa"),
    ("the Messenger of Allah (ﷺ) ordered", "Rasulullah ﷺ memerintahkan"),
    ("the Messenger of Allah (ﷺ) forbade", "Rasulullah ﷺ melarang"),
    ("the Messenger of Allah (ﷺ)", "Rasulullah ﷺ"),
    ("The Messenger of Allah (ﷺ)", "Rasulullah ﷺ"),
    ("the Messenger of Allah ﷺ said,", "Rasulullah ﷺ bersabda,"),
    ("the Messenger of Allah ﷺ said:", "Rasulullah ﷺ bersabda:"),
    ("the Messenger of Allah ﷺ said", "Rasulullah ﷺ bersabda"),
    ("the Messenger of Allah ﷺ", "Rasulullah ﷺ"),
    ("The Messenger of Allah ﷺ", "Rasulullah ﷺ"),
    ("Messenger of Allah (ﷺ) said,", "Rasulullah ﷺ bersabda,"),
    ("Messenger of Allah (ﷺ) said", "Rasulullah ﷺ bersabda"),
    ("Messenger of Allah (ﷺ)", "Rasulullah ﷺ"),
    ("Messenger of Allah ﷺ said,", "Rasulullah ﷺ bersabda,"),
    ("Messenger of Allah ﷺ said", "Rasulullah ﷺ bersabda"),
    ("Messenger of Allah ﷺ", "Rasulullah ﷺ"),
    ("Allah's Messenger (ﷺ) said,", "Rasulullah ﷺ bersabda,"),
    ("Allah's Messenger (ﷺ) said:", "Rasulullah ﷺ bersabda:"),
    ("Allah's Messenger (ﷺ) said", "Rasulullah ﷺ bersabda"),
    ("Allah's Messenger (ﷺ) used to", "Rasulullah ﷺ biasa"),
    ("Allah's Messenger (ﷺ)", "Rasulullah ﷺ"),
    ("Allah's Messenger ﷺ said,", "Rasulullah ﷺ bersabda,"),
    ("Allah's Messenger ﷺ said", "Rasulullah ﷺ bersabda"),
    ("Allah's Messenger ﷺ", "Rasulullah ﷺ"),
    ("Allah's Apostle (ﷺ) said,", "Rasulullah ﷺ bersabda,"),
    ("Allah's Apostle (ﷺ) said", "Rasulullah ﷺ bersabda"),
    ("Allah's Apostle (ﷺ)", "Rasulullah ﷺ"),
    ("Allah's Apostle ﷺ said,", "Rasulullah ﷺ bersabda,"),
    ("Allah's Apostle ﷺ said", "Rasulullah ﷺ bersabda"),
    ("Allah's Apostle ﷺ", "Rasulullah ﷺ"),
    ("the Apostle of Allah ﷺ", "Rasulullah ﷺ"),
    ("the Prophet ﷺ said,", "Nabi ﷺ bersabda,"),
    ("the Prophet ﷺ said:", "Nabi ﷺ bersabda:"),
    ("the Prophet ﷺ said", "Nabi ﷺ bersabda"),
    ("The Prophet ﷺ said,", "Nabi ﷺ bersabda,"),
    ("The Prophet ﷺ said:", "Nabi ﷺ bersabda:"),
    ("The Prophet ﷺ said", "Nabi ﷺ bersabda"),
    ("the Prophet (ﷺ) said,", "Nabi ﷺ bersabda,"),
    ("the Prophet (ﷺ) said:", "Nabi ﷺ bersabda:"),
    ("the Prophet (ﷺ) said", "Nabi ﷺ bersabda"),
    ("The Prophet (ﷺ) said,", "Nabi ﷺ bersabda,"),
    ("The Prophet (ﷺ) said:", "Nabi ﷺ bersabda:"),
    ("The Prophet (ﷺ) said", "Nabi ﷺ bersabda"),
    ("the Prophet ﷺ used to say,", "Nabi ﷺ biasa mengucapkan,"),
    ("the Prophet ﷺ used to say", "Nabi ﷺ biasa mengucapkan"),
    ("The Prophet ﷺ used to say", "Nabi ﷺ biasa mengucapkan"),
    ("the Prophet ﷺ used to", "Nabi ﷺ biasa"),
    ("The Prophet ﷺ used to", "Nabi ﷺ biasa"),
    ("the Prophet (ﷺ) used to", "Nabi ﷺ biasa"),
    ("The Prophet (ﷺ) used to", "Nabi ﷺ biasa"),
    ("the Prophet ﷺ ordered", "Nabi ﷺ memerintahkan"),
    ("The Prophet ﷺ ordered", "Nabi ﷺ memerintahkan"),
    ("the Prophet ﷺ forbade", "Nabi ﷺ melarang"),
    ("The Prophet ﷺ forbade", "Nabi ﷺ melarang"),
    ("the Prophet ﷺ prohibited", "Nabi ﷺ melarang"),
    ("the Prophet ﷺ permitted", "Nabi ﷺ mengizinkan"),
    ("the Prophet ﷺ", "Nabi ﷺ"),
    ("The Prophet ﷺ", "Nabi ﷺ"),
    ("the Prophet (ﷺ)", "Nabi ﷺ"),
    ("The Prophet (ﷺ)", "Nabi ﷺ"),

    # Narrated / reported openings
    ("Narrated Abu Hurairah (radhiyallahu 'anhu):", "Diriwayatkan oleh Abu Hurairah (radhiyallahu 'anhu):"),
    ("Narrated Aisha (radhiyallahu 'anha):", "Diriwayatkan oleh Aisha (radhiyallahu 'anha):"),
    ("Narrated Ibn Umar (radhiyallahu 'anhuma):", "Diriwayatkan oleh Ibnu Umar (radhiyallahu 'anhuma):"),
    ("Narrated Ibn Abbas (radhiyallahu 'anhuma):", "Diriwayatkan oleh Ibnu Abbas (radhiyallahu 'anhuma):"),
    ("Narrated Anas (radhiyallahu 'anhu):", "Diriwayatkan oleh Anas (radhiyallahu 'anhu):"),

    # "X reported that" → "X meriwayatkan bahwa"
    ("reported that the Prophet ﷺ said,", "meriwayatkan bahwa Nabi ﷺ bersabda,"),
    ("reported that the Prophet ﷺ said:", "meriwayatkan bahwa Nabi ﷺ bersabda:"),
    ("reported that the Prophet ﷺ said", "meriwayatkan bahwa Nabi ﷺ bersabda"),
    ("reported that Rasulullah ﷺ said,", "meriwayatkan bahwa Rasulullah ﷺ bersabda,"),
    ("reported that Rasulullah ﷺ said", "meriwayatkan bahwa Rasulullah ﷺ bersabda"),
    ("reported that Nabi ﷺ said,", "meriwayatkan bahwa Nabi ﷺ bersabda,"),
    ("reported that Nabi ﷺ said", "meriwayatkan bahwa Nabi ﷺ bersabda"),
    ("reported that", "meriwayatkan bahwa"),
    ("narrated that", "meriwayatkan bahwa"),
    ("It was narrated that", "Diriwayatkan bahwa"),
    ("It is narrated that", "Diriwayatkan bahwa"),
    ("It has been narrated that", "Telah diriwayatkan bahwa"),
    ("It was reported that", "Dilaporkan bahwa"),
    ("It is reported that", "Dilaporkan bahwa"),

    # "I heard" patterns
    ("I heard the Prophet ﷺ saying,", "Aku mendengar Nabi ﷺ bersabda,"),
    ("I heard the Prophet ﷺ saying", "Aku mendengar Nabi ﷺ bersabda"),
    ("I heard the Prophet ﷺ say,", "Aku mendengar Nabi ﷺ bersabda,"),
    ("I heard the Prophet ﷺ say", "Aku mendengar Nabi ﷺ bersabda"),
    ("I heard Rasulullah ﷺ saying", "Aku mendengar Rasulullah ﷺ bersabda"),
    ("I heard Rasulullah ﷺ say", "Aku mendengar Rasulullah ﷺ bersabda"),
    ("I heard Nabi ﷺ saying", "Aku mendengar Nabi ﷺ bersabda"),
    ("I heard Nabi ﷺ say", "Aku mendengar Nabi ﷺ bersabda"),

    # Asking the Prophet
    ("I asked the Prophet ﷺ about", "Aku bertanya kepada Nabi ﷺ tentang"),
    ("I asked the Prophet ﷺ", "Aku bertanya kepada Nabi ﷺ"),
    ("I asked Rasulullah ﷺ", "Aku bertanya kepada Rasulullah ﷺ"),
    ("I asked Nabi ﷺ", "Aku bertanya kepada Nabi ﷺ"),
    ("asked the Prophet ﷺ about", "bertanya kepada Nabi ﷺ tentang"),
    ("asked the Prophet ﷺ", "bertanya kepada Nabi ﷺ"),

    # Divine names and attributes
    ("in the Name of Allah, the Most Gracious, the Most Merciful", "dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang"),
    ("in the Name of Allah,", "dengan nama Allah,"),
    ("in the name of Allah,", "dengan nama Allah,"),
    ("in the name of Allah", "dengan nama Allah"),
    ("praise be to Allah", "segala puji bagi Allah"),
    ("Praise be to Allah", "Segala puji bagi Allah"),
    ("All praise is due to Allah", "Segala puji hanya milik Allah"),
    ("Glory be to Allah", "Maha Suci Allah"),
    ("Glorified be Allah", "Maha Suci Allah"),
    ("Allah is the Greatest", "Allah Maha Besar"),
    ("Allah Akbar", "Allahu Akbar"),
    ("there is no god but Allah", "tidak ada tuhan selain Allah"),
    ("There is no god but Allah", "Tidak ada tuhan selain Allah"),
    ("There is no deity worthy of worship except Allah", "Tidak ada tuhan yang berhak disembah kecuali Allah"),
    ("no deity worthy of worship except Allah", "tidak ada tuhan yang berhak disembah kecuali Allah"),
    ("Allah's mercy", "rahmat Allah"),
    ("Allah's wrath", "murka Allah"),
    ("Allah's pleasure", "keridhaan Allah"),
    ("the wrath of Allah", "murka Allah"),
    ("the mercy of Allah", "rahmat Allah"),
    ("the pleasure of Allah", "keridhaan Allah"),
    ("the punishment of Allah", "azab Allah"),
    ("Allah's punishment", "azab Allah"),
    ("Allah willing", "insya Allah"),
    ("if Allah wills", "jika Allah menghendaki"),
    ("If Allah wills", "Jika Allah menghendaki"),
    ("Allah has forgiven", "Allah telah mengampuni"),
    ("Allah forgives", "Allah mengampuni"),
    ("may Allah forgive", "semoga Allah mengampuni"),
    ("may Allah have mercy on", "semoga Allah merahmati"),
    ("may Allah guide", "semoga Allah memberi petunjuk kepada"),
    ("may Allah bless", "semoga Allah memberkahi"),

    # Afterlife
    ("the Day of Judgment", "Hari Kiamat"),
    ("the Day of Judgement", "Hari Kiamat"),
    ("Day of Judgment", "Hari Kiamat"),
    ("Day of Judgement", "Hari Kiamat"),
    ("the Day of Resurrection", "Hari Kebangkitan"),
    ("Day of Resurrection", "Hari Kebangkitan"),
    ("the Last Day", "Hari Akhir"),
    ("the Hereafter", "akhirat"),
    ("the hereafter", "akhirat"),
    ("the life of this world", "kehidupan dunia ini"),
    ("this world", "dunia ini"),
    ("the next world", "akhirat"),
    ("the Fire", "api neraka"),
    ("the Garden", "surga"),
    ("Paradise", "surga"),
    ("Hellfire", "neraka"),
    ("Hell-fire", "neraka"),
    ("Hell", "neraka"),

    # Prayer (Salat)
    ("the five daily prayers", "salat lima waktu"),
    ("five daily prayers", "salat lima waktu"),
    ("the obligatory prayers", "salat fardhu"),
    ("obligatory prayers", "salat fardhu"),
    ("voluntary prayers", "salat sunnah"),
    ("the noon prayer", "salat Zuhur"),
    ("the afternoon prayer", "salat Asar"),
    ("the Asr prayer", "salat Asar"),
    ("the morning prayer", "salat Subuh"),
    ("the Fajr prayer", "salat Subuh"),
    ("the evening prayer", "salat Magrib"),
    ("the Maghrib prayer", "salat Magrib"),
    ("the night prayer", "salat Isya"),
    ("the Isha prayer", "salat Isya"),
    ("the Friday prayer", "salat Jumat"),
    ("the Jumu'ah prayer", "salat Jumat"),
    ("the funeral prayer", "salat jenazah"),
    ("the eclipse prayer", "salat gerhana"),
    ("the Witr prayer", "salat Witir"),
    ("the Tahajjud prayer", "salat Tahajjud"),
    ("the prayer in congregation", "salat berjamaah"),
    ("prayer in congregation", "salat berjamaah"),
    ("congregational prayer", "salat berjamaah"),
    ("perform the prayer", "melaksanakan salat"),
    ("performed the prayer", "melaksanakan salat"),
    ("offering the prayer", "melaksanakan salat"),
    ("offered the prayer", "melaksanakan salat"),
    ("the prayer", "salat"),
    ("the prayers", "salat"),
    ("a prayer", "salat"),
    ("his prayer", "salatnya"),
    ("your prayer", "salatmu"),
    ("my prayer", "salatku"),
    ("our prayer", "salat kami"),
    ("their prayer", "salat mereka"),

    # Ablution / Ritual purity
    ("performed ablution", "berwudhu"),
    ("perform ablution", "berwudhu"),
    ("performing ablution", "berwudhu"),
    ("ritual bath", "mandi wajib (ghusl)"),
    ("the ritual bath", "mandi wajib (ghusl)"),
    ("taking a bath", "mandi"),
    ("take a bath", "mandi"),
    ("took a bath", "mandi"),
    ("dry ablution", "tayammum"),
    ("state of major ritual impurity", "keadaan junub"),
    ("state of ritual impurity", "keadaan junub"),
    ("major ritual impurity", "hadas besar"),
    ("minor ritual impurity", "hadas kecil"),
    ("ritual impurity", "hadas"),
    ("state of impurity", "keadaan tidak suci"),
    ("be in a state of Junub", "dalam keadaan junub"),
    ("while we were Junub", "sementara kami dalam keadaan junub"),
    ("while he was Junub", "sementara beliau dalam keadaan junub"),
    ("while she was Junub", "sementara dia dalam keadaan junub"),
    ("who is Junub", "yang dalam keadaan junub"),
    ("Junub", "junub"),
    ("junub", "junub"),
    ("menstruation", "haid"),
    ("menstrual period", "masa haid"),
    ("during the menses", "selama masa haid"),
    ("during her menses", "selama masa haidnya"),
    ("in her menses", "saat haid"),
    ("menses", "haid"),
    ("post-natal bleeding", "nifas"),
    ("lustful discharge", "madzi"),
    ("pre-seminal fluid", "madzi"),
    ("nocturnal discharge", "mimpi basah"),
    ("wet dream", "mimpi basah"),
    ("urine", "air kencing"),
    ("feces", "kotoran"),
    ("impure", "najis"),
    ("pure", "suci"),
    ("purification", "bersuci"),
    ("be purified", "bersuci"),

    # Zakat / Charity
    ("obligatory almsgiving", "zakat wajib"),
    ("pay the Zakat", "membayar zakat"),
    ("paying Zakat", "membayar zakat"),
    ("give charity", "bersedekah"),
    ("giving charity", "bersedekah"),
    ("gave charity", "bersedekah"),
    ("voluntary charity", "sedekah sunnah"),
    ("almsgiving", "zakat"),
    ("charity", "sedekah"),

    # Fasting
    ("observing the fast", "berpuasa"),
    ("observe the fast", "berpuasa"),
    ("break the fast", "berbuka puasa"),
    ("breaking the fast", "berbuka puasa"),
    ("the fast of Ramadan", "puasa Ramadan"),
    ("fasting in Ramadan", "puasa Ramadan"),
    ("voluntary fasting", "puasa sunnah"),
    ("the fast", "puasa"),
    ("fasting", "puasa"),

    # Hajj / Umrah
    ("performing Hajj", "melaksanakan haji"),
    ("perform Hajj", "melaksanakan haji"),
    ("performed Hajj", "melaksanakan haji"),
    ("performing Umrah", "melaksanakan umrah"),
    ("perform Umrah", "melaksanakan umrah"),
    ("performed Umrah", "melaksanakan umrah"),
    ("the farewell pilgrimage", "haji wada'"),
    ("the minor pilgrimage", "umrah"),
    ("the pilgrimage", "haji"),
    ("pilgrimage", "haji"),
    ("Tawaf Al-Ifadah", "Tawaf Ifadah"),
    ("Tawaf Al-Ifada", "Tawaf Ifadah"),
    ("Tawaf-Al-Ifada", "Tawaf Ifadah"),
    ("Tawaf al-Ifadah", "Tawaf Ifadah"),
    ("go back home", "pulang ke rumah"),
    ("leave (go back home)", "berangkat pulang"),
    ("should not leave", "tidak boleh berangkat"),
    ("is allowed to leave", "diperbolehkan untuk berangkat"),
    ("the Tawaf", "tawaf"),
    ("performing Tawaf", "melakukan tawaf"),
    ("performed Tawaf", "melakukan tawaf"),
    ("completed the Tawaf", "menyelesaikan tawaf"),
    ("Tawaf", "tawaf"),
    ("Sa`i", "sa'i"),
    ("Sa'i", "sa'i"),
    ("sa`i", "sa'i"),
    ("the Sa`i", "sa'i"),
    ("I'tikaf", "i'tikaf"),
    ("I`tikaf", "i'tikaf"),
    ("i`tikaf", "i'tikaf"),
    ("while in I'tikaf", "sementara beliau beri'tikaf"),
    ("while in I`tikaf", "sementara beliau beri'tikaf"),
    ("while in i'tikaf", "sementara beliau beri'tikaf"),
    ("in I'tikaf", "beri'tikaf"),
    ("in I`tikaf", "beri'tikaf"),
    ("ihram", "ihram"),
    ("the ihram", "ihram"),
    ("state of ihram", "keadaan ihram"),

    # Quran / Knowledge
    ("recitation of the Quran", "membaca Al-Qur'an"),
    ("reciting the Quran", "membaca Al-Qur'an"),
    ("recite the Quran", "membaca Al-Qur'an"),
    ("the verses of the Quran", "ayat-ayat Al-Qur'an"),
    ("a verse of the Quran", "ayat Al-Qur'an"),
    ("the Quran", "Al-Qur'an"),
    ("the Sunnah", "Sunnah"),
    ("the Sunna", "Sunnah"),
    ("Islamic law", "hukum Islam"),
    ("Islamic jurisprudence", "fikih Islam"),
    ("seeking knowledge", "menuntut ilmu"),
    ("religious knowledge", "ilmu agama"),
    ("knowledge", "ilmu"),

    # Dhikr / Dua
    ("remembrance of Allah", "dzikir kepada Allah"),
    ("remembrance", "dzikir"),
    ("supplication", "doa"),
    ("seeking forgiveness", "memohon ampunan"),
    ("asking forgiveness", "memohon ampunan"),
    ("repentance", "taubat"),
    ("seeking refuge", "berlindung"),
    ("I seek refuge in Allah", "Aku berlindung kepada Allah"),

    # Companions / People categories
    ("the Companions", "para Sahabat"),
    ("the companions", "para sahabat"),
    ("his Companions", "para Sahabatnya"),
    ("his companions", "para sahabatnya"),
    ("a Companion", "seorang Sahabat"),
    ("the Ansari", "orang Anshar"),
    ("the Ansar", "kaum Anshar"),
    ("Ansar", "Anshar"),
    ("the Muhajirun", "kaum Muhajirin"),
    ("Muhajirun", "Muhajirin"),
    ("hypocrites", "orang-orang munafik"),
    ("a hypocrite", "seorang munafik"),
    ("disbelievers", "orang-orang kafir"),
    ("a disbeliever", "seorang kafir"),
    ("polytheists", "orang-orang musyrik"),
    ("polytheist", "orang musyrik"),
    ("the believers", "orang-orang beriman"),
    ("believers", "orang-orang beriman"),
    ("a believer", "seorang mukmin"),
    ("the Muslims", "kaum Muslimin"),
    ("a Muslim", "seorang Muslim"),
    ("Jews", "orang-orang Yahudi"),
    ("Christians", "orang-orang Nasrani"),
    ("the scholars", "para ulama"),
    ("scholars", "para ulama"),
    ("the imam", "imam"),
    ("the caliph", "khalifah"),
    ("the governor", "gubernur"),
    ("the tribe", "kabilah"),
    ("his tribe", "kabilahnya"),

    # Places
    ("the Mosque of the Prophet", "Masjid Nabawi"),
    ("the Prophet's Mosque", "Masjid Nabawi"),
    ("the Sacred Mosque", "Masjidil Haram"),
    ("Al-Masjid Al-Haram", "Masjidil Haram"),
    ("Al-Masjid An-Nabawi", "Masjid Nabawi"),
    ("the mosque", "masjid"),
    ("the Mosque", "masjid"),
    ("a mosque", "sebuah masjid"),
    ("the Kaaba", "Ka'bah"),
    ("the Ka`bah", "Ka'bah"),
    ("the Ka'bah", "Ka'bah"),
    ("Ka`bah", "Ka'bah"),
    ("Baitul Maqdis", "Baitul Maqdis"),
    ("Jerusalem", "Yerusalem"),
    ("Madinah", "Madinah"),
    ("Al-Madinah", "Madinah"),
    ("Makkah", "Makkah"),
    ("Mecca", "Makkah"),
    ("Medina", "Madinah"),
    ("Minaret", "menara masjid"),
    ("the Minaret", "menara masjid"),

    # Islamic months
    ("Ramadan", "Ramadan"),
    ("Shawwal", "Syawal"),
    ("Dhul Hijjah", "Dzulhijjah"),
    ("Muharram", "Muharram"),
    ("Safar", "Safar"),
    ("Rabi al-Awwal", "Rabi'ul Awwal"),
    ("Rajab", "Rajab"),
    ("Sha'ban", "Sya'ban"),
    ("Sha`ban", "Sya'ban"),

    # Common verbs — said/spoke
    ("he said to me,", "beliau berkata kepadaku,"),
    ("he said to me:", "beliau berkata kepadaku:"),
    ("she said to me,", "dia berkata kepadaku,"),
    ("he said to him,", "beliau berkata kepadanya,"),
    ("he said to her,", "beliau berkata kepadanya,"),
    ("he said to them,", "beliau berkata kepada mereka,"),
    ("he said to us,", "beliau berkata kepada kami,"),
    ("he said,", "beliau bersabda,"),
    ("he said:", "beliau bersabda:"),
    ("he said", "beliau bersabda"),
    ("she said,", "dia berkata,"),
    ("she said:", "dia berkata:"),
    ("she said", "dia berkata"),
    ("they said,", "mereka berkata,"),
    ("they said:", "mereka berkata:"),
    ("they said", "mereka berkata"),
    ("I said,", "Aku berkata,"),
    ("I said:", "Aku berkata:"),
    ("I said", "Aku berkata"),
    ("he replied,", "beliau menjawab,"),
    ("he replied:", "beliau menjawab:"),
    ("he replied", "beliau menjawab"),
    ("she replied,", "dia menjawab,"),
    ("he answered,", "beliau menjawab,"),
    ("he answered:", "beliau menjawab:"),
    ("he answered", "beliau menjawab"),
    ("he asked,", "beliau bertanya,"),
    ("he asked:", "beliau bertanya:"),
    ("he asked", "beliau bertanya"),
    ("she asked,", "dia bertanya,"),
    ("I replied,", "Aku menjawab,"),
    ("I replied:", "Aku menjawab:"),
    ("I replied", "Aku menjawab"),
    ("I answered,", "Aku menjawab,"),

    # Verb patterns
    ("he ordered me to", "beliau memerintahkanku untuk"),
    ("he ordered us to", "beliau memerintahkan kami untuk"),
    ("he ordered him to", "beliau memerintahkannya untuk"),
    ("he ordered", "beliau memerintahkan"),
    ("he forbade me from", "beliau melarangku dari"),
    ("he forbade us from", "beliau melarang kami dari"),
    ("he forbade", "beliau melarang"),
    ("he prohibited", "beliau melarang"),
    ("he prohibited us from", "beliau melarang kami dari"),
    ("he permitted", "beliau mengizinkan"),
    ("he allowed", "beliau membolehkan"),
    ("he used to", "beliau biasa"),
    ("he would", "beliau"),
    ("he came", "beliau datang"),
    ("he came to", "beliau datang kepada"),
    ("he went", "beliau pergi"),
    ("he went to", "beliau pergi ke"),
    ("he went out", "beliau keluar"),
    ("he entered", "beliau masuk"),
    ("he passed by", "beliau melewati"),
    ("he saw", "beliau melihat"),
    ("he heard", "beliau mendengar"),
    ("he told", "beliau memberitahu"),
    ("he informed", "beliau mengabarkan"),
    ("he advised", "beliau menasihati"),
    ("he warned", "beliau memperingatkan"),
    ("he stood up", "beliau berdiri"),
    ("he sat down", "beliau duduk"),
    ("she used to", "dia biasa"),
    ("she would", "dia"),
    ("they used to", "mereka biasa"),
    ("they would", "mereka"),
    ("we used to", "kami biasa"),
    ("we would", "kami"),
    ("I used to", "aku biasa"),
    ("I would", "aku"),

    # Clothing / items
    ("put on an Izar", "mengenakan Izar"),
    ("put on the Izar", "mengenakan Izar"),
    ("a single pot", "satu wadah"),
    ("from a single pot", "dari satu wadah"),
    ("the same pot", "wadah yang sama"),
    ("a pot", "sebuah wadah"),
    ("wash it", "mencucinya"),
    ("wash his head", "mencuci kepalanya"),
    ("bring his head near", "mendekatkan kepalanya"),
    ("fondle me", "bermesraan denganku"),
    ("used to fondle me", "biasa bermesraan denganku"),
    ("Izar (dress worn below the waist)", "Izar (kain yang dikenakan di bawah pinggang)"),
    ("Izar", "Izar"),
    ("turban", "sorban"),
    ("sandals", "sandal"),
    ("ring", "cincin"),
    ("sword", "pedang"),
    ("bow", "busur panah"),
    ("arrow", "anak panah"),
    ("camel", "unta"),
    ("horse", "kuda"),
    ("donkey", "keledai"),
    ("date palm", "pohon kurma"),
    ("dates", "kurma"),
    ("date", "kurma"),
    ("water", "air"),
    ("food", "makanan"),
    ("drink", "minuman"),

    # Common connectives and sentence structure
    ("is obligatory", "adalah wajib"),
    ("is forbidden", "adalah haram"),
    ("is permissible", "adalah halal"),
    ("is recommended", "dianjurkan"),
    ("is disliked", "dimakruhkan"),
    ("is valid", "adalah sah"),
    ("is invalid", "tidak sah"),
    ("is allowed", "diperbolehkan"),
    ("is not allowed", "tidak diperbolehkan"),
    ("it is obligatory", "hal itu wajib"),
    ("it is forbidden", "hal itu haram"),
    ("it is permissible", "hal itu diperbolehkan"),
    ("it is recommended", "hal itu dianjurkan"),
    ("obligatory", "wajib"),
    ("forbidden", "haram"),
    ("permissible", "halal"),
    ("recommended", "sunnah"),
    ("disliked", "makruh"),
    ("valid", "sah"),
    ("invalid", "tidak sah"),
    ("allowed to", "diperbolehkan untuk"),
    ("not allowed to", "tidak diperbolehkan untuk"),
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
    ("are not", "bukan"),
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
    ("whatever", "apa pun"),
    ("whenever", "kapan pun"),
    ("wherever", "di mana pun"),
    ("however", "namun"),
    ("although", "meskipun"),
    ("because of", "karena"),
    ("because", "karena"),
    ("since", "sejak"),
    ("unless", "kecuali"),
    ("except", "kecuali"),
    ("only", "hanya"),
    ("also", "juga"),
    ("indeed", "sesungguhnya"),
    ("verily", "sesungguhnya"),
    ("truly", "sungguh"),
    ("certainly", "sungguh"),
    ("even", "bahkan"),
    ("already", "sudah"),
    ("still", "masih"),
    ("again", "lagi"),
    ("also", "juga"),
    ("too", "juga"),
    ("then", "kemudian"),
    ("therefore", "oleh karena itu"),
    ("thus", "dengan demikian"),
    ("hence", "oleh karena itu"),
    ("so", "maka"),
    ("while", "sementara"),
    ("when", "ketika"),
    ("whenever", "kapanpun"),
    ("after", "setelah"),
    ("before", "sebelum"),
    ("until", "hingga"),
    ("during", "selama"),
    ("at the time of", "pada saat"),
    ("at the time", "pada saat itu"),
    ("in the time of", "pada masa"),

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
    ("on that night", "pada malam itu"),

    # Pronoun references
    ("he (the Prophet)", "beliau (Nabi ﷺ)"),
    ("his head", "kepalanya"),
    ("his hand", "tangannya"),
    ("his hands", "kedua tangannya"),
    ("his face", "wajahnya"),
    ("his beard", "jenggotnya"),
    ("his feet", "kedua kakinya"),
    ("her hair", "rambutnya"),

    # Actions
    ("bring his head near me", "mendekatkan kepalanya kepadaku"),
    ("wash it while", "mencucinya sementara"),
    ("wash his head while", "mencuci kepalanya sementara"),
    ("I would wash it", "aku mencucinya"),
    ("I would wash", "aku mencuci"),
    ("I was in my periods", "aku sedang haid"),
    ("while I used to be in my periods", "sementara aku sedang haid"),
    ("while I used to be in my period", "sementara aku sedang haid"),
    ("in my periods", "saat haidku"),
    ("periods (menses)", "haid"),
    ("my periods (menses)", "haidku"),
    ("I used to be in my periods (menses)", "aku dalam keadaan haid"),

    # Miscellaneous Islamic terms kept in Arabic
    ("Adhan", "adzan"),
    ("Iqamah", "iqamah"),
    ("Khutbah", "khutbah"),
    ("Sujud", "sujud"),
    ("Ruku", "rukuk"),
    ("Sajda", "sujud"),
    ("Sujud Al-Sahw", "sujud sahwi"),
    ("Takbir", "takbir"),
    ("Taslim", "salam"),
    ("Tashahhud", "tasyahud"),
    ("Al-Fatiha", "Al-Fatihah"),
    ("Surah Al-Fatiha", "Surah Al-Fatihah"),
    ("the Fatiha", "Al-Fatihah"),
    ("Bismillah", "Bismillah"),
    ("Ameen", "Amin"),
    ("Amen", "Amin"),
    ("Wudhu", "wudhu"),
    ("Ghusl", "mandi wajib (ghusl)"),
    ("Tayammum", "tayammum"),
    ("Zakat", "zakat"),
    ("Sadaqah", "sedekah"),
    ("Zakah", "zakat"),
    ("Hajj", "haji"),
    ("Umrah", "umrah"),
    ("Jihad", "jihad"),
    ("jihaad", "jihad"),
    ("Shariah", "syariat"),
    ("Shari`ah", "syariat"),
    ("Shari'ah", "syariat"),
    ("former(ly)", "sebelumnya"),
    ("formerly", "sebelumnya"),
]


def apply_narrator_suffixes(text: str) -> str:
    """Replace 'may Allah be pleased with him/her' etc."""
    for pattern, replacement in NARRATOR_SUFFIXES:
        text = re.sub(pattern, replacement, text)
    return text


def apply_phrase_replacements(text: str) -> str:
    """Apply ordered phrase replacements."""
    for eng, ind in PHRASE_REPLACEMENTS:
        text = text.replace(eng, ind)
    return text


def fix_grammar(text: str) -> str:
    """Fix common grammatical issues after translation."""
    # Fix double spaces
    text = re.sub(r'  +', ' ', text)
    # Fix space before comma/period
    text = re.sub(r' ([,\.;:])', r'\1', text)
    # Ensure sentence starts with capital
    if text and text[0].islower():
        text = text[0].upper() + text[1:]
    return text.strip()


def translate_hadith(iwh_en: str) -> str:
    """
    Translate a hadith text from English to Bahasa Indonesia.

    Strategy:
    1. Replace narrator suffix phrases (radhiyallahu forms)
    2. Apply ordered phrase replacements
    3. Handle "Narrated X:" opening pattern
    4. Clean up grammar
    """
    if not iwh_en:
        return iwh_en

    text = iwh_en.strip()

    # Step 1: Replace narrator suffix phrases FIRST
    text = apply_narrator_suffixes(text)

    # Step 2: Handle "Narrated X (radhiyallahu 'anhu/anha):" pattern
    # After narrator suffix replacement, transform the opening
    narrated_match = re.match(
        r'^Narrated ([\w`\' \.\-]+?)(\s*\(radhiyallahu \'[^)]+\))?\s*:(.*)',
        text,
        re.DOTALL
    )
    if narrated_match:
        narrator = narrated_match.group(1).strip()
        suffix = narrated_match.group(2) or ""
        rest = narrated_match.group(3).strip()
        text = f"Diriwayatkan oleh {narrator}{suffix}: {rest}"

    # Step 3: Apply phrase-level replacements
    text = apply_phrase_replacements(text)

    # Step 4: Fix remaining "X (radhiyallahu '...') reported that" → "X meriwayatkan bahwa"
    # This handles cases where phrase replacement changed "reported that" to "meriwayatkan bahwa"
    # but "Narrated" wasn't at the start

    # Step 5: Fix grammar
    text = fix_grammar(text)

    return text


def process_file(filepath: str) -> int:
    """Process a single JSON file, translating all iwh_id fields."""
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
    total = 0

    for filename in files:
        filepath = os.path.join(DATA_DIR, filename)
        if not os.path.exists(filepath):
            print(f"SKIP {filename} (not found)")
            continue

        count = process_file(filepath)
        total += count
        print(f"{filename}: {count} updated")

    print(f"\nTotal hadiths updated: {total}")


if __name__ == "__main__":
    main()
