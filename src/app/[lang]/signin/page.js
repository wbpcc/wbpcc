import { getDictionary } from "@/i18n/config";
import PageHead from "@/components/PageHead";
import { SignInFlow } from "@/components/AuthFlows";
import { LIVE } from "@/lib/live";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDictionary(lang).auth.eyebrow };
}

// One sign-in page, three doors: Supporter · Member · Team.
export default async function SignInPage({ params }) {
  const { lang } = await params;
  const d = getDictionary(lang);
  const a = d.auth;
  return (
    <>
      <PageHead crumbHref={`/${lang}`} crumbLabel={d.nav.home} eyebrow={a.eyebrow} title={a.title} lead={a.lead} />
      <section className="section deco deco-a auth-wrap">
        <div className="wrap" style={{ maxWidth: 560 }}>
          {!LIVE && <p className="demo-note">{a.demo}</p>}
          <SignInFlow lang={lang} a={a} />
        </div>
      </section>
    </>
  );
}
