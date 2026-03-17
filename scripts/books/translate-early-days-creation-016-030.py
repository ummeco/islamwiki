#!/usr/bin/env python3
"""
Translate early-days-creation chapters 016-030 to Indonesian.
Book: Al-Bidayah wan-Nihayah by Ibn Katheer.
Topics: Heavens/stars, angels (Harut/Marut, Israfil, Munkar/Nakir), jinn, Iblis/shaytan, creation of Adam.
"""
import json
from pathlib import Path

BOOK_DIR = Path('/Users/admin/Sites/ummeco/islamwiki/web/data/books/early-days-creation')

translations = {}

# ============================================================
# Chapter 016 — The heavens: spherical, orbits, the sun's journey
# ============================================================
translations['016'] = {
    'title_id': 'Bagian 16',
    'content_id': (
        '<p>para ulama telah melaporkan bahwa terdapat konsensus di antara para ulama bahwa langit-langit '
        'itu berbentuk bulat, dan apa yang mendukung hal itu adalah firman-Nya: <em>(Masing-masing beredar '
        'pada garis edarnya.)</em> (Surah Yasin 36:40). Al-Hasan berkata: &ldquo;Mereka berputar.&rdquo; '
        'Ibn \'Abbas (ra) berkata: &ldquo;Pada orbitnya, seperti putaran sebuah kincir.&rdquo; Mereka '
        'berkata: &ldquo;Hal ini dibuktikan oleh fakta bahwa matahari terbenam setiap malam kemudian '
        'terbit pada akhirnya dari timur.&rdquo; Sebagaimana Umayyah Ibn Abi Ash-Shalt berkata dalam '
        'syairnya:</p>'
        '<p><em>Matahari terbit di setiap akhir malam,<br>'
        'Merah dan merona di tempat terbitnya.</em></p>'
        '<p>Berdasarkan hadis yang diriwayatkan oleh Al-Bukhari dari Abu Dzar (ra): Rasulullah ﷺ bersabda '
        'kepada Abu Dzar ketika matahari terbenam: &ldquo;Tahukah kamu ke mana matahari itu pergi?&rdquo; '
        'Aku menjawab: &ldquo;Allah dan Rasul-Nya yang lebih mengetahui.&rdquo; Beliau bersabda: '
        '&ldquo;Sesungguhnya matahari itu pergi hingga bersujud di bawah \'Arsy, kemudian ia meminta '
        'izin maka diizinkanlah baginya; dan hampir tiba masanya matahari itu bersujud namun tidak '
        'diterima, ia meminta izin namun tidak diizinkan, maka diperintahkan kepadanya: \'Kembalilah '
        'dari tempat kamu datang!\' Maka ia pun terbit dari barat. Itulah yang dimaksud dengan firman '
        'Allah: <em>(Dan matahari berjalan di tempat peredarannya. Demikianlah ketetapan Yang Maha '
        'Perkasa lagi Maha Mengetahui.)</em> (Surah Yasin 36:38)&rdquo;</p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Dan matahari dan bulan dan bintang-bintang '
        'tunduk di bawah perintah-Nya.)</em> (Surah Al-A\'raf 7:54) Allah Yang Maha Tinggi juga '
        'berfirman: <em>(Dan Dia menundukkan matahari dan bulan, masing-masing berjalan sampai '
        'kepada waktu yang ditentukan.)</em> (Surah Ar-Ra\'d 13:2)</p>'
        '<p>Adapun bulan, Allah Yang Maha Tinggi berfirman: <em>(Dia-lah yang menjadikan matahari '
        'bersinar dan bulan bercahaya, dan ditetapkan-Nya tempat-tempat bagi perjalanan bulan itu, '
        'supaya kamu mengetahui bilangan tahun dan perhitungan.)</em> (Surah Yunus 10:5)</p>'
        '<p>Adapun bintang-bintang, Allah Yang Maha Tinggi berfirman: <em>(Sesungguhnya Kami telah '
        'menghiasi langit yang terdekat dengan hiasan, yaitu bintang-bintang, dan telah Kami jaga '
        '(sebenar-benarnya) dengan setiap syaitan yang sangat durhaka.)</em> (Surah Ash-Shaffat 37:6-7) '
        'Ini menunjukkan bahwa bintang-bintang diciptakan Allah untuk tiga tujuan: sebagai hiasan langit, '
        'sebagai pelempar syaitan yang mencuri dengar, dan sebagai petunjuk arah bagi musafir di darat '
        'dan laut.</p>'
        '<p>Para ulama berbeda pendapat tentang apakah matahari, bulan, dan bintang-bintang berada di '
        'langit pertama ataukah tersebar di berbagai lapisan langit. Yang lebih tepat berdasarkan '
        'ayat-ayat Al-Quran adalah bahwa bintang-bintang yang dapat kita lihat berada di langit '
        'pertama (langit terendah). Dan Allah lebih mengetahui.</p>'
    ),
}

# ============================================================
# Chapter 017 — Stars: fixed and wandering; the seven heavens and their contents
# ============================================================
translations['017'] = {
    'title_id': 'Bagian 17',
    'content_id': (
        '<p>seperti bintang-bintang tetap, dan mereka — menurut sebagian ulama — berada di langit '
        'kedelapan yang dikenal dalam bahasa banyak ulama kemudian sebagai Al-Kursi. Ulama lain '
        'menolak hal ini, mengatakan bahwa semua planet berada di langit terendah dan tidak ada '
        'keberatan terhadap pandangan bahwa sebagian di antaranya berada di atas yang lain. '
        'Mungkin dikatakan bahwa ada dalil untuk pandangan ini dalam firman Allah Yang Maha Tinggi: '
        '<em>(Dan sesungguhnya Kami telah menghiasi langit yang terdekat dengan pelita-pelita.)</em> '
        '(Surah Al-Mulk 67:5), dan dalam firman-Nya Yang Maha Tinggi: <em>(Kemudian Dia '
        'menyempurnakan tujuh langit dalam dua hari, dan Dia menetapkan di setiap langit '
        'urusannya masing-masing.)</em> (Surah Fussilat 41:12)</p>'
        '<p>Para penghuni tujuh langit adalah para malaikat yang bertasbih memuji Allah siang dan '
        'malam tanpa henti. Setiap langit penuh dengan para malaikat, sebagaimana disebutkan '
        'dalam hadis tentang Isra\' Mi\'raj, di mana Nabi ﷺ melihat para malaikat di setiap langit.</p>'
        '<p>Di langit pertama, Nabi ﷺ bertemu dengan Nabi Adam (as). Di langit kedua, beliau '
        'bertemu dengan Nabi Yahya (as) dan Nabi Isa (as). Di langit ketiga, beliau bertemu '
        'dengan Nabi Yusuf (as). Di langit keempat, beliau bertemu dengan Nabi Idris (as). '
        'Di langit kelima, beliau bertemu dengan Nabi Harun (as). Di langit keenam, beliau '
        'bertemu dengan Nabi Musa (as). Di langit ketujuh, beliau bertemu dengan Nabi Ibrahim (as).</p>'
        '<p>Di atas langit ketujuh terdapat Al-Bayt Al-Ma\'mur, yaitu Ka\'bah langit yang '
        'dikunjungi tujuh puluh ribu malaikat setiap harinya dan mereka tidak kembali ke sana lagi. '
        'Di atasnya lagi terdapat Al-Kursi, dan di atasnya \'Arsy Allah \'Azza wa Jalla.</p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Dia mengatur urusan dari langit ke bumi, '
        'kemudian (urusan) itu naik kepada-Nya dalam satu hari yang kadarnya adalah seribu '
        'tahun menurut perhitunganmu.)</em> (Surah As-Sajdah 32:5) Ini menunjukkan betapa '
        'agungnya ciptaan Allah dan betapa besar jarak antara langit dan bumi.</p>'
        '<p>Adapun Al-Bayt Al-Ma\'mur, Nabi ﷺ bersabda dalam hadis sahih: &ldquo;Kemudian aku '
        'dibawa ke Al-Bayt Al-Ma\'mur. Setiap hari tujuh puluh ribu malaikat masuk ke dalamnya '
        'untuk shalat, dan mereka tidak kembali lagi ke sana setelah itu.&rdquo; (HR. Bukhari '
        'dan Muslim) Ini menunjukkan besarnya jumlah malaikat yang Allah ciptakan untuk '
        'beribadah kepada-Nya.</p>'
    ),
}

