"use client";

import { useEffect, useState } from "react";
import { t } from "@/i18n/config";
import { groups, events } from "@/data/placeholder";
import { submissionQueue } from "@/data/console";
import { useRole } from "./ConsoleShell";
import { PageTitle, Panel, Status, Drawer, LangField, DistrictPick, Flash, useFlash, fmtDate } from "./ui";

// Contributor workspace: create articles / blogs, petitions and campaigns,
// then "Submit for review". Nothing goes live until an Admin accepts — until then only Admins can see it.
const KIND = { article: "Article", blog: "Blog", petition: "Petition", campaign: "Campaign" };
const ST = { draft: ["review", "Draft"], review: ["review", "Waiting for review"], approved: ["approved", "Published"], changes: ["changes", "Needs changes"], rejected: ["rejected", "Not accepted"] };
const tri = (en = "") => ({ en, bn: "", hi: "" });

function blank(kind) {
  return { id: null, kind, status: "draft", title: tri(), body: tri(), format: "blog", link: "", district: "", group: "", ptype: "online", authority: tri(), goal: 5000, start: "", end: "", events: [] };
}

export default function MySubmissions() {
  const { me } = useRole();
  const [list, setList] = useState(() =>
    submissionQueue.filter((s) => s.by === me.email).map((s) => ({ ...blank(s.kind), ...s, title: tri(s.title), body: tri(s.summary), authority: tri(s.authority || "") }))
  );
  const [edit, setEdit] = useState(null);
  const [msg, flash] = useFlash();

  useEffect(() => {
    const k = new URLSearchParams(window.location.search).get("new");
    if (k && KIND[k]) setEdit(blank(k));
  }, []);
  useEffect(() => {
    setList(submissionQueue.filter((s) => s.by === me.email).map((s) => ({ ...blank(s.kind), ...s, title: tri(s.title), body: tri(s.summary), authority: tri(s.authority || "") })));
  }, [me.email]);

  const patch = (p) => setEdit({ ...edit, ...p });
  function save(status) {
    const it = { ...edit, status, by: me.email, date: new Date().toISOString().slice(0, 10) };
    if (it.id) setList(list.map((x) => (x.id === it.id ? it : x)));
    else setList([{ ...it, id: `SUB-${Math.floor(100 + Math.random() * 900)}` }, ...list]);
    setEdit(null);
    flash(status === "review" ? "Submitted — an Admin will review it" : "Saved as draft");
  }
  const editable = (s) => ["draft", "changes"].includes(s.status);

  return (
    <>
      <PageTitle title="Add article, campaign or petition" sub="Create and submit. You can edit a submission while it's a draft or when it's sent back with changes.">
        <button className="btn btn-ghost" onClick={() => setEdit(blank("article"))}>Add article / news</button>
        <button className="btn btn-ghost" onClick={() => setEdit(blank("campaign"))}>Add campaign</button>
        <button className="btn btn-saffron" onClick={() => setEdit(blank("petition"))}>Add petition</button>
      </PageTitle>
      <Flash msg={msg} />
      <Panel>
        <div className="cs-list">
          {list.length === 0 && <p className="cs-muted">Nothing yet — create your first article, petition or campaign.</p>}
          {list.map((s) => (
            <article key={s.id} className="cs-card">
              <div className="cs-card-top">
                <span className="badge-kind">{KIND[s.kind]}</span>
                <Status kind={ST[s.status][0]}>{ST[s.status][1]}</Status>
              </div>
              <h3>{t(s.title, "en") || "(untitled)"}</h3>
              <p className="cs-muted">{s.id} · {fmtDate(s.date || new Date().toISOString())}</p>
              {s.note && <p className="sub-note"><b>Reviewer&apos;s note:</b> {s.note}</p>}
              {editable(s) && <div className="cs-row" style={{ marginTop: 10 }}><button className="btn btn-ghost btn-sm" onClick={() => setEdit({ ...s })}>Edit</button></div>}
            </article>
          ))}
        </div>
      </Panel>

      <Drawer
        open={!!edit}
        title={edit ? `${edit.id ? "Edit" : "New"} ${KIND[edit.kind].split(" ").slice(1).join(" ").toLowerCase()}` : ""}
        onClose={() => setEdit(null)}
        footer={edit && (
          <div className="cs-row">
            <button className="btn btn-ghost btn-sm" onClick={() => save("draft")}>Save draft</button>
            <button className="btn btn-saffron btn-sm" disabled={!edit.title.en || !edit.body.en} onClick={() => save("review")}>Submit for review</button>
          </div>
        )}
      >
        {edit && (
          <div className="form">
            {(edit.kind === "article" || edit.kind === "blog") && (
              <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
                <legend>Format</legend>
                <div className="checks" style={{ marginTop: 6 }}>
                  {[["blog", "Article / blog"], ["reel", "Reel"], ["video", "Video"]].map(([k, l]) => (
                    <label key={k}><input type="radio" checked={edit.format === k} onChange={() => patch({ format: k })} /> {l}</label>
                  ))}
                </div>
              </fieldset>
            )}
            {(edit.kind === "article" || edit.kind === "blog") && edit.format !== "blog" && (
              <div className="field"><label>Video link (YouTube / Instagram / Facebook)</label><input type="url" placeholder="https://" value={edit.link} onChange={(e) => patch({ link: e.target.value })} /></div>
            )}
            <LangField label={edit.kind === "petition" ? "Petition title" : edit.kind === "campaign" ? "Campaign name" : "Headline"} value={edit.title} onChange={(v) => patch({ title: v })} />
            <LangField label={edit.kind === "petition" ? "Why this matters" : edit.kind === "campaign" ? "Goal & plan" : "Article text"} value={edit.body} onChange={(v) => patch({ body: v })} multiline rows={edit.kind === "article" || edit.kind === "blog" ? 10 : 5} />
            {edit.kind === "petition" && (
              <>
                <LangField label="Addressed to (who must act)" value={edit.authority} onChange={(v) => patch({ authority: v })} />
                <div className="checks">
                  <label><input type="radio" checked={edit.ptype === "online"} onChange={() => patch({ ptype: "online" })} /> Online signatures</label>
                  <label><input type="radio" checked={edit.ptype === "formal"} onChange={() => patch({ ptype: "formal" })} /> For government</label>
                </div>
                <div className="field"><label>Signature goal</label><input type="number" min={100} value={edit.goal} onChange={(e) => patch({ goal: e.target.value })} /></div>
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
            <div className="field"><label>Cover photo (optional)</label><label className="dropzone"><span>Upload</span><small>JPG / PNG</small><input type="file" accept="image/*" className="sr-only" /></label></div>
          </div>
        )}
      </Drawer>
    </>
  );
}
