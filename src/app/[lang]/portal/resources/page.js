import { getDictionary, locales, t } from "@/i18n/config";
import { campaigns, findGroup } from "@/data/placeholder";
import Printables from "@/components/Printables";
import Icon from "@/components/Icon";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDictionary(lang).resources.title };
}

// Members' resources: ready-to-print campaign kits (uploaded by the Admin)
// + the printables maker to create your own.
export default async function ResourcesPage({ params }) {
  const { lang } = await params;
  const d = getDictionary(lang);
  const r = d.resources;
  const p = d.portal.printables;
  const printText = Object.fromEntries(locales.map((l) => { const x = getDictionary(l).portal.printables; return [l, { joinUs: x.joinUs, defaults: x.defaults }]; }));
  return (
    <div className="portal-stack">
      <div>
        <h1 className="portal-title">{r.title}</h1>
        <p className="portal-lead">{r.lead}</p>
      </div>
      <div>
        <h2 className="portal-h">{r.ready}</h2>
        <div className="kit-grid">
          {campaigns.map((c, i) => {
            const g = c.group ? findGroup(c.group) : null;
            return (
              <article key={c.id} className="card kit" data-reveal style={{ "--i": i, "--g": g?.color || "var(--saffron)" }}>
                <span className="camp-band" aria-hidden="true" />
                <small>{r.kit}</small>
                <b>{t(c.title, lang)}</b>
                <ul>
                  <li>{p.templates.poster}</li>
                  <li>{p.templates.placard}</li>
                  <li>{p.templates.leaflet}</li>
                </ul>
                <button className="btn btn-ghost btn-sm" disabled title={r.soon}><Icon name="download" /> {r.download}</button>
                <small className="cs-muted">{r.soon}</small>
              </article>
            );
          })}
        </div>
      </div>
      <div>
        <h2 className="portal-h">{r.create}</h2>
        <p className="portal-lead" style={{ marginTop: -6, marginBottom: 12 }}>{r.createLead}</p>
        <Printables lang={lang} p={p} printText={printText} />
      </div>
    </div>
  );
}