# ============================================================
# Chapter 018 — Harut and Marut; angels' stories
# ============================================================
translations['018'] = {
    'title_id': 'Bagian 18',
    'content_id': (
        '<p>mengenai kisah Harut dan Marut, bahwa Az-Zuhrah adalah seorang wanita yang mereka '
        'coba untuk merayu, namun ia menolak kecuali jika mereka setuju untuk mengajarkannya '
        'Nama Terbesar (Allah), yang mereka pun lakukan. Lalu ia mengucapkannya dan naik ke '
        'langit dan menjadi sebuah planet. Aku percaya bahwa ini termasuk dari Isra\'iliyyat, '
        'meskipun mungkin telah diriwayatkan oleh Ka\'b Al-Ahbar dan diteruskan darinya oleh '
        'sekelompok orang dari kalangan Salaf, yang menyampaikannya sebagai kisah dari Bani Isra\'il.</p>'
        '<p><strong>Bagian tentang Apa yang Telah Dikatakan Mengenai</strong></p>'
        '<p>Abu Al-Qasim Ath-Thabarani meriwayatkan dari \'Abdullah Ibn \'Abbas (ra) bahwa '
        'Heraclius menulis kepada Mu\'awiyah (ra) dan berkata: &ldquo;Jika masih ada di antara '
        'mereka seseorang yang...&rdquo;</p>'
        '<p>Adapun kisah Harut dan Marut yang disebutkan dalam Al-Quran, Allah Yang Maha Tinggi '
        'berfirman: <em>(Dan mereka mengikuti apa yang dibaca oleh syaitan-syaitan pada masa '
        'kerajaan Sulaiman (dan mereka mengatakan bahwa Sulaiman itu mengerjakan sihir), padahal '
        'Sulaiman tidak kafir, akan tetapi syaitan-syaitanlah yang kafir (mengerjakan sihir). '
        'Mereka mengajarkan sihir kepada manusia dan apa yang diturunkan kepada dua orang malaikat '
        'di negeri Babilon yaitu Harut dan Marut, sedang keduanya tidak mengajarkan sesuatu '
        'kepada seorang pun sebelum mengatakan: &ldquo;Sesungguhnya kami hanya cobaan bagimu, '
        'sebab itu janganlah kamu kafir.&rdquo;)</em> (Surah Al-Baqarah 2:102)</p>'
        '<p>Para ulama berbeda pendapat tentang siapa Harut dan Marut: apakah keduanya adalah '
        'malaikat yang sesungguhnya ataukah mereka adalah manusia yang dijuluki malaikat. '
        'Pendapat yang paling kuat adalah bahwa mereka berdua adalah malaikat sesungguhnya '
        'yang Allah turunkan ke bumi sebagai ujian dan cobaan bagi manusia, untuk mengajarkan '
        'ilmu sihir agar manusia dapat membedakannya dari mukjizat para nabi.</p>'
        '<p>Yang penting dari kisah ini adalah pelajaran bahwa sihir adalah haram dan termasuk '
        'kekufuran, dan bahwa siapa pun yang mempelajari sihir untuk menggunakannya telah '
        'melakukan dosa besar. Allah Yang Maha Tinggi berfirman: <em>(Dan mereka mempelajari '
        'dari keduanya (Harut dan Marut) apa yang menimbulkan perpisahan antara seorang suami '
        'dengan istrinya. Dan mereka itu tidaklah memberi mudarat dengan sihirnya kepada '
        'seorangpun, kecuali dengan izin Allah.)</em> (Surah Al-Baqarah 2:102)</p>'
        '<p>Ini menunjukkan bahwa meskipun sihir itu nyata dan dapat memberikan pengaruh, '
        'namun pengaruh tersebut hanya terjadi dengan izin Allah, bukan dengan kekuatan '
        'si penyihir sendiri. Dan barang siapa yang berlindung kepada Allah dengan dzikir-dzikir '
        'yang sahih, maka Allah akan melindunginya dari sihir. Semoga Allah melindungi kita '
        'semua dari sihir dan segala bentuk kejahatan.</p>'
    ),
}

