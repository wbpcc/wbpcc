// =====================================================================
// PLACEHOLDER CONTENT for the public pages (About, Manifesto, Contact,
// Help, Volunteer). Admin Editors will edit all of this in the console.
// Text fields are { en, bn, hi }.
// =====================================================================

import { fromLive, fromPage } from "./live";
export const ideology = fromPage("about", "ideology", {
  intro: {
    en: "The Indian National Congress works for the well-being and progress of every person in India. Through peaceful and constitutional means, it aims to build a democratic and secular nation where every citizen has equal rights, equal opportunity and a life of dignity — and an India that stands for peace and friendship in the world. In Bengal, we carry this aim into every district, block and ward.",
    bn: "ভারতীয় জাতীয় কংগ্রেস ভারতের প্রতিটি মানুষের কল্যাণ ও অগ্রগতির জন্য কাজ করে। শান্তিপূর্ণ ও সাংবিধানিক পথে এমন এক গণতান্ত্রিক ও ধর্মনিরপেক্ষ দেশ গড়াই তার লক্ষ্য, যেখানে প্রত্যেক নাগরিকের সমান অধিকার, সমান সুযোগ ও মর্যাদাপূর্ণ জীবন থাকবে — আর বিশ্বে ভারত হবে শান্তি ও বন্ধুত্বের পক্ষে। বাংলায় আমরা এই লক্ষ্য প্রতিটি জেলা, ব্লক ও ওয়ার্ডে পৌঁছে দিই।",
    hi: "भारतीय राष्ट्रीय कांग्रेस भारत के हर व्यक्ति के कल्याण और प्रगति के लिए काम करती है। शांतिपूर्ण और संवैधानिक तरीक़ों से उसका लक्ष्य ऐसा लोकतांत्रिक और धर्मनिरपेक्ष देश बनाना है जहाँ हर नागरिक को बराबर अधिकार, बराबर अवसर और सम्मान का जीवन मिले — और दुनिया में भारत शांति और मित्रता के पक्ष में खड़ा हो। बंगाल में हम यह लक्ष्य हर ज़िले, ब्लॉक और वार्ड तक ले जाते हैं।",
  },
  pillars: [
    {
      icon: "🤝",
      t: { en: "Unity in diversity", bn: "বৈচিত্র্যের মধ্যে ঐক্য", hi: "विविधता में एकता" },
      d: { en: "Every faith, language and community of Bengal, equal before the law.", bn: "বাংলার প্রতিটি ধর্ম, ভাষা ও সম্প্রদায় আইনের চোখে সমান।", hi: "बंगाल का हर धर्म, भाषा और समुदाय क़ानून की नज़र में बराबर।" },
    },
    {
      icon: "⚖️",
      t: { en: "Social justice", bn: "সামাজিক ন্যায়", hi: "सामाजिक न्याय" },
      d: { en: "Dignity, opportunity and protection for the poorest first.", bn: "সবচেয়ে গরিবদের জন্য আগে মর্যাদা, সুযোগ ও সুরক্ষা।", hi: "सबसे ग़रीब के लिए पहले सम्मान, अवसर और सुरक्षा।" },
    },
    {
      icon: "📜",
      t: { en: "Democracy & the Constitution", bn: "গণতন্ত্র ও সংবিধান", hi: "लोकतंत्र और संविधान" },
      d: { en: "Free institutions, a free press, free and fair elections.", bn: "স্বাধীন প্রতিষ্ঠান, স্বাধীন সংবাদমাধ্যম, অবাধ ও সুষ্ঠু নির্বাচন।", hi: "स्वतंत्र संस्थाएँ, स्वतंत्र प्रेस, स्वतंत्र और निष्पक्ष चुनाव।" },
    },
    {
      icon: "🛠️",
      t: { en: "Work with dignity", bn: "মর্যাদার সঙ্গে কাজ", hi: "सम्मान के साथ काम" },
      d: { en: "Jobs, fair wages and support for farmers and workers.", bn: "কাজ, ন্যায্য মজুরি এবং কৃষক ও শ্রমিকদের পাশে থাকা।", hi: "रोज़गार, उचित मज़दूरी और किसानों-मज़दूरों का साथ।" },
    },
  ],
});

