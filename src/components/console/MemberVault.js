"use client";

import { useState } from "react";
import { t } from "@/i18n/config";
import { districts, findGroup } from "@/data/placeholder";
import { applications } from "@/data/console";
import { PageTitle, Panel, Tabs, Status, Drawer, Flash, useFlash, fmtDate } from "./ui";
import { useAdminList, patchItem, removeItem, logView, adminApi, LIVE } from "@/lib/cms";
import Icon from "../Icon";

// Members list — membership applications from the website's Join form.
// Admins only (the database refuses everyone else); members never see each other.
// Opening a record and every decision is written to the audit log.
const ST = {
  new: ["review", "New"], verifying: ["changes", "Verifying"], approved: ["approved", "Approved"], rejected: ["rejected", "Rejected"],
};
const st = (a) => (a.status === "pending_payment" || !a.status ? "new" : a.status);

// Preview data uses an older shape — bring it in line with what the Join form saves.
const SAMPLE = applications.map((a) => ({ ...a, mobile: a.phone, assembly: a.constituency, group: a.groups[0] || "", createdAt: `${a.date}T09:00:00Z` }));

const code3 = (s) => String(s || "GEN").replace(/[^a-z]/gi, "").slice(0, 3).toUpperCase() || "GEN";
const newMemberId = (a) => `WB-${code3(a.district)}-${code3((a.group || "").split("-")[0])}-${String(Math.floor(1000 + Math.random() * 9000))}`;
const groupName = (id) => (id ? t(findGroup(id)?.name, "en") || id : "—");
const districtName = (k) => (k ? t(districts[k], "en") || k : "—");

