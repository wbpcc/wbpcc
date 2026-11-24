// =====================================================================
// ORGANISATION STRUCTURE (placeholders) — State Committee, District
// Presidents, frontal organisations, cells & departments, media, INTUC.
// Names, photos and phone numbers are placeholders until the party sends
// the real list. Admin / President edit all of this in the console.
// =====================================================================

// All districts of West Bengal (used in forms + district presidents).
import { fromLive, fromPage } from "./live";
export const districts = fromPage("site", "districts", {
  alipurduar: { en: "Alipurduar", bn: "আলিপুরদুয়ার", hi: "अलीपुरद्वार" },
  bankura: { en: "Bankura", bn: "বাঁকুড়া", hi: "बांकुड़ा" },
  birbhum: { en: "Birbhum", bn: "বীরভূম", hi: "बीरभूम" },
  coochbehar: { en: "Cooch Behar", bn: "কোচবিহার", hi: "कूचबिहार" },
  ddinajpur: { en: "Dakshin Dinajpur", bn: "দক্ষিণ দিনাজপুর", hi: "दक्षिण दिनाजपुर" },
  darjeeling: { en: "Darjeeling", bn: "দার্জিলিং", hi: "दार्जिलिंग" },
  hooghly: { en: "Hooghly", bn: "হুগলি", hi: "हुगली" },
  howrah: { en: "Howrah", bn: "হাওড়া", hi: "हावड़ा" },
  jalpaiguri: { en: "Jalpaiguri", bn: "জলপাইগুড়ি", hi: "जलपाईगुड़ी" },
  jhargram: { en: "Jhargram", bn: "ঝাড়গ্রাম", hi: "झाड़ग्राम" },
  kalimpong: { en: "Kalimpong", bn: "কালিম্পং", hi: "कालिम्पोंग" },
  kolkata: { en: "Kolkata", bn: "কলকাতা", hi: "कोलकाता" },
  malda: { en: "Malda", bn: "মালদা", hi: "मालदा" },
  murshidabad: { en: "Murshidabad", bn: "মুর্শিদাবাদ", hi: "मुर्शिदाबाद" },
  nadia: { en: "Nadia", bn: "নদিয়া", hi: "नदिया" },
  n24pgs: { en: "North 24 Parganas", bn: "উত্তর ২৪ পরগনা", hi: "उत्तर 24 परगना" },
  pbardhaman: { en: "Paschim Bardhaman", bn: "পশ্চিম বর্ধমান", hi: "पश्चिम बर्धमान" },
  pmedinipur: { en: "Paschim Medinipur", bn: "পশ্চিম মেদিনীপুর", hi: "पश्चिम मेदिनीपुर" },
  pubardhaman: { en: "Purba Bardhaman", bn: "পূর্ব বর্ধমান", hi: "पूर्व बर्धमान" },
  pumedinipur: { en: "Purba Medinipur", bn: "পূর্ব মেদিনীপুর", hi: "पूर्व मेदिनीपुर" },
  purulia: { en: "Purulia", bn: "পুরুলিয়া", hi: "पुरुलिया" },
  s24pgs: { en: "South 24 Parganas", bn: "দক্ষিণ ২৪ পরগনা", hi: "दक्षिण 24 परगना" },
  udinajpur: { en: "Uttar Dinajpur", bn: "উত্তর দিনাজপুর", hi: "उत्तर दिनाजपुर" },
});

const ph = { en: "Name Placeholder", bn: "নাম (পরে বসবে)", hi: "नाम (बाद में)" };
const phone = (n) => `+91 00000 ${String(n).padStart(5, "0")}`;

// ---------------- State Committee ----------------
// level: president → vp → gs (shown top to bottom on the Leadership page)
const vp = { en: "Vice President", bn: "সহ-সভাপতি", hi: "उपाध्यक्ष" };
const gs = { en: "General Secretary", bn: "সাধারণ সম্পাদক", hi: "महासचिव" };
export const leaders = fromLive("leaders", [
  { id: "state-president", level: "president", initials: "SP", name: ph, role: { en: "State President", bn: "রাজ্য সভাপতি", hi: "प्रदेश अध्यक्ष" }, phone: phone(100), email: "president@wbpcc.org" },
  ...[1, 2, 3, 4].map((n) => ({ id: `vp-${n}`, level: "vp", initials: "VP", name: ph, role: vp, phone: phone(100 + n), email: `vp${n}@wbpcc.org` })),
  ...[1, 2, 3, 4].map((n) => ({ id: `gs-${n}`, level: "gs", initials: "GS", name: ph, role: gs, phone: phone(110 + n), email: `gensec${n}@wbpcc.org` })),
]);