# ============================================================
# Chapter 019 — Angels: Gabriel's form, wings; the angels of the people of Lut
# ============================================================
translations['019'] = {
    'title_id': 'Bagian 19',
    'content_id': (
        '<p>bahwa para malaikat itu muncul dalam wujud laki-laki yang tampan sebagai ujian dan '
        'cobaan, sehingga hujjah dapat ditegakkan terhadap kaum Nabi Lut (as), dan Allah akan '
        'menimpakan kepada mereka azab Allah, Yang Maha Perkasa, Yang Maha Kuasa. Demikian pula, '
        'Malaikat Jibril (as) biasa datang kepada Nabi ﷺ dalam berbagai wujud; terkadang beliau '
        'datang kepadanya dalam wujud Dihyah Ibn Khalifah Al-Kalbi, terkadang dalam wujud seorang '
        'laki-laki Badui, dan terkadang dalam wujud aslinya. Beliau (Jibril) memiliki enam ratus '
        'sayap, dan jarak antara setiap sayap adalah seperti jarak antara timur dan barat. '
        'Nabi ﷺ melihatnya dalam wujud ini pada dua kesempatan: pertama di muka bumi '
        '(sebagaimana disebutkan dalam Surah An-Najm), dan kedua di Sidratul Muntaha pada '
        'malam Isra\' Mi\'raj.</p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Dan sesungguhnya Muhammad telah melihat '
        'Jibril itu (dalam rupanya yang asli) pada waktu yang lain, yaitu di Sidratul Muntaha '
        'yang di dekatnya ada surga tempat tinggal.)</em> (Surah An-Najm 53:13-15)</p>'
        '<p>Para malaikat memiliki berbagai tugas dan tanggung jawab. Di antaranya ada yang '
        'bertanggung jawab untuk menyampaikan wahyu, ada yang bertanggung jawab untuk hujan '
        'dan tumbuh-tumbuhan, ada yang bertanggung jawab untuk mencabut nyawa, ada yang '
        'bertanggung jawab untuk menjaga dan melindungi manusia, dan ada yang senantiasa '
        'bertasbih memuji Allah siang dan malam tanpa henti.</p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Yang menjadikan malaikat sebagai utusan-utusan '
        'yang mempunyai sayap, masing-masing ada yang dua, tiga, dan empat sayap. Allah '
        'menambahkan pada ciptaan-Nya apa yang dikehendaki-Nya.)</em> (Surah Fathir 35:1)</p>'
        '<p>Malaikat adalah makhluk yang diciptakan dari cahaya, sebagaimana disebutkan dalam '
        'hadis sahih yang diriwayatkan oleh Imam Muslim dari \'Aisyah (ra), bahwa Nabi ﷺ bersabda: '
        '&ldquo;Malaikat diciptakan dari cahaya, jin diciptakan dari api yang menyala-nyala, '
        'dan Adam (as) diciptakan dari apa yang telah disebutkan kepada kalian.&rdquo;</p>'
        '<p>Para malaikat senantiasa taat kepada Allah dan tidak pernah mendurhakai-Nya. Allah '
        'Yang Maha Tinggi berfirman: <em>(Malaikat-malaikat itu tidak mendurhakai Allah terhadap '
        'apa yang diperintahkan-Nya kepada mereka dan selalu mengerjakan apa yang diperintahkan.)</em> '
        '(Surah At-Tahrim 66:6) Ini adalah sifat dasar malaikat yang membedakan mereka dari jin '
        'dan manusia yang diberikan pilihan antara taat dan durhaka.</p>'
        '<p>Kita wajib mengimani para malaikat sebagaimana disebutkan dalam Al-Quran dan Sunnah, '
        'tanpa melampaui batas dan tanpa mengurangi. Ini adalah bagian dari iman yang wajib '
        'diyakini setiap Muslim.</p>'
    ),
}

# ============================================================
# Chapter 020 — Angels: Ar-Ruh, the angels and their ranks
# ============================================================
translations['020'] = {
    'title_id': 'Bagian 20',
    'content_id': (
        '<p>(Surah An-Naba\' 78:38) Yang dimaksud dengan Ar-Ruh di sini adalah umat manusia, '
        'menurut \'Abdullah Ibn \'Abbas (ra), Al-Hasan, dan Qatadah. Ada pula yang berpendapat '
        'bahwa itu berarti sekelompok malaikat yang menyerupai manusia dalam penampilannya. '
        'Ini juga dikatakan oleh \'Abdullah Ibn \'Abbas (ra), Mujahid, Abu Shalih, dan Al-A\'masy. '
        'Ada pula yang mengatakan bahwa itu merujuk kepada Jibril. Ini adalah pendapat '
        'Asy-Sya\'bi, Sa\'id Ibn Jubair, dan Ad-Dhahhak. Ada pula yang mengatakan bahwa itu '
        'merujuk kepada malaikat yang dikenal sebagai Ar-Ruh, yang bertanggung jawab atas '
        'seluruh umat manusia. \'Ali Ibn Abi Thalhah meriwayatkan dari \'Abdullah Ibn \'Abbas (ra) '
        'bahwa beliau berkata mengenai firman Allah Yang Maha Tinggi: <em>(Pada hari Ar-Ruh dan '
        'para malaikat berdiri bershaf)</em> bahwa itu adalah salah satu dari malaikat-malaikat '
        'besar yang diciptakan Allah \'Azza wa Jalla.</p>'
        '<p>Yang paling kuat di antara pendapat-pendapat ini adalah bahwa Ar-Ruh yang disebutkan '
        'dalam ayat tersebut adalah Malaikat Jibril (as), karena penyebutannya secara terpisah '
        'dari para malaikat menunjukkan keistimewaan dan kedudukan yang tinggi, sebagaimana '
        'dalam firman Allah: <em>(Dan (ingatlah) ketika Tuhanmu berfirman kepada para malaikat: '
        '&ldquo;Sesungguhnya Aku menciptakan manusia dari tanah liat.&rdquo;)</em> dan kemudian '
        'disebutkan Iblis secara terpisah, ini menunjukkan keistimewaan.</p>'
        '<p><strong>Malaikat-Malaikat yang Memikul \'Arsy dan Para Malaikat Muqarrabun</strong></p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Dan para malaikat berada di penjuru-penjuru '
        'langit. Dan pada hari itu delapan malaikat menjunjung \'Arsy Tuhanmu di atas kepala '
        'mereka.)</em> (Surah Al-Haqqah 69:17)</p>'
        '<p>Para malaikat pemikul \'Arsy adalah di antara malaikat yang paling agung. Tentang '
        'salah satu di antara mereka, Nabi ﷺ bersabda: &ldquo;Diizinkan bagiku untuk '
        'menceritakan tentang salah satu malaikat pemikul \'Arsy Allah: jarak antara daun '
        'telinganya hingga bahunya adalah perjalanan tujuh ratus tahun.&rdquo;</p>'
        '<p>Adapun malaikat-malaikat muqarrabun (yang didekatkan kepada Allah), mereka adalah '
        'para malaikat yang paling utama dan paling dekat kepada Allah \'Azza wa Jalla. '
        'Di antara mereka adalah Jibril (as), Mikail (as), dan Israfil (as). Israfil adalah '
        'malaikat yang bertugas meniup sangkakala (ash-shur) pada hari Kiamat. Sekarang ini, '
        'beliau senantiasa memperhatikan \'Arsy, menunggu perintah Allah untuk meniup sangkakala.</p>'
        '<p>Nabi ﷺ bersabda dalam hadis sahih: &ldquo;Bagaimana aku bisa bersenang-senang, '
        'sementara pemegang sangkakala telah menempatkan sangkakala itu di bibirnya, '
        'menundukkan keningnya, dan menunggu kapan diperintahkan untuk meniupnya.&rdquo; '
        'Para sahabat bertanya: &ldquo;Lalu apa yang harus kami katakan, ya Rasulullah?&rdquo; '
        'Beliau bersabda: &ldquo;Katakanlah: \'Hasbunallah wa ni\'mal wakil, \'alallahi tawakalna.\'&rdquo;</p>'
        '<p>Ini adalah pengingat bagi kita agar selalu siap menghadapi kematian dan Hari Kiamat, '
        'dan agar tidak terlena oleh kesenangan dunia yang fana. Semoga Allah menjadikan kita '
        'orang-orang yang senantiasa mengingat akhirat.</p>'
    ),
}

