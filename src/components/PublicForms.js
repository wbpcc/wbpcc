"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { t, fill } from "@/i18n/config";
import { groups } from "@/data/placeholder";
import { contactTopics } from "@/data/pages";
import { Done, DistrictSelect } from "./Forms";
import { OtpInput } from "./AuthFlows";
import { useSession } from "./session";
import Icon from "./Icon";
import PasswordInput from "./PasswordInput";

// ---------------------------------------------------------------------
// The three public forms: Contact · Appointment with the President · Join.
// DEMO — nothing is sent or saved yet. Phase 2: each goes to its inbox /
// the President's office / the membership list, with real OTP checks.
// Appointment mirrors TNCC's form; Join mirrors KPPC's register form,
// both adapted for West Bengal.
// ---------------------------------------------------------------------
const ref = (p) => `${p}-${Math.floor(100000 + Math.random() * 900000)}`;
const today = () => new Date().toISOString().slice(0, 10);

function Section({ n, title, children }) {
  return (
    <fieldset className="form-section">
      <legend><span className="num">{n}</span>{title}</legend>
      <div className="form-grid">{children}</div>
    </fieldset>
  );
}

function F({ label, req, wide, children }) {
  return (
    <div className={`field${wide ? " wide" : ""}`}>
      <label>{label}{req && <span className="req"> *</span>}</label>
      {children}
    </div>
  );
}

/** Mobile number with a "Verify" button → one-time code (demo: any 6 digits). */
function MobileVerify({ label, s, onVerified }) {
  const [stage, setStage] = useState("idle"); // idle | code | ok
  const [code, setCode] = useState("");
  return (
    <div className="field wide">
      <label>{label}<span className="req"> *</span></label>
      <div className="mobile-verify">
        <input type="tel" required inputMode="tel" pattern="[0-9+ ]{10,15}" placeholder="+91" autoComplete="tel" disabled={stage === "ok"} />
        {stage === "ok" ? (
          <span className="verified">✓ {s.verified}</span>
        ) : (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStage("code")}>{s.verify}</button>
        )}
      </div>
      {stage === "code" && (
        <div className="otp-inline">
          <OtpInput value={code} onChange={(v) => { setCode(v); if (v.length === 6) { setStage("ok"); onVerified?.(); } }} label={s.verify} />
        </div>
      )}
      <small className="hint">{s.otpNote}</small>
    </div>
  );
}

/* ---------------------------- Contact ---------------------------- */
export function ContactForm({ lang, s, c }) {
  const [type, setType] = useState("feedback");
  const [done, setDone] = useState(null);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("type");
    if (q && contactTopics.find((x) => x.id === q)) setType(q);
  }, []);
  const cur = contactTopics.find((x) => x.id === type);
  if (done) return <div className="card"><Done text={fill(s.thanks, { id: done })} c={c} /></div>;
  return (
    <form className="card form" onSubmit={(e) => { e.preventDefault(); setDone(ref("WB")); }}>
      <F label={s.type} req>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {contactTopics.map((x) => <option key={x.id} value={x.id}>{t(x.t, lang)}</option>)}
        </select>
        <small className="route"><Icon name="mail" size={15} /> {fill(s.goesTo, { email: cur.inbox })}</small>
      </F>
      <F label={s.name}><input autoComplete="name" /></F>
      <F label={s.email} req><input type="email" required autoComplete="email" /></F>
      <F label={s.phone}><input type="tel" autoComplete="tel" /></F>
      <F label={s.message} req><textarea required rows={6} /></F>
      <button className="btn btn-saffron" type="submit">{s.submit}</button>
      <p className="form-note">{c.demoNote}</p>
    </form>
  );
}

