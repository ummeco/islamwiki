#!/usr/bin/env python3
"""
Translate early-days-creation chapters 031-046 to Indonesian.
Book: Al-Bidayah wan-Nihayah by Ibn Katheer.
Topics: Adam's creation, intercession, garden of Eden, Qabil/Habil, Idris, Nuh (Noah).
"""
import json
from pathlib import Path

BOOK_DIR = Path('/Users/admin/Sites/ummeco/islamwiki/web/data/books/early-days-creation')

translations = {}

# ============================================================
# Chapter 031 — Adam's intercession on Yawm al-Qiyamah; the teaching of names
# ============================================================
translations['031'] = {
    'title_id': 'Bagian 31',
    'content_id': (
        '<p>dan berkata: &ldquo;Marilah kita meminta seseorang untuk memberikan syafaat bagi kita '
        'kepada Tuhan kita.&rdquo; Maka mereka akan pergi kepada Adam (as) dan berkata: &ldquo;Engkau '
        'adalah bapak semua manusia; Allah menciptakanmu dengan tangan-Nya sendiri, memerintahkan '
        'para malaikat untuk bersujud kepadamu, dan mengajarkan kepadamu nama-nama segala sesuatu.&rdquo; '
        'Beliau mencatat hadis tersebut secara lengkap.</p>'
        '<p><em>(Kemudian Dia memperlihatkan benda-benda itu kepada para malaikat seraya berfirman: '
        '&ldquo;Beritahukan kepada-Ku nama-nama benda ini jika kamu memang orang-orang yang '
        'benar!&rdquo;)</em> (Surah Al-Baqarah 2:31)</p>'
        '<p>Al-Hasan Al-Bashri berkata: &ldquo;Ketika Allah ingin menciptakan Adam (as), para malaikat '
        'berkata: \'Tuhan kami tidak akan menciptakan suatu makhluk kecuali kami lebih berilmu '
        'darinya.\' Maka Allah \'Azza wa Jalla menguji mereka dengan nama-nama benda-benda dan '
        'mereka tidak mengetahuinya.&rdquo;</p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Dan Dia mengajarkan kepada Adam nama-nama '
        'semuanya, kemudian Dia memperlihatkannya kepada para malaikat seraya berfirman, '
        '&ldquo;Beritahukan kepada-Ku nama-nama benda ini jika kamu memang orang-orang yang '
        'benar!&rdquo; Mereka menjawab, &ldquo;Mahasuci Engkau, tidak ada yang kami ketahui '
        'selain dari apa yang telah Engkau ajarkan kepada kami; sungguh, Engkaulah Yang Maha '
        'Mengetahui, Maha Bijaksana.&rdquo; Dia berfirman, &ldquo;Hai Adam! Beritahukan kepada '
        'mereka nama-nama benda ini!&rdquo; Setelah dia memberitahukan kepada mereka nama-namanya, '
        'Allah berfirman, &ldquo;Bukankah sudah Ku katakan kepadamu bahwa sesungguhnya Aku '
        'mengetahui rahasia langit dan bumi dan mengetahui apa yang kamu lahirkan dan apa yang '
        'kamu sembunyikan?&rdquo;)</em> (Surah Al-Baqarah 2:31-33)</p>'
        '<p>Ini adalah salah satu bukti keistimewaan manusia atas makhluk-makhluk lainnya: '
        'Allah menganugerahkan kepada Adam (as) ilmu tentang nama-nama segala sesuatu. '
        'Ilmu ini adalah dasar dari kemampuan manusia untuk berpikir, berbicara, berkomunikasi, '
        'dan membangun peradaban. Inilah yang menjadikan manusia layak menjadi khalifah di muka bumi.</p>'
        '<p>Pada Hari Kiamat, Adam (as) akan diminta untuk memberikan syafaat bagi seluruh umat '
        'manusia. Namun Adam (as) akan berkata: &ldquo;Nafsi, nafsi! (Diriku, diriku!)&rdquo; '
        'karena kesalahannya memakan buah dari pohon terlarang di surga, sehingga ia merasa '
        'tidak layak untuk memberikan syafaat. Maka manusia akan pergi kepada para nabi lainnya '
        'satu persatu, hingga akhirnya mereka datang kepada Nabi Muhammad ﷺ, dan beliaulah '
        'yang akan memberikan syafaat yang agung (al-maqam al-mahmud). Semoga Allah '
        'menganugerahkan kepada kita syafaat beliau.</p>'
    ),
}

# ============================================================
# Chapter 032 — Iblis's request for respite; his vow to mislead
# ============================================================
translations['032'] = {
    'title_id': 'Bagian 32',
    'content_id': (
        '<p>dari sini. Sesungguhnya engkau adalah yang terkutuk. Dan sesungguhnya laknat-Ku '
        'tetap atasmu sampai Hari Pembalasan.&rdquo; (Iblis [Setan]) berkata: &ldquo;Ya Tuhanku! '
        'Tangguhkanlah aku sampai hari mereka dibangkitkan.&rdquo; (Allah) berfirman: '
        '&ldquo;Sesungguhnya kamu termasuk orang-orang yang diberi tangguh hingga hari waktu '
        'yang telah ditentukan.&rdquo; (Iblis [Setan]) berkata: &ldquo;Demi keperkasaan-Mu, '
        'aku pasti akan menyesatkan mereka semuanya, kecuali hamba-hamba-Mu yang terpilih '
        'di antara mereka (orang-orang yang beriman, taat, benar-benar beriman pada '
        'Tauhid Islami).&rdquo; (Allah) berfirman: &ldquo;Yang benar (adalah sumpah-Ku) dan '
        'kebenaran itulah yang Ku-katakan, bahwa Aku pasti akan memenuhi neraka dengan dirimu '
        'wahai Iblis beserta siapa saja di antara mereka yang mengikutimu.&rdquo;</p>'
        '<p>(Surah Shad 38:77-85)</p>'
        '<p>Iblis telah bersumpah untuk menyesatkan seluruh umat manusia kecuali hamba-hamba '
        'Allah yang tulus. Ia meminta penangguhan hingga Hari Kiamat, dan Allah pun '
        'mengabulkan permintaannya. Ini adalah bagian dari ujian dan cobaan yang Allah '
        'tetapkan bagi manusia untuk menguji keimanan dan ketaatan mereka.</p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Sesungguhnya Iblis telah dapat membuktikan '
        'kebenaran sangkaannya terhadap mereka lalu mereka mengikutinya, kecuali sebagian '
        'orang-orang yang beriman.)</em> (Surah Saba\' 34:20)</p>'
        '<p>Cara-cara Iblis dalam menyesatkan manusia antara lain: memperindah kemaksiatan, '
        'menghias kejahatan sehingga tampak baik, membisikkan keraguan dalam agama, '
        'mendorong kepada kelalaian dari ibadah, dan membuat manusia mencintai dunia '
        'dan melupakan akhirat.</p>'
        '<p>Namun Allah Yang Maha Tinggi berfirman dalam menenangkan hamba-hamba-Nya: '
        '<em>(Sesungguhnya tipu daya setan itu lemah.)</em> (Surah An-Nisa\' 4:76) '
        'Selama seorang hamba senantiasa berlindung kepada Allah, bertawakkal kepada-Nya, '
        'berdzikir kepada-Nya, dan mengikuti Sunnah Nabi ﷺ, maka ia akan terlindungi '
        'dari tipu daya Iblis. Semoga Allah menjadikan kita termasuk hamba-hamba-Nya '
        'yang terpilih yang tidak dapat disesatkan oleh Iblis.</p>'
    ),
}