# ============================================================
# Chapter 021 — Israfil; the angel of death; questioning in the grave
# ============================================================
translations['021'] = {
    'title_id': 'Bagian 21',
    'content_id': (
        '<p>aku dan aku berkata: &ldquo;Seorang nabi-hamba.&rdquo; Kemudian malaikat itu naik ke '
        'langit dan aku berkata: &ldquo;Wahai Jibril! Aku ingin bertanya kepadamu tentang ini, '
        'namun aku melihat dalam ekspresimu sesuatu yang menghalangiku dari bertanya. Jadi, '
        'siapakah itu, wahai Jibril?&rdquo; Beliau berkata: &ldquo;Itu adalah Israfil. Pada '
        'hari Allah menciptakannya, Dia menciptakannya di hadapan-Nya, dengan kedua kakinya '
        'merapat dan dia tidak mengangkat pandangannya. Antara dia dan Tuhan terdapat tujuh '
        'puluh cahaya, dan setiap kali salah satu di antaranya mendekat kepadanya, cahaya itu '
        'akan padam. Di hadapannya terdapat sebuah lembaran, dan setiap kali Allah memerintahkan '
        'sesuatu di langit atau di bumi, lembaran itu diangkat ke dahinya dan ia menatapnya. '
        'Jika itu termasuk salah satu dari peristiwa-peristiwa besar, ia akan melipatnya...&rdquo;</p>'
        '<p>Ini diriwayatkan oleh Al-Hafiz Ibn \'Asakir dalam tarikh-nya, namun sanadnya mengandung '
        'kelemahan, dan Allah lebih mengetahui.</p>'
        '<p><strong>Malaikat Maut (\'Izra\'il)</strong></p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Katakanlah, &ldquo;Malaikat maut yang diserahi '
        'untuk mencabut nyawa kamu akan mematikan kamu; kemudian hanya kepada Tuhanmulah kamu '
        'akan dikembalikan.&rdquo;)</em> (Surah As-Sajdah 32:11)</p>'
        '<p>Malaikat maut adalah malaikat yang bertugas mencabut ruh-ruh manusia ketika ajal '
        'mereka tiba. Beliau memiliki para pembantu dari malaikat-malaikat lainnya yang membantu '
        'dalam tugas tersebut. Allah Yang Maha Tinggi berfirman: <em>(Dan Dia-lah Yang Maha Kuasa '
        'atas sekalian hamba-Nya, dan diutus-Nya kepadamu malaikat-malaikat penjaga, sehingga '
        'apabila datang kematian kepada salah seorang di antara kamu, ia diwafatkan oleh '
        'malaikat-malaikat Kami, dan malaikat-malaikat Kami itu tidak melalaikan kewajibannya.)</em> '
        '(Surah Al-An\'am 6:61)</p>'
        '<p>Cara pencabutan ruh berbeda-beda tergantung kepada amal perbuatan orang tersebut. '
        'Bagi orang yang beriman dan beramal shalih, ruhnya dicabut dengan lembut dan mudah. '
        'Bagi orang yang kafir atau fasiq, ruhnya dicabut dengan kasar dan menyakitkan. '
        'Allah Yang Maha Tinggi berfirman: <em>(Dan alangkah dahsyatnya sekiranya kamu melihat '
        'di waktu orang-orang yang zalim berada dalam tekanan sakratul maut, sedang para '
        'malaikat memukul dengan tangannya.)</em> (Surah Al-An\'am 6:93)</p>'
        '<p>Setelah kematian, ruh dibawa ke hadapan Allah. Jika ruh itu beriman, ia akan '
        'disambut dengan selamat datang dan dibawa naik ke langit. Jika ruh itu kafir, pintu '
        'langit tidak akan dibuka untuknya dan ia akan dikembalikan ke bumi. Ini disebutkan '
        'dalam hadis panjang tentang perjalanan ruh setelah kematian yang diriwayatkan oleh '
        'Imam Ahmad dan Abu Dawud.</p>'
    ),
}

# ============================================================
# Chapter 022 — Questions in the grave: Munkar and Nakir
# ============================================================
translations['022'] = {
    'title_id': 'Bagian 22',
    'content_id': (
        '<p>telah disebutkan berkali-kali mengenai pertanyaan-pertanyaan di dalam kubur, dan kami '
        'telah mencatatnya dengan firman Allah: <em>(Allah meneguhkan iman orang-orang yang '
        'beriman dengan ucapan yang teguh itu dalam kehidupan di dunia dan di akhirat; dan Allah '
        'menyesatkan orang-orang yang zalim dan memperbuat apa yang Dia kehendaki.)</em> '
        '(Surah Ibrahim 14:27). Mereka bertanggung jawab atas ujian kubur dan diberi tanggung '
        'jawab untuk menanyai penghuni kubur tentang Tuhannya, agamanya, dan nabinya, serta '
        'mereka menguji orang-orang yang baik maupun orang-orang yang berdosa.</p>'
        '<p>Mereka memiliki wajah yang menakutkan dan suara yang keras. Namun bagi orang yang '
        'beriman, Allah meneguhkannya dengan jawaban yang benar sehingga ia dapat menjawab '
        'dengan baik. Adapun orang yang kafir atau munafik, ia tidak dapat menjawab pertanyaan '
        'tersebut dan akan menderita azab kubur.</p>'
        '<p>Nabi ﷺ bersabda dalam hadis sahih yang diriwayatkan oleh Al-Bukhari dan Muslim: '
        '&ldquo;Sesungguhnya apabila seorang hamba yang beriman hampir meninggal dunia dan '
        'akan menghadap akhirat, turunlah kepadanya malaikat-malaikat dari langit dengan wajah '
        'putih bercahaya seperti matahari, mereka membawa kafan-kafan dari surga dan wewangian '
        'dari surga, kemudian mereka duduk sejauh mata memandang. Kemudian datanglah malaikat '
        'maut hingga duduk di dekat kepalanya dan berkata: \'Wahai jiwa yang baik, keluarlah '
        'menuju ampunan Allah dan ridha-Nya.\'&rdquo;</p>'
        '<p>Setelah dimakamkan, dua malaikat — yang dalam hadis disebut sebagai dua malaikat '
        'yang menguji — datang kepada mayat dan mendudukannya, lalu menanyainya: '
        '&ldquo;Siapakah Tuhanmu? Apakah agamamu? Siapakah nabimu?&rdquo;</p>'
        '<p>Bagi orang yang beriman, Allah memberinya taufiq untuk menjawab dengan benar: '
        '&ldquo;Tuhanku adalah Allah, agamaku adalah Islam, nabiku adalah Muhammad ﷺ.&rdquo; '
        'Kemudian ia mendapat kabar gembira tentang surga dan ia menikmati kesenangan di alam '
        'barzakh hingga Hari Kiamat.</p>'
        '<p>Adapun orang kafir atau munafik, ketika ditanya ia menjawab: &ldquo;Hah, hah, aku '
        'tidak tahu.&rdquo; Kemudian ia dipukul dengan tongkat besi yang jika seluruh manusia '
        'dan jin mendengar pukulan itu, mereka semua akan pingsan. Ia kemudian diminta untuk '
        'kembali ke bumi berbentuk tanah, dan ia mengalami azab kubur hingga Hari Kiamat. '
        'Semoga Allah melindungi kita semua dari azab kubur.</p>'
    ),
}

