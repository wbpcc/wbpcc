"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fill } from "@/i18n/config";
import { demoMember } from "@/data/portal";
import { setSession, LIVE, signIn, resetPassword } from "./session";
import Icon from "./Icon";
import PasswordInput from "./PasswordInput";

// Sign-in messages (kept here so the dictionaries stay as they were).
const MSG = {
  en: {
    "wrong-category": "This login doesn't have that access. Pick the right category above.",
    bad: "Wrong mobile/email or password.",
    "too-many": "Too many tries. Wait a few minutes and try again.",
    "use-mobile": "Sign in with your 10-digit mobile number.",
    "bad-mobile": "Enter your 10-digit mobile number.",
    network: "Couldn't connect. Check your internet and try again.",
    resetSent: "If that email has a team login, a link to set a new password is on its way.",
    resetNeed: "Type your email above first, then tap “Forgot password?”.",
    memberReset: "Forgot your password? Tell your district office or use the Contact page — they can reset it.",
    wait: "Signing in…",
  },
  bn: {
    "wrong-category": "এই লগইনে ওই অ্যাক্সেস নেই। ওপরে সঠিক বিভাগটি বেছে নিন।",
    bad: "মোবাইল/ইমেল বা পাসওয়ার্ড ভুল।",
    "too-many": "অনেকবার চেষ্টা হয়েছে। কয়েক মিনিট পরে আবার চেষ্টা করুন।",
    "use-mobile": "আপনার ১০ সংখ্যার মোবাইল নম্বর দিয়ে সাইন ইন করুন।",
    "bad-mobile": "আপনার ১০ সংখ্যার মোবাইল নম্বর লিখুন।",
    network: "সংযোগ হয়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন।",
    resetSent: "ওই ইমেলে টিম লগইন থাকলে, নতুন পাসওয়ার্ড দেওয়ার লিঙ্ক পাঠানো হয়েছে।",
    resetNeed: "আগে ওপরে আপনার ইমেল লিখুন, তারপর “পাসওয়ার্ড ভুলে গেছেন?”-এ চাপুন।",
    memberReset: "পাসওয়ার্ড ভুলে গেলে আপনার জেলা অফিস বা যোগাযোগ পাতায় জানান — তাঁরা রিসেট করে দেবেন।",
    wait: "সাইন ইন হচ্ছে…",
  },
  hi: {
    "wrong-category": "इस लॉगिन के पास यह एक्सेस नहीं है। ऊपर सही श्रेणी चुनें।",
    bad: "मोबाइल/ईमेल या पासवर्ड गलत है।",
    "too-many": "बहुत बार कोशिश हुई। कुछ मिनट बाद फिर कोशिश करें।",
    "use-mobile": "अपने 10 अंकों के मोबाइल नंबर से साइन इन करें।",
    "bad-mobile": "अपना 10 अंकों का मोबाइल नंबर लिखें।",
    network: "कनेक्ट नहीं हो सका। इंटरनेट जाँचकर फिर कोशिश करें।",
    resetSent: "अगर उस ईमेल पर टीम लॉगिन है, तो नया पासवर्ड रखने का लिंक भेज दिया गया है।",
    resetNeed: "पहले ऊपर अपना ईमेल लिखें, फिर “पासवर्ड भूल गए?” दबाएँ।",
    memberReset: "पासवर्ड भूल गए? अपने ज़िला कार्यालय या संपर्क पेज पर बताएँ — वे रीसेट कर देंगे।",
    wait: "साइन इन हो रहा है…",
  },
};
const errKey = (code = "") =>
  code === "auth/too-many-requests" ? "too-many"
  : code === "auth/network-request-failed" ? "network"
  : ["wrong-category", "use-mobile", "bad-mobile"].includes(code) ? code
  : "bad";