export default function MemberVault() {
  const [apps, setApps, state] = useAdminList("applications", LIVE ? [] : SAMPLE);
  const [tab, setTab] = useState("new");
  const [openId, setOpenId] = useState(null);
  const [method, setMethod] = useState("Phone call");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, flash] = useFlash();
  const open = apps.find((a) => a.id === openId);
  const shown = apps.filter((a) => tab === "all" || st(a) === tab);
  const count = (s) => apps.filter((a) => st(a) === s).length;

  function openRecord(a) {
    setOpenId(a.id);
    setNote("");
    logView("applications", a.id, "membership application");
  }

  async function update(a, patch, label, done) {
    setBusy(true);
    try {
      await patchItem("applications", a.id, patch, label);
      setApps(apps.map((x) => (x.id === a.id ? { ...x, ...patch } : x)));
      flash(done);
    } catch (e) {
      flash(`⚠️ Not changed: ${e.code === "permission-denied" ? "only an Admin can do this." : e.message}`);
    }
    setBusy(false);
  }

  const how = () => `${method}${note ? ` — ${note}` : ""}`;
  const [invite, setInvite] = useState(null); // { code, memberId, mobile, name, lang, validDays } — shown once

  const REASON = {
    "mobile-already-member": "This mobile number already has a member login.",
    "bad-mobile": "The mobile number on this application isn't a valid 10-digit number — ask them to apply again.",
    "already-approved": "Already approved.", "already-active": "This member has already set their password — they can sign in.",
    "not-approved": "Approve the application first.", "server-not-configured": "The server isn't set up (FIREBASE_SERVICE_ACCOUNT on Vercel).",
  };

  // Shared-login model (the party's choice): approving records the member — no
  // personal login or invite code. The Admin shares the members' login with them.
  const SHARED_MEMBER_LOGIN = true;

  async function approve(a) {
    if (!LIVE || SHARED_MEMBER_LOGIN) {
      const memberId = newMemberId(a);
      update(a, { status: "approved", memberId, verifiedBy: how() }, `Approved membership application (${memberId})`, `Approved — Member ID ${memberId}. Share the members' login with them.`);
      return;
    }
    if (!window.confirm(`Approve ${a.name} and create their member login?`)) return;
    setBusy(true);
    const r = await adminApi("/api/members/approve", { applicationId: a.id, verifiedBy: how() });
    if (r.ok) {
      setApps(apps.map((x) => (x.id === a.id ? { ...x, status: "approved", memberId: r.memberId, memberUid: r.memberUid, verifiedBy: how() } : x)));
      setInvite({ code: r.invite, memberId: r.memberId, mobile: r.mobile, name: a.name, lang: a.lang || "en", validDays: r.validDays });
      flash(`Approved — Member ID ${r.memberId}. Send them the invite code.`);
    } else {
      flash(`⚠️ Not approved: ${REASON[r.reason] || r.detail || r.reason || "something went wrong"}`);
    }
    setBusy(false);
  }

  async function reinvite(a) {
    setBusy(true);
    const r = await adminApi("/api/members/invite", { applicationId: a.id });
    if (r.ok) {
      setInvite({ code: r.invite, memberId: r.memberId, mobile: r.mobile, name: a.name, lang: a.lang || "en", validDays: r.validDays });
      flash("New invite code created — the old one no longer works");
    } else {
      flash(`⚠️ ${REASON[r.reason] || r.detail || r.reason || "something went wrong"}`);
    }
    setBusy(false);
  }

  async function del(a) {
    if (!window.confirm("Delete this application permanently? Use this only for spam or duplicates.")) return;
    setBusy(true);
    try {
      await removeItem("applications", a.id, "membership application (spam/duplicate)");
      setApps(apps.filter((x) => x.id !== a.id));
      setOpenId(null);
      flash("Deleted");
    } catch (e) {
      flash(`⚠️ Not deleted: ${e.message}`);
    }
    setBusy(false);
  }

  return (
    <>
      <PageTitle title="Members list" sub="Membership applications from the website. Only Admins can see this list — members never see each other." />
      <div className="cs-onhold"><span><Icon name="clock" size={24} /></span><div><b>How membership works</b>People apply through the Join form (no verification codes). Check the person if you wish — a call, the district office or the district committee — then approve or reject here. Approved members use the shared members&apos; login; share it with them yourself.</div></div>
      <div className="cs-warn"><Icon name="lock" size={15} /> Every application you open is recorded in the audit log with your account and the time.</div>
      <Flash msg={msg} />
      {state === "loading" && <p className="form-note">Loading applications…</p>}
      {state === "error" && <p className="cs-warn small">Couldn&apos;t load applications — check your internet and reload.</p>}
      <Tabs value={tab} onChange={setTab} tabs={[["new", "New", count("new")], ["verifying", "Verifying", count("verifying")], ["approved", "Approved", count("approved")], ["rejected", "Rejected", count("rejected")], ["all", "All", apps.length]]} />
      <Panel>
        <table className="cs-table">
          <thead><tr><th>Received</th><th>District</th><th>Organisation</th><th>Fee</th><th>Status</th><th /></tr></thead>
          <tbody>
            {shown.map((a) => (
              <tr key={a.id}>
                <td>{a.createdAt ? fmtDate(a.createdAt) : "—"}</td>
                <td>{districtName(a.district)}</td>
                <td>{groupName(a.group)}</td>
                <td>{a.paid ? "Paid" : <span className="cs-muted">Not paid</span>}</td>
                <td><Status kind={(ST[st(a)] || ST.new)[0]}>{(ST[st(a)] || ST.new)[1]}</Status></td>
                <td><button className="btn btn-ghost btn-sm" onClick={() => openRecord(a)}>Open</button></td>
              </tr>
            ))}
            {state !== "loading" && shown.length === 0 && <tr><td colSpan={6} className="cs-muted">Nothing here.</td></tr>}
          </tbody>
        </table>
      </Panel>

      <Drawer
        open={!!open}
        title={open ? `Application — ${open.name}` : ""}
        onClose={() => { setOpenId(null); setInvite(null); }}
        footer={open && (
          <div className="cs-row">
            {!(LIVE && open.memberUid) && <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => del(open)}>Delete</button>}
            {(st(open) === "new" || st(open) === "verifying") && <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => update(open, { status: "rejected", verifiedBy: how() }, "Rejected membership application", "Application rejected")}>Reject</button>}
            {st(open) === "new" && <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => update(open, { status: "verifying", verifiedBy: how() }, "Started verifying membership application", "Marked as verifying")}>Mark verifying</button>}
            {(st(open) === "rejected" || (st(open) === "approved" && !(LIVE && open.memberUid))) && <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => update(open, { status: "verifying" }, "Reopened membership application", "Reopened")}>Reopen</button>}
            {LIVE && st(open) === "approved" && open.memberUid && <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => reinvite(open)}>New invite code</button>}
            {(st(open) === "new" || st(open) === "verifying") && <button className="btn btn-saffron btn-sm" disabled={busy} onClick={() => approve(open)}>{busy ? "Working…" : "Verified — approve"}</button>}
          </div>
        )}
      >
        {open && (
          <div className="form">
            <dl className="cs-dl">
              <dt>Name</dt><dd>{open.name}</dd>
              {open.guardian && <><dt>Father&apos;s name</dt><dd>{open.guardian}</dd></>}
              <dt>Mobile</dt><dd>{open.mobile ? <a className="link-arrow" href={`tel:${open.mobile.replace(/\s/g, "")}`}><Icon name="phone" size={15} /> {open.mobile}</a> : "—"}</dd>
              {open.mobile2 && <><dt>Second mobile</dt><dd>{open.mobile2}</dd></>}
              {open.whatsapp && <><dt>WhatsApp</dt><dd>{open.whatsapp}</dd></>}
              <dt>Email</dt><dd>{open.email ? <a className="link-arrow" href={`mailto:${open.email}`}><Icon name="mail" size={15} /> {open.email}</a> : "—"}</dd>
              <dt>Gender · DOB</dt><dd>{[open.gender, open.dob].filter(Boolean).join(" · ") || "—"}</dd>
              <dt>Occupation</dt><dd>{[open.occupation, open.workplace].filter(Boolean).join(" · ") || "—"}</dd>
              <dt>Where</dt><dd>{[districtName(open.district), open.assembly, open.block, open.ward].filter((x) => x && x !== "—").join(" · ") || "—"}</dd>
              <dt>Address</dt><dd>{[open.address, open.pin].filter(Boolean).join(", ") || "—"}</dd>
              <dt>Organisation</dt><dd>{groupName(open.group)}</dd>
              <dt>Fee (₹5)</dt><dd>{open.paid ? "Paid" : "Not paid — online payment comes later"}</dd>
              <dt>Status</dt><dd><Status kind={(ST[st(open)] || ST.new)[0]}>{(ST[st(open)] || ST.new)[1]}</Status></dd>
              {open.verifiedBy && <><dt>Verification</dt><dd>{open.verifiedBy}</dd></>}
              {open.handledBy && <><dt>Last handled by</dt><dd>{open.handledBy}</dd></>}
            </dl>
            {st(open) === "approved" && open.memberId && (
              <div className="member-id-card">
                <small>Member ID</small>
                <b>{open.memberId}</b>
                <span style={{ fontSize: 14 }}>
                  {LIVE && open.memberUid
                    ? "Member login created. They set their password on the website with an invite code. Lost or expired? Use “New invite code”."
                    : "Approved. Members sign in with the shared members' login — share it with them by phone or WhatsApp."}
                </span>
                <span className="tricolour"><span /><span /><span /></span>
              </div>
            )}
            {invite && <InvitePanel invite={invite} />}
            {(st(open) === "new" || st(open) === "verifying") && (
              <>
                <div className="field">
                  <label>How was the applicant verified?</label>
                  <select value={method} onChange={(e) => setMethod(e.target.value)}>
                    <option>Phone call</option><option>Met at district office</option><option>Known to district committee</option>
                  </select>
                </div>
                <div className="field"><label>Note (optional)</label><textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} /></div>
                <p className="form-note">Only “how and by whom it was verified” is recorded — no ID cards or Aadhaar are stored.</p>
              </>
            )}
          </div>
        )}
      </Drawer>
    </>
  );
}

