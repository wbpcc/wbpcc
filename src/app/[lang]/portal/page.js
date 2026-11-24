import Link from "next/link";
import { getDictionary, t, intlLocale } from "@/i18n/config";
import { findEvent } from "@/data/placeholder";
import { demoMember, announcements } from "@/data/portal";
import Icon from "@/components/Icon";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDictionary(lang).portal.title };
}

export default async function PortalDashboard({ params }) {
  const { lang } = await params;
  const d = getDictionary(lang);
  const p = d.portal;
  const date = (iso) => new Intl.DateTimeFormat(intlLocale[lang], { day: "numeric", month: "short" }).format(new Date(iso));
  const quick = [
    ["/resources", "print", d.resources.title, d.resources.ready + " · " + d.resources.create],
    ["/appointment", "calendar", d.appointment.title, d.appointment.eyebrow],
    ["/feedback", "chat", d.contactForm.types.feedback, d.contactForm.types.suggestion + " · " + d.contactForm.types.grievance],
  ];

  return (
    <div className="portal-stack">
      <div>
        <h2 className="portal-h">{p.quick}</h2>
        <div className="quick-grid">
          {quick.map(([href, icon, title, sub], i) => (
            <Link key={href} href={`/${lang}/portal${href}`} className="card card-link quick" data-reveal style={{ "--i": i }}>
              <i aria-hidden="true"><Icon name={icon} size={24} /></i>
              <b>{title}</b>
              <small>{sub}</small>
            </Link>
          ))}
        </div>
      </div>

      <div className="two-col">
        <div>
          <h2 className="portal-h">{p.announcements}</h2>
          <div className="announce-list">
            {announcements.map((a, i) => (
              <article key={a.id} className="card announce" data-reveal style={{ "--i": i }}>
                <small><b>{t(a.from, lang)}</b> · {date(a.date)}</small>
                <p>{t(a.text, lang)}</p>
              </article>
            ))}
          </div>
        </div>
        <div>
          <h2 className="portal-h">{p.upcoming}</h2>
          <div className="announce-list">
            {demoMember.upcoming.map((id, i) => {
              const e = findEvent(id);
              return (
                <Link key={id} href={`/${lang}/events/${id}`} className="card card-link announce" data-reveal style={{ "--i": i }}>
                  <b>{t(e.title, lang)}</b>
                  <small><Icon name="pin" size={14} /> {t(e.place, lang)}</small>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
