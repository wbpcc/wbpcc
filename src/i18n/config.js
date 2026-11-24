import en from "./en";
import bn from "./bn";
import hi from "./hi";
import pages from "./pages";
import portal from "./portal";
import orgText from "./org";
import { live } from "../data/live";

// English is the default. Order here = order in the language switcher.
export const locales = ["en", "bn", "hi"];
export const defaultLocale = "en";

// Shown in the switcher, each in its own script.
export const localeLabels = { en: "EN", bn: "বাং", hi: "हिं" };
export const localeNames = { en: "English", bn: "বাংলা", hi: "हिन्दी" };

// Main dictionary + the info-page strings from pages.js
const base = {
  en: { ...en, ...pages.en, ...portal.en, ...orgText.en },
  bn: { ...bn, ...pages.bn, ...portal.bn, ...orgText.bn },
  hi: { ...hi, ...pages.hi, ...portal.hi, ...orgText.hi },
};

// Wording an Admin changed in the console (hero headline, footer address,
// press-kit text …) is stored in the database as pages/text and laid over the
// dictionaries here, e.g. { hero: { title: { en, bn, hi } } }. Empty = keep default.
const isTri = (v) => v && typeof v === "object" && ["en", "bn", "hi"].some((k) => typeof v[k] === "string");
function overlay(dict, over, lang) {
  if (!over || typeof over !== "object") return dict;
  const out = { ...dict };
  for (const [k, v] of Object.entries(over)) {
    if (isTri(v)) { const s = v[lang] || v.en; if (s) out[k] = s; }
    else if (v && typeof v === "object" && dict[k] && typeof dict[k] === "object") out[k] = overlay(dict[k], v, lang);
  }
  return out;
}
const textOverrides = live?.pages?.text;
const dictionaries = Object.fromEntries(Object.entries(base).map(([l, d]) => [l, overlay(d, textOverrides, l)]));

export function isLocale(value) {
  return locales.includes(value);
}

export function getDictionary(lang) {
  return dictionaries[lang] ?? dictionaries[defaultLocale];
}

// Locale codes for dates/numbers: bn-IN gives Bengali digits (১২৩).
export const intlLocale = { en: "en-IN", bn: "bn-IN", hi: "hi-IN" };

export function formatNumber(n, lang) {
  return new Intl.NumberFormat(intlLocale[lang] || "en-IN").format(n);
}

// fill("{n} going", { n: "320" }) → "320 going"
export function fill(str, vars = {}) {
  return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
}

// Content items store text as { en, bn, hi }. Falls back to English
// when a translation is missing (Phase 2: auto-translate fills these).
export function t(field, lang) {
  if (field == null) return "";
  if (typeof field === "string") return field;
  return field[lang] || field[defaultLocale] || "";
}