// ---------------- 35 District Presidents ----------------
// The party has 35 organisational districts. The real list isn't in yet, so
// the 23 administrative districts are used first + 12 numbered placeholders.
const extra = Array.from({ length: 12 }, (_, i) => {
  const n = 24 + i;
  return [`org-district-${n}`, { en: `Organisational district ${n}`, bn: `সাংগঠনিক জেলা ${n}`, hi: `संगठनात्मक ज़िला ${n}` }];
});
export const districtPresidents = fromLive("districtPresidents", [...Object.entries(districts), ...extra].map(([key, name], i) => ({
  id: `dp-${key}`, district: name, name: ph, initials: "DP", phone: phone(200 + i),
})));

// ---------------- Organisation system ----------------
// category: frontal | cells | media | intuc
const org = (id, category, icon, color, en, bn, hi, n) => ({
  id, category, icon, color, name: { en, bn, hi }, head: ph, phone: phone(300 + n), email: `${id}@wbpcc.org`,
});

// One-line description shown on each card (Admin edits these in the console).
const SHORT = {
  "youth-congress": { en: "Young Congress workers organising for jobs, education and a fair deal for youth.", bn: "চাকরি, শিক্ষা ও তরুণদের ন্যায্য অধিকারের জন্য সংগঠিত তরুণ কংগ্রেস কর্মীরা।", hi: "रोज़गार, शिक्षा और युवाओं के हक़ के लिए संगठित युवा कांग्रेस कार्यकर्ता।" },
  "chhatra-parishad": { en: "The Congress's student organisation on campuses across Bengal.", bn: "বাংলা জুড়ে কলেজ-বিশ্ববিদ্যালয়ে কংগ্রেসের ছাত্র সংগঠন।", hi: "पूरे बंगाल के कॉलेज-विश्वविद्यालयों में कांग्रेस का छात्र संगठन।" },
  "seva-dal": { en: "The volunteer corps of the Congress — service, discipline and relief work.", bn: "কংগ্রেসের স্বেচ্ছাসেবক বাহিনী — সেবা, শৃঙ্খলা ও ত্রাণকাজ।", hi: "कांग्रेस का स्वयंसेवक दल — सेवा, अनुशासन और राहत कार्य।" },
  "mahila-congress": { en: "The women's wing — for safety, equal pay and women's leadership.", bn: "মহিলা শাখা — নিরাপত্তা, সমান মজুরি ও নারী নেতৃত্বের জন্য।", hi: "महिला शाखा — सुरक्षा, समान वेतन और महिला नेतृत्व के लिए।" },
  "sc-cell": { en: "Works for the rights, dignity and representation of Scheduled Castes.", bn: "তফসিলি জাতির অধিকার, মর্যাদা ও প্রতিনিধিত্বের জন্য কাজ করে।", hi: "अनुसूचित जातियों के अधिकार, सम्मान और प्रतिनिधित्व के लिए काम करता है।" },
  "st-cell": { en: "Works for the rights, land and livelihoods of Scheduled Tribes.", bn: "তফসিলি উপজাতির অধিকার, জমি ও জীবিকার জন্য কাজ করে।", hi: "अनुसूचित जनजातियों के अधिकार, ज़मीन और आजीविका के लिए काम करता है।" },
  "obc-cell": { en: "Works for fair opportunity and representation for Other Backward Classes.", bn: "অন্যান্য অনগ্রসর শ্রেণির ন্যায্য সুযোগ ও প্রতিনিধিত্বের জন্য কাজ করে।", hi: "अन्य पिछड़ा वर्ग के उचित अवसर और प्रतिनिधित्व के लिए काम करता है।" },
  "minorities-cell": { en: "Works for the equal rights, safety and progress of minority communities.", bn: "সংখ্যালঘু সম্প্রদায়ের সমান অধিকার, নিরাপত্তা ও অগ্রগতির জন্য কাজ করে।", hi: "अल्पसंख्यक समुदायों के बराबर अधिकार, सुरक्षा और प्रगति के लिए काम करता है।" },
  "kisan-congress": { en: "Stands with farmers for fair prices, irrigation and crop insurance.", bn: "ন্যায্য দাম, সেচ ও ফসল বিমার দাবিতে কৃষকদের পাশে।", hi: "उचित दाम, सिंचाई और फ़सल बीमा के लिए किसानों के साथ।" },
  "adivasi-congress": { en: "A voice for Adivasi communities — forest rights, culture and development.", bn: "আদিবাসী সম্প্রদায়ের কণ্ঠস্বর — বনাধিকার, সংস্কৃতি ও উন্নয়ন।", hi: "आदिवासी समुदायों की आवाज़ — वन अधिकार, संस्कृति और विकास।" },
  "professional-congress": { en: "Brings doctors, engineers, lawyers and other professionals into public life.", bn: "চিকিৎসক, ইঞ্জিনিয়ার, আইনজীবী ও অন্যান্য পেশাদারদের জনজীবনে যুক্ত করে।", hi: "डॉक्टरों, इंजीनियरों, वकीलों और अन्य पेशेवरों को सार्वजनिक जीवन से जोड़ता है।" },
  "cultural-cell": { en: "Celebrates and protects Bengal's art, music, literature and heritage.", bn: "বাংলার শিল্প, সংগীত, সাহিত্য ও ঐতিহ্যের চর্চা ও সংরক্ষণ।", hi: "बंगाल की कला, संगीत, साहित्य और विरासत का उत्सव और संरक्षण।" },
  "legal-cell": { en: "Legal help for party workers and citizens, and advice on law and policy.", bn: "দলীয় কর্মী ও নাগরিকদের আইনি সহায়তা, আইন ও নীতি বিষয়ে পরামর্শ।", hi: "पार्टी कार्यकर्ताओं और नागरिकों को क़ानूनी मदद, क़ानून और नीति पर सलाह।" },
  "social-media": { en: "Runs the party's social media and digital outreach.", bn: "দলের সোশ্যাল মিডিয়া ও ডিজিটাল প্রচার পরিচালনা করে।", hi: "पार्टी का सोशल मीडिया और डिजिटल संपर्क संभालता है।" },
  "media-publishing": { en: "Handles press relations, statements and party publications.", bn: "সংবাদমাধ্যমের সঙ্গে যোগাযোগ, বিবৃতি ও দলীয় প্রকাশনা দেখে।", hi: "प्रेस संबंध, बयान और पार्टी प्रकाशन संभालता है।" },
  "intuc": { en: "The Indian National Trade Union Congress — standing with workers for fair wages and safe jobs.", bn: "ভারতীয় জাতীয় ট্রেড ইউনিয়ন কংগ্রেস — ন্যায্য মজুরি ও নিরাপদ কাজের জন্য শ্রমিকদের পাশে।", hi: "भारतीय राष्ट्रीय ट्रेड यूनियन कांग्रेस — उचित मज़दूरी और सुरक्षित काम के लिए मज़दूरों के साथ।" },
};

