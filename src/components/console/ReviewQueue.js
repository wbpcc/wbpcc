"use client";

import { useState } from "react";
import { t } from "@/i18n/config";
import { districts, findGroup } from "@/data/placeholder";
import { submissionQueue } from "@/data/console";
import { PageTitle, Panel, Tabs, Status, Flash, useFlash, fmtDate } from "./ui";
import { useAdminList, patchItem, acceptSubmission, requestPublish, savedMessage, LIVE } from "@/lib/cms";
import { UI_TO_KIND, KIND_LABEL, PUBLIC_PATH } from "@/lib/submissions";
import Icon from "../Icon";

// Admin: everything contributors submit waits here. Accept → it becomes a real
// article / petition / campaign on the website. Until then only Admins (and the
// author) can see it. Every decision is recorded in the audit log.
const ST = {
  pending: ["review", "Waiting"], changes: ["changes", "Sent back"], accepted: ["approved", "Published"],
  rejected: ["rejected", "Rejected"], draft: ["review", "Draft"],
};
const tri = (x) => (x && typeof x === "object" ? x : { en: x || "", bn: "", hi: "" });

// Preview data uses an older shape.
const SAMPLE_STATUS = { review: "pending", approved: "accepted", changes: "changes" };
const SAMPLE = submissionQueue.map((s) => ({
  ...s, kind: UI_TO_KIND[s.kind] || "post", status: SAMPLE_STATUS[s.status] || s.status, title: tri(s.title),
  body: tri(s.summary), authority: tri(s.authority || ""), authorEmail: s.by, reviewNote: s.note, createdAt: s.date,
}));

function Card({ s, busy, onAccept, onSend }) {
  const [mode, setMode] = useState(null); // "changes" | "rejected"
  const [note, setNote] = useState("");
  const [more, setMore] = useState(false);
  const body = t(tri(s.body || s.summary), "en");
  const long = body.length > 420;
  const group = s.group ? findGroup(s.group) : null;

  return (
    <article className={`cs-card${s.status !== "pending" ? " done" : ""}`}>
      <div className="cs-card-top">
        <span className="badge-kind">{KIND_LABEL[s.kind] || "Item"}{s.kind === "post" && s.format && s.format !== "blog" ? ` · ${s.format}` : ""}</span>
        {s.status === "pending"
          ? <small>{s.submittedAt || s.createdAt ? fmtDate(s.submittedAt || s.createdAt) : ""}</small>
          : <Status kind={(ST[s.status] || ST.pending)[0]}>{(ST[s.status] || ST.pending)[1]}</Status>}
      </div>
      <h3>{t(tri(s.title), "en") || "(untitled)"}</h3>
      <p className="cs-message" style={{ marginBottom: 8 }}>{long && !more ? `${body.slice(0, 420)}…` : body}</p>
      {long && <button type="button" className="text-btn" style={{ justifySelf: "start" }} onClick={() => setMore(!more)}>{more ? "Show less" : "Read all"}</button>}
      <div className="cs-meta">
        <span>by <code>{s.authorEmail || "—"}</code></span>
        {s.district && <span><Icon name="pin" size={14} /> {t(districts[s.district], "en")}</span>}
        {group && <span>{t(group.name, "en")}</span>}
        {s.kind === "petition" && <span><Icon name="landmark" size={14} /> {t(tri(s.authority), "en") || "—"} · {s.ptype === "formal" ? "for government" : "online"} · goal {Number(s.goal || 0).toLocaleString("en-IN")}</span>}
        {s.kind === "campaign" && (s.start || s.end) && <span><Icon name="calendar" size={14} /> {s.start || "…"} – {s.end || "…"}</span>}
        {s.kind === "post" && s.link && <a className="link-arrow" href={s.link} target="_blank" rel="noopener noreferrer">Video ↗</a>}
      </div>
      {s.reviewNote && s.status !== "pending" && <p className="sub-note"><b>Note sent:</b> {s.reviewNote}</p>}
      {s.status === "accepted" && s.publishedId && <a className="link-arrow" href={`/en/${PUBLIC_PATH[s.kind]}/${s.publishedId}`} target="_blank" rel="noopener noreferrer">View on the website ↗</a>}
      {s.status === "pending" && (mode ? (
        <div className="form" style={{ marginTop: 10 }}>
          <div className="field"><label>{mode === "changes" ? "What should they change?" : "Reason (shown to the contributor)"}</label><textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} /></div>
          <div className="cs-row">
            <button className="btn btn-ghost btn-sm" onClick={() => setMode(null)}>Cancel</button>
            <button className="btn btn-navy btn-sm" disabled={busy || !note.trim()} onClick={() => onSend(mode, note.trim())}>Send</button>
          </div>
        </div>
      ) : (
        <div className="cs-row" style={{ marginTop: 10 }}>
          <button className="btn btn-saffron btn-sm" disabled={busy} onClick={onAccept}>Accept &amp; publish</button>
          <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => setMode("changes")}>Ask for changes</button>
          <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => setMode("rejected")}>Reject</button>
        </div>
      ))}
    </article>
  );
}