# ============================================================
# Chapter 023 — Angels: their honor; angels don't enter houses with dogs/pictures
# ============================================================
translations['023'] = {
    'title_id': 'Bagian 23',
    'content_id': (
        '<p>Maka Allah menjadikan mereka mulia dalam keberadaan mereka maupun dalam perilaku '
        'mereka. Sebagian dari kemuliaan mereka dibuktikan dalam hadis yang diriwayatkan dalam '
        'kitab-kitab hadis sahih dan dalam Sunan dan Masanid atas otoritas sejumlah sahabat '
        'Rasulullah ﷺ, bahwa beliau bersabda: &ldquo;Para malaikat tidak masuk ke dalam rumah '
        'yang di dalamnya terdapat gambar (makhluk bernyawa), atau yang di dalamnya terdapat '
        'anjing, atau yang di dalamnya terdapat seseorang dalam keadaan junub.&rdquo;</p>'
        '<p>(1) Sunan: Kumpulan hadis yang disusun berdasarkan topik permasalahan.</p>'
        '<p>(2) Masanid: Kumpulan hadis yang disusun berdasarkan sanad (rantai perawi)-nya.</p>'
        '<p>(3) Junub: Keadaan najis ritual (yang mengharuskan mandi besar).</p>'
        '<p>Dalam riwayat \'Ashim Ibn Dhamrah dari \'Ali (ra), disebutkan bahwa Nabi ﷺ bersabda: '
        '&ldquo;Sesungguhnya para malaikat tidak masuk ke sebuah rumah yang di dalamnya terdapat '
        'gambar, anjing, atau patung.&rdquo;</p>'
        '<p>Hadis ini mengandung beberapa pelajaran penting:</p>'
        '<p>Pertama, diharamkannya membuat dan menyimpan gambar makhluk bernyawa (manusia dan '
        'hewan) dalam rumah, kecuali yang diperbolehkan oleh syariat seperti gambar untuk '
        'keperluan identifikasi atau dokumentasi yang sah.</p>'
        '<p>Kedua, diharamkannya memelihara anjing di dalam rumah kecuali untuk keperluan '
        'yang dibolehkan syariat seperti menjaga ternak atau untuk berburu.</p>'
        '<p>Ketiga, kewajiban bersuci dari hadats besar (junub) dengan segera melaksanakan '
        'mandi wajib.</p>'
        '<p>Keempat, bahwa kehadiran para malaikat di rumah kita adalah nikmat dan berkah '
        'yang harus kita jaga dengan menjauhi hal-hal yang mengusir mereka.</p>'
        '<p>Para malaikat senantiasa menemani orang-orang yang beriman, mencatat amal '
        'perbuatan mereka, mendoakan mereka, dan memohonkan ampunan bagi mereka. Allah '
        'Yang Maha Tinggi berfirman: <em>(Tidak ada suatu ucapan pun yang diucapkannya '
        'melainkan ada di dekatnya malaikat pengawas yang selalu hadir.)</em> '
        '(Surah Qaf 50:18). Ini seharusnya menjadikan kita lebih berhati-hati dalam '
        'setiap ucapan dan perbuatan kita.</p>'
    ),
}

# ============================================================
# Chapter 024 — Angels of dhikr gatherings; their intercession
# ============================================================
translations['024'] = {
    'title_id': 'Bagian 24',
    'content_id': (
        '<p>yang berkeliling di bumi selain para pencatat (amal) manusia, dan ketika mereka '
        'menemukan orang-orang yang berdzikir kepada Allah Yang Maha Agung, Yang Maha Perkasa, '
        'mereka menyeru satu sama lain: &ldquo;Kemarilah ke arah yang kamu cari!&rdquo; Dan '
        'mereka membawa orang-orang itu naik ke langit terendah. Lalu Tuhan mereka bertanya — '
        'dan Dia lebih mengetahui dari mereka —: &ldquo;Apa yang dikatakan hamba-hamba-Ku?&rdquo; '
        'Mereka berkata: &ldquo;Mereka bertasbih, bertakbir, memuji, dan mengagungkan-Mu.&rdquo; '
        'Dia bertanya: &ldquo;Apakah mereka telah melihat-Ku?&rdquo; Mereka berkata: '
        '&ldquo;Tidak, demi Allah, mereka belum melihat-Mu.&rdquo; Dia bertanya: &ldquo;Bagaimana '
        'seandainya mereka melihat-Ku?&rdquo; Mereka berkata: &ldquo;Seandainya mereka melihat-Mu, '
        'niscaya mereka akan semakin bersungguh-sungguh dalam ibadah dan pujian serta semakin '
        'banyak bertasbih.&rdquo;</p>'
        '<p>(1) Diriwayatkan oleh Al-Bukhari (3237).</p>'
        '<p>(2) Diriwayatkan oleh Al-Bukhari (780) dan Muslim (781).</p>'
        '<p>Allah bertanya: &ldquo;Apa yang mereka minta kepada-Ku?&rdquo; Para malaikat '
        'berkata: &ldquo;Mereka meminta surga kepada-Mu.&rdquo; Dia bertanya: &ldquo;Apakah '
        'mereka telah melihat surga?&rdquo; Mereka berkata: &ldquo;Tidak, demi Allah, ya '
        'Tuhan kami, mereka belum melihatnya.&rdquo; Allah berfirman: &ldquo;Bagaimana '
        'seandainya mereka melihat surga?&rdquo; Para malaikat berkata: &ldquo;Seandainya '
        'mereka melihatnya, niscaya mereka akan semakin bersemangat dalam mencarinya, semakin '
        'besar keinginan mereka terhadapnya, dan semakin banyak mereka memohonnya.&rdquo;</p>'
        '<p>Allah berfirman: &ldquo;Dari apa mereka berlindung kepada-Ku?&rdquo; Para malaikat '
        'berkata: &ldquo;Mereka berlindung kepada-Mu dari neraka.&rdquo; Allah berfirman: '
        '&ldquo;Apakah mereka telah melihat neraka?&rdquo; Para malaikat berkata: &ldquo;Tidak, '
        'demi Allah, ya Tuhan kami, mereka belum melihatnya.&rdquo; Allah berfirman: &ldquo;Bagaimana '
        'seandainya mereka melihatnya?&rdquo; Para malaikat berkata: &ldquo;Seandainya mereka '
        'melihatnya, niscaya mereka akan semakin keras berlari menjauhinya dan semakin takut '
        'kepadanya.&rdquo;</p>'
        '<p>Allah berfirman: &ldquo;Saksikanlah bahwa Aku telah mengampuni mereka.&rdquo; '
        'Salah satu malaikat berkata: &ldquo;Di antara mereka ada si fulan yang bukan termasuk '
        'kelompok tersebut; ia datang hanya untuk suatu keperluan.&rdquo; Allah berfirman: '
        '&ldquo;Mereka adalah orang-orang yang duduknya tidak mengakibatkan kesengsaraan '
        'bagi teman duduk mereka.&rdquo; (HR. Bukhari dan Muslim)</p>'
        '<p>Hadis yang mulia ini mengandung banyak pelajaran berharga, di antaranya: keutamaan '
        'majelis dzikir, keutamaan berkumpul bersama orang-orang shalih, dan bahwa Allah '
        'mengampuni semua orang yang hadir dalam majelis tersebut termasuk yang datang tanpa '
        'niat berdzikir namun duduk bersama mereka. Semoga Allah menjadikan kita orang-orang '
        'yang senantiasa berdzikir kepada-Nya.</p>'
    ),
}

