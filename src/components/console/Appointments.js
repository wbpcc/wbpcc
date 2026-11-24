"use client";

import { useState } from "react";
import { t, getDictionary } from "@/i18n/config";
import { districts } from "@/data/placeholder";
import { appointments as seed } from "@/data/console";
import { PageTitle, Panel, Tabs, Status, Drawer, Flash, useFlash, fmtDate } from "./ui";
import { useAdminList, patchItem, removeItem, LIVE } from "@/lib/cms";
import Icon from "../Icon";

// Requests to meet the State President — from the website's appointment form
// (open to everyone). Admins only. Every change is recorded in the audit log.
const EN = getDictionary("en").appointment;
const ST = { new: ["review", "New"], confirmed: ["approved", "Confirmed"], declined: ["rejected", "Declined"], done: ["changes", "Done"] };

// Preview data uses an older shape — bring it in line with what the form saves.
const SAMPLE = seed.map((a) => ({ ...a, topicLabel: a.reason, reason: a.describe, createdAt: `${a.date}T09:00:00Z` }));

const whoLabel = (w) => (!w ? "—" : w.startsWith("other:") ? `Other — ${w.slice(6).trim()}` : EN.whoOpts?.[w] || w);
const topicLabel = (a) => a.topicLabel || EN.reasons?.[a.topic] || "—";
const modeLabel = (m) => EN.modes?.[m] || m || "—";
const dateText = (d, tm) => (d ? `${fmtDate(d)}${tm ? `, ${tm}` : ""}` : "—");

