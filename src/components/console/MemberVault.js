"use client";

import { useState } from "react";
import { t } from "@/i18n/config";
import { districts, findGroup } from "@/data/placeholder";
import { applications } from "@/data/console";
import { PageTitle, Panel, Tabs, Status, Drawer, Flash, useFlash, fmtDate } from "./ui";
import Icon from "../Icon";

// Members list — Admins only. Every record
// opened here is written to the audit log (Phase 2: enforced server-side).
const DCODE = { kolkata: "KOL", howrah: "HWH", n24pgs: "N24", darjeeling: "DJL", malda: "MLD", pbardhaman: "PBD", murshidabad: "MSD", nadia: "NAD", pmedinipur: "PMD" };
const GCODE = { youth: "YTH", women: "WOM", students: "STU", labour: "LAB", minority: "MIN", farmers: "FRM" };
const ST = { new: ["review", "New"], verifying: ["changes", "Verifying"], approved: ["approved", "Approved"], rejected: ["rejected", "Rejected"] };

export default function MemberVault() {
  const [apps, setApps] = useState(applications);
  const [tab, setTab] = useState("new");
  const [openId, setOpenId] = useState(null);
  const [method, setMethod] = useState("Phone call");
  const [note, setNote] = useState("");
  const [msg, flash] = useFlash();
  const open = apps.find((a) => a.id === openId);
  const shown = apps.filter((a) => tab === "all" || a.status === tab);
  const count = (s) => apps.filter((a) => a.status === s).length;

  const update = (id, patch) => setApps(apps.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  function approve(a) {
    const memberId = `WB-${DCODE[a.district]}-${GCODE[a.groups[0]] || "GEN"}-${String(400 + Math.floor(Math.random() * 600)).padStart(4, "0")}`;
    const invite = Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    update(a.id, { status: "approved", memberId, invite, note: `${method}${note ? ` — ${note}` : ""}` });
    flash(`Approved — Member ID ${memberId} created`);
  }

  return (
    <>
      <PageTitle title="Members list" sub="Every member and new registration. Only Admins can see this list — members never see each other." />
      <div className="cs-onhold"><span><Icon name="clock" size={24} /></span><div><b>Verification process on hold</b>The party is still deciding how members are verified and given access. This screen shows the proposed flow for discussion — the steps may change before it goes live.</div></div>
      <div className="cs-warn"><Icon name="lock" size={15} /> Every record you open is recorded in the audit log with your account and the time.</div>
      <Flash msg={msg} />
      <Tabs value={tab} onChange={setTab} tabs={[["new", "New", count("new")], ["verifying", "Verifying", count("verifying")], ["approved", "Approved", count("approved")], ["rejected", "Rejected", count("rejected")], ["all", "All", apps.length]]} />
      <Panel>
        <table className="cs-table">
          <thead><tr><th>Application</th><th>District</th><th>Groups</th><th>Received</th><th>Status</th><th /></tr></thead>
          <tbody>
            {shown.map((a) => (
              <tr key={a.id}>
                <td><code>{a.id}</code></td>
                <td>{t(districts[a.district], "en")}</td>
                <td>{a.groups.map((g) => findGroup(g).icon).join(" ") || "—"}</td>
                <td>{fmtDate(a.date)}</td>
                <td><Status kind={ST[a.status][0]}>{ST[a.status][1]}</Status></td>
                <td><button className="btn btn-ghost btn-sm" onClick={() => { setOpenId(a.id); setNote(""); }}>Open</button></td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={6} className="cs-muted">Nothing here.</td></tr>}
          </tbody>
        </table>
      </Panel>

      <Drawer
        open={!!open}
        title={open ? `Application ${open.id}` : ""}
        onClose={() => setOpenId(null)}
        footer={open && (open.status === "new" || open.status === "verifying") && (
          <div className="cs-row">
            <button className="btn btn-ghost btn-sm" onClick={() => { update(open.id, { status: "rejected", note: note || "Not approved" }); flash("Application rejected"); }}>✕ Reject</button>
            {open.status === "new" && <button className="btn btn-ghost btn-sm" onClick={() => { update(open.id, { status: "verifying", note: `${method}${note ? ` — ${note}` : ""}` }); flash("Marked as verifying"); }}>Mark verifying</button>}
            <button className="btn btn-saffron btn-sm" onClick={() => approve(open)}>✓ Verified — approve</button>
          </div>
        )}
      >
        {open && (
          <div className="form">
            <p className="cs-warn small">Opened by you at {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} — logged.</p>
            <dl className="cs-dl">
              <dt>Name</dt><dd>{open.name}</dd>
              <dt>Phone</dt><dd>{open.phone}</dd>
              <dt>Email</dt><dd>{open.email || "—"}</dd>
              <dt>District</dt><dd>{t(districts[open.district], "en")}</dd>
              <dt>Constituency</dt><dd>{open.constituency}</dd>
              <dt>Groups</dt><dd>{open.groups.map((g) => t(findGroup(g).name, "en")).join(", ") || "—"}</dd>
              <dt>Status</dt><dd><Status kind={ST[open.status][0]}>{ST[open.status][1]}</Status></dd>
              {open.note && (<><dt>Note</dt><dd>{open.note}</dd></>)}
            </dl>
            {open.status === "approved" && open.memberId && (
              <div className="member-id-card">
                <small>Member ID</small>
                <b>{open.memberId}</b>
                {open.invite && <span style={{ fontSize: 14 }}>Invite code: <code style={{ background: "rgba(255,255,255,.15)", padding: "2px 6px", borderRadius: 4 }}>{open.invite}</code> — send it to the applicant privately</span>}
                <span className="tricolour"><span /><span /><span /></span>
              </div>
            )}
            {(open.status === "new" || open.status === "verifying") && (
              <>
                <div className="field">
                  <label>How was the applicant verified?</label>
                  <select value={method} onChange={(e) => setMethod(e.target.value)}>
                    <option>Phone call</option><option>Met at district office</option><option>Known to district committee</option>
                  </select>
                </div>
                <div className="field"><label>Note (optional)</label><textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} /></div>
                <p className="form-note">We record only “verified by an Admin on date” — no ID cards or Aadhaar are stored.</p>
              </>
            )}
          </div>
        )}
      </Drawer>
    </>
  );
}
