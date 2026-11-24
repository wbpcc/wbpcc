"use client";

import { useEffect, useState } from "react";
import { t, getDictionary } from "@/i18n/config";
import { ideology, values, vision, manifesto, contactTopics, helpTopics, hq, history } from "@/data/pages";
import { groups, social } from "@/data/placeholder";
import { PageTitle, Panel, LangField, Flash, useFlash, ConfirmPublish, useQueryParam } from "./ui";
import { useLiveDocs, savePage, requestPublish, savedMessage, LIVE } from "@/lib/cms";

// "Edit any section" — every info page and site-wide block, without code.
// Each section is stored in the database (pages/about, history, manifesto,
// contact, site, text) and the public page shows it after the next update.
const tri3 = (get) => ({ en: get("en"), bn: get("bn"), hi: get("hi") });
// Footer social buttons ↔ the labels used on the website.
const SOCIAL = [["Instagram", "IG"], ["Facebook", "f"], ["X", "X"], ["YouTube", "YT"], ["WhatsApp Channel", "WA"]];
// Manifesto promises are edited as "one per line" per language; stored as a list.
const toLines = (items) => ({ en: items.map((i) => i.en).join("\n"), bn: items.map((i) => i.bn || "").join("\n"), hi: items.map((i) => i.hi || "").join("\n") });
function fromLines(text) {
  const split = (s) => (s || "").split("\n").map((x) => x.trim());
  const en = split(text.en), bn = split(text.bn), hi = split(text.hi);
  return en.map((line, i) => ({ en: line, bn: bn[i] || "", hi: hi[i] || "" })).filter((x) => x.en || x.bn || x.hi);
}

function buildState({ about, historyDoc, manifestoDoc, contact, site, text } = {}) {
  const iv = about?.ideology || ideology, vv = about?.values || values, vs = about?.vision || vision;
  const h = contact?.hq || hq, soc = site?.social || social;
  const linkOf = (label) => soc.links?.find((l) => l.label === label)?.href || "";
  return {
    ideology: { intro: iv.intro, pillars: iv.pillars.map((p) => ({ ...p })) },
    values: vv.map((v) => ({ ...v })),
    vision: { quote: vs.quote, points: vs.points.map((p) => ({ ...p })) },
    history: (historyDoc?.items || history).map((x) => ({ ...x })),
    manifesto: (manifestoDoc?.items || manifesto).map((m) => ({ ...m, text: toLines(m.items) })),
    contact: (contact?.topics || contactTopics).map((c) => ({ ...c })),
    help: (contact?.helpTopics || helpTopics).map((x) => ({ ...x })),
    footer: {
      address: text?.footer?.address || tri3((l) => getDictionary(l).footer.address),
      phone: h.phone, email: h.email, handle: soc.handle,
      links: Object.fromEntries(SOCIAL.map(([, label]) => [label, linkOf(label) === "#" ? "" : linkOf(label)])),
    },
    press: { text: text?.press?.boilerplateText || tri3((l) => getDictionary(l).press.boilerplateText), media: h.media },
    _hq: h, _social: soc,
  };
}
const SECTIONS = [
  { id: "ideology", page: "About", label: "Vision & aim (AICC)", icon: "📜" },
  { id: "values", page: "About", label: "Ethos / values (AICC)", icon: "🤍" },
  { id: "vision", page: "About", label: "Vision (President's quote)", icon: "🕊️" },
  { id: "history", page: "History", label: "Timeline", icon: "🕰️" },
  { id: "manifesto", page: "Manifesto", label: "Promises", icon: "📘" },
  { id: "contact", page: "Contact", label: "Types of contact & inboxes", icon: "✉️" },
  { id: "footer", page: "Site-wide", label: "Footer & contact details", icon: "🧭" },
  { id: "press", page: "Press kit", label: "About-the-party text", icon: "📰" },
];

