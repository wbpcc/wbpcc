// =====================================================================
// PLACEHOLDER CONTENT — everything here is sample data for the design.
// In Phase 2 this comes from the database (Firestore) and the admin
// console, with Bangla/Hindi filled by auto-translation + editors.
// Text fields are { en, bn, hi }.
// =====================================================================

import { fromLive, fromPage } from "./live";
import { districts, groups, leaders } from "./org";
export { districts, groups, leaders, districtPresidents, ORG_CATEGORIES } from "./org";


// Times are relative to "now" so Live / Upcoming / This-month
// always has something to show while we design.
export const events = fromLive("events", [
  {
    id: "jobs-for-youth-rally", district: "kolkata", group: "youth-congress", startInHours: -1, durationHours: 4, going: 1240, lat: 22.5646, lng: 88.3513,
    title: { en: "Jobs for Youth rally", bn: "যুবদের জন্য কাজ — সমাবেশ", hi: "युवाओं को रोज़गार — रैली" },
    place: { en: "Esplanade, Kolkata", bn: "ধর্মতলা, কলকাতা", hi: "एस्प्लेनेड, कोलकाता" },
  },
  {
    id: "price-rise-survey-howrah", district: "howrah", group: null, startInHours: 20, durationHours: 5, going: 85, lat: 22.5717, lng: 88.3125,
    title: { en: "Door-to-door: price rise survey", bn: "বাড়ি বাড়ি: মূল্যবৃদ্ধি সমীক্ষা", hi: "घर-घर: महँगाई सर्वे" },
    place: { en: "Shibpur, Howrah", bn: "শিবপুর, হাওড়া", hi: "शिबपुर, हावड़ा" },
  },
  {
    id: "womens-safety-barasat", district: "n24pgs", group: "mahila-congress", startInHours: 44, durationHours: 3, going: 210, lat: 22.7226, lng: 88.4803,
    title: { en: "Public meeting on women's safety", bn: "নারী সুরক্ষা নিয়ে জনসভা", hi: "महिला सुरक्षा पर जनसभा" },
    place: { en: "Barasat, North 24 Parganas", bn: "বারাসত, উত্তর ২৪ পরগনা", hi: "बारासात, उत्तर 24 परगना" },
  },
  {
    id: "tea-garden-wage-meeting", district: "darjeeling", group: "intuc", startInHours: 70, durationHours: 3, going: 340, lat: 26.7271, lng: 88.3953,
    title: { en: "Tea garden workers' wage meeting", bn: "চা-বাগান শ্রমিকদের মজুরি সভা", hi: "चाय बागान मज़दूरों की मज़दूरी सभा" },
    place: { en: "Siliguri, Darjeeling", bn: "শিলিগুড়ি, দার্জিলিং", hi: "सिलीगुड़ी, दार्जिलिंग" },
  },
  {
    id: "farmers-fair-price-camp", district: "malda", group: "kisan-congress", startInHours: 5 * 24, durationHours: 6, going: 150, lat: 25.0108, lng: 88.1411,
    title: { en: "Farmers' fair-price camp", bn: "কৃষকদের ন্যায্য দাম শিবির", hi: "किसानों का उचित दाम शिविर" },
    place: { en: "English Bazar, Malda", bn: "ইংরেজবাজার, মালদা", hi: "इंग्लिश बाज़ार, मालदा" },
  },
  {
    id: "students-career-fair", district: "pbardhaman", group: "chhatra-parishad", startInHours: 8 * 24, durationHours: 6, going: 400, lat: 23.6739, lng: 86.9524,
    title: { en: "Students' career & rights fair", bn: "ছাত্রছাত্রীদের কেরিয়ার ও অধিকার মেলা", hi: "छात्रों का करियर और अधिकार मेला" },
    place: { en: "Asansol, Paschim Bardhaman", bn: "আসানসোল, পশ্চিম বর্ধমান", hi: "आसनसोल, पश्चिम बर्धमान" },
  },
  {
    id: "health-camp-berhampore", district: "murshidabad", group: "minorities-cell", startInHours: 12 * 24, durationHours: 5, going: 260, lat: 24.1, lng: 88.25,
    title: { en: "Free health check-up camp", bn: "বিনামূল্যে স্বাস্থ্য পরীক্ষা শিবির", hi: "मुफ़्त स्वास्थ्य जाँच शिविर" },
    place: { en: "Berhampore, Murshidabad", bn: "বহরমপুর, মুর্শিদাবাদ", hi: "बहरामपुर, मुर्शिदाबाद" },
  },
  {
    id: "nadia-workers-convention", district: "nadia", group: null, startInHours: 20 * 24, durationHours: 4, going: 600, lat: 23.4058, lng: 88.49,
    title: { en: "District workers' convention", bn: "জেলা কর্মী সম্মেলন", hi: "ज़िला कार्यकर्ता सम्मेलन" },
    place: { en: "Krishnanagar, Nadia", bn: "কৃষ্ণনগর, নদিয়া", hi: "कृष्णनगर, नदिया" },
  },
  {
    id: "blood-donation-kharagpur", district: "pmedinipur", group: "youth-congress", startInHours: -6 * 24, durationHours: 5, going: 180, lat: 22.346, lng: 87.232,
    title: { en: "Blood donation camp", bn: "রক্তদান শিবির", hi: "रक्तदान शिविर" },
    place: { en: "Kharagpur, Paschim Medinipur", bn: "খড়্গপুর, পশ্চিম মেদিনীপুর", hi: "खड़गपुर, पश्चिम मेदिनीपुर" },
  },
]);

