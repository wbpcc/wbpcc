import Link from "next/link";
import { campaigns, petitions } from "@/data/placeholder";
import CampaignCard from "./CampaignCard";
import PetitionCard from "./PetitionCard";

// "Happening around you" — ongoing campaigns + petitions to sign, together.
export default function AroundYou({ lang, d }) {
  const s = d.around;
  return (
    <section className="section deco deco-c" id="action">
      <div className="wrap">
        <div className="section-head" data-reveal>
          <div>
            <p className="eyebrow">{s.eyebrow}</p>
            <h2 className="h-section">{s.title}</h2>
            <p>{s.sub}</p>
          </div>
        </div>

        <div className="around-block">
          <div className="around-head">
            <h3>{d.campaign.ongoing}</h3>
            <Link href={`/${lang}/campaigns`} className="link-arrow">{s.allCampaigns} →</Link>
          </div>
          <div className="camp-grid">
            {campaigns.map((c, i) => <CampaignCard key={c.id} c={c} lang={lang} s={d.campaign} i={i} />)}
          </div>
        </div>

        <div className="around-block">
          <div className="around-head">
            <h3>{d.action.title}</h3>
            <Link href={`/${lang}/petitions`} className="link-arrow">{s.allPetitions} →</Link>
          </div>
          <div className="action-grid">
            {petitions.map((p, i) => <PetitionCard key={p.id} p={p} lang={lang} a={d.action} i={i} />)}
          </div>
          <div className="request-box" data-reveal>
            <p>{d.action.requestText}</p>
            <Link href={`/${lang}/contact?type=petition`} className="btn btn-navy btn-sm">{d.action.requestBtn}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