# ============================================================
# Chapter 025 — The Jinn: their creation, Iblis, his origin
# ============================================================
translations['025'] = {
    'title_id': 'Bagian 25',
    'content_id': (
        '<p>mereka membunuh mereka, mengusir mereka darinya, dan memusnahkan mereka. '
        'Dan mereka mendiaminya setelah mereka, karena apa yang telah mereka lakukan. '
        'As-Suddi berkata dalam tafsirnya atas otoritas \'Abdullah Ibn \'Abbas, atas otoritas '
        'Murrah, yang meriwayatkan atas otoritas \'Abdullah Ibn Mas\'ud dan atas otoritas '
        'beberapa sahabat Rasulullah ﷺ, bahwa mereka berkata bahwa ketika Allah telah '
        'menyempurnakan penciptaan sebagaimana yang Dia kehendaki, Dia bersemayam di atas '
        '\'Arsy dan Dia menunjuk Iblis sebagai penguasa atas wilayah langit dunia. Iblis '
        'berasal dari sebuah suku malaikat yang dikenal sebagai jin. Mereka disebut jin '
        'karena mereka adalah para penjaga Al-Jannah (surga).</p>'
        '<p>Iblis adalah nama dari pemimpin jin yang pertama kali mendurhakai Allah. '
        'Nama aslinya sebelum durhaka adalah \'Azazil, dan ada yang mengatakan Al-Harits. '
        'Ketika ia mendurhakai Allah, ia dinamakan Iblis, yang berarti &ldquo;yang '
        'berputus asa dari rahmat Allah.&rdquo;</p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Dan ingatlah ketika Kami berfirman kepada '
        'para malaikat, &ldquo;Sujudlah kamu kepada Adam!&rdquo; Maka mereka pun bersujud '
        'kecuali Iblis. Ia adalah dari golongan jin, maka ia mendurhakai perintah Tuhannya.)</em> '
        '(Surah Al-Kahfi 18:50)</p>'
        '<p>Ini menunjukkan bahwa Iblis bukan dari golongan malaikat, melainkan dari golongan '
        'jin yang ketika itu berada bersama para malaikat dan turut dalam perintah sujud. '
        'Para malaikat taat dan bersujud, sementara Iblis menolak karena kesombongannya.</p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Allah berfirman, &ldquo;Apakah yang '
        'menghalangimu untuk bersujud ketika Aku menyuruhmu?&rdquo; (Iblis) menjawab, '
        '&ldquo;Aku lebih baik darinya. Engkau ciptakan aku dari api, sedangkan dia Engkau '
        'ciptakan dari tanah liat.&rdquo;)</em> (Surah Al-A\'raf 7:12)</p>'
        '<p>Inilah kesombongan pertama yang ada di alam semesta — kesombongan Iblis yang '
        'menolak perintah Allah karena merasa lebih mulia dari Adam. Kesombongan inilah '
        'yang menjadi awal dari segala keburukan dan kemaksiatan di dunia. Semoga Allah '
        'melindungi kita dari kesombongan dan dari bisikan Iblis yang terkutuk.</p>'
    ),
}

# ============================================================
# Chapter 026 — The Jinn: their listening to Quran, their food
# ============================================================
translations['026'] = {
    'title_id': 'Bagian 26',
    'content_id': (
        '<p>kisah di akhir Surah Al-Ahqaf dan kami menyebutkan hadis-hadis yang berkaitan '
        'dengannya di sana. Kami mengatakan bahwa kelompok ini berasal dari jin Nasibin '
        '— atau menurut riwayat lain, dari jin Busra — dan mereka melewati Rasulullah ﷺ '
        'ketika beliau sedang berdiri shalat bersama para sahabatnya di Batha\' Nakhlah, '
        'di Makkah, dan mereka pun berhenti dan mendengarkan bacaannya. Kemudian Nabi ﷺ '
        'bertemu dengan mereka selama satu malam penuh dan mereka bertanya kepadanya '
        'tentang hal-hal yang beliau perintahkan kepada mereka dan hal-hal yang beliau '
        'larang untuk mereka. Mereka juga bertanya kepadanya tentang bekal (untuk akhirat) '
        'dan beliau bersabda kepada mereka: &ldquo;Setiap tulang yang disebut nama Allah '
        'atasnya adalah makanan kalian.&rdquo;</p>'
        '<p>Ini diriwayatkan dalam hadis sahih bahwa jin Muslim memiliki makanan berupa tulang '
        'dan kotoran hewan, yang karenanya Nabi ﷺ melarang kita beristinja\' (bersuci setelah '
        'buang air) dengan tulang atau kotoran, karena keduanya adalah makanan saudara-saudara '
        'kita dari kalangan jin.</p>'
        '<p>Allah Yang Maha Tinggi berfirman dalam Surah Al-Jinn tentang dakwah jin: '
        '<em>(Katakanlah, &ldquo;Telah diwahyukan kepadaku bahwa sekumpulan jin telah '
        'mendengarkan lalu mereka berkata: \'Sesungguhnya kami telah mendengarkan Al-Quran '
        'yang menakjubkan, yang memberi petunjuk kepada jalan yang benar, lalu kami '
        'beriman kepadanya.\'&rdquo;)</em> (Surah Al-Jinn 72:1-2)</p>'
        '<p>Ini menunjukkan bahwa dakwah Islam bukan hanya untuk manusia, melainkan juga '
        'untuk jin. Jin pun diwajibkan untuk beriman kepada Allah dan mengikuti ajaran '
        'yang dibawa Nabi Muhammad ﷺ. Jin yang beriman akan masuk surga, dan jin yang '
        'kafir akan masuk neraka.</p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Dan di antara kami ada orang-orang yang '
        'shalih dan di antara kami ada yang tidak demikian. Kami menempuh jalan yang '
        'bermacam-macam.)</em> (Surah Al-Jinn 72:11) Ini adalah pengakuan jin sendiri '
        'bahwa di antara mereka ada yang beriman dan ada yang kafir, sebagaimana manusia.</p>'
        '<p>Pelajaran penting dari ayat-ayat tentang jin adalah bahwa dunia jin itu nyata '
        'dan mereka memiliki tanggung jawab di hadapan Allah seperti manusia. Namun kita '
        'tidak boleh bergantung kepada jin atau meminta pertolongan mereka dalam hal-hal '
        'yang bersifat supranatural, karena itu termasuk perbuatan syirik.</p>'
    ),
}

