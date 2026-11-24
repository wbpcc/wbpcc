"use client";

import { useState } from "react";
import { t } from "@/i18n/config";
import { petitions as petSeed, campaigns as campSeed, events, groups, districts } from "@/data/placeholder";

import { useRole } from "./ConsoleShell";
import { PageTitle, Panel, Tabs, Status, Drawer, LangField, DistrictPick, Flash, useFlash, fmtDate } from "./ui";
import { useLiveList, saveItem, requestPublish, savedMessage, LIVE } from "@/lib/cms";
import Icon from "../Icon";

// Start petitions & campaigns directly (Admin).
// Contributors create theirs under "My submissions" → Review queue.
// In the database: `stage` = where a petition is (live / closed / …);
// `status` = published (on the website) or draft (Admins only).
const tri = (x) => x || { en: "", bn: "", hi: "" };
const PSTATUS = { live: ["approved", "Live"], closed: ["review", "Closed"], submitted: ["changes", "Submitted to govt"], won: ["approved", "Won"], draft: ["review", "Draft"] };
const prepPet = (p) => ({ ...p, stage: p.stage || (p.status === "draft" ? "draft" : "live"), why: p.why || p.desc || tri(), addressedTo: p.addressedTo || tri() });
const prepCamp = (c) => ({ ...c, desc: c.desc || tri(), events: c.events || [], petitions: c.petitions || [] });

