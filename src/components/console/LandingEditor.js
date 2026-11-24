"use client";

import { useEffect, useState } from "react";
import { t, getDictionary } from "@/i18n/config";
import { tickerItems, events as evSeed, featured, stats } from "@/data/placeholder";
import { PageTitle, Panel, LangField, Flash, useFlash, ConfirmPublish } from "./ui";
import { useLiveDocs, useLiveList, savePage, requestPublish, savedMessage, LIVE } from "@/lib/cms";

// Landing page editor — Admin. Edits the hero text, the LIVE ticker,
// the featured "Live now" card and the headline numbers.
//  • Hero wording → pages/text (laid over the language files when the site builds)
//  • Ticker, featured card, numbers → pages/home
const HERO_KEYS = ["eyebrow", "title", "titleEm", "sub"];
const heroFrom = (lang) => getDictionary(lang).hero;
const seedHero = () => Object.fromEntries(HERO_KEYS.map((k) => [k, { en: heroFrom("en")[k], bn: heroFrom("bn")[k], hi: heroFrom("hi")[k] }]));
const withIds = (list) => list.map((x, i) => ({ id: `t${i}-${Date.now()}`, ...x }));

export default function LandingEditor() {
  const [hero, setHero] = useState(seedHero);
  const [ticker, setTicker] = useState(() => withIds(tickerItems));
  const [feat, setFeat] = useState(featured.eventId);
  const [when, setWhen] = useState(featured.when || { en: "", bn: "", hi: "" });
  const [nums, setNums] = useState({ events: stats.eventsThisWeek, districts: stats.districts });
  const [events] = useLiveList("events", evSeed);
  const [docs, loadState] = useLiveDocs(["text", "home"]);
  const [pl, setPl] = useState("en");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [msg, flash] = useFlash();
  const touch = (fn) => (...a) => { fn(...a); setDirty(true); };

  // When the database answers, show what's actually live.
  useEffect(() => {
    if (loadState !== "ready") return;
    const h = docs.text?.hero;
    if (h) setHero((cur) => Object.fromEntries(HERO_KEYS.map((k) => [k, { ...cur[k], ...(h[k] || {}) }])));
    const home = docs.home;
    if (home?.tickerItems) setTicker(withIds(home.tickerItems));
    if (home?.featured?.eventId) setFeat(home.featured.eventId);
    if (home?.featured?.when) setWhen(home.featured.when);
    if (home?.numbers) setNums((n) => ({ ...n, ...home.numbers }));
  }, [loadState, docs]);

  const move = (i, d) => {
    const n = [...ticker]; const j = i + d;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]]; setTicker(n); setDirty(true);
  };
  const ev = events.find((e) => e.id === feat);

  async function publish() {
    setConfirming(false);
    setBusy(true);
    try {
      await savePage("text", { hero }, "Home page · hero");
      await savePage("home", {
        tickerItems: ticker.map(({ id, ...x }) => x),
        featured: { ...featured, eventId: feat, when },
        numbers: { events: Number(nums.events) || 0, districts: Number(nums.districts) || 0 },
      }, "Home page · ticker, live card & numbers");
      setDirty(false);
      flash(savedMessage(await requestPublish(), "Home page saved"));
    } catch (e) {
      flash(`⚠️ Not saved: ${e.code === "permission-denied" ? "only an Admin can change this." : e.message}`);
    }
    setBusy(false);
  }

  return (
    <>
      <PageTitle title="Landing page" sub="What every visitor sees first. Submit saves it straight away; the public homepage shows it about 2 minutes later.">
        <button className="btn btn-saffron" disabled={!dirty || busy || (LIVE && loadState !== "ready")} onClick={() => setConfirming(true)}>{busy ? "Saving…" : "Submit changes"}</button>
      </PageTitle>
      <Flash msg={msg} />
      {loadState === "loading" && <p className="form-note">⏳ Loading the live homepage from the database…</p>}
      {loadState === "error" && <p className="cs-warn small">⚠️ Couldn&apos;t load from the database — check your internet and reload before editing.</p>}
      <ConfirmPublish open={confirming} page="Home page" changes={["Hero text", "LIVE ticker (" + ticker.length + " items)", "“Live now” card", "Headline numbers"]} onCancel={() => setConfirming(false)} onConfirm={publish} />

      <div className="cs-two wide-left">
        <div className="cs-stack">
          <Panel title="Hero">
            <div className="form">
              <LangField label="Small line above the headline" value={hero.eyebrow} onChange={touch((v) => setHero({ ...hero, eyebrow: v }))} />
              <LangField label="Headline — line 1" value={hero.title} onChange={touch((v) => setHero({ ...hero, title: v }))} />
              <LangField label="Headline — line 2 (saffron)" value={hero.titleEm} onChange={touch((v) => setHero({ ...hero, titleEm: v }))} />
              <LangField label="Sub-line" value={hero.sub} onChange={touch((v) => setHero({ ...hero, sub: v }))} multiline rows={3} />
              <div className="field">
                <label>Hero photo</label>
                {LIVE
                  ? <p className="form-note">🖼️ Photo uploads come in a later step.</p>
                  : <label className="dropzone"><span>🖼️ Upload a photo</span><small>Rally or Congress Bhavan · at least 1600 px wide</small><input type="file" accept="image/*" className="sr-only" onChange={() => setDirty(true)} /></label>}
              </div>
            </div>
          </Panel>

          <Panel title="LIVE ticker" actions={<button className="btn btn-ghost btn-sm" onClick={() => { setTicker([...ticker, { id: `t-${Date.now()}`, href: "/", text: { en: "", bn: "", hi: "" } }]); setDirty(true); }}>+ Add item</button>}>
            <div className="cs-list">
              {ticker.map((it, i) => (
                <div key={it.id} className="cs-ticker-item">
                  <div className="cs-order">
                    <button type="button" onClick={() => move(i, -1)} aria-label="Move up">↑</button>
                    <button type="button" onClick={() => move(i, 1)} aria-label="Move down">↓</button>
                  </div>
                  <div className="form" style={{ flex: 1 }}>
                    <LangField label={`Item ${i + 1}`} value={it.text} onChange={touch((v) => setTicker(ticker.map((x) => (x.id === it.id ? { ...x, text: v } : x))))} />
                    <div className="field"><label>Opens</label><input value={it.href} onChange={touch((e) => setTicker(ticker.map((x) => (x.id === it.id ? { ...x, href: e.target.value } : x))))} /></div>
                  </div>
                  <button type="button" className="cs-x" aria-label="Remove" onClick={() => { setTicker(ticker.filter((x) => x.id !== it.id)); setDirty(true); }}>✕</button>
                </div>
              ))}
            </div>
          </Panel>

          <div className="cs-two">
            <Panel title="“Live now” card">
              <div className="form">
                <div className="field">
                  <label>Event</label>
                  <select value={feat} onChange={touch((e) => setFeat(e.target.value))}>
                    {events.map((e) => <option key={e.id} value={e.id}>{t(e.title, "en")}</option>)}
                  </select>
                </div>
                <LangField label="When (shown on the card)" value={when} onChange={touch(setWhen)} />
              </div>
            </Panel>
            <Panel title="Headline numbers">
              <div className="form">
                <div className="field"><label>Events this week</label><input type="number" value={nums.events} onChange={touch((e) => setNums({ ...nums, events: e.target.value }))} /></div>
                <div className="field"><label>Districts</label><input type="number" value={nums.districts} onChange={touch((e) => setNums({ ...nums, districts: e.target.value }))} /></div>
                <p className="form-note">Organisations and petition signatures are counted automatically.</p>
              </div>
            </Panel>
          </div>
        </div>

        <div className="cs-sticky">
          <Panel title="Preview" actions={
            <div className="lang-tabs">
              {[["en", "EN"], ["bn", "বাং"], ["hi", "हिं"]].map(([k, l]) => <button key={k} type="button" aria-pressed={pl === k} onClick={() => setPl(k)}>{l}</button>)}
            </div>
          }>
            <div className="lp-preview" lang={pl}>
              <div className="lp-ticker"><span>LIVE</span><em>{ticker.map((x) => x.text[pl] || x.text.en).filter(Boolean).join("  •  ")}</em></div>
              <div className="lp-hero">
                <small>{hero.eyebrow[pl] || hero.eyebrow.en}</small>
                <h3>{hero.title[pl] || hero.title.en}<br /><em>{hero.titleEm[pl] || hero.titleEm.en}</em></h3>
                <p>{hero.sub[pl] || hero.sub.en}</p>
                <div className="lp-btns"><i>✋ Join</i><i>📍 Events</i><i>✍️ Sign</i></div>
                {ev && <div className="lp-live"><b>● LIVE NOW</b>{t(ev.title, pl)}</div>}
              </div>
              <div className="lp-stats"><span><b>{nums.events}</b>events</span><span><b>{stats.groups}</b>groups</span><span><b>{nums.districts}</b>districts</span></div>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