export const values = fromPage("about", "values", [
  { icon: "🕊️", t: { en: "Non-violence", bn: "অহিংসা", hi: "अहिंसा" }, d: { en: "Change through peaceful means — the path shown by Mahatma Gandhi.", bn: "শান্তিপূর্ণ পথে পরিবর্তন — মহাত্মা গান্ধীর দেখানো পথ।", hi: "शांतिपूर्ण तरीक़ों से बदलाव — महात्मा गांधी का दिखाया रास्ता।" } },
  { icon: "🤝", t: { en: "Secularism", bn: "ধর্মনিরপেক্ষতা", hi: "धर्मनिरपेक्षता" }, d: { en: "Equal respect for every faith. The state belongs to all.", bn: "সব ধর্মের প্রতি সমান শ্রদ্ধা। রাষ্ট্র সবার।", hi: "हर धर्म का बराबर सम्मान। राज्य सबका है।" } },
  { icon: "📜", t: { en: "Faith in the Constitution", bn: "সংবিধানে আস্থা", hi: "संविधान में आस्था" }, d: { en: "Rights, freedoms and free institutions protected for every citizen.", bn: "প্রত্যেক নাগরিকের অধিকার, স্বাধীনতা ও স্বাধীন প্রতিষ্ঠান সুরক্ষিত।", hi: "हर नागरिक के अधिकार, आज़ादी और स्वतंत्र संस्थाएँ सुरक्षित।" } },
  { icon: "⚖️", t: { en: "Equality & justice", bn: "সমতা ও ন্যায়", hi: "समानता और न्याय" }, d: { en: "No one held back by caste, creed, gender or income.", bn: "জাত, ধর্ম, লিঙ্গ বা আয়ের কারণে কেউ পিছিয়ে থাকবে না।", hi: "जाति, धर्म, लिंग या आय के कारण कोई पीछे नहीं रहेगा।" } },
  { icon: "🙏", t: { en: "Service (Seva)", bn: "সেবা", hi: "सेवा" }, d: { en: "Politics as service to people — not a path to power.", bn: "রাজনীতি মানে মানুষের সেবা — ক্ষমতার পথ নয়।", hi: "राजनीति यानी जनता की सेवा — सत्ता का रास्ता नहीं।" } },
  { icon: "🇮🇳", t: { en: "Unity of India", bn: "ভারতের ঐক্য", hi: "भारत की एकता" }, d: { en: "One nation of many languages, cultures and peoples.", bn: "বহু ভাষা, সংস্কৃতি ও মানুষের এক দেশ।", hi: "अनेक भाषाओं, संस्कृतियों और लोगों का एक देश।" } },
]);

export const vision = fromPage("about", "vision", {
  quote: {
    en: "Placeholder: the State President's vision for Bengal — two or three lines in their own words.",
    bn: "নমুনা লেখা: বাংলার জন্য রাজ্য সভাপতির স্বপ্ন — তাঁর নিজের ভাষায় দু-তিন লাইন।",
    hi: "नमूना पाठ: बंगाल के लिए प्रदेश अध्यक्ष का सपना — उनके अपने शब्दों में दो-तीन पंक्तियाँ।",
  },
  points: [
    { en: "Jobs in Bengal, for Bengal's youth", bn: "বাংলার যুবদের জন্য বাংলাতেই কাজ", hi: "बंगाल के युवाओं को बंगाल में ही रोज़गार" },
    { en: "A school and a health centre that work, in every block", bn: "প্রতিটি ব্লকে চালু স্কুল ও স্বাস্থ্যকেন্দ্র", hi: "हर ब्लॉक में चालू स्कूल और स्वास्थ्य केंद्र" },
    { en: "Safe streets and equal pay for women", bn: "নারীদের জন্য নিরাপদ রাস্তা ও সমান মজুরি", hi: "महिलाओं के लिए सुरक्षित सड़कें और बराबर वेतन" },
  ],
});

