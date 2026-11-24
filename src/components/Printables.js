"use client";

import { useState } from "react";
import { locales, localeNames } from "@/i18n/config";
import Icon from "./Icon";

// ---------------------------------------------------------------------
// Printables maker. Templates are fixed (party-approved): members only
// fill in text. Preview scales with its box (container query units), so
// the same markup prints edge-to-edge on A4 / A3.
// "Download" uses the browser's print → Save as PDF (works offline,
// no server). Phase 2 can add server-rendered PDF/PNG if needed.
// ---------------------------------------------------------------------

const TEMPLATES = {
  poster: { fields: ["headline", "sub", "date", "place", "cta"], page: "A4 portrait" },
  placard: { fields: ["slogan"], page: "A3 landscape" },
  leaflet: { fields: ["headline", "sub", "points", "cta"], page: "A4 portrait" },
  social: { fields: ["headline", "sub", "date", "place"], page: "A4 portrait" },
};

function Lockup() {
  return (
    <div className="pr-lockup">
      <img src="/brand/logo.svg" alt="" />
      <div>
        <span className="bn">পশ্চিমবঙ্গ প্রদেশ কংগ্রেস</span>
        <span className="hi">पश्चिम बंगाल प्रदेश कांग्रेस</span>
        <span className="en">WEST BENGAL PRADESH CONGRESS</span>
        <span className="pr-tri"><i /><i /><i /></span>
      </div>
    </div>
  );
}

function Foot({ joinUs }) {
  return (
    <div className="pr-foot">
      <span>𝕏 ⓕ @INCWestBengal</span>
      <span>{joinUs} · wbpcc.org</span>
    </div>
  );
}

function Preview({ tpl, theme, v, joinUs, printLang }) {
  const points = (v.points || "").split("\n").map((s) => s.trim()).filter(Boolean);
  return (
    <div className={`pr pr-${tpl} theme-${theme}`} lang={printLang}>
      <div className="pr-arc" aria-hidden="true" />
      {tpl === "placard" ? (
        <>
          <div className="pr-top"><Lockup /></div>
          <div className="pr-slogan">{v.slogan}</div>
          <div className="pr-band" aria-hidden="true"><i /><i /><i /></div>
        </>
      ) : (
        <>
          <div className="pr-top"><Lockup /></div>
          <div className="pr-body">
            <h2 className="pr-head">{v.headline}</h2>
            {v.sub && <p className="pr-sub">{v.sub}</p>}
            {tpl === "leaflet" && points.length > 0 && (
              <ol className="pr-points">{points.map((p, i) => <li key={i}><b>{i + 1}</b><span>{p}</span></li>)}</ol>
            )}
            {(tpl === "poster" || tpl === "social") && (
              <div className="pr-details">
                {v.date && <span><Icon name="calendar" size="1em" /> {v.date}</span>}
                {v.place && <span><Icon name="pin" size="1em" /> {v.place}</span>}
              </div>
            )}
            {v.cta && tpl !== "social" && <div className="pr-cta">{v.cta}</div>}
          </div>
          {tpl === "social" && <div className="pr-sticker">{joinUs}</div>}
          <Foot joinUs={joinUs} />
        </>
      )}
    </div>
  );
}

export default function Printables({ lang, p, printText }) {
  const [tpl, setTpl] = useState("poster");
  const [theme, setTheme] = useState("light");
  const [printLang, setPrintLang] = useState(lang);
  const [v, setV] = useState(printText[lang].defaults);
  const def = TEMPLATES[tpl];

  function changePrintLang(l) {
    setPrintLang(l);
    setV(printText[l].defaults); // swap the sample text into the new language
  }

  function doPrint() {
    const style = document.createElement("style");
    style.textContent = `@page { size: ${def.page}; margin: 0; }`;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => style.remove(), 1500);
  }

  return (
    <div className="printables">
      <div>
        <h2 className="portal-h">{p.choose}</h2>
        <div className="tpl-picker">
          {Object.entries(TEMPLATES).map(([id, tdef]) => (
            <button key={id} type="button" className={`tpl${tpl === id ? " on" : ""}`} onClick={() => setTpl(id)} aria-pressed={tpl === id}>
              
              <b>{p.templates[id]}</b>
              <small>{p.sizes[id]}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="print-grid">
        <form className="card form" onSubmit={(e) => { e.preventDefault(); doPrint(); }}>
          {def.fields.map((f) => (
            <div className="field" key={f}>
              <label htmlFor={`pf-${f}`}>{p[f]}</label>
              {f === "points" ? (
                <textarea id={`pf-${f}`} value={v[f] || ""} onChange={(e) => setV({ ...v, [f]: e.target.value })} />
              ) : (
                <input id={`pf-${f}`} value={v[f] || ""} maxLength={f === "slogan" ? 60 : 90} onChange={(e) => setV({ ...v, [f]: e.target.value })} />
              )}
            </div>
          ))}
          {tpl !== "placard" && (
            <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend>{p.theme}</legend>
              <div className="checks" style={{ marginTop: 6 }}>
                <label><input type="radio" name="theme" checked={theme === "light"} onChange={() => setTheme("light")} /> {p.light}</label>
                <label><input type="radio" name="theme" checked={theme === "dark"} onChange={() => setTheme("dark")} /> {p.dark}</label>
              </div>
            </fieldset>
          )}
          <div className="field">
            <label htmlFor="plang">{p.language}</label>
            <select id="plang" value={printLang} onChange={(e) => changePrintLang(e.target.value)}>
              {locales.map((l) => <option key={l} value={l}>{localeNames[l]}</option>)}
            </select>
          </div>
          <button className="btn btn-saffron" type="submit"><Icon name="download" /> {p.download}</button>
          <p className="form-note">{p.downloadHint}</p>
          <p className="form-note"><Icon name="lock" size={15} /> {p.approved}</p>
        </form>

        <div className="print-stage">
          <div className="print-area">
            <Preview tpl={tpl} theme={tpl === "placard" ? "light" : theme} v={v} joinUs={printText[printLang].joinUs} printLang={printLang} />
          </div>
        </div>
      </div>
    </div>
  );
}
