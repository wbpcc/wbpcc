"use client";

import { useState } from "react";
import { t } from "@/i18n/config";
import Icon from "./Icon";

// 35 district presidents with a quick search box.
export default function DistrictPresidents({ list, lang, c }) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const shown = list.filter((p) => !query || ["en", "bn", "hi"].some((l) => (p.district[l] || "").toLowerCase().includes(query)));
  return (
    <>
      <input className="dp-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={c.search} aria-label={c.search} />
      {shown.length === 0 && <p style={{ color: "var(--muted)" }}>{c.noMatch}</p>}
      <div className="dp-grid">
        {shown.map((p) => (
          <article key={p.id} className="card dp-card">
            {/* PLACEHOLDER: district president photo */}
            <span className="leader-photo dp-photo" aria-hidden="true">{p.initials}</span>
            <div>
              <small>{t(p.district, lang)}</small>
              <b>{t(p.name, lang)}</b>
              <a href={`tel:${p.phone.replace(/\s/g, "")}`}><Icon name="phone" size={15} /> {p.phone}</a>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
