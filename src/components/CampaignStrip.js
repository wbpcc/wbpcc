import Link from "next/link";
import { campaigns } from "@/data/placeholder";
import CampaignCard from "./CampaignCard";

// "Ongoing campaigns" row shown at the top of What's on.
export default function CampaignStrip({ lang, s }) {
  if (!campaigns.length) return null;
  return (
    <div className="camp-strip">
      <div className="camp-strip-head">
        <h3>{s.ongoing}</h3>
        <Link href={`/${lang}/campaigns`} className="link-arrow">{s.all} →</Link>
      </div>
      <div className="camp-row">
        {campaigns.map((c, i) => <CampaignCard key={c.id} c={c} lang={lang} s={s} i={i} compact />)}
      </div>
    </div>
  );
}