# ============================================================
# Chapter 033 — Adam in Paradise; the Garden (Jannah)
# ============================================================
translations['033'] = {
    'title_id': 'Bagian 33',
    'content_id': (
        '<p>akan dibawa dekat kepada mereka. Mereka akan datang kepada Adam dan berkata: '
        '&ldquo;Wahai bapak kami! Bukalah pintu surga bagi kami!&rdquo; Beliau akan berkata: '
        '&ldquo;Adakah yang mengeluarkanmu dari surga selain dosa bapakmu, Adam?&rdquo; Dan '
        'beliau pun menceritakan hadis tersebut secara lengkap. Ini merupakan bukti kuat '
        'dan jelas bahwa itu adalah Jannat Al-Ma\'wa, meskipun masih ada ruang untuk perdebatan.</p>'
        '<p>Ulama lain mengatakan bahwa surga tempat Adam (as) tinggal bukanlah Jannat Al-Khuld '
        '(surga abadi), karena di sana beliau diperintahkan untuk tidak memakan dari pohon '
        'tertentu, beliau tidur di sana, beliau kemudian dikeluarkan darinya, dan Iblis '
        'masuk ke dalamnya. Semua hal ini bertentangan dengan sifat-sifat surga abadi.</p>'
        '<p>Yang benar menurut para ulama terpercaya adalah bahwa surga tempat Adam (as) tinggal '
        'sebelum diturunkan ke bumi adalah surga yang sesungguhnya, yang berada di langit. '
        'Allah menempatkan Adam (as) di sana sebagai kehormatan dan karunia untuknya. '
        'Adapun kenyataan bahwa ia kemudian dikeluarkan dari sana adalah bagian dari '
        'ketetapan Allah yang mengandung hikmah yang besar.</p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Dan Kami berfirman, &ldquo;Hai Adam, '
        'tinggallah kamu dan istrimu di surga, dan makanlah makanannya yang banyak lagi '
        'baik di mana saja yang kamu sukai, dan janganlah kamu dekati pohon ini, yang '
        'menyebabkan kamu termasuk orang-orang yang zalim.&rdquo;)</em> (Surah Al-Baqarah 2:35)</p>'
        '<p>Kemudian Iblis berhasil menggoda keduanya untuk memakan dari pohon terlarang itu, '
        'sehingga keduanya berdosa. Namun Adam (as) segera bertaubat kepada Allah, dan '
        'Allah pun menerima taubatnya.</p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Kemudian Adam menerima beberapa kalimat '
        'dari Tuhannya, maka Allah menerima taubatnya. Sesungguhnya Allah Maha Menerima '
        'taubat lagi Maha Penyayang.)</em> (Surah Al-Baqarah 2:37)</p>'
        '<p>Kalimat-kalimat yang diterima Adam (as) itu adalah doa: <em>&ldquo;Rabbana '
        'zhalamna anfusana wa in lam taghfir lana wa tarhamna lanakunanna minal khasirin&rdquo; '
        '(Ya Tuhan kami, kami telah menganiaya diri kami sendiri, dan jika Engkau tidak '
        'mengampuni kami dan memberi kami rahmat, niscaya kami termasuk orang-orang yang '
        'rugi.)</em> (Surah Al-A\'raf 7:23) Kisah ini mengajarkan kita bahwa selama '
        'seseorang bertaubat dengan tulus, Allah pasti akan mengampuninya.</p>'
    ),
}

# ============================================================
# Chapter 034 — Adam and Musa's debate; the story of Dawud and Sulaiman
# ============================================================
translations['034'] = {
    'title_id': 'Bagian 34',
    'content_id': (
        '<p>(Ingat) Nabi Dawud (Daud) dan Nabi Sulaiman (as), ketika keduanya memberikan '
        'keputusan mengenai tanaman, ketika ada domba-domba orang-orang tertentu yang '
        'merumput di malam hari, dan Kami menjadi saksi atas keputusan mereka.) '
        '(Surah Al-Anbiya\' 21:78)</p>'
        '<p>Namun pendapat yang benar adalah bahwa karena hakim tidak memberikan keputusan '
        'kecuali antara dua pihak — penggugat dan tergugat — Allah berfirman: '
        '<em>(dan Kami menjadi saksi atas keputusan mereka.)</em> (Surah Al-Anbiya\' 21:78)</p>'
        '<p>Adapun tentang pengulangan penurunan (dari surga) dalam Surah Al-Baqarah, '
        'dalam firman-Nya: <em>(Kemudian setan menjadikan keduanya tergelincir dari surga '
        'itu dan mengeluarkan keduanya dari keadaan semula.)</em> (Surah Al-Baqarah 2:36), '
        'dan firman-Nya dalam Surah Al-A\'raf: <em>(Maka keduanya digelincirkan oleh '
        'setan dari surga itu.)</em> (Surah Al-A\'raf 7:22) — para ulama berbeda pendapat '
        'tentang apakah ini satu kejadian atau dua kejadian yang berbeda.</p>'
        '<p><strong>Perdebatan antara Adam dan Musa (as)</strong></p>'
        '<p>Dalam hadis sahih yang diriwayatkan oleh Imam Ahmad dari Abu Musa Al-Asy\'ari (ra) '
        'bahwa Nabi ﷺ bersabda: &ldquo;Adam (as) dan Musa (as) berdebat. Maka Musa berkata: '
        '\'Wahai Adam! Engkaulah bapak kami yang telah menipu kami dan mengeluarkan kami '
        'dari surga.\' Maka Adam (as) berkata kepadanya: \'Wahai Musa! Kamu telah dipilih '
        'oleh Allah dengan kalam-Nya (firman langsung) dan Dia telah menuliskan dengan '
        'tangan-Nya (Taurat) untukmu. Apakah kamu mencelaku atas sesuatu yang telah '
        'ditetapkan Allah padaku sebelum penciptaanku oleh empat puluh tahun?\' '
        'Maka Adam (as) mengalahkan Musa (as) dalam perdebatan.&rdquo; (HR. Bukhari dan Muslim)</p>'
        '<p>Hadis ini mengandung pelajaran penting tentang masalah qadar (takdir). Adam (as) '
        'mengingatkan Musa (as) bahwa kejatuhan Adam dari surga adalah bagian dari ketetapan '
        'Allah yang telah dituliskan sebelum penciptaannya. Ini bukan berarti kita boleh '
        'menjadikan takdir sebagai alasan untuk berbuat maksiat. Melainkan maknanya adalah '
        'bahwa setelah seseorang bertaubat dan diampuni, tidak layak bagi orang lain untuk '
        'terus mencelanya atas kesalahannya yang sudah berlalu. Dan Allah lebih mengetahui '
        'hikmah yang terkandung dalam hadis ini.</p>'
    ),
}