export default function Appointments() {
  const [list, setList, state] = useAdminList("appointments", LIVE ? [] : SAMPLE);
  const [tab, setTab] = useState("new");
  const [open, setOpen] = useState(null);
  const [slot, setSlot] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, flash] = useFlash();
  const cur = list.find((a) => a.id === open);
  const st = (a) => a.status || "new";
  const shown = list.filter((a) => tab === "all" || st(a) === tab);
  const n = (s) => list.filter((a) => st(a) === s).length;

  async function update(a, patch, label, done) {
    setBusy(true);
    try {
      await patchItem("appointments", a.id, patch, label);
      setList(list.map((x) => (x.id === a.id ? { ...x, ...patch } : x)));
      setOpen(null);
      flash(done);
    } catch (e) {
      flash(`⚠️ Not changed: ${e.code === "permission-denied" ? "only an Admin can do this." : e.message}`);
    }
    setBusy(false);
  }

  async function del(a) {
    if (!window.confirm("Delete this request permanently? Use this only for spam.")) return;
    setBusy(true);
    try {
      await removeItem("appointments", a.id, "appointment request (spam)");
      setList(list.filter((x) => x.id !== a.id));
      setOpen(null);
      flash("Deleted");
    } catch (e) {
      flash(`⚠️ Not deleted: ${e.message}`);
    }
    setBusy(false);
  }

  return (
    <>
      <PageTitle title="Appointments" sub="Requests to meet the State President, sent through the website. Call or email the person to agree a time, then confirm it here." />
      <Flash msg={msg} />
      {state === "loading" && <p className="form-note">Loading requests…</p>}
      {state === "error" && <p className="cs-warn small">Couldn&apos;t load requests — check your internet and reload.</p>}
      <Tabs value={tab} onChange={setTab} tabs={[["new", "New", n("new")], ["confirmed", "Confirmed", n("confirmed")], ["done", "Done", n("done")], ["declined", "Declined", n("declined")], ["all", "All", list.length]]} />
      <Panel>
        <table className="cs-table">
          <thead><tr><th>Received</th><th>Person</th><th>Topic</th><th>Preferred</th><th>Status</th><th /></tr></thead>
          <tbody>
            {shown.map((a) => (
              <tr key={a.id}>
                <td>{a.createdAt ? fmtDate(a.createdAt) : "—"}</td>
                <td><b>{a.name}</b><br /><small className="cs-muted">{a.district ? t(districts[a.district], "en") : "—"}</small></td>
                <td>{topicLabel(a)}</td>
                <td>{dateText(a.date, a.time)}<br /><small className="cs-muted">{modeLabel(a.mode)}</small></td>
                <td><Status kind={(ST[st(a)] || ST.new)[0]}>{(ST[st(a)] || ST.new)[1]}</Status></td>
                <td><button className="btn btn-ghost btn-sm" onClick={() => { setOpen(a.id); setSlot(a.slot || dateText(a.date, a.time)); }}>Open</button></td>
              </tr>
            ))}
            {state !== "loading" && shown.length === 0 && <tr><td colSpan={6} className="cs-muted">Nothing here.</td></tr>}
          </tbody>
        </table>
      </Panel>

      <Drawer open={!!cur} title={cur ? `Appointment — ${cur.name}` : ""} onClose={() => setOpen(null)}
        footer={cur && (
          <div className="cs-row">
            <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => del(cur)}>Delete (spam)</button>
            {st(cur) === "new" && <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => update(cur, { status: "declined" }, "Declined appointment request", "Marked as declined — remember to tell the person")}>Decline</button>}
            {st(cur) === "confirmed" && <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => update(cur, { status: "done" }, "Marked appointment as done", "Marked as done")}>Mark done</button>}
            {st(cur) !== "new" && <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => update(cur, { status: "new" }, "Reopened appointment request", "Reopened")}>Reopen</button>}
            {st(cur) === "new" && <button className="btn btn-saffron btn-sm" disabled={busy || !slot.trim()} onClick={() => update(cur, { status: "confirmed", slot: slot.trim() }, `Confirmed appointment for ${slot.trim()}`, "Confirmed — remember to tell the person the time")}>Confirm slot</button>}
          </div>
        )}>
        {cur && (
          <div className="form">
            <dl className="cs-dl">
              <dt>Phone</dt><dd>{cur.phone ? <a className="link-arrow" href={`tel:${cur.phone.replace(/\s/g, "")}`}><Icon name="phone" size={15} /> {cur.phone}</a> : "—"}</dd>
              <dt>Email</dt><dd>{cur.email ? <a className="link-arrow" href={`mailto:${cur.email}?subject=${encodeURIComponent("Your appointment request — WBPCC")}`}><Icon name="mail" size={15} /> {cur.email}</a> : "—"}</dd>
              {cur.whatsapp && <><dt>WhatsApp</dt><dd>{cur.whatsapp}</dd></>}
              <dt>Who</dt><dd>{whoLabel(cur.who)}{cur.occupation ? ` · ${cur.occupation}` : ""}</dd>
              <dt>Address</dt><dd>{[cur.address, cur.district ? t(districts[cur.district], "en") : "", cur.pin].filter(Boolean).join(", ") || "—"}</dd>
              <dt>Topic</dt><dd>{topicLabel(cur)}</dd>
              <dt>Preferred</dt><dd>{dateText(cur.date, cur.time)} · {modeLabel(cur.mode)}{cur.people ? ` · ${cur.people} ${cur.people === 1 ? "person" : "people"}` : ""}{cur.duration ? ` · ${cur.duration} min` : ""}</dd>
              {cur.altDate && <><dt>Alternative</dt><dd>{dateText(cur.altDate, cur.altTime)}</dd></>}
              {cur.handledBy && <><dt>Last handled by</dt><dd>{cur.handledBy}</dd></>}
            </dl>
            <div className="field"><label>Request</label><p className="cs-message">{cur.reason}</p></div>
            {cur.more && <div className="field"><label>Additional details</label><p className="cs-message">{cur.more}</p></div>}
            <div className="field"><label>Confirmed date &amp; time</label><input value={slot} onChange={(e) => setSlot(e.target.value)} disabled={st(cur) !== "new"} placeholder="e.g. 3 Dec, 11:30 AM at Congress Bhavan" /></div>
            <p className="form-note">Call or email the person to agree the time, then press <b>Confirm slot</b>. Every change is recorded in the audit log.</p>
          </div>
        )}
      </Drawer>
    </>
  );
}