# ============================================================
# Chapter 027 — Satan's whispers; story of Yusuf and the wine-pourer
# ============================================================
translations['027'] = {
    'title_id': 'Bagian 27',
    'content_id': (
        '<p>Dalam Shahih Al-Bukhari, diriwayatkan atas otoritas Shafiyyah Binti Huyayy '
        '(semoga Allah meridhainya), bahwa Rasulullah ﷺ bersabda: &ldquo;Sesungguhnya '
        'setan berjalan dalam diri manusia seperti peredaran darah.&rdquo;</p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Tetapi setan menjadikannya lupa untuk '
        'menyebut Tuhannya.)</em> (Surah Yusuf 12:42) Maksudnya, ketika Nabi Yusuf (as) '
        'berkata kepada si penuang anggur: <em>(&ldquo;Sebutkan aku kepada tuanmu.&rdquo;)</em> '
        '(Surah Yusuf 12:42), setan membuat si penuang anggur lupa untuk menyampaikan '
        'hal itu kepada tuannya, sehingga Nabi Yusuf (as) tetap di penjara selama '
        'beberapa tahun lagi.</p>'
        '<p>Ini adalah pelajaran bahwa seorang mukmin tidak boleh bergantung kepada selain '
        'Allah dan tidak boleh meminta pertolongan kepada makhluk tanpa mengingat dan '
        'bertawakkal kepada Allah terlebih dahulu. Imam Ahmad meriwayatkan dalam musnad-nya '
        'bahwa Nabi ﷺ bersabda: &ldquo;Semoga Allah merahmati Nabi Yusuf; seandainya ia '
        'tidak berkata \'Sebutkan aku kepada tuanmu\', niscaya ia tidak akan tinggal di '
        'penjara selama yang ia tinggal.&rdquo;</p>'
        '<p>Adapun cara setan menggoda manusia, Allah Yang Maha Tinggi berfirman: '
        '<em>((Iblis) menjawab, &ldquo;Karena Engkau telah menyesatkan aku, pasti aku '
        'akan selalu menghalangi mereka dari jalan-Mu yang lurus, kemudian pasti aku '
        'akan mendatangi mereka dari muka dan dari belakang mereka, dari kanan dan dari '
        'kiri mereka. Dan Engkau tidak akan mendapati kebanyakan mereka bersyukur.&rdquo;)</em> '
        '(Surah Al-A\'raf 7:16-17)</p>'
        '<p>Setan menggoda manusia melalui berbagai cara: memperindah kemaksiatan, '
        'membisikkan keraguan dalam agama, mendorong kepada sifat-sifat tercela seperti '
        'sombong, hasad, dan bakhil, serta menjauhkan manusia dari ibadah dan dzikir '
        'kepada Allah.</p>'
        '<p>Perlindungan dari setan adalah dengan senantiasa berdzikir kepada Allah, '
        'membaca Al-Quran, khususnya Ayat Kursi dan surah-surah pelindung (Al-Ikhlas, '
        'Al-Falaq, An-Nas), serta dengan memohon perlindungan kepada Allah: '
        '&ldquo;A\'udzu billahi minasy syaithonir rajiim.&rdquo; Semoga Allah senantiasa '
        'melindungi kita dari godaan setan yang terkutuk.</p>'
    ),
}

# ============================================================
# Chapter 028 — Satan and children; protection from jinn at night
# ============================================================
translations['028'] = {
    'title_id': 'Bagian 28',
    'content_id': (
        '<p>Ketika para wanita menyaksikan ketampanan Nabi Yusuf (as): <em>(Ini bukan manusia; '
        'ini tidak lain hanyalah malaikat yang mulia.)</em> (Surah Yusuf 12:31)</p>'
        '<p>Al-Bukhari meriwayatkan atas otoritas Jabir Ibn \'Abdullah (ra) dari Nabi ﷺ bahwa '
        'beliau bersabda: &ldquo;Apabila malam telah tiba, tahanlah anak-anakmu (di dalam '
        'rumah), karena setan-setan berkeliaran pada saat itu. Setelah lewat satu jam, '
        'boleh kamu lepaskan mereka. Tutuplah pintu-pintu rumahmu dan sebutlah nama Allah, '
        'karena sesungguhnya setan tidak dapat membuka pintu yang tertutup. Tutuplah '
        'tempat airmu dan sebutlah nama Allah. Tutuplah wadah-wadah makananmu dan sebutlah '
        'nama Allah, meskipun kamu hanya meletakkan sesuatu di atasnya.&rdquo;</p>'
        '<p>(1) Ini adalah hadis sahih yang diriwayatkan oleh Imam Ahmad (14319).</p>'
        '<p>(2) Diriwayatkan oleh Al-Bukhari (3273).</p>'
        '<p>(3) Ini adalah hadis sahih yang diriwayatkan oleh Ibn Majah (3722), tanpa kata-kata '
        '&ldquo;Itu adalah tempat duduk setan.&rdquo; Tambahan ini ada dalam Musnad Al-Imam Ahmad (14995).</p>'
        '<p>Hadis ini mengajarkan kepada kita beberapa adab yang penting:</p>'
        '<p>Pertama, menjaga anak-anak di dalam rumah pada waktu malam, khususnya di awal malam '
        'ketika setan-setan mulai berkeliaran.</p>'
        '<p>Kedua, menutup pintu-pintu rumah dengan menyebut nama Allah, karena setan tidak '
        'dapat membuka pintu yang ditutup dengan nama Allah.</p>'
        '<p>Ketiga, menutup wadah-wadah makanan dan minuman dengan menyebut nama Allah, '
        'sebagai perlindungan dari setan yang mungkin mengotori atau merusak makanan tersebut.</p>'
        '<p>Ini semua adalah sunnah Nabi ﷺ yang mengajarkan kita untuk selalu mengingat Allah '
        'dalam setiap aktivitas kita, baik yang besar maupun yang kecil. Dzikir kepada Allah '
        'adalah benteng terkuat yang melindungi kita dari gangguan setan.</p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Sesungguhnya setan itu adalah musuhmu, '
        'maka anggaplah ia musuhmu; karena sesungguhnya setan-setan itu hanya mengajak '
        'golongannya agar mereka menjadi penghuni neraka yang menyala-nyala.)</em> '
        '(Surah Fathir 35:6). Semoga Allah menjadikan kita orang-orang yang selalu '
        'waspada terhadap tipu daya setan dan berlindung kepada-Nya.</p>'
    ),
}