export const offices = fromLive("offices", [
  { id: "o1", lat: 22.5448, lng: 88.3876, name: { en: "State headquarters", bn: "রাজ্য সদর দপ্তর", hi: "प्रदेश मुख्यालय" } },
  { id: "o2", lat: 26.71, lng: 88.43, name: { en: "District office, Siliguri", bn: "জেলা কার্যালয়, শিলিগুড়ি", hi: "ज़िला कार्यालय, सिलीगुड़ी" } },
  { id: "o3", lat: 23.685, lng: 86.98, name: { en: "District office, Asansol", bn: "জেলা কার্যালয়, আসানসোল", hi: "ज़िला कार्यालय, आसनसोल" } },
  { id: "o4", lat: 25.0, lng: 88.15, name: { en: "District office, Malda", bn: "জেলা কার্যালয়, মালদা", hi: "ज़िला कार्यालय, मालदा" } },
]);

export const featured = fromPage("home", "featured", {
  eventId: "jobs-for-youth-rally",
  when: { en: "Today · till 7 PM", bn: "আজ · সন্ধ্যা ৭টা পর্যন্ত", hi: "आज · शाम 7 बजे तक" },
});

export const tickerItems = fromPage("home", "tickerItems", [
  { href: "/events/jobs-for-youth-rally", text: { en: "Jobs for Youth rally at Esplanade, Kolkata — live now", bn: "ধর্মতলায় যুবদের কাজের দাবিতে সমাবেশ — এখন লাইভ", hi: "एस्प्लेनेड, कोलकाता में युवाओं के रोज़गार की रैली — अभी लाइव" } },
  { href: "/petitions/fill-teacher-posts", text: { en: "Teacher recruitment petition crosses 12,000 signatures", bn: "শিক্ষক নিয়োগের আবেদনে ১২,০০০-এর বেশি সই", hi: "शिक्षक भर्ती याचिका पर 12,000 से ज़्यादा हस्ताक्षर" } },
  { href: "/newsroom/teacher-recruitment-statement", text: { en: "New official statement: WBPCC/ST/2026/041", bn: "নতুন অফিসিয়াল বিবৃতি: WBPCC/ST/2026/041", hi: "नया आधिकारिक बयान: WBPCC/ST/2026/041" } },
  { href: "/events/womens-safety-barasat", text: { en: "Women's safety public meeting in Barasat the day after tomorrow", bn: "পরশু বারাসতে নারী সুরক্ষা নিয়ে জনসভা", hi: "परसों बारासात में महिला सुरक्षा पर जनसभा" } },
]);