# ============================================================
# Chapter 035 — Hadith about Adam's creation; his physical description
# ============================================================
translations['035'] = {
    'title_id': 'Bagian 35',
    'content_id': (
        '<p>(Adam) lebih tua (dan karenanya lebih bijaksana) darinya (Musa). Ada pula yang '
        'mengatakan bahwa karena beliau (Adam) adalah bapaknya (Musa). Ada yang mengatakan '
        'bahwa karena keduanya berada dalam dua wahyu yang berbeda. Ada yang mengatakan '
        'bahwa karena keduanya berada di alam barzakh dan tanggung jawab terhadap mereka '
        'telah berakhir, menurut pendapat mereka.</p>'
        '<p>(1) Diriwayatkan oleh Imam Ahmad (9664).</p>'
        '<p>(2) Diriwayatkan oleh Imam Ahmad (7579).</p>'
        '<p><strong>Hadis-Hadis tentang Penciptaan Adam (as)</strong></p>'
        '<p>Imam Ahmad meriwayatkan dari Abu Musa bahwa Nabi ﷺ bersabda: &ldquo;Allah '
        'menciptakan Adam dari segenggam (tanah) yang diambil dari seluruh bumi; maka '
        'anak-anak Adam datang sesuai (dengan keberagaman) bumi: di antara mereka ada '
        'yang merah, putih, hitam, dan ada yang di antara warna-warna itu; ada yang '
        'lembut dan ada yang keras; ada yang buruk dan ada yang baik.&rdquo;</p>'
        '<p>Imam Ahmad, Abu Dawud, dan At-Tirmidzi meriwayatkan hadis ini dan At-Tirmidzi '
        'menshahihkannya. Hadis ini menjelaskan mengapa manusia diciptakan dengan '
        'berbagai perbedaan dalam warna kulit, temperamen, dan karakter. Semuanya berasal '
        'dari tanah yang sama yang diambil dari seluruh penjuru bumi.</p>'
        '<p>Dalam Shahih Al-Bukhari dan Shahih Muslim, dari Abu Hurairah (ra), bahwa '
        'Nabi ﷺ bersabda: &ldquo;Allah menciptakan Adam dengan bentuk-Nya, tingginya '
        'enam puluh hasta. Ketika Dia menciptakannya, Dia berfirman: \'Pergilah dan '
        'ucapkan salam kepada sekelompok malaikat yang duduk di sana, dan dengarkanlah '
        'apa yang mereka ucapkan, karena itu adalah salam penghormatanmu dan salam '
        'penghormatan keturunanmu.\' Ia (Adam) pergi dan mengucapkan: \'Assalamu\'alaykum.\' '
        'Mereka berkata: \'Assalamu\'alayka wa rahmatullah.\' Mereka menambahkan '
        '\'wa rahmatullah\'&rdquo;</p>'
        '<p>Nabi ﷺ bersabda: &ldquo;Setiap orang yang masuk surga akan memiliki bentuk '
        'Adam yaitu tinggi enam puluh hasta. Dan umat manusia terus berkurang tingginya '
        'sejak masa Adam hingga sekarang.&rdquo; (HR. Bukhari dan Muslim)</p>'
        '<p>Ini menunjukkan bahwa manusia semakin berkurang tinggi badannya dari zaman ke '
        'zaman. Adam (as) adalah manusia pertama yang diciptakan dalam bentuk yang paling '
        'sempurna dan paling tinggi. Dan orang-orang yang masuk surga akan dikembalikan '
        'kepada bentuk Adam tersebut. Semoga Allah memasukkan kita semua ke dalam surga-Nya.</p>'
    ),
}

# ============================================================
# Chapter 036 — People of the Right and Left; Allah's covenant with Adam's descendants
# ============================================================
translations['036'] = {
    'title_id': 'Bagian 36',
    'content_id': (
        '<p>(Ashhab Al-Yamin) dan Golongan Orang-orang yang di Sebelah Kiri (Ashhab Al-Syimal), '
        'dan Dia berfirman: &ldquo;Mereka ini adalah untuk surga dan Aku tidak peduli, dan '
        'mereka ini adalah untuk neraka dan Aku tidak peduli.&rdquo;</p>'
        '<p>Adapun tentang mengambil kesaksian atas mereka atau membuat mereka secara lisan '
        'mengakui keesaan-Nya, hal ini tidak disebutkan dalam hadis-hadis yang sahih. '
        'Oleh karena itu, menafsirkan ayat dalam Surah Al-A\'raf sebagai merujuk kepada '
        'laporan-laporan ini adalah dipertanyakan, sebagaimana telah kami jelaskan di sana, '
        'dan kami menyebutkan hadis-hadis dan atsar-atsar secara lengkap beserta sanad-sanadnya '
        'dan redaksi-redaksinya.</p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Dan ingatlah, ketika Tuhanmu mengeluarkan '
        'keturunan anak-anak Adam dari sulbi mereka dan Allah mengambil kesaksian terhadap '
        'jiwa mereka (seraya berfirman): &ldquo;Bukankah Aku ini Tuhanmu?&rdquo; Mereka '
        'menjawab: &ldquo;Betul (Engkau Tuhan kami), kami menjadi saksi.&rdquo;)</em> '
        '(Surah Al-A\'raf 7:172)</p>'
        '<p>Para ulama tafsir berbeda pendapat tentang kapan perjanjian ini terjadi. Sebagian '
        'berpendapat bahwa itu terjadi di alam ruh sebelum penciptaan jasad. Sebagian '
        'lainnya berpendapat bahwa fitrah manusia adalah bentuk dari perjanjian tersebut. '
        'Yang paling tepat adalah bahwa Allah mengambil perjanjian dari seluruh keturunan '
        'Adam bahwa mereka mengakui-Nya sebagai Tuhan, dan ini tertanam dalam fitrah '
        'setiap manusia yang dilahirkan.</p>'
        '<p>Nabi ﷺ bersabda: &ldquo;Setiap anak dilahirkan dalam keadaan fitrah. Maka '
        'kedua orang tuanyalah yang menjadikannya Yahudi, Nasrani, atau Majusi, sebagaimana '
        'binatang ternak dilahirkan utuh. Apakah kalian melihat ada yang terpotong di '
        'antara mereka?&rdquo; (HR. Bukhari dan Muslim)</p>'
        '<p>Ini menunjukkan bahwa fitrah manusia adalah Islam — yaitu pengakuan terhadap '
        'keesaan Allah. Manusia yang lahir dalam keadaan fitrah ini kemudian dipengaruhi '
        'oleh lingkungan dan pendidikannya. Maka kewajiban orang tua dan masyarakat '
        'Muslim adalah memelihara fitrah Islam anak-anak mereka agar tidak menyimpang '
        'dari jalan yang benar.</p>'
    ),
}