export default function SitePages() {
  const [sel, setSel] = useState("ideology");
  const [confirming, setConfirming] = useState(false);
  useQueryParam("s", (v) => { if (SECTIONS.find((x) => x.id === v)) setSel(v); });
  const [msg, flash] = useFlash();
  const [state, setState] = useState(() => buildState());
  const [docs, loadState] = useLiveDocs(["about", "history", "manifesto", "contact", "site", "text"]);
  useEffect(() => {
    if (loadState === "ready") setState(buildState({ about: docs.about, historyDoc: docs.history, manifestoDoc: docs.manifesto, contact: docs.contact, site: docs.site, text: docs.text }));
  }, [loadState, docs]);
  const [published, setPublished] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (key, value) => setState({ ...state, [key]: value });
  const upd = (key, i, patch) => set(key, state[key].map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const cur = SECTIONS.find((s) => s.id === sel);

  // What each section writes to the database.
  async function saveSection(id) {
    const s = state, label = `${cur.page} · ${cur.label}`;
    if (id === "ideology") return savePage("about", { ideology: s.ideology }, label);
    if (id === "values") return savePage("about", { values: s.values }, label);
    if (id === "vision") return savePage("about", { vision: s.vision }, label);
    if (id === "history") return savePage("history", { items: s.history }, label);
    if (id === "manifesto") return savePage("manifesto", { items: s.manifesto.map(({ text, ...m }) => ({ ...m, items: fromLines(text) })) }, label);
    if (id === "contact") return savePage("contact", { topics: s.contact }, label);
    if (id === "help") return savePage("contact", { helpTopics: s.help }, label);
    if (id === "footer") {
      await savePage("text", { footer: { address: s.footer.address } }, label);
      await savePage("contact", { hq: { ...s._hq, phone: s.footer.phone, email: s.footer.email } }, label);
      return savePage("site", { social: { ...s._social, handle: s.footer.handle, links: SOCIAL.map(([, l]) => ({ label: l, href: s.footer.links[l] || "#" })) } }, label);
    }
    if (id === "press") {
      await savePage("text", { press: { boilerplateText: s.press.text } }, label);
      return savePage("contact", { hq: { ...s._hq, media: s.press.media } }, label);
    }
  }

  async function publish() {
    setConfirming(false);
    setBusy(true);
    try {
      await saveSection(sel);
      setPublished({ ...published, [sel]: new Date() });
      flash(savedMessage(await requestPublish(), `“${cur.page} · ${cur.label}” saved`));
    } catch (e) {
      flash(`⚠️ Not saved: ${e.code === "permission-denied" ? "only an Admin can change this." : e.message}`);
    }
    setBusy(false);
  }

  return (
    <>
      <PageTitle title="Site pages" sub="Edit any section of the website. Submit saves it straight away; the public page shows it about 2 minutes later.">
        <button className="btn btn-saffron" disabled={busy || (LIVE && loadState !== "ready")} onClick={() => setConfirming(true)}>{busy ? "Saving…" : "Submit changes"}</button>
      </PageTitle>
      <Flash msg={msg} />
      {loadState === "loading" && <p className="form-note">⏳ Loading the live pages from the database…</p>}
      {loadState === "error" && <p className="cs-warn small">⚠️ Couldn&apos;t load from the database — check your internet and reload before editing.</p>}
      <ConfirmPublish open={confirming} page={`${cur.page} · ${cur.label}`} onCancel={() => setConfirming(false)} onConfirm={publish} />
      <div className="tr-layout">
        <Panel title="Sections">
          <ul className="tr-list">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button type="button" aria-pressed={s.id === sel} onClick={() => setSel(s.id)}>
                  <small>{s.page}</small>
                  <b>{s.icon} {s.label}</b>
                  <span>{published[s.id] ? `🟢 Saved ${published[s.id].toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : "Live version"}</span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={`${cur.page} · ${cur.label}`} actions={<a className="link-arrow" href={{ ideology: "/en/about#ideology", values: "/en/about#values", vision: "/en/about#vision", history: "/en/history", manifesto: "/en/manifesto", contact: "/en/contact", help: "/en/help", footer: "/en", press: "/en/press-kit" }[sel]} target="_blank" rel="noopener noreferrer">View live page ↗</a>}>
          <div className="form">
            {sel === "ideology" && (
              <>
                <LangField label="Introduction" value={state.ideology.intro} onChange={(v) => set("ideology", { ...state.ideology, intro: v })} multiline />
                {state.ideology.pillars.map((p, i) => (
                  <div key={i} className="cs-sub">
                    <b>{p.icon} Pillar {i + 1}</b>
                    <LangField label="Title" value={p.t} onChange={(v) => set("ideology", { ...state.ideology, pillars: state.ideology.pillars.map((x, j) => (j === i ? { ...x, t: v } : x)) })} />
                    <LangField label="One line" value={p.d} onChange={(v) => set("ideology", { ...state.ideology, pillars: state.ideology.pillars.map((x, j) => (j === i ? { ...x, d: v } : x)) })} />
                  </div>
                ))}
              </>
            )}
            {sel === "values" && state.values.map((v, i) => (
              <div key={i} className="cs-sub">
                <b>{v.icon} Value {i + 1}</b>
                <LangField label="Name" value={v.t} onChange={(x) => upd("values", i, { t: x })} />
                <LangField label="One line" value={v.d} onChange={(x) => upd("values", i, { d: x })} />
              </div>
            ))}
            {sel === "vision" && (
              <>
                <LangField label="The President's quote" value={state.vision.quote} onChange={(v) => set("vision", { ...state.vision, quote: v })} multiline />
                {state.vision.points.map((p, i) => (
                  <LangField key={i} label={`Point ${i + 1}`} value={p} onChange={(v) => set("vision", { ...state.vision, points: state.vision.points.map((x, j) => (j === i ? v : x)) })} />
                ))}
              </>
            )}
            {sel === "history" && (
              <>
                {state.history.map((h, i) => (
                  <div key={i} className="cs-sub">
                    <div className="cs-two">
                      <div className="field"><label>Year</label><input value={h.year} onChange={(e) => upd("history", i, { year: e.target.value })} /></div>
                      <div className="cs-row" style={{ alignItems: "end" }}><button type="button" className="btn btn-ghost btn-sm" onClick={() => set("history", state.history.filter((_, j) => j !== i))}>🗑 Remove</button></div>
                    </div>
                    <LangField label="Title" value={h.t} onChange={(v) => upd("history", i, { t: v })} />
                    <LangField label="What happened" value={h.d} onChange={(v) => upd("history", i, { d: v })} multiline rows={3} />
                  </div>
                ))}
                <button type="button" className="btn btn-ghost" onClick={() => set("history", [...state.history, { year: "", t: { en: "", bn: "", hi: "" }, d: { en: "", bn: "", hi: "" } }])}>+ Add a moment</button>
              </>
            )}
            {sel === "manifesto" && state.manifesto.map((m, i) => (
              <div key={m.id} className="cs-sub">
                <b>{m.icon} {t(m.t, "en")}</b>
                <LangField label="Topic name" value={m.t} onChange={(v) => upd("manifesto", i, { t: v })} />
                <LangField label="Promises — one per line" value={m.text} onChange={(v) => upd("manifesto", i, { text: v })} multiline rows={4} />
              </div>
            ))}
            {sel === "contact" && (
              <>
                <p className="form-note">Each topic on the Contact page sends its messages to this inbox.</p>
                {state.contact.map((c, i) => (
                  <div key={c.id} className="cs-inline">
                    <span>{c.icon} {t(c.t, "en")}</span>
                    <input type="email" value={c.inbox} onChange={(e) => upd("contact", i, { inbox: e.target.value })} aria-label={`Inbox for ${t(c.t, "en")}`} />
                  </div>
                ))}
              </>
            )}
            {sel === "help" && (
              <>
                <p className="form-note">Choose which group receives each kind of help request.</p>
                {state.help.map((h, i) => (
                  <div key={h.id} className="cs-inline">
                    <span>{h.icon} {t(h.t, "en")}</span>
                    <select value={h.group || ""} onChange={(e) => upd("help", i, { group: e.target.value || null })} aria-label={`Team for ${t(h.t, "en")}`}>
                      <option value="">State help desk</option>
                      {groups.map((g) => <option key={g.id} value={g.id}>{g.icon} {t(g.name, "en")}</option>)}
                    </select>
                  </div>
                ))}
              </>
            )}
            {sel === "footer" && (
              <>
                <LangField label="Office address" value={state.footer.address} onChange={(v) => set("footer", { ...state.footer, address: v })} />
                <div className="cs-two">
                  <div className="field"><label>Phone</label><input value={state.footer.phone} onChange={(e) => set("footer", { ...state.footer, phone: e.target.value })} /></div>
                  <div className="field"><label>Email</label><input type="email" value={state.footer.email} onChange={(e) => set("footer", { ...state.footer, email: e.target.value })} /></div>
                </div>
                <div className="field"><label>Social handle (all platforms)</label><input value={state.footer.handle} onChange={(e) => set("footer", { ...state.footer, handle: e.target.value })} /></div>
                <div className="cs-two">
                  {SOCIAL.map(([name, l]) => (
                    <div key={l} className="field"><label>{name} link</label>
                      <input type="url" placeholder="https://" value={state.footer.links[l] || ""} onChange={(e) => set("footer", { ...state.footer, links: { ...state.footer.links, [l]: e.target.value } })} />
                    </div>
                  ))}
                </div>
              </>
            )}
            {sel === "press" && (
              <>
                <LangField label="About the party (journalists copy this)" value={state.press.text} onChange={(v) => set("press", { ...state.press, text: v })} multiline rows={5} />
                <div className="field"><label>Media contact email</label><input type="email" value={state.press.media} onChange={(e) => set("press", { ...state.press, media: e.target.value })} /></div>
                <div className="field"><label>Logo files & leader photos</label>{LIVE ? <p className="form-note">🖼️ File uploads come in a later step.</p> : <label className="dropzone"><span>🖼️ Upload files</span><small>SVG / PNG / JPG</small><input type="file" multiple className="sr-only" /></label>}</div>
              </>
            )}
          </div>
        </Panel>
      </div>
    </>
  );
}
