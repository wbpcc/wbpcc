"use client";

import { useEffect, useState } from "react";
import { t } from "@/i18n/config";
import { posts as seed, districts } from "@/data/placeholder";
import { postAuthors } from "@/data/console";
import { useRole } from "./ConsoleShell";
import { PageTitle, Panel, Tabs, Status, Drawer, LangField, DistrictPick, Flash, useFlash, fmtDate } from "./ui";
import { useLiveList, saveItem, removeItem, requestPublish, savedMessage, LIVE } from "@/lib/cms";

// Editor works with `link` + `story`; the website reads `videoUrl` + `excerpt`.
const tri0 = () => ({ en: "", bn: "", hi: "" });
const prep = (p) => ({ ...p, link: p.link ?? p.videoUrl ?? "", story: p.story || p.excerpt || tri0(), district: p.district || "", status: p.status || "published", author: p.author || postAuthors[p.id] });
const platformOf = (url) => ({ YouTube: "youtube", Instagram: "instagram", Facebook: "facebook", X: "x" })[detectPlatform(url)] || null;

// Newsroom posts — managed by Admins.
const KIND = { statement: "🟥 Statement", report: "✓ Verified report", story: "Story", explainer: "Explainer" };
const FORMAT = { reel: "📱 Reel", video: "▶️ Video", blog: "📝 Blog" };

function detectPlatform(url) {
  if (/youtu\.?be/.test(url)) return "YouTube";
  if (/instagram\.com/.test(url)) return "Instagram";
  if (/facebook\.com|fb\.watch/.test(url)) return "Facebook";
  if (/(twitter|x)\.com/.test(url)) return "X";
  return url ? "Unknown link" : "";
}

const blank = { id: null, format: "reel", link: "", title: { en: "", bn: "", hi: "" }, story: { en: "", bn: "", hi: "" }, kind: "story", district: "", status: "draft", leaderId: null, statementId: null };