export const petitions = fromLive("petitions", [
  {
    id: "fill-teacher-posts", type: "online", signatures: 12480, goal: 20000, startedBy: "leadership", district: null, group: "chhatra-parishad",
    title: { en: "Fill all vacant government teacher posts", bn: "সব শূন্য সরকারি শিক্ষক পদ পূরণ করুন", hi: "सभी ख़ाली सरकारी शिक्षक पद भरें" },
    desc: {
      en: "Qualified candidates are waiting while thousands of posts lie empty. Demand a time-bound recruitment drive.",
      bn: "যোগ্য প্রার্থীরা অপেক্ষায়, অথচ হাজার হাজার পদ খালি। সময়সীমা বেঁধে নিয়োগের দাবি জানান।",
      hi: "योग्य उम्मीदवार इंतज़ार में हैं, फिर भी हज़ारों पद ख़ाली हैं। समयबद्ध भर्ती की माँग करें।",
    },
    addressedTo: { en: "Education Department, Government of West Bengal", bn: "শিক্ষা দপ্তর, পশ্চিমবঙ্গ সরকার", hi: "शिक्षा विभाग, पश्चिम बंगाल सरकार" },
  },
  {
    id: "repair-shibpur-road", type: "formal", signatures: 3120, goal: 5000, startedBy: "member", district: "howrah", group: null,
    title: { en: "Repair the Shibpur–Santragachi road before the monsoon", bn: "বর্ষার আগে শিবপুর–সাঁতরাগাছি রাস্তা সারান", hi: "बारिश से पहले शिबपुर–संतरागाछी सड़क की मरम्मत करें" },
    desc: {
      en: "To be submitted to the district administration with signers' names and addresses.",
      bn: "স্বাক্ষরকারীদের নাম ও ঠিকানা সহ জেলা প্রশাসনের কাছে জমা দেওয়া হবে।",
      hi: "हस्ताक्षरकर्ताओं के नाम और पते के साथ ज़िला प्रशासन को सौंपी जाएगी।",
    },
    addressedTo: { en: "District Magistrate, Howrah", bn: "জেলাশাসক, হাওড়া", hi: "ज़िलाधिकारी, हावड़ा" },
  },
  {
    id: "tea-garden-fair-wage", type: "online", signatures: 8650, goal: 10000, startedBy: "leadership", district: null, group: "intuc",
    title: { en: "A fair daily wage for tea garden workers", bn: "চা-বাগান শ্রমিকদের ন্যায্য দৈনিক মজুরি", hi: "चाय बागान मज़दूरों को उचित दैनिक मज़दूरी" },
    desc: {
      en: "Stand with the workers of North Bengal's tea gardens.",
      bn: "উত্তরবঙ্গের চা-বাগানের শ্রমিকদের পাশে দাঁড়ান।",
      hi: "उत्तर बंगाल के चाय बागानों के मज़दूरों के साथ खड़े हों।",
    },
    addressedTo: { en: "Labour Department, Government of West Bengal", bn: "শ্রম দপ্তর, পশ্চিমবঙ্গ সরকার", hi: "श्रम विभाग, पश्चिम बंगाल सरकार" },
  },
]);



