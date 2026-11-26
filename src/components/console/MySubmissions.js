"use client";

import { useEffect, useState } from "react";
import { t } from "@/i18n/config";
import { groups, events, posts as pubPosts, petitions as pubPetitions, campaigns as pubCampaigns } from "@/data/placeholder";
import { submissionQueue } from "@/data/console";
import { PageTitle, Panel, Status, Drawer, LangField, DistrictPick, Flash, useFlash, fmtDate } from "./ui";
import { useOwnSubmissions, createSubmission, updateSubmission, deleteSubmission, LIVE } from "@/lib/cms";
import { UI_TO_KIND, KIND_LABEL, PUBLIC_PATH, submissionFromPublished } from "@/lib/submissions";

// Published items a contributor can ask to edit (as of the last website update).
const PUBLISHED = {
  post: pubPosts.filter((p) => p.kind !== "statement"),
  petition: pubPetitions,
  campaign: pubCampaigns,
};

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

const TABS = [["all", "All"], ["pending", "Waiting"], ["changes", "Need changes"], ["accepted", "Published"], ["draft", "Drafts"]];
const editable = (s) => ["draft", "pending", "changes"].includes(s.status);
const withDefaults = (s) => ({ ...blank("article"), ...s, title: s.title || tri(), body: s.body || s.summary || tri(), authority: s.authority || tri(), events: s.events || [] });

export default function MySubmissions() {
  const [list, setList, state] = useOwnSubmissions(LIVE ? [] : SAMPLE);
  const [edit, setEdit] = useState(null);
  const [picking, setPicking] = useState(null); // { kind, id } while choosing an item to edit
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("all");

  function startEditRequest() {
    const { kind, id } = picking;
    const item = PUBLISHED[kind].find((x) => x.id === id);
    if (!item) return;
    setPicking(null);
    setEdit({ ...blank(kind === "post" ? "article" : kind), ...submissionFromPublished(kind, item), id: null, status: "draft" });
  }
  const [msg, flash] = useFlash();

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const k = q.get("new");
    const st = q.get("status");
    if (st && TABS.some(([v]) => v === st)) setFilter(st);
    if (k && UI_TO_KIND[k]) setEdit(blank(k));
    else if (q.get("edit")) setPicking({ kind: "post", id: "" });
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

  const shown = filter === "all" ? list : list.filter((x) => x.status === filter);
  const kindLabel = (k) => KIND_LABEL[k] || "Item";
  const isPost = edit?.kind === "post";

  return (
    <>
      <PageTitle title="My submissions" sub="Only you and the Admins can see these until they're published. You can edit while it's a draft, waiting, or sent back.">
        <button className="btn btn-ghost btn-sm" onClick={() => setPicking({ kind: "post", id: "" })}>Request an edit</button>
        <button className="btn btn-ghost btn-sm" onClick={() => setEdit(blank("article"))}>+ Article</button>
        <button className="btn btn-ghost btn-sm" onClick={() => setEdit(blank("campaign"))}>+ Campaign</button>
        <button className="btn btn-saffron btn-sm" onClick={() => setEdit(blank("petition"))}>+ Petition</button>
      </PageTitle>
      <Flash msg={msg} />
      {state === "loading" && <p className="form-note">Loading your work…</p>}
      {state === "error" && <p className="cs-warn small">Couldn&apos;t load your work — check your internet and reload.</p>}
      <div className="cs-pills" role="tablist" aria-label="Filter by status">
        {TABS.map(([v, label]) => {
          const n = v === "all" ? list.length : list.filter((x) => x.status === v).length;
          return <button key={v} type="button" role="tab" aria-selected={filter === v} className={filter === v ? "on" : ""} onClick={() => setFilter(v)}>{label} <small>{n}</small></button>;
        })}
      </div>
      <Panel>
        <div className="cs-list">
          {state !== "loading" && shown.length === 0 && <p className="cs-muted">{filter === "all" ? "Nothing yet — create your first article, petition or campaign." : "Nothing here."}</p>}
          {shown.map((s) => (
            <article key={s.id} className="cs-card">
              <div className="cs-card-top">
                <span className="badge-kind">{s.editOf ? `Edit request · ${kindLabel(s.kind)}` : kindLabel(s.kind)}</span>
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
        title={edit ? (edit.editOf ? `Edit request — ${kindLabel(edit.kind).toLowerCase()}` : `${edit.id ? "Edit" : "New"} ${kindLabel(edit.kind).toLowerCase()}`) : ""}
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
            {edit.editOf && (
              <p className="form-note">
                You&apos;re suggesting changes to something already on the website. An Admin reviews them; once accepted, the live version is updated.{" "}
                <a className="link-arrow" href={`/en/${PUBLIC_PATH[edit.kind]}/${edit.editOf.id}`} target="_blank" rel="noopener noreferrer">See the current version ↗</a>
              </p>
            )}
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

      <Drawer
        open={!!picking}
        title="Request an edit"
        onClose={() => setPicking(null)}
        footer={picking && (
          <div className="cs-row">
            <button className="btn btn-ghost btn-sm" onClick={() => setPicking(null)}>Cancel</button>
            <button className="btn btn-saffron btn-sm" disabled={!picking.id} onClick={startEditRequest}>Edit this</button>
          </div>
        )}
      >
        {picking && (
          <div className="form">
            <p className="form-note">Pick something that&apos;s already on the website. You&apos;ll edit a copy; an Admin reviews it before the live version changes.</p>
            <div className="field">
              <label>What do you want to edit?</label>
              <div className="checks">
                {[["post", "Article / news"], ["petition", "Petition"], ["campaign", "Campaign"]].map(([k, l]) => (
                  <label key={k}><input type="radio" checked={picking.kind === k} onChange={() => setPicking({ kind: k, id: "" })} /> {l}</label>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Which one?</label>
              <select value={picking.id} onChange={(e) => setPicking({ ...picking, id: e.target.value })}>
                <option value="">— Choose —</option>
                {PUBLISHED[picking.kind].map((x) => <option key={x.id} value={x.id}>{t(x.title, "en")}</option>)}
              </select>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