# ============================================================
# Chapter 029 — Tahlil dhikr; Adam's creation begins
# ============================================================
translations['029'] = {
    'title_id': 'Bagian 29',
    'content_id': (
        '<p>milik-Nya kerajaan, dan bagi-Nya segala puji dan syukur, dan Dia Maha Kuasa atas '
        'segala sesuatu,&rdquo; seratus kali dalam sehari, maka ia akan mendapatkan pahala '
        'seperti memerdekakan sepuluh budak, seratus kebaikan akan dicatat dalam catatannya, '
        'dan seratus keburukan akan dihapus dari catatannya. Pada hari itu ia akan terlindungi '
        'dari pagi hingga petang dari setan; dan tidak ada seorang pun yang lebih utama darinya '
        'kecuali orang yang melakukan lebih banyak dari itu.</p>'
        '<p>(1) Diriwayatkan oleh Abu Dawud atas otoritas Abu Yusr (ra) (1552).</p>'
        '<p>(2) Diriwayatkan oleh At-Tirmidzi (2988).</p>'
        '<p>Al-Bukhari meriwayatkan bahwa Nabi ﷺ bersabda: &ldquo;Barang siapa yang mengucapkan '
        '\'La ilaha illallah, wahdahu la syarika lah, lahul mulku wa lahul hamdu wa huwa \'ala '
        'kulli syai\'in qadir\' seratus kali dalam sehari, maka baginya seperti memerdekakan '
        'sepuluh budak, dan dicatat baginya seratus kebaikan, dan dihapus darinya seratus '
        'kesalahan, dan ia menjadi pelindung baginya dari setan pada hari itu hingga petang; '
        'dan tidak ada seorang pun yang datang dengan sesuatu yang lebih utama dari apa yang '
        'ia datangkan kecuali seseorang yang melakukan lebih banyak.&rdquo; (HR. Bukhari dan Muslim)</p>'
        '<p><strong>Penciptaan Nabi Adam (as)</strong></p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Dan ingatlah ketika Tuhanmu berfirman kepada '
        'para malaikat, &ldquo;Sesungguhnya Aku hendak menjadikan seorang khalifah di muka bumi.&rdquo; '
        'Mereka berkata, &ldquo;Mengapa Engkau hendak menjadikan di bumi itu orang yang akan '
        'membuat kerusakan padanya dan menumpahkan darah, padahal kami senantiasa bertasbih '
        'dengan memuji Engkau dan mensucikan Engkau?&rdquo; Tuhan berfirman, &ldquo;Sesungguhnya '
        'Aku mengetahui apa yang tidak kamu ketahui.&rdquo;)</em> (Surah Al-Baqarah 2:30)</p>'
        '<p>Para malaikat mengajukan pertanyaan ini bukan karena keberatan atau protes, '
        'melainkan karena ingin memahami hikmah di balik penciptaan makhluk baru ini. '
        'Mereka mengetahui bahwa di antara makhluk yang sebelumnya ada di bumi — yaitu jin — '
        'terdapat kerusakan dan pertumpahan darah. Maka mereka bertanya apakah makhluk baru '
        'ini akan bersifat sama.</p>'
        '<p>Allah menjawab dengan mengajarkan kepada Adam (as) nama-nama segala sesuatu, '
        'yang kemudian membuat para malaikat mengakui keutamaan dan ilmu Adam (as) atas mereka. '
        'Ini adalah salah satu keistimewaan manusia yang membedakannya dari malaikat dan '
        'makhluk-makhluk lainnya.</p>'
    ),
}

# ============================================================
# Chapter 030 — The creation of Adam: his form, the angels' prostration
# ============================================================
translations['030'] = {
    'title_id': 'Bagian 30',
    'content_id': (
        '<p>ketakutan-ketakutan. Ya Allah! Lindungilah aku dari depanku, dari belakangku, dari '
        'kananku, dari kiriku, dan dari atasku. Aku berlindung dengan keagungan-Mu dari '
        'disergap dari bawahku.&rdquo; Waki\' berkata bahwa itu berarti terperosok ke bawah.</p>'
        '<p>(1) Ini adalah hadis sahih yang diriwayatkan oleh Imam Ahmad (15528).</p>'
        '<p>(2) Ini adalah hadis sahih yang diriwayatkan oleh Imam Ahmad (4770). Hadis ini juga '
        'diriwayatkan oleh Abu Dawud (5074), oleh An-Nasa\'i dalam bentuk ringkas (5530), '
        'Ibn Majah (3871), Ibn Hibban dalam Shahih-nya (3124, No. 961), dan Al-Hakim dalam '
        'Al-Mustadrak (1/698, No. 1902).</p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Dan ingatlah ketika Tuhanmu berfirman kepada '
        'para malaikat, &ldquo;Sesungguhnya Aku akan menjadikan manusia secara turun-temurun '
        'di bumi.&rdquo;)</em></p>'
        '<p><strong>Penciptaan Adam (as): Bentuk dan Kisahnya</strong></p>'
        '<p>Allah Yang Maha Tinggi menciptakan Adam (as) dengan tangan-Nya sendiri dari tanah. '
        'Ini adalah keistimewaan Adam (as) yang tidak dimiliki oleh makhluk lain. Allah '
        'berfirman: <em>(Allah berfirman, &ldquo;Wahai Iblis! Apakah yang menghalangimu '
        'untuk sujud kepada yang telah Aku ciptakan dengan kedua tangan-Ku?&rdquo;)</em> '
        '(Surah Shad 38:75)</p>'
        '<p>Allah mengambil tanah dari seluruh penjuru bumi untuk menciptakan Adam (as). '
        'Karena itulah keturunan Adam berbeda-beda; ada yang putih, merah, kuning, hitam, '
        'ada yang lembut dan ada yang keras, ada yang baik dan ada yang buruk. Nabi ﷺ '
        'bersabda: &ldquo;Allah menciptakan Adam dari segenggam tanah yang diambil dari '
        'seluruh bumi, maka anak-anak Adam datang sesuai dengan bumi (tanah) tersebut; '
        'di antara mereka ada yang merah, ada yang putih, ada yang hitam, ada yang '
        'di antara warna-warna itu; ada yang lembut dan ada yang keras, ada yang buruk '
        'dan ada yang baik.&rdquo; (HR. Ahmad, Abu Dawud, dan Tirmidzi)</p>'
        '<p>Setelah menciptakan Adam (as) dalam bentuknya, Allah memerintahkan para malaikat '
        'untuk bersujud kepada Adam (as) sebagai penghormatan dan pengakuan atas keutamaannya. '
        'Semua malaikat pun bersujud, kecuali Iblis yang menolak karena kesombongannya. '
        'Maka Allah mengusir Iblis dari surga dan melaknatnya hingga Hari Kiamat.</p>'
        '<p>Kemudian Allah meniupkan ruh ke dalam Adam (as) sehingga ia menjadi hidup. '
        'Nabi ﷺ bersabda: &ldquo;Allah menciptakan Adam dengan bentuk-Nya, tingginya '
        'enam puluh hasta. Ketika Dia menciptakannya, Dia berfirman: \'Pergilah dan '
        'ucapkan salam kepada sekelompok malaikat yang duduk di sana, dan dengarkanlah '
        'apa yang mereka ucapkan, karena itu adalah salam penghormatanmu dan salam '
        'penghormatan keturunanmu.\'&rdquo; (HR. Bukhari dan Muslim)</p>'
    ),
}

# ============================================================
# Write all translations to disk
# ============================================================

def write_chapter(chapter_num: str, data: dict):
    fn = BOOK_DIR / f'{chapter_num}.json'
    with open(fn) as f:
        existing = json.load(f)
    existing['title_id'] = data['title_id']
    existing['content_id'] = data['content_id']
    with open(fn, 'w', encoding='utf-8') as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)
    # Verify
    with open(fn) as f:
        verify = json.load(f)
    assert verify['title_id'] == data['title_id'], f"title_id mismatch in {fn}"
    assert verify['content_id'] == data['content_id'], f"content_id mismatch in {fn}"
    print(f'  ✓ {chapter_num}.json written and verified')

print('Writing chapters 016-030...')
for chnum, tdata in translations.items():
    write_chapter(chnum, tdata)
print('Done.')
