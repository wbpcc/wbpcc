"use client";

import { useMemo, useState } from "react";
import { PageTitle, Panel, Tabs, Status, Drawer, Flash, useFlash } from "./ui";
import { useAdminList, patchItem, removeItem, LIVE } from "@/lib/cms";
import Icon from "../Icon";

// Inbox — every message sent through the website's Contact form.
// Admins only (the database refuses everyone else). Each change is logged.
const TYPE = {
  feedback: "Feedback", suggestion: "Suggestion", grievance: "Grievance / complaint", help: "Need help",
  volunteer: "Volunteer", petition: "Petition idea", media: "Media enquiry", other: "Other",
};
const STATUS = { new: ["review", "New"], replied: ["approved", "Replied"], closed: ["changes", "Closed"] };
const LANG = { en: "English", bn: "বাংলা", hi: "हिन्दी" };

const SAMPLE = [
  { id: "s1", type: "grievance", name: "Sample Person", email: "sample@example.com", phone: "", message: "Sample grievance — appears here once the website is connected.", lang: "en", status: "new", createdAt: new Date().toISOString() },
];

const when = (iso) => (iso ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)) : "—");

export default function Inbox() {
  const [list, setList, state] = useAdminList("inbox", LIVE ? [] : SAMPLE);
  const [tab, setTab] = useState("new");
  const [type, setType] = useState("");
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, flash] = useFlash();

  const count = (s) => list.filter((x) => (s === "all" || (x.status || "new") === s) && (!type || x.type === type)).length;
  const shown = useMemo(
    () => list.filter((x) => (tab === "all" || (x.status || "new") === tab) && (!type || x.type === type)),
    [list, tab, type]
  );

  async function setStatus(item, status) {
    setBusy(true);
    try {
      await patchItem("inbox", item.id, { status }, `Marked message as ${STATUS[status][1].toLowerCase()}`);
      setList(list.map((x) => (x.id === item.id ? { ...x, status } : x)));
      setOpen(null);
      flash(`Marked as ${STATUS[status][1].toLowerCase()}`);
    } catch (e) {
      flash(`⚠️ Not changed: ${e.code === "permission-denied" ? "only an Admin can do this." : e.message}`);
    }
    setBusy(false);
  }

  async function del(item) {
    if (!window.confirm("Delete this message permanently? Use this only for spam.")) return;
    setBusy(true);
    try {
      await removeItem("inbox", item.id, "message (spam)");
      setList(list.filter((x) => x.id !== item.id));
      setOpen(null);
      flash("Deleted");
    } catch (e) {
      flash(`⚠️ Not deleted: ${e.message}`);
    }
    setBusy(false);
  }

  return (
    <>
      <PageTitle title="Inbox" sub="Messages from the website's Contact form — feedback, grievances, requests for help, volunteers, media. Only Admins can see this." />
      <Flash msg={msg} />
      {state === "loading" && <p className="form-note">Loading messages…</p>}
      {state === "error" && <p className="cs-warn small">Couldn&apos;t load messages — check your internet and reload.</p>}

      <div className="cs-row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <Tabs value={tab} onChange={setTab} tabs={[["new", "New", count("new")], ["replied", "Replied", count("replied")], ["closed", "Closed", count("closed")], ["all", "All", count("all")]]} />
        <label className="cs-filter">
          <span>Type</span>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All types</option>
            {Object.entries(TYPE).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </label>
      </div>

      <Panel>
        <table className="cs-table">
          <thead><tr><th>Received</th><th>Type</th><th>From</th><th>Message</th><th>Status</th><th /></tr></thead>
          <tbody>
            {shown.map((x) => (
              <tr key={x.id}>
                <td>{when(x.createdAt)}</td>
                <td>{TYPE[x.type] || x.type}</td>
                <td><b>{x.name || "—"}</b><br /><small className="cs-muted">{x.email}</small></td>
                <td className="cs-clip">{x.message}</td>
                <td><Status kind={(STATUS[x.status] || STATUS.new)[0]}>{(STATUS[x.status] || STATUS.new)[1]}</Status></td>
                <td><button className="btn btn-ghost btn-sm" onClick={() => setOpen(x)}>Open</button></td>
              </tr>
            ))}
            {state !== "loading" && shown.length === 0 && <tr><td colSpan={6} className="cs-muted">No messages here.</td></tr>}
          </tbody>
        </table>
      </Panel>

      <Drawer open={!!open} title={open ? `${TYPE[open.type] || "Message"}` : ""} onClose={() => setOpen(null)}
        footer={open && (
          <div className="cs-row">
            <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => del(open)}>Delete (spam)</button>
            {(open.status || "new") !== "new" && <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => setStatus(open, "new")}>Reopen</button>}
            {open.status !== "closed" && <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => setStatus(open, "closed")}>Close</button>}
            {open.status !== "replied" && <button className="btn btn-saffron btn-sm" disabled={busy} onClick={() => setStatus(open, "replied")}>Mark replied</button>}
          </div>
        )}>
        {open && (
          <div className="form">
            <dl className="cs-dl">
              <dt>Received</dt><dd>{when(open.createdAt)}</dd>
              <dt>Name</dt><dd>{open.name || "—"}</dd>
              <dt>Email</dt><dd><a className="link-arrow" href={`mailto:${open.email}?subject=${encodeURIComponent("Re: your message to WBPCC")}`}><Icon name="mail" size={15} /> {open.email}</a></dd>
              <dt>Phone</dt><dd>{open.phone ? <a className="link-arrow" href={`tel:${open.phone.replace(/\s/g, "")}`}><Icon name="phone" size={15} /> {open.phone}</a> : "—"}</dd>
              <dt>Language</dt><dd>{LANG[open.lang] || "—"}</dd>
              {open.handledBy && <><dt>Last handled by</dt><dd>{open.handledBy}</dd></>}
            </dl>
            <div className="field"><label>Message</label><p className="cs-message">{open.message}</p></div>
            <p className="form-note">Reply from your own email using the link above, then press <b>Mark replied</b>. Every change is recorded in the audit log.</p>
          </div>
        )}
      </Drawer>
    </>
  );
}
