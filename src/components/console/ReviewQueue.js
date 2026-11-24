"use client";

import { useState } from "react";
import { t } from "@/i18n/config";
import { districts } from "@/data/placeholder";
import { submissionQueue } from "@/data/console";
import { PageTitle, Panel, Tabs, Status, Flash, useFlash, fmtDate } from "./ui";
import Icon from "../Icon";

// Admin: accept (publish) or reject contributors' work. Until accepted, nobody but Admins sees it.
const KIND = { article: "Article", blog: "Blog", petition: "Petition", campaign: "Campaign" };
const ST = { review: ["review", "Waiting"], approved: ["approved", "Published"], changes: ["changes", "Sent back"], rejected: ["rejected", "Rejected"] };

function Card({ s, onDecide }) {
  const [mode, setMode] = useState(null);
  const [note, setNote] = useState("");
  return (
    <article className={`cs-card${s.status !== "review" ? " done" : ""}`}>
      <div className="cs-card-top">
        <span className="badge-kind">{KIND[s.kind]}</span>
        {s.status === "review" ? <small>{s.id} · {fmtDate(s.date)}</small> : <Status kind={ST[s.status][0]}>{ST[s.status][1]}</Status>}
      </div>
      <h3>{s.title}</h3>
      <p>{s.summary}</p>
      <div className="cs-meta">
        <span>by <code>{s.by}</code></span>
        {s.district && <span><Icon name="pin" size={14} /> {t(districts[s.district], "en")}</span>}
        {s.authority && <span><Icon name="landmark" size={14} /> {s.authority} · {s.ptype === "formal" ? "for government" : "online"}</span>}
      </div>
      {s.note && s.status !== "review" && <p className="sub-note"><b>Note sent:</b> {s.note}</p>}
      {s.status === "review" && (mode ? (
        <div className="form" style={{ marginTop: 10 }}>
          <div className="field"><label>{mode === "changes" ? "What should they change?" : "Reason (shown to the contributor)"}</label><textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} /></div>
          <div className="cs-row">
            <button className="btn btn-ghost btn-sm" onClick={() => setMode(null)}>Cancel</button>
            <button className="btn btn-navy btn-sm" disabled={!note.trim()} onClick={() => onDecide(mode, note)}>Send</button>
          </div>
        </div>
      ) : (
        <div className="cs-row" style={{ marginTop: 10 }}>
          <button className="btn btn-saffron btn-sm" onClick={() => onDecide("approved")}>✓ Accept & publish</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setMode("changes")}>Ask for changes</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setMode("rejected")}>✕ Reject</button>
        </div>
      ))}
    </article>
  );
}

export default function ReviewQueue() {
  const [items, setItems] = useState(submissionQueue);
  const [tab, setTab] = useState("review");
  const [msg, flash] = useFlash();
  const shown = items.filter((s) => (tab === "review" ? s.status === "review" : s.status !== "review"));
  const decide = (id, status, note) => {
    setItems(items.map((x) => (x.id === id ? { ...x, status, note: note || x.note } : x)));
    flash(status === "approved" ? "Accepted — now live on the website" : status === "changes" ? "Sent back with your note" : "Rejected — the contributor has been told why");
  };
  return (
    <>
      <PageTitle title="Review queue" sub="Everything contributors create — articles, blogs, petitions and campaigns — waits here. Accept to publish it on the website, or send it back." />
      <Flash msg={msg} />
      <Tabs value={tab} onChange={setTab} tabs={[["review", "Waiting", items.filter((s) => s.status === "review").length], ["done", "Decided", items.filter((s) => s.status !== "review").length]]} />
      <Panel>
        <div className="cs-list">
          {shown.length === 0 && <p className="cs-muted">Nothing here.</p>}
          {shown.map((s) => <Card key={s.id} s={s} onDecide={(st, n) => decide(s.id, st, n)} />)}
        </div>
      </Panel>
    </>
  );
}
