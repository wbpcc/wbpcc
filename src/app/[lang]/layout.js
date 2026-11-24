import { notFound } from "next/navigation";
import "../globals.css";
import { fontClasses } from "../fonts";
import { locales, isLocale, getDictionary } from "@/i18n/config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TranslationNotice from "@/components/TranslationNotice";
import BottomTabs from "@/components/BottomTabs";
import RevealObserver from "@/components/RevealObserver";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const d = getDictionary(lang);
  return {
    title: { default: `${d.hero.eyebrow} — ${d.hero.title} ${d.hero.titleEm}`, template: `%s · ${d.hero.eyebrow}` },
    description: d.hero.sub,
    icons: { icon: "/brand/logo.svg" },
    // PLACEHOLDER domain — set NEXT_PUBLIC_SITE_URL once wbpcc.org / incwb.org is decided.
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://wbpcc.org"),
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])) },
    openGraph: {
      type: "website",
      siteName: d.hero.eyebrow,
      locale: { en: "en_IN", bn: "bn_IN", hi: "hi_IN" }[lang],
      description: d.hero.sub,
    },
    twitter: { card: "summary_large_image", site: "@INCWestBengal" },
  };
}

export const viewport = { themeColor: "#15223f" };

export default async function LangLayout({ children, params }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);

  return (
    <html
      lang={lang}
      className={fontClasses}
    >
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <Header lang={lang} d={d} />
        {lang !== "en" && <TranslationNotice d={d} />}
        <main id="main" tabIndex={-1}>{children}</main>
        <Footer lang={lang} d={d} />
        <BottomTabs lang={lang} d={{ nav: d.nav }} />
        <RevealObserver />
      </body>
    </html>
  );
}
