import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, t } from "@/i18n/config";
import { campaigns, findCampaign, findEvent, findPetition, findGroup } from "@/data/placeholder";
import PageHead from "@/components/PageHead";
import ShareButtons from "@/components/ShareButtons";
import PetitionCard from "@/components/PetitionCard";
import { campaignRuns } from "@/components/CampaignCard";
import Icon from "@/components/Icon";

export function generateStaticParams() {
  return campaigns.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }) {
  const { lang, id } = await params;
  const c = findCampaign(id);
  return c ? { title: t(c.title, lang), description: t(c.goal, lang) } : {};
}

export default async function CampaignPage({ params }) {
  const { lang, id } = await params;
  const c = findCampaign(id);
  if (!c) notFound();
  const d = getDictionary(lang);
  const s = d.campaign;
  const g = c.group ? findGroup(c.group) : null;
  const evs = c.events.map(findEvent).filter(Boolean);
  const pets = c.petitions.map(findPetition).filter(Boolean);

  return (
    <>
      <PageHead
        crumbHref={`/${lang}/campaigns`}
        crumbLabel={s.all}
        badges={<span className="pill pill-live"><span className="dot" />{s.eyebrow}</span>}
        title={t(c.title, lang)}
        lead={t(c.goal, lang)}
      />
      <div className="wrap detail">
        <div>
          <div className="facts" data-reveal>
            <div className="fact"><i><Icon name="calendar" /></i><div><b>{d.event.when}</b><span>{campaignRuns(c, lang, s.runs)}</span></div></div>
            <div className="fact"><i><Icon name="flag" /></i><div><b>{s.ledBy}</b>
              {g ? <Link href={`/${lang}/groups/${g.id}`} className="link-arrow">{t(g.name, lang)}</Link> : <span>{d.event.organiserParty}</span>}
            </div></div>
          </div>
          <div className="prose" data-reveal>
            <h2>{s.about}</h2>
            <p>{s.desc}</p>
          </div>

          <h2 style={{ marginTop: 28 }}>{s.events}</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {evs.length === 0 && <p style={{ color: "var(--muted)" }}>{s.noEvents}</p>}
            {evs.map((e, i) => (
              <Link key={e.id} href={`/${lang}/events/${e.id}`} className="card card-link" data-reveal style={{ "--i": i, padding: 16 }}>
                <b>{t(e.title, lang)}</b>
                <div style={{ color: "var(--muted)", fontSize: 14 }}><Icon name="pin" size={15} /> {t(e.place, lang)} · <Icon name="users" size={15} /> {e.going}</div>
              </Link>
            ))}
          </div>

          {pets.length > 0 && (
            <>
              <h2 style={{ marginTop: 28 }}>{s.petitions}</h2>
              <div className="action-grid" style={{ gridTemplateColumns: "1fr" }}>
                {pets.map((p, i) => <PetitionCard key={p.id} p={p} lang={lang} a={d.action} i={i} />)}
              </div>
            </>
          )}
          <ShareButtons title={t(c.title, lang)} c={d.common} />
        </div>
        <aside>
          <div className="card camp-aside" style={{ "--g": g?.color || "var(--saffron)" }}>
            <span className="camp-band" aria-hidden="true" />
            <p className="eyebrow">{s.goal}</p>
            <p className="big-text" style={{ margin: "0 0 14px" }}>{t(c.goal, lang)}</p>
            <Link href={`/${lang}/join`} className="btn btn-saffron">{s.join}</Link>
            {evs[0] && <Link href={`/${lang}/events/${evs[0].id}`} className="btn btn-outline" style={{ marginTop: 10 }}>{d.happening.rsvp}</Link>}
          </div>
        </aside>
      </div>
    </>
  );
}
