"use client";

import { useEffect, useState } from "react";
import { t } from "@/i18n/config";
import { groups, events } from "@/data/placeholder";
import { submissionQueue } from "@/data/console";
import { PageTitle, Panel, Status, Drawer, LangField, DistrictPick, Flash, useFlash, fmtDate } from "./ui";
import { useOwnSubmissions, createSubmission, updateSubmission, deleteSubmission, LIVE } from "@/lib/cms";
import { UI_TO_KIND, KIND_LABEL, PUBLIC_PATH } from "@/lib/submissions";

// Contributor workspace: write an article / blog, a petition or a campaign, then
// "Submit for review". Nothing goes live until an Admin accepts it — until then
// only you and the Admins can see it (the database enforces this).
const ST = {
  draft: ["review", "Draft"], pending: ["review", "Waiting for review"], changes: ["changes", "Needs changes"],
  accepted: ["approved", "Published"], rejected: ["rejected", "Not accepted"],
};
const tri = (en = "") => ({ en, bn: "", hi: "" });

function blank(uiKind) {
  return {
    id: null, kind: UI_TO_KIND[uiKind] || "post", status: "draft", title: tri(), body: tri(), format: "blog", link: "",
    district: "", group: "", ptype: "online", authority: tri(), goal: 5000, start: "", end: "", events: [],
  };
}

// Preview data uses an older shape.
const SAMPLE_STATUS = { review: "pending", approved: "accepted", changes: "changes" };
const SAMPLE = submissionQueue.filter((s) => s.by === "contributor1@wbpcc.org").map((s) => ({
  ...blank(s.kind), ...s, kind: UI_TO_KIND[s.kind] || "post", status: SAMPLE_STATUS[s.status] || s.status,
  title: tri(s.title), body: tri(s.summary), authority: tri(s.authority || ""), reviewNote: s.note, createdAt: s.date,
}));

const editable = (s) => ["draft", "pending", "changes"].includes(s.status);
const withDefaults = (s) => ({ ...blank("article"), ...s, title: s.title || tri(), body: s.body || s.summary || tri(), authority: s.authority || tri(), events: s.events || [] });