# ============================================================
# Chapter 037 — Qabil and Habil (Cain and Abel); the first murder
# ============================================================
translations['037'] = {
    'title_id': 'Bagian 37',
    'content_id': (
        '<p>kitab-kitab hadis mana pun dengan sanad yang sahih, hasan, maupun dhaif. '
        'Namun bisa terjadi dalam beberapa kasus bahwa pada Hari Kebangkitan, orang yang '
        'dibunuh akan menuntut keadilan dari pembunuhnya, dan amal-amal baik pembunuh '
        'tidak cukup untuk mengkompensasi ketidakadilan ini. Dalam kasus tersebut, '
        'dosa-dosa orang yang dibunuh akan dipindahkan kepada pembunuhnya, sebagaimana '
        'telah ditetapkan dalam hadis sahih mengenai segala bentuk kezaliman, pembunuhan '
        'termasuk yang paling besar di antaranya, dan Allah lebih mengetahui. Kami telah '
        'membahas semua ini dalam Tafsir, dan kepada Allah-lah segala puji.</p>'
        '<p><strong>Kisah Habil dan Qabil (Abel dan Kain)</strong></p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Ceritakanlah kepada mereka kisah kedua '
        'putra Adam (Habil dan Qabil) menurut yang sebenarnya, ketika keduanya '
        'mempersembahkan korban, maka diterima dari salah seorang dari mereka berdua '
        '(Habil) dan tidak diterima dari yang lain (Qabil). Ia (Qabil) berkata: '
        '&ldquo;Aku pasti membunuhmu!&rdquo; Berkata (Habil): &ldquo;Sesungguhnya Allah '
        'hanya menerima (korban) dari orang-orang yang bertakwa.&rdquo;)</em> '
        '(Surah Al-Ma\'idah 5:27)</p>'
        '<p>Ini adalah kisah pembunuhan pertama yang terjadi di muka bumi. Qabil membunuh '
        'Habil karena dengki dan iri hati. Qabil iri karena qurbannya tidak diterima Allah '
        'sementara qurban Habil diterima. Sebab diterimanya qurban Habil adalah karena '
        'ketulusannya dan ketakwaannya, sementara qurban Qabil ditolak karena ia '
        'mempersembahkannya dengan niatan yang tidak tulus.</p>'
        '<p>Setelah membunuh Habil, Qabil bingung bagaimana cara menguburkan saudaranya. '
        'Allah Yang Maha Tinggi berfirman: <em>(Kemudian Allah menyuruh seekor burung gagak '
        'menggali-gali di bumi untuk memperlihatkan kepadanya (Qabil) bagaimana seharusnya '
        'menguburkan mayat saudaranya. Berkata Qabil: &ldquo;Aduhai, celaka aku, mengapa '
        'aku tidak mampu berbuat seperti burung gagak ini, lalu aku dapat menguburkan '
        'mayat saudaraku ini?&rdquo;)</em> (Surah Al-Ma\'idah 5:31)</p>'
        '<p>Nabi ﷺ bersabda: &ldquo;Tidak ada seorang jiwa yang dibunuh secara zalim, '
        'melainkan anak Adam yang pertama (Qabil) mendapat bagian dari darahnya, karena '
        'dialah yang pertama kali melakukan pembunuhan.&rdquo; (HR. Bukhari dan Muslim) '
        'Ini menunjukkan betapa besarnya dosa membunuh tanpa hak, dan bahwa orang yang '
        'pertama kali memperkenalkan sebuah keburukan akan menanggung dosa orang-orang '
        'yang mengikutinya hingga Hari Kiamat.</p>'
    ),
}

# ============================================================
# Chapter 038 — Adam's lifespan; the Prophet Idris (Enoch)
# ============================================================
translations['038'] = {
    'title_id': 'Bagian 38',
    'content_id': (
        '<p>yang merujuk pada masa hidupnya di bumi, setelah diturunkan dari surga, yaitu '
        'sembilan ratus tiga puluh tahun surya, yang dalam hitungan tahun qamariyah '
        'setara dengan sembilan ratus lima puluh tujuh tahun. Ditambah empat puluh tiga '
        'tahun yang beliau habiskan di surga sebelum diturunkan ke bumi, menurut '
        'perkataan Ibn Jarir dan lainnya. Ini menjadikan totalnya seribu tahun.</p>'
        '<p><strong>Apa yang Disebutkan tentang Nabi Idris (as)</strong></p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Dan ceritakanlah dalam Kitab (Al-Quran) '
        'kisah Idris. Sesungguhnya ia adalah seorang yang sangat membenarkan dan seorang '
        'nabi. Dan Kami telah mengangkatnya ke martabat yang tinggi.)</em> '
        '(Surah Maryam 19:56-57)</p>'
        '<p>Nabi Idris (as) adalah cicit Nabi Adam (as). Para ulama berbeda pendapat tentang '
        'identitasnya; sebagian menganggapnya sama dengan Nabi Ukhnukh yang disebutkan '
        'dalam sumber-sumber, dan sebagian lainnya berpendapat bahwa itu adalah dua '
        'nabi yang berbeda.</p>'
        '<p>Tentang kenaikan Idris (as), para ulama juga berbeda pendapat. Sebagian '
        'berpendapat bahwa beliau diangkat ke langit dalam keadaan masih hidup, '
        'sebagaimana yang lahir dari firman Allah: <em>(Dan Kami telah mengangkatnya '
        'ke martabat yang tinggi.)</em> Sebagian lainnya berpendapat bahwa maksud '
        '&ldquo;mengangkat ke martabat yang tinggi&rdquo; adalah derajat kenabian '
        'yang tinggi, bukan secara harfiah diangkat ke langit.</p>'
        '<p>Dalam hadis tentang Isra\' Mi\'raj yang diriwayatkan dalam Shahih Al-Bukhari '
        'dan Muslim, Nabi ﷺ bertemu dengan Nabi Idris (as) di langit keempat. Ini '
        'mendukung pendapat bahwa Idris (as) diangkat secara fisik ke langit.</p>'
        '<p>Di antara keistimewaan Nabi Idris (as) adalah bahwa beliau adalah orang '
        'pertama yang menulis dengan pena. Beliau juga dikenal sebagai orang yang '
        'pertama yang menjahit pakaian. Beliau adalah nabi yang sangat bertakwa '
        'dan senantiasa berpuasa. Semoga Allah merahmati beliau dan '
        'seluruh para nabi dan rasul.</p>'
        '<p>Para nabi yang diutus antara masa Adam (as) dan Nuh (as) adalah banyak, '
        'namun tidak semuanya disebutkan dengan jelas dalam Al-Quran dan hadis sahih. '
        'Nabi Idris (as) adalah salah satu yang disebutkan dengan jelas. '
        'Semoga Allah memberi kita taufiq untuk mengikuti ajaran para nabi-Nya.</p>'
    ),
}

