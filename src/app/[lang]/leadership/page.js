import Link from "next/link";
import { getDictionary, t } from "@/i18n/config";
import { leaders, districtPresidents } from "@/data/placeholder";
import PageHead from "@/components/PageHead";
import { LeaderCard } from "@/components/Leadership";
import DistrictPresidents from "@/components/DistrictPresidents";
import Icon from "@/components/Icon";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDictionary(lang).committee.title };
}

// State Committee (President · Vice Presidents · General Secretaries) + 35 District Presidents.
export default async function LeadershipPage({ params }) {
  const { lang } = await params;
  const d = getDictionary(lang);
  const c = d.committee;
  const president = leaders.find((l) => l.level === "president");

  return (
    <>
      <PageHead crumbHref={`/${lang}`} crumbLabel={d.nav.home} eyebrow={c.eyebrow} title={c.title} lead={c.lead} />

      <section className="section deco deco-a">
        <div className="wrap">
          <article className="card president-card" data-reveal>
            {/* PLACEHOLDER: State President's photo */}
            <div className="leader-photo president-photo" aria-hidden="true">{president.initials}</div>
            <div className="president-body">
              <p className="eyebrow">{c.president}</p>
              <h2>{t(president.name, lang)}</h2>
              <p>{c.bioPh}</p>
              <div className="president-contact">
                <a href={`tel:${president.phone.replace(/\s/g, "")}`} className="btn btn-outline btn-sm"><Icon name="phone" size={16} /> {president.phone}</a>
                <a href={`mailto:${president.email}`} className="btn btn-outline btn-sm"><Icon name="mail" size={16} /> {president.email}</a>
                <Link href={`/${lang}/appointment`} className="btn btn-saffron btn-sm">{c.appointment}</Link>
              </div>
            </div>
          </article>

          {[["vp", c.vps], ["gs", c.gss]].map(([lv, title]) => (
            <div key={lv} className="org-block">
              <h2 className="org-block-title" data-reveal>{title}</h2>
              <div className="leaders">
                {leaders.filter((p) => p.level === lv).map((p, i) => <LeaderCard key={p.id} p={p} lang={lang} i={i} />)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section deco deco-b" id="districts">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <div>
              <p className="eyebrow">35</p>
              <h2 className="h-section">{c.districts}</h2>
              <p>{c.districtsLead}</p>
            </div>
          </div>
          <DistrictPresidents list={districtPresidents} lang={lang} c={c} />
        </div>
      </section>
    </>
  );
}