/* -------- The one-time invite, shown right after approving -------- */
// Message in the member's own language. The code is shown here once; only a
// scrambled copy is stored, so if it's lost the Admin makes a new one.
const INVITE_MSG = {
  en: (c) => `Namaskar ${c.name}! Your West Bengal Pradesh Congress membership is approved. Member ID: ${c.memberId}.\n\nTo set your password, open ${c.link} and enter your mobile number and this one-time code: ${c.code}\n(valid for ${c.days} days — please don't share it).`,
  bn: (c) => `নমস্কার ${c.name}! পশ্চিমবঙ্গ প্রদেশ কংগ্রেসে আপনার সদস্যপদ অনুমোদিত হয়েছে। সদস্য আইডি: ${c.memberId}।\n\nপাসওয়ার্ড তৈরি করতে ${c.link} খুলে আপনার মোবাইল নম্বর ও এই এককালীন কোডটি দিন: ${c.code}\n(${c.days} দিন বৈধ — কাউকে জানাবেন না)।`,
  hi: (c) => `नमस्कार ${c.name}! पश्चिम बंगाल प्रदेश कांग्रेस में आपकी सदस्यता स्वीकृत हो गई है। सदस्य आईडी: ${c.memberId}।\n\nपासवर्ड बनाने के लिए ${c.link} खोलें और अपना मोबाइल नंबर व यह एक-बार का कोड डालें: ${c.code}\n(${c.days} दिन मान्य — किसी से साझा न करें)।`,
};

function InvitePanel({ invite }) {
  const [copied, setCopied] = useState(false);
  const lang = INVITE_MSG[invite.lang] ? invite.lang : "en";
  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/${lang}/activate`;
  const text = INVITE_MSG[lang]({ ...invite, link, days: invite.validDays || 14 });
  const wa = `https://wa.me/91${String(invite.mobile).replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(text)}`;
  async function copy() {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch {}
  }
  return (
    <div className="cs-invite">
      <small>One-time invite code — shown only now</small>
      <b className="cs-invite-code">{invite.code}</b>
      <p>Send it to <b>{invite.name}</b> ({invite.mobile}). They open <code>{link}</code>, enter their mobile number and this code, and choose a password. Valid {invite.validDays || 14} days; 5 wrong tries lock it.</p>
      <div className="cs-row">
        <a className="btn btn-saffron btn-sm" href={wa} target="_blank" rel="noopener noreferrer"><Icon name="chat" size={16} /> Send on WhatsApp</a>
        <button type="button" className="btn btn-ghost btn-sm" onClick={copy}>{copied ? "Copied" : "Copy message"}</button>
      </div>
    </div>
  );
}
