// =====================================================================
// OUR INSPIRATION — notable Congress figures, nationally and from Bengal.
// Short lines written in our own words, using only well-established facts.
// Photos: placeholders (initials) until the Admin uploads official images.
// =====================================================================

import { fromLive, fromPage } from "./live";
const p = (id, group, years, initials, name, line) => ({ id, group, years, initials, name, line });

export const inspiration = fromLive("inspiration", [
  // ---------------- Leaders of the nation ----------------
  p("mahatma-gandhi", "national", "1869–1948", "MG",
    { en: "Mahatma Gandhi", bn: "মহাত্মা গান্ধী", hi: "महात्मा गांधी" },
    { en: "Led the freedom movement through non-violence and truth.", bn: "অহিংসা ও সত্যের পথে স্বাধীনতা আন্দোলনের নেতৃত্ব দেন।", hi: "अहिंसा और सत्य के रास्ते स्वतंत्रता आंदोलन का नेतृत्व किया।" }),
  p("jawaharlal-nehru", "national", "1889–1964", "JN",
    { en: "Jawaharlal Nehru", bn: "জওহরলাল নেহরু", hi: "जवाहरलाल नेहरू" },
    { en: "India's first Prime Minister; built its democratic institutions and modern industry.", bn: "ভারতের প্রথম প্রধানমন্ত্রী; গণতান্ত্রিক প্রতিষ্ঠান ও আধুনিক শিল্প গড়ে তোলেন।", hi: "भारत के पहले प्रधानमंत्री; लोकतांत्रिक संस्थाएँ और आधुनिक उद्योग खड़े किए।" }),
  p("sardar-patel", "national", "1875–1950", "VP",
    { en: "Sardar Vallabhbhai Patel", bn: "সর্দার বল্লভভাই প্যাটেল", hi: "सरदार वल्लभभाई पटेल" },
    { en: "Brought more than 500 princely states together into one India.", bn: "পাঁচশোরও বেশি দেশীয় রাজ্যকে এক ভারতে যুক্ত করেন।", hi: "500 से अधिक रियासतों को एक भारत में जोड़ा।" }),
  p("maulana-azad", "national", "1888–1958", "AK",
    { en: "Maulana Abul Kalam Azad", bn: "মৌলানা আবুল কালাম আজাদ", hi: "मौलाना अबुल कलाम आज़ाद" },
    { en: "Congress President and India's first Education Minister; a lifelong voice of unity.", bn: "কংগ্রেস সভাপতি ও ভারতের প্রথম শিক্ষামন্ত্রী; আজীবন ঐক্যের কণ্ঠস্বর।", hi: "कांग्रेस अध्यक्ष और भारत के पहले शिक्षा मंत्री; जीवन भर एकता की आवाज़।" }),
  p("sarojini-naidu", "national", "1879–1949", "SN",
    { en: "Sarojini Naidu", bn: "সরোজিনী নাইডু", hi: "सरोजिनी नायडू" },
    { en: "Poet and the first Indian woman to become President of the Congress, in 1925.", bn: "কবি, ১৯২৫ সালে কংগ্রেসের প্রথম ভারতীয় মহিলা সভাপতি।", hi: "कवयित्री, 1925 में कांग्रेस की पहली भारतीय महिला अध्यक्ष।" }),
  p("lal-bahadur-shastri", "national", "1904–1966", "LS",
    { en: "Lal Bahadur Shastri", bn: "লাল বাহাদুর শাস্ত্রী", hi: "लाल बहादुर शास्त्री" },
    { en: "Prime Minister who gave the call “Jai Jawan, Jai Kisan”.", bn: "প্রধানমন্ত্রী, যিনি ‘জয় জওয়ান, জয় কিষাণ’-এর ডাক দেন।", hi: "प्रधानमंत्री, जिन्होंने ‘जय जवान, जय किसान’ का नारा दिया।" }),
  p("indira-gandhi", "national", "1917–1984", "IG",
    { en: "Indira Gandhi", bn: "ইন্দিরা গান্ধী", hi: "इंदिरा गांधी" },
    { en: "India's first woman Prime Minister.", bn: "ভারতের প্রথম মহিলা প্রধানমন্ত্রী।", hi: "भारत की पहली महिला प्रधानमंत्री।" }),
  p("rajiv-gandhi", "national", "1944–1991", "RG",
    { en: "Rajiv Gandhi", bn: "রাজীব গান্ধী", hi: "राजीव गांधी" },
    { en: "Brought the computer and telecom revolution to India and gave the vote at 18.", bn: "দেশে কম্পিউটার ও টেলিযোগাযোগ বিপ্লব আনেন, ১৮ বছরে ভোটাধিকার দেন।", hi: "देश में कंप्यूटर और दूरसंचार क्रांति लाए, 18 साल में मताधिकार दिया।" }),

  // ---------------- From Bengal ----------------
  p("wc-bonnerjee", "bengal", "1844–1906", "WB",
    { en: "Womesh Chunder Bonnerjee", bn: "উমেশচন্দ্র বন্দ্যোপাধ্যায়", hi: "व्योमेश चंद्र बनर्जी" },
    { en: "The first President of the Indian National Congress, in 1885.", bn: "১৮৮৫ সালে ভারতীয় জাতীয় কংগ্রেসের প্রথম সভাপতি।", hi: "1885 में भारतीय राष्ट्रीय कांग्रेस के पहले अध्यक्ष।" }),
  p("surendranath-banerjee", "bengal", "1848–1925", "SB",
    { en: "Surendranath Banerjee", bn: "সুরেন্দ্রনাথ বন্দ্যোপাধ্যায়", hi: "सुरेंद्रनाथ बनर्जी" },
    { en: "A pioneer of Indian nationalism; Congress President in 1895 and 1902.", bn: "ভারতীয় জাতীয়তাবাদের পথিকৃৎ; ১৮৯৫ ও ১৯০২-এ কংগ্রেস সভাপতি।", hi: "भारतीय राष्ट्रवाद के अग्रदूत; 1895 और 1902 में कांग्रेस अध्यक्ष।" }),
  p("cr-das", "bengal", "1870–1925", "CD",
    { en: "Deshbandhu Chittaranjan Das", bn: "দেশবন্ধু চিত্তরঞ্জন দাশ", hi: "देशबंधु चित्तरंजन दास" },
    { en: "Lawyer and freedom fighter who gave up everything for the nation; Congress President in 1922.", bn: "আইনজীবী ও স্বাধীনতা সংগ্রামী, দেশের জন্য সর্বস্ব ত্যাগ করেন; ১৯২২-এ কংগ্রেস সভাপতি।", hi: "वकील और स्वतंत्रता सेनानी, देश के लिए सब कुछ त्याग दिया; 1922 में कांग्रेस अध्यक्ष।" }),
  p("netaji-bose", "bengal", "1897–1945", "SC",
    { en: "Netaji Subhas Chandra Bose", bn: "নেতাজি সুভাষচন্দ্র বসু", hi: "नेताजी सुभाष चंद्र बोस" },
    { en: "Congress President in 1938 and 1939; later led the Azad Hind Fauj.", bn: "১৯৩৮ ও ১৯৩৯-এ কংগ্রেস সভাপতি; পরে আজাদ হিন্দ ফৌজের নেতৃত্ব দেন।", hi: "1938 और 1939 में कांग्रेस अध्यक्ष; बाद में आज़ाद हिंद फ़ौज का नेतृत्व किया।" }),
  p("bc-roy", "bengal", "1882–1962", "BR",
    { en: "Dr Bidhan Chandra Roy", bn: "ডাঃ বিধানচন্দ্র রায়", hi: "डॉ. बिधान चंद्र रॉय" },
    { en: "Chief Minister of West Bengal, 1948–62, and builder of modern Bengal. His birthday, 1 July, is National Doctors' Day.", bn: "১৯৪৮–৬২ পশ্চিমবঙ্গের মুখ্যমন্ত্রী, আধুনিক বাংলার রূপকার। তাঁর জন্মদিন ১ জুলাই জাতীয় চিকিৎসক দিবস।", hi: "1948–62 तक पश्चिम बंगाल के मुख्यमंत्री, आधुनिक बंगाल के निर्माता। उनका जन्मदिन 1 जुलाई राष्ट्रीय चिकित्सक दिवस है।" }),
  p("ghani-khan-choudhury", "bengal", "1927–2006", "GK",
    { en: "A.B.A. Ghani Khan Choudhury", bn: "এ বি এ গনি খান চৌধুরী", hi: "ए.बी.ए. ग़नी ख़ान चौधरी" },
    { en: "Malda's beloved leader; as Union Railway Minister he brought new rail projects to Bengal.", bn: "মালদার প্রিয় নেতা; কেন্দ্রীয় রেলমন্ত্রী হিসেবে বাংলায় নতুন রেল প্রকল্প আনেন।", hi: "मालदा के प्रिय नेता; केंद्रीय रेल मंत्री के रूप में बंगाल में नई रेल परियोजनाएँ लाए।" }),
  p("pranab-mukherjee", "bengal", "1935–2020", "PM",
    { en: "Pranab Mukherjee", bn: "প্রণব মুখোপাধ্যায়", hi: "प्रणब मुखर्जी" },
    { en: "A towering Congress leader from Bengal who served as President of India, 2012–17.", bn: "বাংলার বিশিষ্ট কংগ্রেস নেতা, ২০১২–১৭ ভারতের রাষ্ট্রপতি।", hi: "बंगाल के दिग्गज कांग्रेस नेता, 2012–17 में भारत के राष्ट्रपति।" }),
]);