export const manifesto = fromPage("manifesto", "items", [
  {
    id: "jobs", icon: "💼",
    t: { en: "Jobs & economy", bn: "কাজ ও অর্থনীতি", hi: "रोज़गार और अर्थव्यवस्था" },
    items: [
      { en: "Fill all vacant government posts within a fixed timeline", bn: "নির্দিষ্ট সময়ের মধ্যে সব শূন্য সরকারি পদ পূরণ", hi: "तय समय में सभी ख़ाली सरकारी पद भरना" },
      { en: "Support for small businesses and local industry", bn: "ছোট ব্যবসা ও স্থানীয় শিল্পের পাশে থাকা", hi: "छोटे व्यापार और स्थानीय उद्योग को सहारा" },
      { en: "A paid apprenticeship for every young graduate who wants one", bn: "আগ্রহী প্রত্যেক তরুণ স্নাতকের জন্য ভাতাসহ শিক্ষানবিশি", hi: "हर इच्छुक युवा स्नातक के लिए वेतन वाली अप्रेंटिसशिप" },
    ],
  },
  {
    id: "education", icon: "🎓",
    t: { en: "Education", bn: "শিক্ষা", hi: "शिक्षा" },
    items: [
      { en: "Transparent teacher recruitment", bn: "স্বচ্ছ শিক্ষক নিয়োগ", hi: "पारदर्शी शिक्षक भर्ती" },
      { en: "Scholarships paid on time", bn: "সময়মতো স্কলারশিপ", hi: "समय पर छात्रवृत्ति" },
      { en: "Working labs and libraries in every school", bn: "প্রতিটি স্কুলে চালু ল্যাব ও লাইব্রেরি", hi: "हर स्कूल में चालू लैब और पुस्तकालय" },
    ],
  },
  {
    id: "health", icon: "🏥",
    t: { en: "Health", bn: "স্বাস্থ্য", hi: "स्वास्थ्य" },
    items: [
      { en: "A doctor at every primary health centre", bn: "প্রতিটি প্রাথমিক স্বাস্থ্যকেন্দ্রে ডাক্তার", hi: "हर प्राथमिक स्वास्थ्य केंद्र में डॉक्टर" },
      { en: "Free essential medicines", bn: "বিনামূল্যে জরুরি ওষুধ", hi: "मुफ़्त ज़रूरी दवाएँ" },
      { en: "An ambulance within 30 minutes", bn: "৩০ মিনিটের মধ্যে অ্যাম্বুলেন্স", hi: "30 मिनट में एम्बुलेंस" },
    ],
  },
  {
    id: "women", icon: "🛡️",
    t: { en: "Women & safety", bn: "নারী ও নিরাপত্তা", hi: "महिलाएँ और सुरक्षा" },
    items: [
      { en: "Well-lit, patrolled streets and transport", bn: "আলোকিত, টহলদারি রাস্তা ও যানবাহন", hi: "रोशन, गश्त वाली सड़कें और परिवहन" },
      { en: "Fast-track courts for crimes against women", bn: "নারী নির্যাতনের মামলায় ফাস্ট-ট্র্যাক কোর্ট", hi: "महिलाओं के ख़िलाफ़ अपराधों के लिए फ़ास्ट-ट्रैक कोर्ट" },
      { en: "Equal pay for equal work, and direct support for women in poor households", bn: "সমান কাজে সমান মজুরি, আর গরিব পরিবারের নারীদের সরাসরি আর্থিক সহায়তা", hi: "समान काम का समान वेतन, और ग़रीब परिवारों की महिलाओं को सीधी आर्थिक मदद" },
    ],
  },
  {
    id: "farmers", icon: "🌾",
    t: { en: "Farmers & workers", bn: "কৃষক ও শ্রমিক", hi: "किसान और मज़दूर" },
    items: [
      { en: "A legal guarantee of a fair minimum support price for crops", bn: "ফসলের ন্যায্য ন্যূনতম সহায়ক মূল্যের আইনি নিশ্চয়তা", hi: "फ़सलों के उचित न्यूनतम समर्थन मूल्य की क़ानूनी गारंटी" },
      { en: "A living wage for tea garden workers", bn: "চা-বাগান শ্রমিকদের বাঁচার মতো মজুরি", hi: "चाय बागान मज़दूरों को जीने लायक़ मज़दूरी" },
      { en: "Crop insurance that pays out on time", bn: "সময়ে টাকা মেলে এমন ফসল বিমা", hi: "समय पर भुगतान वाला फ़सल बीमा" },
    ],
  },
]);