/* --------------------- Appointment with the President --------------------- */
export function AppointmentForm({ lang, s, g, c, requireMember = false }) {
  const session = useSession();
  const [who, setWho] = useState("worker");
  const [done, setDone] = useState(null);
  const [verified, setVerified] = useState(false);

  if (requireMember && session !== undefined && session?.role !== "member") {
    return (
      <div className="card members-only">
        <span className="big" aria-hidden="true"><Icon name="id" size={40} /></span>
        <p>{s.membersOnly}</p>
        <div className="cs-row" style={{ justifyContent: "center" }}>
          <Link href={`/${lang}/signin`} className="btn btn-saffron">{s.signin}</Link>
          <Link href={`/${lang}/join`} className="btn btn-outline">{s.join}</Link>
        </div>
      </div>
    );
  }
  if (done) return <div className="card"><Done text={fill(s.thanks, { id: done })} c={c} /></div>;

  return (
    <form className="card form long-form" onSubmit={(e) => { e.preventDefault(); if (!verified) return; setDone(ref("APT")); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
      <Section n={1} title={s.s1}>
        <F label={s.name} req wide><input required autoComplete="name" /></F>
        <F label={s.guardian}><input /></F>
        <F label={s.gender}>
          <select defaultValue=""><option value="" disabled>—</option>{Object.entries(g).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </F>
        <F label={s.dob}><input type="date" max={today()} /></F>
        <F label={s.occupation}><input /></F>
        <MobileVerify label={s.mobile} s={s} onVerified={() => setVerified(true)} />
        <F label={s.email}><input type="email" autoComplete="email" /></F>
        <F label={s.whatsapp}><input type="tel" /></F>
      </Section>

      <Section n={2} title={s.s2}>
        <F label={s.door}><input /></F>
        <F label={s.street}><input /></F>
        <F label={s.town}><input /></F>
        <DistrictSelect lang={lang} label={s.district} name="apt-district" />
        <F label={s.pin} req><input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="700001" /></F>
      </Section>

      <Section n={3} title={s.s3}>
        <F label={s.who} req>
          <select value={who} onChange={(e) => setWho(e.target.value)}>
            {Object.entries(s.whoOpts).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </F>
        {who === "other" ? <F label={s.specify} req><input required /></F> : <span />}
        <F label={s.date} req><input type="date" required min={today()} /></F>
        <F label={s.time}><input type="time" min="10:00" max="18:00" /></F>
        <F label={s.altDate}><input type="date" min={today()} /></F>
        <F label={s.altTime}><input type="time" min="10:00" max="18:00" /></F>
        <F label={s.mode} wide>
          <div className="checks">
            {Object.entries(s.modes).map(([k, v], i) => <label key={k}><input type="radio" name="mode" defaultChecked={i === 0} /> {v}</label>)}
          </div>
        </F>
        <F label={s.people}><input type="number" min={1} max={10} defaultValue={1} /></F>
        <F label={s.duration}>
          <select defaultValue="15">{["15", "30", "45", "60"].map((m) => <option key={m}>{m}</option>)}</select>
        </F>
      </Section>

      <Section n={4} title={s.s4}>
        <F label={s.reason} req wide>
          <select required defaultValue=""><option value="" disabled>—</option>{Object.entries(s.reasons).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </F>
        <F label={s.describe} req wide><textarea required rows={5} /></F>
        <F label={s.more} wide><textarea rows={3} /></F>
        <F label={s.docs} wide>
          <input type="file" multiple accept=".pdf,.doc,.docx,image/*" onChange={(e) => { if (e.target.files.length > 5) e.target.value = ""; }} />
        </F>
      </Section>

      <Section n={5} title={s.s5}>
        <label className="check wide"><input type="checkbox" required /> {s.correct}</label>
        <label className="check wide"><input type="checkbox" /> {s.updates}</label>
      </Section>

      {!verified && <p className="form-note">{s.otpNote}</p>}
      <button className="btn btn-saffron" type="submit" disabled={!verified}>{s.submit}</button>
      <p className="form-note">{c.demoNote}</p>
    </form>
  );
}

/* ---------------------------- Join as a member ---------------------------- */
const strong = (pw) => pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw) && /[^A-Za-z0-9]/.test(pw);
const isAdult = (dob) => {
  if (!dob) return true;
  const d = new Date(dob), n = new Date();
  const age = n.getFullYear() - d.getFullYear() - (n < new Date(n.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0);
  return age >= 18;
};

export function JoinForm({ lang, j, c }) {
  const [dob, setDob] = useState("");
  const [pw, setPw] = useState("");
  const [verified, setVerified] = useState(false);
  const [done, setDone] = useState(false);
  const adult = isAdult(dob);
  if (done) return <div className="card"><Done text={j.thanks} c={c} /></div>;

  return (
    <form className="card form long-form" onSubmit={(e) => { e.preventDefault(); if (!adult || !strong(pw) || !verified) return; setDone(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
      <h2 style={{ fontSize: 24, margin: 0 }}>{j.title}</h2>

      <Section n={1} title={j.s1}>
        <DistrictSelect lang={lang} label={`${j.district} *`} name="j-district" />
        <F label={j.ac}><input /></F>
        <F label={j.block}><input /></F>
        <F label={j.ward}><input /></F>
      </Section>

      <Section n={2} title={j.s2}>
        <F label={j.name} req wide><input required autoComplete="name" /></F>
        <F label={j.gender} req wide>
          <div className="checks">
            {Object.entries(j.genders).map(([k, v]) => <label key={k}><input type="radio" name="gender" value={k} required /> {v}</label>)}
          </div>
        </F>
        <F label={j.guardian} req><input required /></F>
        <F label={j.dob}>
          <input type="date" max={today()} value={dob} onChange={(e) => setDob(e.target.value)} />
          {!adult && <small className="err">{j.under18}</small>}
        </F>
        <F label={j.occupation} req><input required /></F>
        <F label={j.workplace}><input /></F>
        <F label={j.org} wide>
          <select defaultValue="">
            <option value="">{j.none}</option>
            {groups.map((g) => <option key={g.id} value={g.id}>{t(g.name, lang)}</option>)}
          </select>
        </F>
        <F label={j.address} wide><textarea rows={2} autoComplete="street-address" /></F>
        <F label={j.pin}><input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} /></F>
      </Section>

      <Section n={3} title={j.s3}>
        <MobileVerify label={j.mobile} s={j} onVerified={() => setVerified(true)} />
        <F label={j.mobile2}><input type="tel" /></F>
        <F label={j.whatsapp}><input type="tel" /></F>
        <F label={j.email}><input type="email" autoComplete="email" /></F>
        <F label={j.password} req wide>
          <PasswordInput required value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
          <small className={pw && !strong(pw) ? "err" : "hint"}>{pw && !strong(pw) ? j.pwWeak : j.pwRule}</small>
        </F>
        <F label={j.photo} wide><input type="file" accept="image/*" /></F>
      </Section>

      <Section n={4} title={j.s4}>
        <label className="check wide"><input type="checkbox" required /> {j.age18}</label>
        <label className="check wide"><input type="checkbox" required /> {j.declare}</label>
      </Section>

      {/* Membership fee — ₹5. Phase 2: Razorpay checkout opens here before the registration is saved. */}
      <div className="fee-box">
        <div><b>{j.fee}</b><small>{j.feeNote}</small></div>
        <span className="fee-amount">{j.feeAmount}</span>
      </div>

      <button className="btn btn-saffron" type="submit" disabled={!verified}>{j.submit}</button>
      <p className="form-note">{c.demoNote}</p>
    </form>
  );
}

/* ---------------------------- Donate ---------------------------- */
// Razorpay is added later (backend). For now the form shows the flow and takes no money.
const AMOUNTS = [100, 500, 1000, 2000];
export function DonateForm({ lang, s, c }) {
  const [amt, setAmt] = useState(500);
  const [custom, setCustom] = useState("");
  const [done, setDone] = useState(null);
  const value = custom ? Number(custom) : amt;
  const money = (n) => `₹${new Intl.NumberFormat(lang === "bn" ? "bn-IN" : "en-IN").format(n || 0)}`;
  if (done) return <div className="card"><Done text={fill(s.thanks, { id: done })} c={c} /></div>;
  return (
    <form className="card form" onSubmit={(e) => { e.preventDefault(); if (!value || value < 10) return; setDone(ref("DON")); }}>
      <F label={s.amount} req>
        <div className="amounts">
          {AMOUNTS.map((a) => (
            <button key={a} type="button" className={`amount${!custom && amt === a ? " on" : ""}`} onClick={() => { setAmt(a); setCustom(""); }}>{money(a)}</button>
          ))}
          <input className="amount-other" type="number" min={10} placeholder={s.other} value={custom} onChange={(e) => setCustom(e.target.value)} aria-label={s.other} />
        </div>
      </F>
      <F label={s.name} req><input required autoComplete="name" /></F>
      <F label={s.mobile} req><input type="tel" required autoComplete="tel" /></F>
      <F label={s.email} req><input type="email" required autoComplete="email" /></F>
      <F label={s.pan}><input maxLength={10} pattern="[A-Za-z]{5}[0-9]{4}[A-Za-z]" placeholder="ABCDE1234F" style={{ textTransform: "uppercase" }} /></F>
      <F label={s.address}><textarea rows={2} autoComplete="street-address" /></F>
      <DistrictSelect lang={lang} label={s.district} name="don-district" />
      <label className="check"><input type="checkbox" required /> {s.citizen}</label>
      <button className="btn btn-saffron" type="submit">{fill(s.submit, { amt: money(value) })}</button>
      <p className="form-note">{s.note}</p>
    </form>
  );
}