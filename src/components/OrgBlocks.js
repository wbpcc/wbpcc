"use client";

import { useEffect, useState } from "react";
import Carousel from "./Carousel";
import Icon from "./Icon";

// Organisation page: each category heading has a small List / Carousel switch
// on its right. List (the default) shows every organisation at once; the
// choice applies to all categories and is remembered on this device.
const KEY = "wbpcc-org-view";
const TXT = {
  en: { list: "List view", carousel: "Carousel view" },
  bn: { list: "তালিকা আকারে", carousel: "স্লাইড আকারে" },
  hi: { list: "सूची के रूप में", carousel: "स्लाइड के रूप में" },
};

export default function OrgBlocks({ blocks, lang }) {
  const tx = TXT[lang] || TXT.en;
  const [view, setView] = useState("list");
  useEffect(() => {
    try { const v = localStorage.getItem(KEY); if (v === "list" || v === "carousel") setView(v); } catch {}
  }, []);
  const pick = (v) => { setView(v); try { localStorage.setItem(KEY, v); } catch {} };

  return blocks.map((b) => (
    <div key={b.cat} className="org-block">
      <div className="org-block-head">
        <h2 className="org-block-title">{b.title}</h2>
        <div className="view-switch" role="group" aria-label={`${tx.list} / ${tx.carousel}`}>
          <button type="button" aria-pressed={view === "list"} aria-label={tx.list} title={tx.list} onClick={() => pick("list")}><Icon name="list" size={18} /></button>
          <button type="button" aria-pressed={view === "carousel"} aria-label={tx.carousel} title={tx.carousel} onClick={() => pick("carousel")}><Icon name="slides" size={18} /></button>
        </div>
      </div>
      {view === "list" ? (
        <div className={`groups-grid org-list${b.cat === "frontal" ? " cols-4" : ""}`}>{b.cards}</div>
      ) : (
        <Carousel label={b.title} trackClass="org-rail">{b.cards}</Carousel>
      )}
    </div>
  ));
}