// ---------------------------------------------------------------------
// NEWSROOM posts. Video is NOT uploaded here — editors paste the
// YouTube / Instagram / Facebook link (videoUrl) and write the text.
// kind:   statement (leadership only, has statementId) | report (verified, from members) | story | explainer
// format: reel (9:16) | video (16:9) | blog (text only)
// ---------------------------------------------------------------------
export const posts = fromLive("posts", [
  {
    id: "teacher-recruitment-statement", kind: "statement", format: "video", platform: "youtube", videoUrl: null,
    statementId: "WBPCC/ST/2026/041", date: "2026-11-21", leaderId: "state-president", district: null,
    title: { en: "Statement on the teacher recruitment delay", bn: "শিক্ষক নিয়োগে দেরি নিয়ে বিবৃতি", hi: "शिक्षक भर्ती में देरी पर बयान" },
    excerpt: {
      en: "The State President calls for a time-bound recruitment drive and a public timeline for all pending posts.",
      bn: "রাজ্য সভাপতি সব বকেয়া পদের জন্য সময়সীমা বেঁধে নিয়োগ ও প্রকাশ্য সময়সূচির দাবি জানিয়েছেন।",
      hi: "प्रदेश अध्यक्ष ने सभी लंबित पदों के लिए समयबद्ध भर्ती और सार्वजनिक समय-सारिणी की माँग की है।",
    },
  },
  {
    id: "youth-rally-highlights", kind: "story", format: "reel", platform: "instagram", videoUrl: null, date: "2026-11-23", district: "kolkata",
    title: { en: "Jobs for Youth rally — highlights", bn: "যুবদের কাজের দাবিতে সমাবেশ — মুহূর্তগুলি", hi: "युवा रोज़गार रैली — झलकियाँ" },
    excerpt: { en: "Thousands at Esplanade demanding jobs, not promises.", bn: "ধর্মতলায় হাজারো মানুষ — প্রতিশ্রুতি নয়, কাজ চাই।", hi: "एस्प्लेनेड पर हज़ारों लोग — वादे नहीं, रोज़गार चाहिए।" },
  },
  {
    id: "howrah-waterlogging", kind: "report", format: "reel", platform: "instagram", videoUrl: null, date: "2026-11-22", district: "howrah",
    title: { en: "Ward 12 still waterlogged after 9 days", bn: "৯ দিন পরেও ১২ নম্বর ওয়ার্ডে জমা জল", hi: "9 दिन बाद भी वार्ड 12 में जलभराव" },
    excerpt: { en: "Residents film the flooded lanes; no pump has arrived yet.", bn: "বাসিন্দারা জলমগ্ন গলির ছবি তুলেছেন; এখনও পাম্প আসেনি।", hi: "निवासियों ने डूबी गलियों का वीडियो बनाया; अब तक पंप नहीं आया।" },
  },
  {
    id: "tea-garden-voices", kind: "report", format: "reel", platform: "facebook", videoUrl: null, date: "2026-11-20", district: "darjeeling",
    title: { en: "Tea garden workers speak about wages", bn: "মজুরি নিয়ে মুখ খুললেন চা-শ্রমিকরা", hi: "मज़दूरी पर बोले चाय बागान मज़दूर" },
    excerpt: { en: "Workers from three gardens on what a day's pay buys.", bn: "তিনটি বাগানের শ্রমিকরা জানালেন একদিনের মজুরিতে কী মেলে।", hi: "तीन बागानों के मज़दूर बताते हैं कि एक दिन की मज़दूरी में क्या मिलता है।" },
  },
  {
    id: "what-is-delimitation", kind: "explainer", format: "blog", platform: null, videoUrl: null, date: "2026-11-18", district: null,
    title: { en: "What is delimitation? A simple guide", bn: "ডিলিমিটেশন কী? সহজ ভাষায়", hi: "परिसीमन क्या है? आसान भाषा में" },
    excerpt: { en: "How constituency boundaries are redrawn — and why it matters to Bengal.", bn: "নির্বাচনী এলাকার সীমানা কীভাবে নতুন করে আঁকা হয় — আর বাংলার জন্য কেন তা গুরুত্বপূর্ণ।", hi: "निर्वाचन क्षेत्रों की सीमाएँ कैसे दोबारा खींची जाती हैं — और बंगाल के लिए यह क्यों अहम है।" },
  },
  {
    id: "murshidabad-ration", kind: "report", format: "reel", platform: "youtube", videoUrl: null, date: "2026-11-17", district: "murshidabad",
    title: { en: "Village ration shop shut for two weeks", bn: "দুই সপ্তাহ ধরে গ্রামের রেশন দোকান বন্ধ", hi: "दो हफ़्ते से गाँव की राशन दुकान बंद" },
    excerpt: { en: "Families travel 9 km for rations. Verified by our district team.", bn: "রেশনের জন্য পরিবারগুলি ৯ কিমি যাচ্ছে। জেলা দল যাচাই করেছে।", hi: "राशन के लिए परिवार 9 किमी जा रहे हैं। ज़िला टीम ने सत्यापित किया।" },
  },
  {
    id: "malda-health-centre", kind: "report", format: "blog", platform: null, videoUrl: null, date: "2026-11-16", district: "malda",
    title: { en: "Health centre without a doctor since October", bn: "অক্টোবর থেকে স্বাস্থ্যকেন্দ্রে ডাক্তার নেই", hi: "अक्टूबर से स्वास्थ्य केंद्र में डॉक्टर नहीं" },
    excerpt: { en: "Patients are being sent 30 km away for basic care.", bn: "সাধারণ চিকিৎসার জন্য রোগীদের ৩০ কিমি দূরে পাঠানো হচ্ছে।", hi: "मामूली इलाज के लिए मरीज़ों को 30 किमी दूर भेजा जा रहा है।" },
  },
  {
    id: "price-rise-statement", kind: "statement", format: "blog", platform: null, videoUrl: null,
    statementId: "WBPCC/ST/2026/040", date: "2026-11-14", leaderId: "gs-1", district: null,
    title: { en: "Statement on rising essential prices", bn: "নিত্যপ্রয়োজনীয় জিনিসের দাম বৃদ্ধি নিয়ে বিবৃতি", hi: "ज़रूरी चीज़ों की बढ़ती क़ीमतों पर बयान" },
    excerpt: { en: "The party sets out five demands to bring prices under control.", bn: "দাম নিয়ন্ত্রণে আনতে দল পাঁচটি দাবি জানিয়েছে।", hi: "क़ीमतों पर क़ाबू के लिए पार्टी ने पाँच माँगें रखीं।" },
  },
]);