export default function CampaignsPetitions() {
  const { role } = useRole();
  const lead = role === "admin";
  const canStartPet = lead;
  const canStartCamp = lead;
  const canStart = canStartPet || canStartCamp;
  const canEditExisting = lead;
  const [tab, setTab] = useState("petitions");
  const [pets, setPets, s1] = useLiveList("petitions", petSeed, prepPet);
  const [camps, setCamps, s2] = useLiveList("campaigns", campSeed, prepCamp);
  const loadState = [s1, s2].includes("error") ? "error" : [s1, s2].includes("loading") ? "loading" : "ok";
  const [edit, setEdit] = useState(null); // { type: "petition" | "campaign", item }
  const [busy, setBusy] = useState(false);
  const [msg, flash] = useFlash();

  const blankPet = (from) => ({ id: `petition-${Date.now()}`, type: from?.ptype || "online", signatures: 0, goal: 5000, startedBy: from ? "member" : "leadership", district: from?.district || "", group: "", stage: "live",
    title: { en: from?.title || "", bn: "", hi: "" }, why: { en: from?.why || "", bn: "", hi: "" }, addressedTo: { en: from?.authority || "", bn: "", hi: "" }, fromProposal: from?.id });
  const blankCamp = (from) => ({ id: `campaign-${Date.now()}`, group: "", start: "", end: "", featured: false, events: [], petitions: [],
    title: { en: from?.title || "", bn: "", hi: "" }, goal: { en: from?.why || "", bn: "", hi: "" }, desc: tri(), fromProposal: from?.id });

  const patch = (p) => setEdit({ ...edit, item: { ...edit.item, ...p } });
  const toggle = (key, id) => patch({ [key]: edit.item[key].includes(id) ? edit.item[key].filter((x) => x !== id) : [...edit.item[key], id] });

  async function save(asDraft) {
    const isPet = edit.type === "petition";
    const [list, setter] = isPet ? [pets, setPets] : [camps, setCamps];
    let it = { ...edit.item };
    if (isPet) {
      if (asDraft) it.stage = "draft";
      else if (it.stage === "draft") it.stage = "live";
    }
    const draft = isPet ? it.stage === "draft" : !!asDraft;
    const exists = list.some((x) => x.id === it.id);
    // New items go to the top of the list.
    const order = exists ? it.order : Math.min(0, ...list.map((x) => x.order ?? 0)) - 1;
    const { fromProposal, why, ...data } = it;
    const toSave = isPet ? { ...data, desc: why } : data;
    setBusy(true);
    try {
      await saveItem(isPet ? "petitions" : "campaigns", toSave, { order, status: draft ? "draft" : "published", label: `${edit.type} “${t(it.title, "en")}”` });
      it = { ...it, order, status: draft ? "draft" : "published" };
      setter(exists ? list.map((x) => (x.id === it.id ? it : x)) : [it, ...list]);
      setEdit(null);
      flash(draft ? (LIVE ? "Saved as a draft — only Admins can see it" : "Saved as draft (preview only)") : savedMessage(await requestPublish(), "Published"));
    } catch (e) {
      flash(`⚠️ Not saved: ${e.code === "permission-denied" ? "only an Admin can change this." : e.message}`);
    }
    setBusy(false);
  }

  return (
    <>
      <PageTitle title="Petitions & campaigns" sub="Start a petition or campaign and publish it straight to the website — no code. Contributors' submissions arrive through the Review queue.">
        <button className="btn btn-ghost" disabled={!canStartCamp} title={canStartCamp ? "" : "You don't have permission to start campaigns"} onClick={() => setEdit({ type: "campaign", item: blankCamp() })}>Start a campaign</button>
        <button className="btn btn-saffron" disabled={!canStartPet} title={canStartPet ? "" : "You don't have permission to start petitions"} onClick={() => setEdit({ type: "petition", item: blankPet() })}>Start a petition</button>
      </PageTitle>
      <Flash msg={msg} />
      {loadState === "loading" && <p className="form-note">Loading the latest from the database…</p>}
      {loadState === "error" && <p className="cs-warn small">Couldn&apos;t load from the database — check your internet and reload before editing.</p>}

      <Tabs value={tab} onChange={setTab} tabs={[["petitions", "Petitions", pets.length], ["campaigns", "Campaigns", camps.length]]} />

      <Panel>
        {tab === "petitions" && (
          <table className="cs-table">
            <thead><tr><th>Petition</th><th>Type</th><th>Signatures</th><th>Status</th><th /></tr></thead>
            <tbody>
              {pets.map((p) => (
                <tr key={p.id}>
                  <td><b>{t(p.title, "en")}</b><br /><small className="cs-muted">{p.startedBy === "member" ? "From a contributor" : "Started by the party"}{p.district ? ` · ${t(districts[p.district], "en")}` : ""}</small></td>
                  <td>{p.type === "formal" ? "Government" : "Online"}</td>
                  <td>{p.signatures.toLocaleString("en-IN")} / {Number(p.goal).toLocaleString("en-IN")}</td>
                  <td><Status kind={(PSTATUS[p.stage] || PSTATUS.live)[0]}>{(PSTATUS[p.stage] || PSTATUS.live)[1]}</Status></td>
                  <td>{canEditExisting ? <button className="btn btn-ghost btn-sm" onClick={() => setEdit({ type: "petition", item: { ...p } })}>Edit</button> : <span className="cs-lock" title="Not in your permissions"><Icon name="lock" size={15} /></span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "campaigns" && (
          <table className="cs-table">
            <thead><tr><th>Campaign</th><th>Runs</th><th>Linked</th><th>Home page</th><th /></tr></thead>
            <tbody>
              {camps.map((c) => (
                <tr key={c.id}>
                  <td><b>{t(c.title, "en")}</b><br /><small className="cs-muted">{t(c.goal, "en")}</small></td>
                  <td>{c.start ? `${fmtDate(c.start)} – ${c.end ? fmtDate(c.end) : "…"}` : "—"}</td>
                  <td>{c.events.length} events · {c.petitions.length} petitions</td>
                  <td>{c.status === "draft" ? <Status kind="review">Draft</Status> : c.featured ? <Status kind="approved">Featured</Status> : "—"}</td>
                  <td>{canEditExisting ? <button className="btn btn-ghost btn-sm" onClick={() => setEdit({ type: "campaign", item: { ...c } })}>Edit</button> : <span className="cs-lock" title="Not in your permissions"><Icon name="lock" size={15} /></span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Drawer
        open={!!edit}
        title={edit ? `${edit.type === "petition" ? "Petition" : "Campaign"}${edit.item.fromProposal ? ` — from ${edit.item.fromProposal}` : ""}` : ""}
        onClose={() => setEdit(null)}
        footer={edit && (
          <div className="cs-row">
            <button className="btn btn-ghost btn-sm" disabled={busy || loadState !== "ok"} onClick={() => save(true)}>Save draft</button>
            <button className="btn btn-saffron btn-sm" disabled={busy || loadState !== "ok" || !edit.item.title.en} onClick={() => save(false)}>{busy ? "Saving…" : "Publish to website"}</button>
          </div>
        )}
      >
        {edit?.type === "petition" && (
          <div className="form">
            <LangField label="Petition title" value={edit.item.title} onChange={(v) => patch({ title: v })} />
            <LangField label="Why this matters" value={edit.item.why} onChange={(v) => patch({ why: v })} multiline rows={5} />
            <LangField label="Addressed to (who must act)" value={edit.item.addressedTo} onChange={(v) => patch({ addressedTo: v })} />
            <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend>Type</legend>
              <div className="checks" style={{ marginTop: 6 }}>
                <label><input type="radio" checked={edit.item.type === "online"} onChange={() => patch({ type: "online" })} /> Online signatures</label>
                <label><input type="radio" checked={edit.item.type === "formal"} onChange={() => patch({ type: "formal" })} /> For government (collects name + address)</label>
              </div>
            </fieldset>
            <div className="cs-two">
              <div className="field"><label>Signature goal</label><input type="number" min={100} value={edit.item.goal} onChange={(e) => patch({ goal: e.target.value })} /></div>
              <div className="field"><label>Closes on</label><input type="date" value={edit.item.closes || ""} onChange={(e) => patch({ closes: e.target.value })} /></div>
            </div>
            <DistrictPick value={edit.item.district} onChange={(v) => patch({ district: v })} />
            <div className="field"><label>Group</label><select value={edit.item.group || ""} onChange={(e) => patch({ group: e.target.value })}><option value="">— None —</option>{groups.map((g) => <option key={g.id} value={g.id}>{t(g.name, "en")}</option>)}</select></div>
            <div className="field"><label>Status</label><select value={edit.item.stage} onChange={(e) => patch({ stage: e.target.value })}>{Object.entries(PSTATUS).map(([k, v]) => <option key={k} value={k}>{v[1]}</option>)}</select><small className="cs-muted">“Draft” keeps it off the website.</small></div>
          </div>
        )}
        {edit?.type === "campaign" && (
          <div className="form">
            <LangField label="Campaign name" value={edit.item.title} onChange={(v) => patch({ title: v })} />
            <LangField label="Goal (one line)" value={edit.item.goal} onChange={(v) => patch({ goal: v })} />
            <LangField label="About the campaign" value={edit.item.desc} onChange={(v) => patch({ desc: v })} multiline rows={5} />
            <div className="cs-two">
              <div className="field"><label>Starts</label><input type="date" value={edit.item.start} onChange={(e) => patch({ start: e.target.value })} /></div>
              <div className="field"><label>Ends</label><input type="date" value={edit.item.end} onChange={(e) => patch({ end: e.target.value })} /></div>
            </div>
            <div className="field"><label>Leading group</label><select value={edit.item.group || ""} onChange={(e) => patch({ group: e.target.value })}><option value="">Whole party</option>{groups.map((g) => <option key={g.id} value={g.id}>{t(g.name, "en")}</option>)}</select></div>
            <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend>Events in this campaign</legend>
              <div className="checks" style={{ marginTop: 6 }}>{events.map((e) => <label key={e.id}><input type="checkbox" checked={edit.item.events.includes(e.id)} onChange={() => toggle("events", e.id)} /> {t(e.title, "en")}</label>)}</div>
            </fieldset>
            <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend>Petitions in this campaign</legend>
              <div className="checks" style={{ marginTop: 6 }}>{pets.map((p) => <label key={p.id}><input type="checkbox" checked={edit.item.petitions.includes(p.id)} onChange={() => toggle("petitions", p.id)} /> {t(p.title, "en")}</label>)}</div>
            </fieldset>
            <div className="field"><label>Cover photo</label>{LIVE ? <p className="form-note">Photo uploads come in a later step.</p> : <label className="dropzone"><span>Upload a cover</span><small>Wide photo, at least 1600 px</small><input type="file" accept="image/*" className="sr-only" /></label>}</div>
            <label className="check"><input type="checkbox" checked={edit.item.featured} onChange={(e) => patch({ featured: e.target.checked })} /> Feature on the landing page</label>
          </div>
        )}
      </Drawer>
    </>
  );
}