export default function MySubmissions() {
  const [list, setList, state] = useOwnSubmissions(LIVE ? [] : SAMPLE);
  const [edit, setEdit] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, flash] = useFlash();

  useEffect(() => {
    const k = new URLSearchParams(window.location.search).get("new");
    if (k && UI_TO_KIND[k]) setEdit(blank(k));
  }, []);

  const patch = (p) => setEdit({ ...edit, ...p });

  async function save(submit) {
    const { id, ...data } = edit;
    setBusy(true);
    try {
      const status = submit ? "pending" : "draft";
      if (id) {
        await updateSubmission(id, data, submit);
        setList(list.map((x) => (x.id === id ? { ...x, ...data, status } : x)));
      } else {
        const newId = await createSubmission(data, submit);
        setList([{ ...data, id: newId, status, createdAt: new Date().toISOString() }, ...list]);
      }
      setEdit(null);
      flash(submit ? "Submitted — an Admin will review it" : "Saved as draft — only you and the Admins can see it");
    } catch (e) {
      flash(`⚠️ Not saved: ${e.code === "permission-denied" ? "this can't be changed any more (it may already be reviewed)." : e.message}`);
    }
    setBusy(false);
  }

  async function del() {
    if (!window.confirm("Delete this draft?")) return;
    setBusy(true);
    try {
      await deleteSubmission(edit.id);
      setList(list.filter((x) => x.id !== edit.id));
      setEdit(null);
      flash("Draft deleted");
    } catch (e) {
      flash(`⚠️ Not deleted: ${e.message}`);
    }
    setBusy(false);
  }

  const kindLabel = (k) => KIND_LABEL[k] || "Item";
  const isPost = edit?.kind === "post";

  return (
    <>
      <PageTitle title="Add article, campaign or petition" sub="Write it, then submit it for review. You can edit while it's a draft, waiting for review, or sent back with changes. Only you and the Admins can see it until it's published.">
        <button className="btn btn-ghost" onClick={() => setEdit(blank("article"))}>Add article / news</button>
        <button className="btn btn-ghost" onClick={() => setEdit(blank("campaign"))}>Add campaign</button>
        <button className="btn btn-saffron" onClick={() => setEdit(blank("petition"))}>Add petition</button>
      </PageTitle>
      <Flash msg={msg} />
      {state === "loading" && <p className="form-note">Loading your work…</p>}
      {state === "error" && <p className="cs-warn small">Couldn&apos;t load your work — check your internet and reload.</p>}
      <Panel>
        <div className="cs-list">
          {state !== "loading" && list.length === 0 && <p className="cs-muted">Nothing yet — create your first article, petition or campaign.</p>}
          {list.map((s) => (
            <article key={s.id} className="cs-card">
              <div className="cs-card-top">
                <span className="badge-kind">{kindLabel(s.kind)}</span>
                <Status kind={(ST[s.status] || ST.draft)[0]}>{(ST[s.status] || ST.draft)[1]}</Status>
              </div>
              <h3>{t(s.title, "en") || "(untitled)"}</h3>
              <p className="cs-muted">{s.createdAt ? fmtDate(s.createdAt) : ""}</p>
              {s.reviewNote && ["changes", "rejected"].includes(s.status) && <p className="sub-note"><b>Admin&apos;s note:</b> {s.reviewNote}</p>}
              <div className="cs-row" style={{ marginTop: 10 }}>
                {editable(s) && <button className="btn btn-ghost btn-sm" onClick={() => setEdit(withDefaults(s))}>{s.status === "changes" ? "Make changes" : "Edit"}</button>}
                {s.status === "accepted" && s.publishedId && <a className="link-arrow" href={`/en/${PUBLIC_PATH[s.kind]}/${s.publishedId}`} target="_blank" rel="noopener noreferrer">View on the website ↗</a>}
              </div>
            </article>
          ))}
        </div>
      </Panel>

      <Drawer
        open={!!edit}
        title={edit ? `${edit.id ? "Edit" : "New"} ${kindLabel(edit.kind).toLowerCase()}` : ""}
        onClose={() => setEdit(null)}
        footer={edit && (
          <div className="cs-row">
            {edit.id && edit.status === "draft" && <button className="btn btn-ghost btn-sm" disabled={busy} onClick={del}>Delete draft</button>}
            <button className="btn btn-ghost btn-sm" disabled={busy || !edit.title.en} onClick={() => save(false)}>Save draft</button>
            <button className="btn btn-saffron btn-sm" disabled={busy || !edit.title.en || !edit.body.en} onClick={() => save(true)}>{busy ? "Saving…" : "Submit for review"}</button>
          </div>
        )}
      >
        {edit && (
          <div className="form">
            {edit.status === "changes" && edit.reviewNote && <p className="sub-note"><b>Admin&apos;s note:</b> {edit.reviewNote}</p>}
            {isPost && (
              <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
                <legend>Format</legend>
                <div className="checks" style={{ marginTop: 6 }}>
                  {[["blog", "Article / blog"], ["reel", "Reel"], ["video", "Video"]].map(([k, l]) => (
                    <label key={k}><input type="radio" checked={edit.format === k} onChange={() => patch({ format: k })} /> {l}</label>
                  ))}
                </div>
              </fieldset>
            )}
            {isPost && edit.format !== "blog" && (
              <div className="field"><label>Video link (YouTube / Instagram / Facebook)</label><input type="url" placeholder="https://" value={edit.link} onChange={(e) => patch({ link: e.target.value })} /></div>
            )}
            <LangField label={edit.kind === "petition" ? "Petition title" : edit.kind === "campaign" ? "Campaign name" : "Headline"} value={edit.title} onChange={(v) => patch({ title: v })} />
            <LangField label={edit.kind === "petition" ? "Why this matters" : edit.kind === "campaign" ? "Goal & plan" : "Article text"} value={edit.body} onChange={(v) => patch({ body: v })} multiline rows={isPost ? 10 : 5} />
            {edit.kind === "petition" && (
              <>
                <LangField label="Addressed to (who must act)" value={edit.authority} onChange={(v) => patch({ authority: v })} />
                <div className="checks">
                  <label><input type="radio" checked={edit.ptype === "online"} onChange={() => patch({ ptype: "online" })} /> Online signatures</label>
                  <label><input type="radio" checked={edit.ptype === "formal"} onChange={() => patch({ ptype: "formal" })} /> For government</label>
                </div>
                <div className="field"><label>Signature goal</label><input type="number" min={100} value={edit.goal} onChange={(e) => patch({ goal: Number(e.target.value) || 0 })} /></div>
              </>
            )}
            {edit.kind === "campaign" && (
              <>
                <div className="cs-two">
                  <div className="field"><label>Starts</label><input type="date" value={edit.start} onChange={(e) => patch({ start: e.target.value })} /></div>
                  <div className="field"><label>Ends</label><input type="date" value={edit.end} onChange={(e) => patch({ end: e.target.value })} /></div>
                </div>
                <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
                  <legend>Link existing events (optional)</legend>
                  <div className="checks" style={{ marginTop: 6 }}>
                    {events.map((e) => <label key={e.id}><input type="checkbox" checked={edit.events.includes(e.id)} onChange={() => patch({ events: edit.events.includes(e.id) ? edit.events.filter((x) => x !== e.id) : [...edit.events, e.id] })} /> {t(e.title, "en")}</label>)}
                  </div>
                </fieldset>
              </>
            )}
            <DistrictPick value={edit.district} onChange={(v) => patch({ district: v })} />
            <div className="field"><label>Organisation (optional)</label><select value={edit.group} onChange={(e) => patch({ group: e.target.value })}><option value="">— None —</option>{groups.map((g) => <option key={g.id} value={g.id}>{t(g.name, "en")}</option>)}</select></div>
            {!LIVE && <div className="field"><label>Cover photo (optional)</label><label className="dropzone"><span>Upload</span><small>JPG / PNG</small><input type="file" accept="image/*" className="sr-only" /></label></div>}
            <p className="form-note">Write in English; Bangla and Hindi are optional — the website shows English where they&apos;re empty.</p>
          </div>
        )}
      </Drawer>
    </>
  );
}