// Every statement ID ever issued — used by "Verify a message".
export const statementRegistry = fromPage("site", "statementRegistry", [
  ...posts.filter((p) => p.statementId).map((p) => ({ id: p.statementId, date: p.date })),
  { id: "WBPCC/ST/2026/039", date: "2026-11-02" },
]);

export const stats = {
  eventsThisWeek: 12,
  groups: groups.length,
  districts: 23,
  signatures: petitions.reduce((sum, p) => sum + p.signatures, 0),
};

export const social = fromPage("site", "social", {
  handle: "INCWestBengal",
  links: [
    { label: "X", href: "#" },
    { label: "f", href: "#" },
    { label: "IG", href: "#" },
    { label: "YT", href: "#" },
    { label: "WA", href: "#" },
  ],
});

export const findEvent = (id) => events.find((e) => e.id === id);
export const findPetition = (id) => petitions.find((p) => p.id === id);
export const findGroup = (id) => groups.find((g) => g.id === id);
export const findLeader = (id) => leaders.find((l) => l.id === id);
export const findPost = (id) => posts.find((p) => p.id === id);

// YouTube links become an embeddable, privacy-friendly player.
export function youtubeEmbed(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null;
}

// ---------------------------------------------------------------------
// CAMPAIGNS — long-running drives started by Leadership / President.
// A campaign groups events + petitions under one goal.
// ---------------------------------------------------------------------
export const campaigns = fromLive("campaigns", [
  {
    id: "jobs-for-youth", group: "youth-congress", start: "2026-11-01", end: "2026-12-31", featured: true,
    events: ["jobs-for-youth-rally", "students-career-fair"], petitions: ["fill-teacher-posts"],
    title: { en: "Jobs for Youth", bn: "যুবদের জন্য কাজ", hi: "युवाओं को रोज़गार" },
    goal: { en: "Fill vacant government posts and open a skill centre in every district.", bn: "শূন্য সরকারি পদ পূরণ এবং প্রতিটি জেলায় দক্ষতা কেন্দ্র।", hi: "ख़ाली सरकारी पद भरना और हर ज़िले में कौशल केंद्र खोलना।" },
  },
  {
    id: "safe-streets", group: "mahila-congress", start: "2026-11-15", end: "2027-01-31", featured: false,
    events: ["womens-safety-barasat"], petitions: [],
    title: { en: "Safe Streets", bn: "নিরাপদ রাস্তা", hi: "सुरक्षित सड़कें" },
    goal: { en: "Well-lit, patrolled streets and transport for every woman in Bengal.", bn: "বাংলার প্রতিটি নারীর জন্য আলোকিত, টহলদারি রাস্তা ও যানবাহন।", hi: "बंगाल की हर महिला के लिए रोशन, गश्त वाली सड़कें और परिवहन।" },
  },
  {
    id: "fair-wages-north-bengal", group: "intuc", start: "2026-11-10", end: "2026-12-20", featured: false,
    events: ["tea-garden-wage-meeting"], petitions: ["tea-garden-fair-wage"],
    title: { en: "Fair Wages, North Bengal", bn: "ন্যায্য মজুরি, উত্তরবঙ্গ", hi: "उचित मज़दूरी, उत्तर बंगाल" },
    goal: { en: "A living wage for every tea garden worker.", bn: "প্রতিটি চা-বাগান শ্রমিকের বাঁচার মতো মজুরি।", hi: "हर चाय बागान मज़दूर को जीने लायक़ मज़दूरी।" },
  },
]);

export const findCampaign = (id) => campaigns.find((c) => c.id === id);
export const campaignForEvent = (eventId) => campaigns.find((c) => c.events.includes(eventId));
export const campaignForPetition = (petitionId) => campaigns.find((c) => c.petitions.includes(petitionId));