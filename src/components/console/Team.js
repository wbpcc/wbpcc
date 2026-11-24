"use client";

import { useState } from "react";
import { ROLES, team as seed } from "@/data/console";
import { useRole } from "./ConsoleShell";
import { PageTitle, Panel, Status, Flash, useFlash, fmtDate } from "./ui";
import Icon from "../Icon";

// Team & roles — two team roles: Admin (full access) and Contributor.
// Admins add / remove Admins and Contributors. Every change is logged.
export default function Team() {
  const { role, me } = useRole();
  const [rows, setRows] = useState(seed);
  const [invite, setInvite] = useState({ email: "", role: "contributor" });
  const [handover, setHandover] = useState(null);
  const [msg, flash] = useFlash();

  const assignable = ["admin", "contributor"];
  const canChange = (r) => role === "admin" && r.email !== me.email;

  return (
    <>
      <PageTitle title="Team & roles" sub="Contributors write and submit. Admins have full access: they review and publish, edit the whole site and see the members list." />
      <Flash msg={msg} />
      <div className="role-explainer">
        {[
          ["pen", "Contributor", "Writes articles & blogs, creates petitions & campaigns — submits them for review."],
          ["shield", "Admin", "Full access: accepts or rejects submissions, edits any section, the leadership team and the members list."],
        ].map(([i, t, d]) => <div key={t} className="role-chip"><i><Icon name={i} size={22} /></i><b>{t}</b><span>{d}</span></div>)}
      </div>
      <Panel>
        <table className="cs-table">
          <thead><tr><th>Account</th><th>Held by</th><th>Role</th><th>2-step</th><th>Last active</th><th /></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.email}>
                <td><code>{r.email}</code>{r.email === me.email && <small className="cs-muted"> (you)</small>}</td>
                <td>{r.holder}</td>
                <td>
                  {canChange(r) ? (
                    <select value={r.role} onChange={(e) => { setRows(rows.map((x) => (x.email === r.email ? { ...x, role: e.target.value } : x))); flash(`Role changed for ${r.email} — logged`); }}>
                      {[...new Set([...assignable, r.role])].map((k) => <option key={k} value={k}>{ROLES[k].label}</option>)}
                    </select>
                  ) : <span>{ROLES[r.role].label}</span>}
                </td>
                <td>{r.twofa ? <Status kind="approved">On</Status> : <Status kind="rejected">Off</Status>}</td>
                <td>{fmtDate(r.last)}</td>
                <td>
                  {canChange(r) && <button className="btn btn-ghost btn-sm" onClick={() => { setRows(rows.filter((x) => x.email !== r.email)); flash(`${r.email} removed — access revoked`); }}>Remove</button>}
                  {r.email !== me.email && <button className="btn btn-ghost btn-sm" style={{ marginLeft: 6 }} onClick={() => setHandover(r)}>Hand over</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.some((r) => !r.twofa) && <p className="cs-warn small" style={{ marginTop: 10 }}>Some accounts don&apos;t have 2-step verification yet. Team logins without it will be blocked at launch.</p>}
      </Panel>

      {handover && (
        <Panel title={`Hand over ${handover.email}`}>
          <p>Signs out every device, resets the password and 2-step code, and sends a setup link to the new person. History stays with <code>{handover.email}</code>.</p>
          <div className="cs-row">
            <button className="btn btn-ghost btn-sm" onClick={() => setHandover(null)}>Cancel</button>
            <button className="btn btn-navy btn-sm" onClick={() => { setRows(rows.map((x) => (x.email === handover.email ? { ...x, twofa: false } : x))); setHandover(null); flash("Access reset — setup link sent"); }}>Reset & send setup link</button>
          </div>
        </Panel>
      )}

      <Panel title="Add an Admin or Contributor">
        <form className="cs-invite" onSubmit={(e) => { e.preventDefault(); setRows([...rows, { email: invite.email, role: invite.role, holder: "Invited", twofa: false, last: new Date().toISOString().slice(0, 10) }]); setInvite({ email: "", role: invite.role }); flash("Invite sent"); }}>
          <div className="field"><label>Email</label><input type="email" required placeholder="name@wbpcc.org" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} /></div>
          <div className="field"><label>Role</label><select value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value })}>{assignable.map((k) => <option key={k} value={k}>{ROLES[k].label}</option>)}</select></div>
          <button className="btn btn-saffron" type="submit">Send invite</button>
        </form>
      </Panel>
    </>
  );
}