/** Six boxes for a one-time code; typing jumps to the next box, paste fills all. */
export function OtpInput({ value, onChange, label }) {
  const refs = useRef([]);
  const digits = (value + "      ").slice(0, 6).split("");
  const set = (i, ch) => {
    const next = digits.map((d, j) => (j === i ? ch : d)).join("").replace(/\s+$/, "");
    onChange(next.replace(/ /g, ""));
  };
  return (
    <div className="otp" role="group" aria-label={label}>
      {digits.map((dch, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={dch.trim()}
          aria-label={`${label} ${i + 1}`}
          onChange={(e) => {
            const ch = e.target.value.replace(/\D/g, "").slice(-1);
            set(i, ch || " ");
            if (ch && i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => { if (e.key === "Backspace" && !dch.trim() && i > 0) refs.current[i - 1]?.focus(); }}
          onPaste={(e) => {
            const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            if (p) { e.preventDefault(); onChange(p); refs.current[Math.min(p.length, 5)]?.focus(); }
          }}
        />
      ))}
    </div>
  );
}

// One login form. The person picks their category first (Member / Contributor / Admin);
// the fields below change to match. Contributors & Admins get a 2-step code after the password.
const CATS = [
  { id: "member", icon: "id" },
  { id: "contributor", icon: "pen" },
  { id: "admin", icon: "shield" },
];

export function SignInFlow({ lang, a }) {
  const router = useRouter();
  const [cat, setCat] = useState("member");
  const [step, setStep] = useState(1);
  const [user, setUser] = useState("");
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null); // { kind: "err" | "ok", text }
  const m = MSG[lang] || MSG.en;
  const isMember = cat === "member";
  const pick = (id) => { setCat(id); setStep(1); setCode(""); setUser(""); setPw(""); setNote(null); };

  async function forgot() {
    if (!LIVE) return;
    if (isMember) { setNote({ kind: "ok", text: m.memberReset }); return; }
    if (!user.includes("@")) { setNote({ kind: "err", text: m.resetNeed }); return; }
    try { await resetPassword(user); } catch {}
    setNote({ kind: "ok", text: m.resetSent }); // same message either way — doesn't reveal who has a login
  }

  async function submit(e) {
    e.preventDefault();
    if (LIVE) {
      setBusy(true); setNote(null);
      try {
        await signIn(cat, user, pw);
        router.push(isMember ? `/${lang}/portal` : "/console");
      } catch (err) {
        setNote({ kind: "err", text: m[errKey(err.code)] });
        setBusy(false);
      }
      return;
    }
    // ---- DEMO (no Firebase settings) ----
    if (isMember) { setSession({ role: "member", id: demoMember.id }); router.push(`/${lang}/portal`); return; }
    if (step === 1) { setStep(2); return; }
    setSession({ role: "team", email: user });
    try { localStorage.setItem("wbpcc-console-role", cat); } catch {}
    router.push("/console");
  }

  return (
    <form className="card auth-card login-form" onSubmit={submit}>
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend>{a.signInAs}</legend>
        <div className="login-cats" role="radiogroup">
          {CATS.map((x) => (
            <label key={x.id} className={`login-cat${cat === x.id ? " on" : ""}`}>
              <input type="radio" name="cat" value={x.id} checked={cat === x.id} onChange={() => pick(x.id)} />
              <i aria-hidden="true"><Icon name={x.icon} size={22} /></i>
              <span>{a.doors[x.id].t}</span>
            </label>
          ))}
        </div>
        <small className="hint">{a.doors[cat].d}</small>
      </fieldset>

      {step === 1 ? (
        <>
          <div className="field">
            <label htmlFor="lu">{isMember ? a.memberId : a.teamEmail}</label>
            <input id="lu" required value={user} onChange={(e) => setUser(e.target.value)} type={isMember ? "text" : "email"} autoComplete="username"
              placeholder={isMember ? "98XXXXXXXX / WB-XXX-XXX-0000" : "name@wbpcc.org"} />
          </div>
          <div className="field">
            <label htmlFor="lp">{a.password}</label>
            <PasswordInput id="lp" required autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />
          </div>
          {note && <p className={`form-note${note.kind === "err" ? " form-err" : ""}`} role={note.kind === "err" ? "alert" : "status"}><Icon name={note.kind === "err" ? "alert" : "mail"} size={16} /> {note.text}</p>}
          <button className={`btn ${isMember ? "btn-saffron" : "btn-navy"}`} type="submit" disabled={busy}>{busy ? m.wait : a.signin}</button>
          <button type="button" className="text-btn" onClick={forgot}>{a.forgot}</button>
        </>
      ) : (
        <>
          <p className="form-note">{a.twofaHint}</p>
          <div className="field"><label>{a.twofa}</label><OtpInput value={code} onChange={setCode} label={a.twofa} /></div>
          <button className="btn btn-navy" type="submit" disabled={code.length < 6}>{a.verify}</button>
          <button type="button" className="text-btn" onClick={() => setStep(1)}>← {a.back}</button>
        </>
      )}

      {isMember ? (
        <div className="auth-links">
          <Link href={`/${lang}/activate`} className="link-arrow">{a.firstTime} →</Link>
          <span>{a.notMember} <Link href={`/${lang}/join`} className="link-arrow">{a.join}</Link></span>
        </div>
      ) : (
        <p className="form-note"><Icon name="shield" size={15} /> {a.teamNote}</p>
      )}
    </form>
  );
}
export function ActivateFlow({ lang, v }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const mismatch = pw2 && pw !== pw2;

  return (
    <div className="card auth-card">
      <div className="stepper">
        <span className={step >= 1 ? "on" : ""}>1</span><i /><span className={step >= 2 ? "on" : ""}>2</span>
        <small>{fill(v.step, { n: step })}</small>
      </div>
      {step === 1 ? (
        <form className="form" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
          <div className="field">
            <label htmlFor="ic">{v.code}</label>
            <input id="ic" required placeholder="XXXX-XXXX" style={{ textTransform: "uppercase", letterSpacing: ".15em", fontWeight: 700 }} />
            <small style={{ color: "var(--muted)" }}>{v.codeHint}</small>
          </div>
          <button className="btn btn-saffron" type="submit">{v.check}</button>
        </form>
      ) : (
        <form className="form" onSubmit={(e) => { e.preventDefault(); if (mismatch) return; setSession({ role: "member", id: demoMember.id }); router.push(`/${lang}/portal`); }}>
          <div className="member-id-card">
            <small>{v.yourId}</small>
            <b>{demoMember.id}</b>
            <span className="tricolour"><span /><span /><span /></span>
          </div>
          <p className="form-note"><Icon name="lock" size={15} /> {v.idNote}</p>
          <div className="field"><label htmlFor="ae">{v.email}</label><input id="ae" type="email" required autoComplete="email" /></div>
          <div className="field"><label htmlFor="ap">{v.password}</label><PasswordInput id="ap" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /></div>
          <div className="field">
            <label htmlFor="ap2">{v.confirm}</label>
            <PasswordInput id="ap2" required value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" />
            {mismatch && <small style={{ color: "var(--red)", fontWeight: 700 }}>{v.mismatch}</small>}
          </div>
          <label className="check"><input type="checkbox" required /> {v.pledge}</label>
          <button className="btn btn-saffron" type="submit" disabled={!!mismatch}>{v.finish}</button>
        </form>
      )}
    </div>
  );
}
