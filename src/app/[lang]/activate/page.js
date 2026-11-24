import { getDictionary } from "@/i18n/config";
import PageHead from "@/components/PageHead";
import { ActivateFlow } from "@/components/AuthFlows";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDictionary(lang).activate.eyebrow };
}

// Reached from the one-time link Leadership sends after approving an application.
export default async function ActivatePage({ params }) {
  const { lang } = await params;
  const d = getDictionary(lang);
  const v = d.activate;
  return (
    <>
      <PageHead crumbHref={`/${lang}/signin`} crumbLabel={d.auth.eyebrow} eyebrow={v.eyebrow} title={v.title} lead={v.lead} />
      <section className="section deco deco-c auth-wrap">
        <div className="wrap" style={{ maxWidth: 560 }}>
          <p className="demo-note">{d.auth.demo}</p>
          <ActivateFlow lang={lang} v={v} />
        </div>
      </section>
    </>
  );
}
