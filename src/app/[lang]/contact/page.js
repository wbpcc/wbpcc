import { getDictionary, t } from "@/i18n/config";
import { hq } from "@/data/pages";
import { offices, social } from "@/data/placeholder";
import PageHead from "@/components/PageHead";
import { OfficeMap } from "@/components/InfoForms";
import { ContactForm } from "@/components/PublicForms";
import Icon from "@/components/Icon";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDictionary(lang).contact.title };
}

export default async function ContactPage({ params }) {
  const { lang } = await params;
  const d = getDictionary(lang);
  const s = d.contact;

  return (
    <>
      <PageHead crumbHref={`/${lang}`} crumbLabel={d.nav.home} eyebrow={s.eyebrow} title={s.title} lead={s.lead} />
      <div className="wrap detail">
        <div data-reveal>
          <ContactForm lang={lang} s={d.contactForm} c={d.common} />
        </div>
        <aside style={{ display: "grid", gap: 16 }}>
          <div className="card" style={{ display: "grid", gap: 12 }}>
            <h2 style={{ fontSize: 22, margin: 0 }}>{s.hq}</h2>
            <div className="fact"><i><Icon name="pin" /></i><div><b>{s.hq}</b><span>{t(hq.address, lang)}</span></div></div>
            <div className="fact"><i><Icon name="phone" /></i><div><b>{s.phone}</b><a href={`tel:${hq.phone.replace(/\s/g, "")}`}>{hq.phone}</a></div></div>
            <div className="fact"><i><Icon name="mail" /></i><div><b>{s.email}</b><a href={`mailto:${hq.email}`}>{hq.email}</a></div></div>
            <div className="fact"><i><Icon name="clock" /></i><div><b>{s.hoursLabel}</b><span>{s.hours}</span></div></div>
          </div>
          <OfficeMap lat={hq.lat} lng={hq.lng} offices={offices} lang={lang} labels={{ office: d.happening.legendOffice, directions: s.directions }} />
          <div className="card">
            <h2 style={{ fontSize: 20, margin: "0 0 10px" }}>{s.offices}</h2>
            <ul className="office-list">
              {offices.map((o) => (
                <li key={o.id}>
                  <span><Icon name="pin" size={16} /> {t(o.name, lang)}</span>
                  <a className="link-arrow" href={`https://www.google.com/maps/dir/?api=1&destination=${o.lat},${o.lng}`} target="_blank" rel="noopener noreferrer">{s.directions} ↗</a>
                </li>
              ))}
            </ul>
            <div className="socials dark" style={{ marginTop: 14 }}>
              {social.links.map((x) => <a key={x.label} href={x.href} aria-label={x.label}>{x.label}</a>)}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