export default function ReviewQueue() {
  const [items, setItems, state] = useAdminList("submissions", LIVE ? [] : SAMPLE);
  const [tab, setTab] = useState("pending");
  const [busy, setBusy] = useState(false);
  const [msg, flash] = useFlash();
  // Drafts belong to the contributor until they submit — not shown here.
  const visible = items.filter((s) => s.status !== "draft");
  const shown = visible.filter((s) => tab === "all" || s.status === tab);
  const n = (st) => visible.filter((s) => s.status === st).length;
  const setOne = (id, p) => setItems(items.map((x) => (x.id === id ? { ...x, ...p } : x)));

  async function accept(s) {
    if (!window.confirm(`Publish “${t(tri(s.title), "en")}” on the website?`)) return;
    setBusy(true);
    try {
      const { id } = await acceptSubmission(s);
      setOne(s.id, { status: "accepted", publishedId: id });
      flash(savedMessage(await requestPublish(), "Accepted and published"));
    } catch (e) {
      flash(`⚠️ Not published: ${e.code === "permission-denied" ? "only an Admin can do this." : e.message}`);
    }
    setBusy(false);
  }

  async function send(s, status, reviewNote) {
    setBusy(true);
    try {
      await patchItem("submissions", s.id, { status, reviewNote, reviewedAt: new Date().toISOString() }, status === "changes" ? "Asked for changes" : "Rejected submission");
      setOne(s.id, { status, reviewNote });
      flash(status === "changes" ? "Sent back with your note — the contributor can now edit it" : "Rejected — the contributor sees your reason");
    } catch (e) {
      flash(`⚠️ Not changed: ${e.message}`);
    }
    setBusy(false);
  }

  return (
    <>
      <PageTitle title="Review queue" sub="Everything contributors submit — articles, petitions and campaigns — waits here. Accept to publish it on the website, or send it back with a note." />
      <Flash msg={msg} />
      {state === "loading" && <p className="form-note">Loading submissions…</p>}
      {state === "error" && <p className="cs-warn small">Couldn&apos;t load submissions — check your internet and reload.</p>}
      <Tabs value={tab} onChange={setTab} tabs={[["pending", "Waiting", n("pending")], ["changes", "Sent back", n("changes")], ["accepted", "Published", n("accepted")], ["rejected", "Rejected", n("rejected")], ["all", "All", visible.length]]} />
      <Panel>
        <div className="cs-list">
          {state !== "loading" && shown.length === 0 && <p className="cs-muted">Nothing here.</p>}
          {shown.map((s) => <Card key={s.id} s={s} busy={busy} onAccept={() => accept(s)} onSend={(st, note) => send(s, st, note)} />)}
        </div>
      </Panel>
    </>
  );
}