export default function Posts() {
  const { role, me } = useRole();
  const ownOnly = false;
  const [list, setList, loadState] = useLiveList("posts", seed, prep);
  const [tab, setTab] = useState(ownOnly ? "mine" : "all");
  const [edit, setEdit] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, flash] = useFlash();
  const ready = !LIVE || loadState === "ready";

  useEffect(() => { if (window.location.search.includes("new=1")) setEdit({ ...blank }); }, []);
  useEffect(() => { setTab(ownOnly ? "mine" : "all"); }, [ownOnly]);

  // Admins edit everything here (contributors work in "My submissions").
  const canEdit = () => role === "admin";
  const shown = list.filter((p) => tab === "all" || p.author === me.email);

  async function save(status) {
    const isNew = !edit.id;
    const p = { ...edit, status, id: edit.id || `post-${Date.now()}`, author: edit.author || me.email, date: edit.date || new Date().toISOString().slice(0, 10) };
    const order = isNew ? Math.min(0, ...list.map((x) => x.order ?? 0)) - 1 : p.order;
    const { link, story, status: _s, ...rest } = p;
    const doc = { ...rest, videoUrl: p.format === "blog" ? null : link || null, platform: p.format === "blog" ? null : platformOf(link), excerpt: story };
    setBusy(true);
    try {
      await saveItem("posts", doc, { order, status, label: `post “${t(p.title, "en")}”` });
      const saved = { ...p, order };
      setList(isNew ? [saved, ...list] : list.map((x) => (x.id === p.id ? saved : x)));
      setEdit(null);
      flash(status === "published" ? savedMessage(await requestPublish(), "Published") : (LIVE ? "Saved as a draft — only Admins can see it" : "Saved as draft (preview only)"));
    } catch (e) {
      flash(`⚠️ Not saved: ${e.code === "permission-denied" ? "only an Admin can change this." : e.message}`);
    }
    setBusy(false);
  }

  async function del() {
    if (!window.confirm(`Delete “${t(edit.title, "en")}” from the website?`)) return;
    setBusy(true);
    try {
      await removeItem("posts", edit.id, `post “${t(edit.title, "en")}”`);
      setList(list.filter((x) => x.id !== edit.id));
      setEdit(null);
      flash(savedMessage(await requestPublish(), "Deleted"));
    } catch (e) {
      flash(`⚠️ Not deleted: ${e.code === "permission-denied" ? "only an Admin can change this." : e.message}`);
    }
    setBusy(false);
  }

  return (
    <>
      <PageTitle title="Newsroom posts" sub="Post the video on YouTube / Instagram / Facebook first, then paste its link here and write the story.">
        <button className="btn btn-saffron" onClick={() => setEdit({ ...blank })}>+ New post</button>
      </PageTitle>
      <Flash msg={msg} />
      {loadState === "loading" && <p className="form-note">⏳ Loading the latest from the database…</p>}
      {loadState === "error" && <p className="cs-warn small">⚠️ Couldn&apos;t load from the database — check your internet and reload before editing.</p>}
      <Tabs value={tab} onChange={setTab} tabs={[["mine", "My posts", list.filter((p) => p.author === me.email).length], ["all", "All posts", list.length]]} />
      <Panel>
        <table className="cs-table">
          <thead><tr><th>Post</th><th>Type</th><th>Author</th><th>Date</th><th>Status</th><th /></tr></thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p.id}>
                <td><b>{t(p.title, "en")}</b><br /><small className="cs-muted">{FORMAT[p.format]}{p.district ? ` · ${t(districts[p.district], "en")}` : ""}</small></td>
                <td>{KIND[p.kind]}</td>
                <td><code>{p.author === me.email ? "you" : p.author}</code></td>
                <td>{fmtDate(p.date)}</td>
                <td><Status kind={p.status === "published" ? "approved" : "review"}>{p.status === "published" ? "Published" : "Draft"}</Status></td>
                <td>
                  {canEdit(p) ? (
                    <button className="btn btn-ghost btn-sm" onClick={() => setEdit({ ...p })}>Edit</button>
                  ) : (
                    <span className="cs-lock" title={p.kind === "statement" ? "Only Leadership can edit official statements" : "Only the author or an Admin Editor can edit this"}>🔒</span>
                  )}
                </td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={6} className="cs-muted">You haven&apos;t created any posts yet.</td></tr>}
          </tbody>
        </table>
      </Panel>

      <Drawer
        open={!!edit}
        title={edit?.id ? "Edit post" : "New post"}
        onClose={() => setEdit(null)}
        footer={edit && (
          <div className="cs-row">
            {edit.id && canEdit(edit) && <button className="btn btn-ghost btn-sm" disabled={busy} onClick={del}>🗑 Delete</button>}
            <button className="btn btn-ghost btn-sm" disabled={busy || !ready} onClick={() => save("draft")}>Save draft</button>
            <button className="btn btn-saffron btn-sm" disabled={busy || !ready || !edit.title.en} onClick={() => save("published")}>{busy ? "Saving…" : "Publish"}</button>
          </div>
        )}
      >
        {edit && (
          <div className="form">
            <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend>Format</legend>
              <div className="checks" style={{ marginTop: 6 }}>
                {Object.entries(FORMAT).map(([k, l]) => (
                  <label key={k}><input type="radio" name="fmt" checked={edit.format === k} onChange={() => setEdit({ ...edit, format: k })} /> {l}</label>
                ))}
              </div>
            </fieldset>
            {edit.format !== "blog" && (
              <div className="field">
                <label>Video link</label>
                <input type="url" placeholder="https://www.instagram.com/reel/…" value={edit.link} onChange={(e) => setEdit({ ...edit, link: e.target.value })} />
                {edit.link && <small className="cs-detect">Detected: <b>{detectPlatform(edit.link)}</b> — thumbnail is fetched from the link</small>}
              </div>
            )}
            <LangField label="Headline" value={edit.title} onChange={(v) => setEdit({ ...edit, title: v })} />
            <LangField label="Story" value={edit.story} onChange={(v) => setEdit({ ...edit, story: v })} multiline rows={6} />
            <div className="field">
              <label>Type</label>
              <select value={edit.kind} onChange={(e) => setEdit({ ...edit, kind: e.target.value })} disabled={edit.kind === "statement"}>
                <option value="story">Story</option>
                <option value="explainer">Explainer</option>
                <option value="report">Verified ground report</option>
                {edit.kind === "statement" && <option value="statement">Official statement</option>}
              </select>
              <small className="cs-muted">Official statements are issued from <a className="link-arrow" href="/console/statements">Official statements</a>.</small>
            </div>
            <DistrictPick value={edit.district} onChange={(v) => setEdit({ ...edit, district: v })} />
          </div>
        )}
      </Drawer>
    </>
  );
}
