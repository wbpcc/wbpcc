import Link from "next/link";
import { t, fill, formatNumber } from "@/i18n/config";
import Icon from "./Icon";

export default function PetitionCard({ p, lang, a, i = 0 }) {
  const pct = Math.min(100, Math.round((p.signatures / p.goal) * 100));
  return (
    <Link href={`/${lang}/petitions/${p.id}`} className="card card-link petition" data-reveal style={{ "--i": i }}>
      <span className={`pill petition-tag ${p.type === "formal" ? "tag-formal" : "tag-online"}`}>
        {p.type === "formal" ? <><Icon name="landmark" size={14} /> {a.formal}</> : <><Icon name="globe" size={14} /> {a.online}</>}
      </span>
      <h3>{t(p.title, lang)}</h3>
      <p>{t(p.desc, lang)}</p>
      <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <div className="progress-meta">
        <b>{fill(a.signed, { n: formatNumber(p.signatures, lang) })}</b>
        <span>{fill(a.goal, { n: formatNumber(p.goal, lang) })}</span>
      </div>
      <span className="btn btn-saffron">{a.sign}</span>
    </Link>
  );
}
