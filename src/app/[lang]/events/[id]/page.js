import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, t } from "@/i18n/config";
import { events, findEvent, findGroup, campaignForEvent } from "@/data/placeholder";
import PageHead from "@/components/PageHead";
import ShareButtons from "@/components/ShareButtons";
import { EventStatus, EventWhen, EventRsvp, EventMap } from "@/components/EventLive";
import Icon from "@/components/Icon";

export function generateStaticParams() {
  return events.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }) {
  const { lang, id } = await params;
  const e = findEvent(id);
  return e ? { title: t(e.title, lang) } : {};
}

export default async function EventPage({ params }) {
  const { lang, id } = await params;
  const e = findEvent(id);
  if (!e) notFound();
  const d = getDictionary(lang);
  const h = d.happening, ev = d.event;
  const group = e.group ? findGroup(e.group) : null;
  const camp = campaignForEvent(e.id);
  const others = events.filter((x) => x.id !== e.id && x.startInHours > 0).slice(0, 3);

  return (
    <>
      <PageHead
        crumbHref={`/${lang}/events`}
        crumbLabel={h.allEvents}
        badges={<EventStatus event={e} h={h} />}
        title={t(e.title, lang)}
        lead={t(e.place, lang)}
      />
      <div className="wrap detail">
        <div>
          <div className="facts" data-reveal>
            <div className="fact"><i><Icon name="calendar" /></i><div><b>{ev.when}</b><EventWhen event={e} lang={lang} /></div></div>
            <div className="fact"><i><Icon name="pin" /></i><div><b>{ev.where}</b><span>{t(e.place, lang)}</span></div></div>
            <div className="fact"><i><Icon name="flag" /></i><div><b>{ev.organiser}</b>
              {group ? <Link href={`/${lang}/groups/${group.id}`} className="link-arrow">{t(group.name, lang)}</Link> : <span>{ev.organiserParty}</span>}
            </div></div>
            {camp && <div className="fact"><i><Icon name="flag" /></i><div><b>{d.campaign.partOf}</b><Link href={`/${lang}/campaigns/${camp.id}`} className="link-arrow">{t(camp.title, lang)}</Link></div></div>}
          </div>
          <EventMap event={e} lang={lang} h={h} />
          <div className="prose" data-reveal>
            <h2>{ev.about}</h2>
            <p>{d.ph.eventDesc}</p>
          </div>
          <ShareButtons title={t(e.title, lang)} c={d.common} />
        </div>
        <aside>
          <EventRsvp event={e} lang={lang} h={h} ev={ev} />
          {others.length > 0 && (
            <div style={{ marginTop: 22 }}>
              <h2 style={{ fontSize: 20 }}>{ev.more}</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {others.map((o) => (
                  <Link key={o.id} href={`/${lang}/events/${o.id}`} className="card card-link" style={{ padding: 14 }}>
                    <b>{t(o.title, lang)}</b>
                    <div style={{ color: "var(--muted)", fontSize: 14 }}><Icon name="pin" size={15} /> {t(o.place, lang)}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