export const groups = fromLive("groups", [
  org("youth-congress", "frontal", "⚡", "var(--saffron)", "Youth Congress", "যুব কংগ্রেস", "युवा कांग्रेस", 1),
  org("chhatra-parishad", "frontal", "🎓", "var(--sky)", "Chhatra Parishad", "ছাত্র পরিষদ", "छात्र परिषद", 2),
  org("seva-dal", "frontal", "🙏", "var(--green)", "Seva Dal", "সেবা দল", "सेवा दल", 3),
  org("mahila-congress", "frontal", "✊", "var(--navy)", "Mahila Congress", "মহিলা কংগ্রেস", "महिला कांग्रेस", 4),

  org("sc-cell", "cells", "🤝", "var(--navy-2)", "SC Cell", "তফসিলি জাতি সেল", "अनुसूचित जाति प्रकोष्ठ", 5),
  org("st-cell", "cells", "🌿", "var(--green)", "ST Cell", "তফসিলি উপজাতি সেল", "अनुसूचित जनजाति प्रकोष्ठ", 6),
  org("obc-cell", "cells", "⚖️", "var(--sky)", "OBC Cell", "ওবিসি সেল", "ओबीसी प्रकोष्ठ", 7),
  org("minorities-cell", "cells", "☪️", "var(--navy)", "Minorities Cell", "সংখ্যালঘু সেল", "अल्पसंख्यक प्रकोष्ठ", 8),
  org("kisan-congress", "cells", "🌾", "var(--yellow)", "Kisan Congress", "কিষাণ কংগ্রেস", "किसान कांग्रेस", 9),
  org("adivasi-congress", "cells", "🏹", "var(--saffron)", "Adivasi Congress", "আদিবাসী কংগ্রেস", "आदिवासी कांग्रेस", 10),
  org("professional-congress", "cells", "💼", "var(--navy-2)", "Professional Congress", "প্রফেশনাল কংগ্রেস", "प्रोफ़ेशनल कांग्रेस", 11),
  org("cultural-cell", "cells", "🎭", "var(--saffron)", "Cultural Cell", "সাংস্কৃতিক সেল", "सांस्कृतिक प्रकोष्ठ", 12),
  org("legal-cell", "cells", "📜", "var(--navy)", "Legal Cell", "আইন সেল", "विधि प्रकोष्ठ", 13),

  org("social-media", "media", "📱", "var(--sky)", "Social Media & Digital Communications", "সোশ্যাল মিডিয়া ও ডিজিটাল যোগাযোগ বিভাগ", "सोशल मीडिया और डिजिटल संचार विभाग", 14),
  org("media-publishing", "media", "📰", "var(--navy)", "Media & Publishing", "মিডিয়া ও প্রকাশনা বিভাগ", "मीडिया और प्रकाशन विभाग", 15),

  org("intuc", "intuc", "🛠️", "var(--green)", "INTUC", "আইএনটিইউসি", "इंटक", 16),
]);
groups.forEach((g) => { g.short = SHORT[g.id]; });

export const ORG_CATEGORIES = fromPage("site", "orgCategories", ["frontal", "cells", "media", "intuc"]);