// Contact form "Type of contact" → which inbox it lands in (role emails, see ROADMAP).
export const contactTopics = fromPage("contact", "topics", [
  { id: "feedback", icon: "💬", inbox: "feedback@wbpcc.org", t: { en: "Feedback", bn: "মতামত", hi: "राय" } },
  { id: "suggestion", icon: "💡", inbox: "feedback@wbpcc.org", t: { en: "Suggestion", bn: "পরামর্শ", hi: "सुझाव" } },
  { id: "grievance", icon: "⚠️", inbox: "grievance@wbpcc.org", t: { en: "Grievance / complaint", bn: "অভিযোগ", hi: "शिकायत" } },
  { id: "help", icon: "🆘", inbox: "help@wbpcc.org", t: { en: "Need help", bn: "সাহায্য দরকার", hi: "मदद चाहिए" } },
  { id: "volunteer", icon: "🙋", inbox: "volunteer@wbpcc.org", t: { en: "I want to volunteer", bn: "স্বেচ্ছাসেবক হতে চাই", hi: "स्वयंसेवक बनना चाहता/चाहती हूँ" } },
  { id: "petition", icon: "✍️", inbox: "petitions@wbpcc.org", t: { en: "Suggest a petition", bn: "আবেদনের প্রস্তাব", hi: "याचिका का सुझाव" } },
  { id: "media", icon: "📰", inbox: "media@wbpcc.org", t: { en: "Media enquiry", bn: "সংবাদমাধ্যমের প্রশ্ন", hi: "मीडिया पूछताछ" } },
  { id: "other", icon: "✳️", inbox: "info@wbpcc.org", t: { en: "Other", bn: "অন্য কিছু", hi: "अन्य" } },
]);
// Help topics → which group handles them (null = state help desk).
export const helpTopics = fromPage("contact", "helpTopics", [
  { id: "ration", icon: "🍚", group: null, t: { en: "Ration & food", bn: "রেশন ও খাদ্য", hi: "राशन और भोजन" } },
  { id: "health", icon: "🏥", group: null, t: { en: "Health", bn: "স্বাস্থ্য", hi: "स्वास्थ्य" } },
  { id: "education", icon: "🎓", group: "chhatra-parishad", t: { en: "Education & scholarships", bn: "শিক্ষা ও স্কলারশিপ", hi: "शिक्षा और छात्रवृत्ति" } },
  { id: "jobs", icon: "💼", group: "intuc", t: { en: "Jobs & wages", bn: "কাজ ও মজুরি", hi: "रोज़गार और मज़दूरी" } },
  { id: "women", icon: "🛡️", group: "mahila-congress", t: { en: "Women's safety", bn: "নারীর নিরাপত্তা", hi: "महिला सुरक्षा" } },
  { id: "farm", icon: "🌾", group: "kisan-congress", t: { en: "Farming", bn: "চাষবাস", hi: "खेती-किसानी" } },
  { id: "legal", icon: "⚖️", group: null, t: { en: "Legal help", bn: "আইনি সাহায্য", hi: "क़ानूनी मदद" } },
  { id: "other", icon: "✳️", group: null, t: { en: "Something else", bn: "অন্য কিছু", hi: "कुछ और" } },
]);

export const volunteerSkills = fromPage("contact", "volunteerSkills", [
  { id: "events", icon: "🎪", t: { en: "Event help", bn: "অনুষ্ঠানে সাহায্য", hi: "कार्यक्रम में मदद" } },
  { id: "door", icon: "🚪", t: { en: "Door-to-door", bn: "বাড়ি বাড়ি প্রচার", hi: "घर-घर संपर्क" } },
  { id: "social", icon: "📱", t: { en: "Social media", bn: "সোশ্যাল মিডিয়া", hi: "सोशल मीडिया" } },
  { id: "design", icon: "🎬", t: { en: "Design & video", bn: "ডিজাইন ও ভিডিও", hi: "डिज़ाइन और वीडियो" } },
  { id: "translation", icon: "🔤", t: { en: "Translation", bn: "অনুবাদ", hi: "अनुवाद" } },
  { id: "legal", icon: "⚖️", t: { en: "Legal aid", bn: "আইনি সহায়তা", hi: "क़ानूनी सहायता" } },
  { id: "medical", icon: "🩺", t: { en: "Medical camps", bn: "চিকিৎসা শিবির", hi: "चिकित्सा शिविर" } },
  { id: "transport", icon: "🚐", t: { en: "Transport", bn: "যানবাহন", hi: "परिवहन" } },
]);