# ============================================================
# Chapter 039 — The Story of Nuh (Noah): his call
# ============================================================
translations['039'] = {
    'title_id': 'Bagian 39',
    'content_id': (
        '<p>&ldquo;Sesungguhnya kami melihatmu dalam kesesatan yang nyata.&rdquo; (Nuh) berkata: '
        '&ldquo;Hai kaumku! Tidak ada kesesatan padaku, tetapi aku adalah utusan dari Tuhan '
        'semesta alam! Aku menyampaikan kepada kalian amanat-amanat Tuhanku dan aku memberi '
        'nasihat kepada kalian, dan aku mengetahui dari Allah apa yang tidak kalian ketahui. '
        'Atau apakah kamu heran bahwa datang kepada kamu peringatan dari Tuhanmu dengan '
        'perantaraan seorang laki-laki dari kalanganmu sendiri, untuk memberi peringatan '
        'kepadamu, supaya kamu bertakwa dan supaya kamu mendapat rahmat?&rdquo; Tetapi mereka '
        'mendustakannya, maka Kami selamatkan dia dan orang-orang yang bersamanya dalam bahtera.</p>'
        '<p>(1) Thaghut (jamaknya Thawaghit): Mereka yang menyeru kepada kesesatan.</p>'
        '<p><strong>Kisah Nabi Nuh (as)</strong></p>'
        '<p>Nabi Nuh (as) adalah rasul pertama yang diutus kepada umat manusia setelah '
        'terjadinya kemusyrikan di kalangan mereka. Sebelum beliau, manusia berada dalam '
        'agama yang benar, mengikuti ajaran Adam (as). Kemudian mereka mulai menyembah '
        'patung-patung dan berhala-berhala. Maka Allah mengutus Nuh (as) untuk '
        'meluruskan mereka.</p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Sesungguhnya Kami telah mengutus Nuh '
        'kepada kaumnya lalu ia berkata: &ldquo;Hai kaumku, sembahlah Allah, sekali-kali '
        'tidak ada Tuhan bagimu selain-Nya.&rdquo;)</em> (Surah Al-Mu\'minun 23:23)</p>'
        '<p>Nuh (as) berdakwah kepada kaumnya selama sembilan ratus lima puluh tahun, '
        'sebagaimana disebutkan dalam Al-Quran: <em>(Dan sesungguhnya Kami telah mengutus '
        'Nuh kepada kaumnya, maka ia tinggal di antara mereka seribu tahun kurang lima '
        'puluh tahun.)</em> (Surah Al-Ankabut 29:14)</p>'
        '<p>Selama masa dakwah yang sangat panjang itu, hanya sedikit dari kaumnya yang '
        'beriman. Mereka yang menolak terus-menerus mengejek dan mengancam Nuh (as). '
        'Namun beliau tidak pernah putus asa dan terus berdakwah dengan berbagai cara — '
        'secara terang-terangan maupun secara sembunyi-sembunyi, pada siang hari maupun '
        'pada malam hari.</p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Ia berkata: &ldquo;Ya Tuhanku, '
        'sesungguhnya aku telah menyeru kaumku malam dan siang, maka seruanku itu '
        'hanyalah menambah mereka lari (dari kebenaran). Dan sesungguhnya setiap kali '
        'aku menyeru mereka agar Engkau mengampuni mereka, mereka memasukkan jari-jari '
        'mereka ke dalam telinganya.&rdquo;)</em> (Surah Nuh 71:5-7)</p>'
    ),
}

# ============================================================
# Chapter 040 — Nuh's story: his progeny become the survivors; his message
# ============================================================
translations['040'] = {
    'title_id': 'Bagian 40',
    'content_id': (
        '<p>memerintahkan para rasul yang datang sesudahnya — yang semuanya berasal dari '
        'keturunannya — untuk melakukan, sebagaimana Dia Yang Maha Tinggi berfirman: '
        '<em>(Dan keturunannya itulah yang Kami jadikan yang tetap hidup (yaitu Syam, Ham, '
        'dan Yafits).)</em> (Surah Ash-Shaffat 37:77)</p>'
        '<p>Dia berfirman mengenai beliau (Nuh as) dalam Surah Ibrahim: <em>(Dan Kami '
        'jadikan di antara keturunannya kenabian dan kitab.)</em> (Surah Ibrahim 57:26) '
        'Artinya, setiap nabi yang datang setelah Nuh (as) adalah dari keturunannya, '
        'demikian pula Ibrahim (as).</p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Ia berkata, &ldquo;Hai kaumku! Aku '
        'adalah pemberi peringatan yang nyata bagi kalian. Sembahlah Allah, bertakwalah '
        'kepada-Nya, dan taatilah aku. Niscaya Allah akan mengampuni sebagian dosa-dosa '
        'kalian dan menangguhkan kalian sampai waktu yang ditentukan.&rdquo;)</em> '
        '(Surah Nuh 71:2-4)</p>'
        '<p>Dalam ayat ini, Nuh (as) menyampaikan tiga hal pokok dalam dakwahnya: '
        'pertama, menyembah Allah semata (tauhid); kedua, bertakwa kepada Allah; '
        'dan ketiga, taat kepada rasul-Nya. Inilah inti dari seluruh dakwah para nabi '
        'dan rasul sepanjang zaman.</p>'
        '<p>Ketika kaum Nuh (as) menolak dakwahnya, Allah mewahyukan kepada beliau '
        'bahwa tidak ada lagi yang akan beriman kecuali mereka yang telah beriman. '
        'Maka Nuh (as) memohon kepada Allah untuk membinasakan orang-orang kafir dari '
        'kaumnya.</p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Dan Nuh berkata, &ldquo;Ya Tuhanku, '
        'janganlah Engkau biarkan seorang pun di antara orang-orang kafir itu tinggal '
        'di atas bumi. Sesungguhnya jika Engkau biarkan mereka tinggal, niscaya mereka '
        'akan menyesatkan hamba-hamba-Mu, dan mereka tidak akan melahirkan selain '
        'anak-anak yang berbuat fasik lagi sangat kafir.&rdquo;)</em> '
        '(Surah Nuh 71:26-27)</p>'
        '<p>Doa Nuh (as) ini dikabulkan oleh Allah, dan kemudian datanglah banjir besar '
        'yang menenggelamkan seluruh bumi dan membinasakan semua orang kafir. '
        'Namun Allah menyelamatkan Nuh (as) dan orang-orang yang bersamanya dalam bahtera.</p>'
    ),
}

