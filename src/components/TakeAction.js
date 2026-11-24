import Link from "next/link";
import { petitions } from "@/data/placeholder";
import PetitionCard from "./PetitionCard";

export default function TakeAction({ lang, d, showHead = true }) {
  const a = d.action;
  return (
    <section className="section deco deco-b" id="action">
      <div className="wrap">
        {showHead && (
          <div className="section-head" data-reveal>
            <div>
              <p className="eyebrow">{a.eyebrow}</p>
              <h2 className="h-section">{a.title}</h2>
              <p>{a.sub}</p>
            </div>
            <Link className="link-arrow" href={`/${lang}/petitions`}>{a.viewAll} →</Link>
          </div>
        )}
        <div className="action-grid">
          {petitions.map((p, i) => <PetitionCard key={p.id} p={p} lang={lang} a={a} i={i} />)}
        </div>
        <div className="request-box" data-reveal>
          <p>{a.requestText}</p>
          <Link href={`/${lang}/contact?type=petition`} className="btn btn-navy btn-sm">{a.requestBtn}</Link>
        </div>
      </div>
    </section>
  );
}
