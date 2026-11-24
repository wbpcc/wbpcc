"use client";

import { useMemo, useState } from "react";
import en from "@/i18n/en";
import bn from "@/i18n/bn";
import hi from "@/i18n/hi";
import { findPost, findPetition } from "@/data/placeholder";
import { manifesto } from "@/data/pages";
import { translationItems } from "@/data/console";
import { useRole } from "./ConsoleShell";
import { PageTitle, Panel, Flash, useFlash } from "./ui";

// Wikipedia-style translation editor: English is locked (the source),
// Bangla / Hindi are edited side by side. Every save is logged + revertible.
const ST = { auto: ["", "Auto-translated"], outdated: ["", "English changed — recheck"], reviewed: ["", "Reviewed"] };

function sourceFor(id) {
  if (id === "home-hero") return Object.fromEntries([["en", en], ["bn", bn], ["hi", hi]].map(([k, d]) => [k, `${d.hero.title} ${d.hero.titleEm}\n${d.hero.sub}`]));
  if (id === "manifesto-jobs") return Object.fromEntries(["en", "bn", "hi"].map((k) => [k, manifesto[0].items.map((x) => x[k]).join("\n")]));
  const post = findPost(id);
  if (post) return Object.fromEntries(["en", "bn", "hi"].map((k) => [k, `${post.title[k]}\n\n${post.excerpt[k]}`]));
  const pet = findPetition(id);
  if (pet) return Object.fromEntries(["en", "bn", "hi"].map((k) => [k, `${pet.title[k]}\n\n${pet.desc[k]}`]));
  return { en: "", bn: "", hi: "" };
}

export default function Translations() {
  const { me } = useRole();
  const [items, setItems] = useState(() => translationItems.map((x) => ({ ...x, text: sourceFor(x.id) })));
  const [lang, setLang] = useState("bn");
  const [sel, setSel] = useState(items[0].id);
  const [onlyTodo, setOnlyTodo] = useState(false);
  const [note, setNote] = useState("");
  const [history, setHistory] = useState([]);
  const [msg, flash] = useFlash();
  const cur = items.find((x) => x.id === sel);
  const [draft, setDraft] = useState(cur.text[lang]);

  const shown = useMemo(() => items.filter((x) => !onlyTodo || x[lang] !== "reviewed"), [items, onlyTodo, lang]);
  const pick = (id, l = lang) => { setSel(id); setDraft(items.find((x) => x.id === id).text[l]); setNote(""); };
  const switchLang = (l) => { setLang(l); setDraft(cur.text[l]); };

  function save() {
    const before = cur.text[lang];
    setItems(items.map((x) => (x.id === cur.id ? { ...x, [lang]: "reviewed", text: { ...x.text, [lang]: draft } } : x)));
    setHistory([{ id: Date.now(), item: cur.title, itemId: cur.id, lang, before, after: draft, note, who: me.email, at: new Date().toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) }, ...history]);
    setNote("");
    flash("Saved — live now, and logged");
  }
  function revert(h) {
    setItems(items.map((x) => (x.id === h.itemId ? { ...x, text: { ...x.text, [h.lang]: h.before } } : x)));
    if (h.itemId === sel && h.lang === lang) setDraft(h.before);
    setHistory(history.filter((x) => x.id !== h.id));
    flash("Reverted to the earlier version");
  }

  return (
    <>
      <PageTitle title="Translations" sub="Fix the Bangla or Hindi on any page. English is the source and can't be changed here. Edits go live instantly and are logged.">
        <div className="lang-tabs big">
          <button type="button" aria-pressed={lang === "bn"} onClick={() => switchLang("bn")}>বাংলা</button>
          <button type="button" aria-pressed={lang === "hi"} onClick={() => switchLang("hi")}>हिन्दी</button>
        </div>
      </PageTitle>
      <Flash msg={msg} />
      <div className="tr-layout">
        <Panel title="Pages & posts" actions={<label className="check" style={{ fontSize: 13 }}><input type="checkbox" checked={onlyTodo} onChange={(e) => setOnlyTodo(e.target.checked)} /> Needs review only</label>}>
          <ul className="tr-list">
            {shown.map((x) => (
              <li key={x.id}>
                <button type="button" aria-pressed={x.id === sel} onClick={() => pick(x.id)}>
                  <small>{x.area}</small>
                  <b>{x.title}</b>
                  <span>{ST[x[lang]][1]}</span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="cs-stack">
          <Panel title={cur.title} actions={<span className="cs-muted">{ST[cur[lang]][1]}</span>}>
            <div className="tr-side">
              <div className="field"><label>English (source — locked)</label><textarea value={cur.text.en} readOnly rows={8} className="locked" /></div>
              <div className="field"><label>{lang === "bn" ? "বাংলা" : "हिन्दी"}</label><textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={8} lang={lang} /></div>
            </div>
            <div className="field" style={{ marginTop: 10 }}><label>What did you change? (shown in history)</label><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. better word for 'delimitation'" /></div>
            <div className="cs-row" style={{ marginTop: 12 }}>
              <button className="btn btn-saffron btn-sm" disabled={draft === cur.text[lang] && cur[lang] === "reviewed"} onClick={save}>Save & mark reviewed</button>
            </div>
          </Panel>

          <Panel title="Recent changes">
            {history.length === 0 && <p className="cs-muted">No edits in this session yet. Every edit appears here with a one-click undo.</p>}
            <ul className="cs-feed">
              {history.map((h) => (
                <li key={h.id}>
                  <small>{h.at} · <code>{h.who}</code> · {h.lang === "bn" ? "Bangla" : "Hindi"}</small>
                  <span><b>{h.item}</b>{h.note ? ` — “${h.note}”` : ""}</span>
                  <div className="diff"><del>{h.before.slice(0, 120)}</del><ins>{h.after.slice(0, 120)}</ins></div>
                  <button className="text-btn" style={{ justifySelf: "start" }} onClick={() => revert(h)}>↶ Revert</button>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