# ============================================================
# Chapter 041 — Nuh's message to his people: no payment; rejecting the believers
# ============================================================
translations['041'] = {
    'title_id': 'Bagian 41',
    'content_id': (
        '<p>Kisah Nabi Nuh (as) — hal 189</p>'
        '<p>Artinya, aku tidak meminta pembayaran apa pun dari kalian atas penyampaian '
        'kepadamu apa yang akan bermanfaat bagimu dalam kehidupan duniamu dan akhiratmu. '
        'Aku tidak mencari itu dari siapa pun kecuali Allah, yang ganjarannya lebih baik '
        'bagiku dan lebih abadi daripada apa yang mungkin kalian berikan kepadaku.</p>'
        '<p><em>(&ldquo;Dan aku tidak akan mengusir orang-orang yang beriman. Sesungguhnya '
        'mereka akan bertemu dengan Tuhannya, akan tetapi aku memandang kamu sekalian '
        'adalah kaum yang tidak mengetahui.&rdquo;)</em> (Surah Hud 11:29) Seolah-olah '
        'mereka telah memintanya untuk mengusir orang-orang tersebut dari sisinya dan '
        'berjanji akan bergabung dengannya jika ia melakukan hal itu. Namun Nuh (as) '
        'menolak dengan tegas karena orang-orang yang beriman adalah saudara-saudaranya '
        'yang mulia.</p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Dan (Nuh) berkata, &ldquo;Aku tidak '
        'meminta upah kepadamu atas seruanku ini. Upahku tidak lain hanyalah dari '
        'Allah, dan aku sekali-kali tidak akan mengusir orang-orang yang telah beriman. '
        'Sesungguhnya mereka akan bertemu dengan Tuhannya, tetapi aku memandangmu '
        'adalah kaum yang bodoh.&rdquo;)</em> (Surah Hud 11:29)</p>'
        '<p>Para pemimpin kafir dari kaum Nuh (as) menolak dakwahnya dengan berbagai alasan. '
        'Salah satu alasan mereka adalah bahwa orang-orang yang mengikuti Nuh (as) '
        'adalah orang-orang lemah dan miskin, bukan orang-orang terhormat. Mereka '
        'berkata kepada Nuh (as): &ldquo;Apakah kami harus beriman kepadamu, padahal '
        'yang mengikutimu adalah orang-orang yang hina?&rdquo;</p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Mereka berkata, &ldquo;Tidakkah kami '
        'melihat kamu, melainkan (sebagai) seorang manusia (biasa) seperti kami dan '
        'kami tidak melihat orang-orang yang mengikuti kamu, melainkan orang-orang yang '
        'hina dina di antara kami yang lekas percaya saja.&rdquo;)</em> (Surah Hud 11:27)</p>'
        '<p>Ini adalah pola yang berulang dalam sejarah dakwah para nabi: orang-orang '
        'kaya dan berkuasa sering kali menolak kebenaran karena takut kehilangan kedudukan '
        'mereka, sementara orang-orang yang lemah dan miskin justru lebih mudah menerima '
        'kebenaran karena mereka tidak memiliki ikatan duniawi yang menghalangi mereka '
        'dari mengikuti para nabi.</p>'
    ),
}

# ============================================================
# Chapter 042 — Nuh as witness; the ark
# ============================================================
translations['042'] = {
    'title_id': 'Bagian 42',
    'content_id': (
        '<p>oleh Al-Bukhari, atas otoritas Abu Sa\'id Al-Khudri (ra), yang berkata: '
        'Rasulullah ﷺ bersabda: &ldquo;Nuh (as) dan kaumnya akan datang dan Allah '
        'Yang Maha Agung, Yang Maha Perkasa akan berfirman: \'Apakah engkau telah '
        'menyampaikan (risalah)?\' Ia (Nuh) akan menjawab: \'Ya, ya Tuhanku!\' '
        'Kemudian Dia akan bertanya kepada kaumnya: \'Apakah ia telah menyampaikan '
        'risalah kepada kalian?\' Namun mereka akan menjawab: \'Tidak, tidak ada nabi '
        'yang datang kepada kami.\' Allah kemudian akan bertanya kepada Nuh (as): '
        '\'Siapakah yang akan bersaksi bagimu?\' Ia akan menjawab: \'Muhammad dan '
        'umatnya.\' Mereka pun akan bersaksi bahwa ia telah menyampaikan risalah.&rdquo; '
        'Dan itulah makna firman Allah: </p>'
        '<p><em>(Dan demikian pula Kami telah menjadikan kamu, umat Islam, umat yang '
        'adil dan pilihan agar kamu menjadi saksi atas perbuatan manusia dan agar '
        'Rasul (Muhammad) menjadi saksi atas perbuatanmu.)</em> (Surah Al-Baqarah 2:143)</p>'
        '<p>Umat Nabi Muhammad ﷺ akan menjadi saksi bagi seluruh umat manusia pada '
        'Hari Kiamat, karena mereka adalah umat terbaik yang telah diberikan kitab '
        'yang paling sempurna dan nabi yang terakhir dan terbaik.</p>'
        '<p><strong>Perintah Membangun Bahtera</strong></p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Buatlah bahtera itu dengan pengawasan '
        'dan wahyu Kami, dan janganlah kamu bicarakan dengan Aku tentang orang-orang '
        'yang zalim itu; sesungguhnya mereka itu akan ditenggelamkan.)</em> '
        '(Surah Hud 11:37)</p>'
        '<p>Nuh (as) pun membangun bahtera atas perintah Allah. Ketika kaum Nuh '
        'melihatnya membangun bahtera di daratan jauh dari laut, mereka pun '
        'mengejeknya. Namun Nuh (as) tidak terpengaruh oleh ejekan mereka dan '
        'terus membangun bahtera dengan penuh keyakinan kepada janji Allah.</p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Dan mulailah Nuh membuat bahtera. '
        'Dan setiap kali pemimpin kaumnya berjalan melewati Nuh, mereka mengejeknya. '
        'Berkatalah Nuh: &ldquo;Jika kamu mengejek kami, maka sesungguhnya kami pun '
        'mengejekmu sebagaimana kamu sekalian mengejek kami.&rdquo;)</em> '
        '(Surah Hud 11:38)</p>'
        '<p>Pelajaran dari kisah ini adalah bahwa seorang mukmin harus teguh dan sabar '
        'dalam menghadapi ejekan dan cemoohan ketika menjalankan perintah Allah, '
        'karena kebenaran pasti akan menang pada akhirnya.</p>'
    ),
}