export const availability = fromPage("contact", "availability", [
  { id: "weekdays", t: { en: "Weekdays", bn: "সপ্তাহের দিন", hi: "सप्ताह के दिन" } },
  { id: "weekends", t: { en: "Weekends", bn: "সপ্তাহান্ত", hi: "सप्ताहांत" } },
  { id: "evenings", t: { en: "Evenings", bn: "সন্ধ্যা", hi: "शाम" } },
]);

export const hq = fromPage("contact", "hq", {
  lat: 22.5448, lng: 88.3876,
  address: { en: "Congress Bhavan, Kolkata (address placeholder)", bn: "কংগ্রেস ভবন, কলকাতা (ঠিকানা পরে বসবে)", hi: "कांग्रेस भवन, कोलकाता (पता बाद में)" },
  phone: "+91 00000 00000",
  email: "info@wbpcc.org",
  media: "media@wbpcc.org",
});

export const brandColours = fromPage("site", "brandColours", [
  { name: "Navy", hex: "#15223F" },
  { name: "Saffron", hex: "#F47320" },
  { name: "Green", hex: "#138741" },
  { name: "Sky", hex: "#2AA7E1" },
  { name: "Yellow", hex: "#FFD966" },
  { name: "Cream", hex: "#F8F6F0" },
]);

