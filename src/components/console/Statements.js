"use client";

import { useState } from "react";
import { t } from "@/i18n/config";
import { posts, statementRegistry, findLeader } from "@/data/placeholder";
import { PageTitle, Panel, LangField, Status, Flash, useFlash, fmtDate } from "./ui";

// Official statements — Admins only. Each gets the next ID + a QR code.
export default function Statements() {
  const existing = statementRegistry.map((s) => {
    const p = posts.find((x) => x.statementId === s.id);
    return { id: s.id, date: s.date, title: p ? t(p.title, "en") : "(older statement)", by: p?.leaderId ? t(findLeader(p.leaderId).role, "en") : "—" };
  });
  const [list, setList] = useState(existing);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState({ en: "", bn: "", hi: "" });
  const [body, setBody] = useState({ en: "", bn: "", hi: "" });
  const [signer, setSigner] = useState("State President");
  const [waitReview, setWaitReview] = useState(true);
  const [msg, flash] = useFlash();

  const nextNum = Math.max(...list.map((s) => +s.id.split("/").pop())) + 1;
  const nextId = `WBPCC/ST/2026/${String(nextNum).padStart(3, "0")}`;

  function publish(e) {
    e.preventDefault();
    setList([{ id: nextId, date: new Date().toISOString().slice(0, 10), title: title.en, by: signer }, ...list]);
    setEditing(false);
    setTitle({ en: "", bn: "", hi: "" });
    setBody({ en: "", bn: "", hi: "" });
    flash(`Published ${nextId} — the PDF with QR code is ready`);
  }

  return (
    <>
      <PageTitle title="Official statements" sub="Only Admins can issue these. Each one gets a permanent ID and a QR code so forwarded copies can be checked.">
        {!editing && <button className="btn btn-saffron" onClick={() => setEditing(true)}>New statement</button>}
      </PageTitle>
      <Flash msg={msg} />

      {editing && (
        <form className="cs-two wide-left" onSubmit={publish}>
          <Panel title="Write the statement">
            <div className="form">
              <LangField label="Headline" value={title} onChange={setTitle} />
              <LangField label="Statement text" value={body} onChange={setBody} multiline rows={8} />
              <div className="field">
                <label>Signed by</label>
                <select value={signer} onChange={(e) => setSigner(e.target.value)}>
                  <option>State President</option><option>Vice President</option><option>General Secretary</option>
                </select>
              </div>
              <div className="field"><label>Video link (optional — YouTube / Instagram / Facebook)</label><input type="url" placeholder="https://" /></div>
              <label className="check"><input type="checkbox" checked={waitReview} onChange={(e) => setWaitReview(e.target.checked)} /> Hide the Bangla & Hindi versions until they have been checked (recommended)</label>
              <div className="cs-row">
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                <button type="submit" className="btn btn-saffron" disabled={!title.en || !body.en}>Publish statement</button>
              </div>
            </div>
          </Panel>
          <Panel title="Preview">
            <div className="st-preview">
              <span className="badge-official">● Official statement</span>
              <h3>{title.en || "Your headline appears here"}</h3>
              <p>{body.en ? body.en.slice(0, 220) + (body.en.length > 220 ? "…" : "") : "The statement text appears here."}</p>
              <div className="st-meta">
                <div><small>Statement ID</small><code>{nextId}</code></div>
                <div><small>Signed by</small><b>{signer}</b></div>
                <div className="qr" aria-label="QR code placeholder" />
              </div>
            </div>
          </Panel>
        </form>
      )}

      <Panel title={`Issued statements (${list.length})`}>
        <table className="cs-table">
          <thead><tr><th>ID</th><th>Headline</th><th>Signed by</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id}>
                <td><code>{s.id}</code></td><td>{s.title}</td><td>{s.by}</td><td>{fmtDate(s.date)}</td>
                <td><Status kind="approved">Published</Status></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