# ============================================================
# Chapter 043 — The flood: the earth covered, all things drowned
# ============================================================
translations['043'] = {
    'title_id': 'Bagian 43',
    'content_id': (
        '<p>panjang dan lebarnya, dataran-dataran rendah, tanah-tanah yang bergelombang, '
        'gunung-gunung, gurun-gurun, dan pasir-pasirnya. Tidak ada makhluk hidup yang '
        'tersisa di permukaan bumi, baik yang besar maupun yang kecil.</p>'
        '<p>Dan difirmankan: &ldquo;Hai bumi, telanlah airmu!&rdquo; dan '
        '&ldquo;Hai langit, berhentilah!&rdquo; Dan air pun surut dan ketetapan '
        'Allah pun terpenuhi (yaitu kebinasaan kaum Nuh). Dan bahtera itu pun '
        'berlabuh di Gunung Judi, dan dikatakan: &ldquo;Binasalah orang-orang yang '
        'zalim.&rdquo; (Surah Hud 11:44) Artinya, ketika Allah telah menangani '
        'penghuni bumi dan tidak ada seorang pun dari mereka yang tersisa selain '
        'orang-orang yang bersama Nuh (as) dalam bahtera.</p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Maka Kami buka pintu-pintu langit '
        'dengan air yang mencurah. Dan Kami jadikan bumi memencar dengan mata air-mata '
        'airnya, maka bertemulah air-air itu untuk satu urusan yang sungguh-sungguh '
        'telah ditetapkan. Dan Kami angkat Nuh ke atas (bahtera) yang terbuat dari '
        'papan dan paku, yang berlayar dengan pemeliharaan Kami sebagai balasan bagi '
        'orang yang diingkari (Nuh).)</em> (Surah Al-Qamar 54:11-14)</p>'
        '<p>Banjir besar yang menimpa kaum Nuh (as) adalah salah satu azab terbesar '
        'yang pernah menimpa suatu umat. Air datang dari langit dan memancar dari '
        'dalam bumi, sehingga seluruh permukaan bumi tertutup oleh air. Tidak ada '
        'tempat yang tinggi sekalipun yang luput dari banjir tersebut.</p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Dan Kami berfirman: '
        '&ldquo;Muatkanlah ke dalamnya (bahtera) dari masing-masing binatang sepasang '
        '(jantan dan betina), dan keluargamu kecuali orang yang telah terdahulu '
        'ketetapan terhadapnya dan orang-orang yang beriman.&rdquo; Dan tidak beriman '
        'bersama dengan Nuh itu kecuali sedikit.)</em> (Surah Hud 11:40)</p>'
        '<p>Di antara yang tidak diselamatkan adalah putra Nuh (as) sendiri yang '
        'menolak beriman dan lebih memilih naik ke gunung daripada ikut bersama '
        'bahtera ayahnya. Allah Yang Maha Tinggi berfirman tentang kejadian tersebut, '
        'dan ini mengajarkan kita bahwa ikatan keluarga tidak dapat menggantikan '
        'keimanan kepada Allah. Semoga Allah senantiasa menjaga iman kita dan '
        'keluarga kita.</p>'
    ),
}

# ============================================================
# Chapter 044 — Nuh's sermon after the flood; the prohibition of shirk and kibr
# ============================================================
translations['044'] = {
    'title_id': 'Bagian 44',
    'content_id': (
        '<p>tujuh langit dan tujuh bumi adalah lingkaran yang gelap, niscaya ia akan '
        'dipenuhi oleh &ldquo;La ilaha illallah.&rdquo; Segala puji bagi Allah, karena '
        'di dalamnya terdapat hubungan dengan segala sesuatu dan melaluinya seluruh '
        'ciptaan ditopang. Aku melarang kalian untuk berbuat syirik (menyekutukan Allah) '
        'dan berbuat kibr (sombong).&rdquo; Seseorang — entah Abdullah atau orang lain — '
        'berkata: &ldquo;Wahai Rasulullah! Adapun syirik, kami mengetahuinya, tetapi '
        'apakah kibr itu? Apakah bila salah seorang di antara kami memiliki sepasang '
        'sandal yang bagus dengan tali-tali yang bagus?&rdquo; Beliau ﷺ bersabda: '
        '&ldquo;Bukan.&rdquo; Si penanya bertanya: &ldquo;Apakah bila salah seorang '
        'di antara kami memiliki pakaian yang bagus?&rdquo;</p>'
        '<p>Beliau ﷺ bersabda: &ldquo;Bukan.&rdquo; Si penanya bertanya lebih lanjut: '
        '&ldquo;Apakah bila salah seorang di antara kami memiliki kendaraan yang bagus?&rdquo; '
        'Beliau ﷺ bersabda: &ldquo;Bukan.&rdquo; Mereka bertanya: &ldquo;Lalu apakah '
        'kibr itu, wahai Rasulullah?&rdquo; Beliau bersabda: &ldquo;Kibr adalah menolak '
        'kebenaran dan meremehkan manusia.&rdquo; (HR. Muslim)</p>'
        '<p>Ini adalah wasiat yang sangat penting yang beliau sampaikan kepada putra-putranya '
        'sebelum wafat. Wasiat itu mencakup dua hal pokok:</p>'
        '<p>Pertama, menjauhi syirik — yaitu menyekutukan Allah dalam ibadah, karena syirik '
        'adalah dosa terbesar yang tidak akan diampuni Allah jika seseorang meninggal '
        'dalam keadaan mempersekutukan-Nya.</p>'
        '<p>Kedua, menjauhi kibr (kesombongan) — yaitu menolak kebenaran dan meremehkan '
        'orang lain. Kesombongan adalah sumber dari banyak dosa dan keburukan, '
        'sebagaimana Iblis yang sombong menjadi makhluk pertama yang durhaka kepada Allah.</p>'
        '<p>Nabi ﷺ bersabda: &ldquo;Tidak akan masuk surga orang yang dalam hatinya '
        'terdapat kesombongan seberat biji sawi.&rdquo; (HR. Muslim) Dan beliau juga '
        'bersabda: &ldquo;Allah berfirman: \'Kesombongan adalah selendang-Ku dan '
        'keagungan adalah kain sarung-Ku, maka siapa yang mencabut salah satunya '
        'dari-Ku, maka Aku akan menyiksanya.\'&rdquo; (HR. Abu Dawud) Semoga Allah '
        'melindungi kita semua dari sifat kibr dan menjadikan kita orang-orang yang '
        'senantiasa tawadhu\' (rendah hati).</p>'
    ),
}