// History — Bengal in the Congress story. Only well-established facts;
// the party can extend this in the console (Site pages).
export const history = fromPage("history", "items", [
  { year: "1885", t: { en: "The Congress is born", bn: "কংগ্রেসের জন্ম", hi: "कांग्रेस का जन्म" },
    d: { en: "The Indian National Congress holds its first session in Bombay. It is presided over by Womesh Chunder Bonnerjee of Calcutta — a Bengali.", bn: "বোম্বাইয়ে ভারতীয় জাতীয় কংগ্রেসের প্রথম অধিবেশন। সভাপতিত্ব করেন কলকাতার উমেশচন্দ্র বন্দ্যোপাধ্যায় — একজন বাঙালি।", hi: "बंबई में भारतीय राष्ट्रीय कांग्रेस का पहला अधिवेशन। अध्यक्षता कलकत्ता के व्योमेश चंद्र बनर्जी ने की — एक बंगाली।" } },
  { year: "1886", t: { en: "Calcutta hosts the second session", bn: "কলকাতায় দ্বিতীয় অধিবেশন", hi: "कलकत्ता में दूसरा अधिवेशन" },
    d: { en: "Just a year later, Calcutta hosts the Congress's second session, presided over by Dadabhai Naoroji.", bn: "এক বছরের মধ্যেই কলকাতায় কংগ্রেসের দ্বিতীয় অধিবেশন, সভাপতি দাদাভাই নওরোজি।", hi: "एक साल बाद ही कलकत्ता में कांग्रेस का दूसरा अधिवेशन, अध्यक्ष दादाभाई नौरोजी।" } },
  { year: "1905", t: { en: "Bengal rises against partition", bn: "বঙ্গভঙ্গের বিরুদ্ধে বাংলা", hi: "बंग-भंग के ख़िलाफ़ बंगाल" },
    d: { en: "The British divide Bengal. The people answer with the Swadeshi movement — boycotting foreign goods. The partition is reversed in 1911.", bn: "ব্রিটিশরা বাংলাকে ভাগ করে। মানুষ জবাব দেয় স্বদেশি আন্দোলনে — বিদেশি পণ্য বর্জন করে। ১৯১১ সালে বঙ্গভঙ্গ রদ হয়।", hi: "अंग्रेज़ बंगाल का विभाजन करते हैं। जनता स्वदेशी आंदोलन से जवाब देती है — विदेशी सामान का बहिष्कार। 1911 में विभाजन रद्द होता है।" } },
  { year: "1906", t: { en: "Swaraj becomes the goal", bn: "স্বরাজের লক্ষ্য", hi: "स्वराज का लक्ष्य" },
    d: { en: "At the Calcutta session, under Dadabhai Naoroji, the Congress declares self-rule — Swaraj — as its goal.", bn: "কলকাতা অধিবেশনে, দাদাভাই নওরোজির সভাপতিত্বে, কংগ্রেস স্বরাজকে লক্ষ্য হিসেবে ঘোষণা করে।", hi: "कलकत्ता अधिवेशन में, दादाभाई नौरोजी की अध्यक्षता में, कांग्रेस स्वराज को अपना लक्ष्य घोषित करती है।" } },
  { year: "1911", t: { en: "Jana Gana Mana is first sung", bn: "প্রথম গাওয়া হয় ‘জনগণমন’", hi: "पहली बार गाया गया ‘जन गण मन’" },
    d: { en: "Rabindranath Tagore's song, later India's national anthem, is first sung at the Congress session in Calcutta.", bn: "রবীন্দ্রনাথ ঠাকুরের গান, পরে যা জাতীয় সংগীত, প্রথম গাওয়া হয় কলকাতায় কংগ্রেস অধিবেশনে।", hi: "रवींद्रनाथ टैगोर का गीत, जो बाद में राष्ट्रगान बना, पहली बार कलकत्ता के कांग्रेस अधिवेशन में गाया गया।" } },
  { year: "1922", t: { en: "Deshbandhu leads the Congress", bn: "দেশবন্ধুর নেতৃত্ব", hi: "देशबंधु का नेतृत्व" },
    d: { en: "Deshbandhu Chittaranjan Das presides over the Gaya session of the Congress.", bn: "দেশবন্ধু চিত্তরঞ্জন দাশ কংগ্রেসের গয়া অধিবেশনে সভাপতিত্ব করেন।", hi: "देशबंधु चित्तरंजन दास कांग्रेस के गया अधिवेशन की अध्यक्षता करते हैं।" } },
  { year: "1938", t: { en: "Netaji becomes Congress President", bn: "কংগ্রেস সভাপতি নেতাজি", hi: "कांग्रेस अध्यक्ष बने नेताजी" },
    d: { en: "Subhas Chandra Bose is elected President of the Congress at Haripura, and re-elected in 1939.", bn: "হরিপুরায় সুভাষচন্দ্র বসু কংগ্রেস সভাপতি নির্বাচিত হন, ১৯৩৯-এ আবার নির্বাচিত হন।", hi: "हरिपुरा में सुभाष चंद्र बोस कांग्रेस अध्यक्ष चुने गए, और 1939 में फिर से चुने गए।" } },
  { year: "1947", t: { en: "Freedom — and West Bengal", bn: "স্বাধীনতা — আর পশ্চিমবঙ্গ", hi: "आज़ादी — और पश्चिम बंगाल" },
    d: { en: "India becomes independent and the state of West Bengal is formed.", bn: "ভারত স্বাধীন হয়, গঠিত হয় পশ্চিমবঙ্গ রাজ্য।", hi: "भारत आज़ाद होता है और पश्चिम बंगाल राज्य बनता है।" } },
  { year: "1948", t: { en: "Building modern Bengal", bn: "আধুনিক বাংলা গড়া", hi: "आधुनिक बंगाल का निर्माण" },
    d: { en: "Dr Bidhan Chandra Roy of the Congress becomes Chief Minister and serves until 1962, planning new towns such as Durgapur and Kalyani.", bn: "কংগ্রেসের ডাঃ বিধানচন্দ্র রায় মুখ্যমন্ত্রী হন, ১৯৬২ পর্যন্ত দায়িত্বে থেকে দুর্গাপুর ও কল্যাণীর মতো নতুন শহরের পরিকল্পনা করেন।", hi: "कांग्रेस के डॉ. बिधान चंद्र रॉय मुख्यमंत्री बनते हैं और 1962 तक रहते हैं; दुर्गापुर और कल्याणी जैसे नए शहरों की योजना बनाते हैं।" } },
  { year: "Today", t: { en: "Our work today", bn: "আজকের কাজ", hi: "आज का काम" },
    d: { en: "Placeholder: the West Bengal Pradesh Congress's recent work and milestones — to be written by the party.", bn: "নমুনা লেখা: পশ্চিমবঙ্গ প্রদেশ কংগ্রেসের সাম্প্রতিক কাজ ও মাইলফলক — দল লিখবে।", hi: "नमूना पाठ: पश्चिम बंगाल प्रदेश कांग्रेस का हाल का काम और उपलब्धियाँ — पार्टी लिखेगी।" } },
]);
