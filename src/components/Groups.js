import Link from "next/link";
import { t } from "@/i18n/config";
import { groups, ORG_CATEGORIES } from "@/data/placeholder";
import Carousel from "./Carousel";
import OrgBlocks from "./OrgBlocks";

// Organisation cards — information only: name + one line + "Know more".
// The contact number lives on the organisation's own page.
export function GroupCard({ gr, lang, o, i = 0 }) {
  return (
    <Link href={`/${lang}/groups/${gr.id}`} className="card org-card" style={{ "--g": gr.color, "--i": i }} data-reveal>
      <div className="group-top">
        <div>
          <small className="org-cat">{o.cats[gr.category]}</small>
          <h3>{t(gr.name, lang)}</h3>
        </div>
      </div>
      <p className="org-short">{t(gr.short, lang)}</p>
      <span className="btn btn-sm btn-outline org-more">{o.knowMore} →</span>
    </Link>
  );
}

// Homepage: the frontal organisations. Full page: every category in its own block.
export default function Groups({ lang, d, showHead = true, full = false }) {
  const o = d.org;
  const cats = full ? ORG_CATEGORIES : ["frontal"];
  return (
    <section className="section deco deco-c" id="groups">
      <div className="wrap">
        {showHead && (
          <div className="section-head" data-reveal>
            <div>
              <p className="eyebrow">{o.eyebrow}</p>
              <h2 className="h-section">{o.homeTitle}</h2>
              <p>{o.homeSub}</p>
            </div>
            <Link className="link-arrow" href={`/${lang}/groups`}>{o.viewAll} →</Link>
          </div>
        )}
        {full && (
          <OrgBlocks lang={lang} blocks={cats.map((cat) => ({
            cat,
            title: o.cats[cat],
            cards: groups.filter((g) => g.category === cat).map((gr, i) => <GroupCard key={gr.id} gr={gr} lang={lang} o={o} i={i} />),
          })).filter((b) => b.cards.length)} />
        )}
        {!full && cats.map((cat) => {
          const list = groups.filter((g) => g.category === cat);
          if (!list.length) return null;
          return (
            <div key={cat} className="org-block">
              {full && <h2 className="org-block-title" data-reveal>{o.cats[cat]}</h2>}
              {/* Phones: one card at a time (carousel). Wider screens: the usual grid. */}
              <Carousel label={o.cats[cat]} gridOnDesktop trackClass={`groups-grid${cat === "frontal" ? " cols-4" : ""}`}>
                {list.map((gr, i) => <GroupCard key={gr.id} gr={gr} lang={lang} o={o} i={i} />)}
              </Carousel>
            </div>
          );
        })}
      </div>
    </section>
  );
}