# ============================================================
# Chapter 045 — Story of Nuh's da'wah continued; punishment of deniers
# ============================================================
translations['045'] = {
    'title_id': 'Bagian 45',
    'content_id': (
        '<p>&ldquo;Ya Tuhanku! Tolonglah aku karena mereka mendustakanku.&rdquo; Dia (Allah) '
        'berfirman: &ldquo;Dalam waktu yang tidak lama lagi, mereka pasti akan menyesal.&rdquo; '
        'Maka As-Saihah (hukuman — jeritan yang dahsyat, dan sebagainya) menimpa mereka '
        'dengan adil, dan Kami jadikan mereka seperti sampah yang hanyut. Maka celakalah '
        'orang-orang yang zalim itu. (Surah Al-Mu\'minun 23:31-41)</p>'
        '<p>Dia Yang Maha Tinggi berfirman dalam Surah Ha Mim As-Sajdah (Fussilat): '
        '<em>(Adapun kaum \'Ad, mereka menyombongkan diri di muka bumi tanpa alasan yang '
        'benar, dan mereka berkata: &ldquo;Siapakah yang lebih besar kekuatannya dari '
        'kami?&rdquo; Dan apakah mereka tidak memperhatikan bahwa Allah yang menciptakan '
        'mereka adalah lebih besar kekuatan-Nya dari mereka?)</em> (Surah Fussilat 41:15)</p>'
        '<p>Setelah kaum Nuh (as) dibinasakan dengan banjir besar, Allah menyelamatkan Nuh '
        '(as) dan orang-orang yang beriman bersamanya dalam bahtera. Kemudian Allah '
        'memerintahkan bahtera itu untuk berlabuh di Gunung Judi dan memerintahkan '
        'Nuh (as) untuk turun bersama pengikutnya.</p>'
        '<p>Nuh (as) adalah bapak kedua umat manusia. Seluruh manusia yang hidup setelah '
        'banjir besar adalah keturunan dari tiga putra Nuh (as): Sam (Sem), Ham, dan '
        'Yafits (Japheth). Dari Sam (as) lahirlah bangsa Arab, Persia, dan Romawi. '
        'Dari Ham lahirlah bangsa Afrika dan berkulit hitam. Dari Yafits lahirlah '
        'bangsa Turki, Slavik, dan lainnya.</p>'
        '<p>Nabi ﷺ menyebut Nuh (as) sebagai &ldquo;Adam kedua&rdquo; karena dari '
        'beliaulah seluruh umat manusia yang ada sekarang berasal. Allah Yang Maha Tinggi '
        'mengabadikan kisah Nuh (as) dalam Al-Quran untuk menjadi pelajaran bagi seluruh '
        'umat manusia: bahwa keselamatan hanya ada pada ketaatan kepada Allah dan '
        'mengikuti para nabi dan rasul-Nya; sedangkan keingkaran dan kesombongan '
        'hanya akan membawa kepada kebinasaan.</p>'
        '<p>Semoga Allah menjadikan kita termasuk orang-orang yang mengambil pelajaran '
        'dari kisah-kisah para nabi dan menjauhi keingkaran yang mengundang azab Allah.</p>'
    ),
}

# ============================================================
# Chapter 046 — Story of Nabi Hud; the people of Ad
# ============================================================
translations['046'] = {
    'title_id': 'Bagian 46',
    'content_id': (
        '<p>bertawakkal kepada Allah, Tuhanku dan Tuhanmu! Tidak ada suatu makhluk bergerak '
        'kecuali Dia-lah yang menguasai ubun-ubunnya (yakni takdir semua makhluk ada di '
        'tangan-Nya). Sesungguhnya Tuhanku di atas jalan yang lurus.&rdquo;) '
        '(Surah Hud 11:56)</p>'
        '<p>Artinya, aku meletakkan iman dan kepercayaanku kepada Allah, dan aku '
        'mendapat dukungan dari-Nya, dan aku yakin dengan Perlindungan-Nya yang '
        'tidak menyesatkan mereka yang mencarinya dan berserah diri kepada-Nya. '
        'Maka aku tidak peduli dengan makhluk mana pun selain Dia, dan aku tidak '
        'bertawakkal kepada siapa pun selain Dia, dan aku tidak menyembah siapa pun '
        'selain Dia.</p>'
        '<p>Ini saja merupakan bukti yang tegas bahwa Hud (as) adalah hamba dan '
        'utusan Allah; beliau memproklamirkan tauhid secara terang-terangan di '
        'hadapan kaumnya yang keras kepala.</p>'
        '<p><strong>Kisah Nabi Hud (as) dan Kaum \'Ad</strong></p>'
        '<p>Nabi Hud (as) diutus kepada kaum \'Ad, yaitu kaum yang tinggal di '
        'Ahqaf (bukit-bukit pasir) di wilayah yang sekarang dikenal sebagai '
        'Yaman bagian selatan. Mereka adalah kaum yang memiliki tubuh besar dan kekuatan '
        'yang luar biasa, serta dikenal membangun istana-istana yang megah dan kokoh '
        'di puncak-puncak bukit.</p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Dan kepada kaum \'Ad, (Kami utus) '
        'saudara mereka, Hud. Ia berkata: &ldquo;Hai kaumku, sembahlah Allah, '
        'sekali-kali tidak ada Tuhan bagimu selain dari-Nya. Maka mengapa kamu tidak '
        'bertakwa kepada-Nya?&rdquo;)</em> (Surah Al-A\'raf 7:65)</p>'
        '<p>Kaum \'Ad menolak dakwah Hud (as) dengan sombong, merasa bangga dengan '
        'kekuatan dan kemewahan mereka. Mereka berkata: &ldquo;Siapakah yang lebih '
        'besar kekuatannya dari kami?&rdquo; Maka Allah mengirimkan kepada mereka '
        'angin yang sangat dahsyat yang menghancurkan mereka.</p>'
        '<p>Allah Yang Maha Tinggi berfirman: <em>(Maka Kami tiupkan kepada mereka '
        'angin yang sangat dingin pada hari sial yang terus-menerus, yang '
        'menggelimpangkan manusia seakan-akan mereka batang-batang kurma yang '
        'telah tumbang.)</em> (Surah Al-Qamar 54:19-20)</p>'
        '<p>Kisah kaum \'Ad dan Nabi Hud (as) mengajarkan kita bahwa kekuatan fisik '
        'dan kekayaan materi tidak dapat melindungi seseorang dari azab Allah. '
        'Yang dapat menyelamatkan hanyalah keimanan dan ketakwaan kepada Allah. '
        'Semoga Allah menjadikan kita orang-orang yang selalu bersyukur dan '
        'tunduk kepada-Nya.</p>'
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

print('Writing chapters 031-046...')
for chnum, tdata in translations.items():
    write_chapter(chnum, tdata)
print('Done.')
