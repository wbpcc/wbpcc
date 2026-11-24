"use client";

import { useState } from "react";
import { t } from "@/i18n/config";
import { groups } from "@/data/placeholder";
import { Done, DistrictSelect } from "./Forms";
import Icon from "./Icon";
import PasswordInput from "./PasswordInput";
import { LIVE, loadFirebase } from "./session";

// DEMO — nothing is sent yet. Phase 2: proposals go to the Leadership
// review queue; ground reports go to the Admin Editors' verification queue.

export function ProposeForm({ lang, s, c }) {
  const [kind, setKind] = useState("petition");
  const [done, setDone] = useState(false);
  if (done) return <div className="card"><Done text={s.thanks} c={c} /></div>;
  const kinds = [["petition", "pen", s.petition], ["campaign", "megaphone", s.campaign], ["event", "calendar", s.event]];
  return (
    <form className="card form" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend>{s.type}</legend>
        <div className="topics" role="radiogroup" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {kinds.map(([id, icon, label]) => (
            <label key={id} className={`topic${kind === id ? " on" : ""}`}>
              <input type="radio" name="pk" checked={kind === id} onChange={() => setKind(id)} />
              <i aria-hidden="true"><Icon name={icon} size={20} /></i><span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="field"><label htmlFor="pt">{s.titleF}</label><input id="pt" required maxLength={120} /></div>
      <div className="field"><label htmlFor="pw">{s.why}</label><textarea id="pw" required /></div>
      <DistrictSelect lang={lang} label={s.district} name="pdist" />
      {kind === "petition" ? (
        <>
          <div className="field"><label htmlFor="pa">{s.authority}</label><input id="pa" /></div>
          <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend>{s.petitionType}</legend>
            <div className="checks" style={{ marginTop: 6 }}>
              <label><input type="radio" name="ptype" defaultChecked /> {s.online}</label>
              <label><input type="radio" name="ptype" /> {s.formal}</label>
            </div>
          </fieldset>
        </>
      ) : (
        <div className="field"><label htmlFor="pd">{s.when}</label><input id="pd" type="date" /></div>
      )}
      <div className="field">
        <label htmlFor="pg">{s.group}</label>
        <select id="pg" defaultValue="">
          <option value="">{s.noGroup}</option>
          {groups.map((g) => <option key={g.id} value={g.id}>{t(g.name, lang)}</option>)}
        </select>
      </div>
      <button className="btn btn-saffron" type="submit">{s.submit}</button>
      <p className="form-note">{c.demoNote}</p>
    </form>
  );
}

export function ReportForm({ lang, s, c }) {
  const [photos, setPhotos] = useState([]);
  const [done, setDone] = useState(false);
  if (done) return <div className="card"><Done text={s.thanks} c={c} /></div>;
  return (
    <form className="card form" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
      <div className="field"><label htmlFor="rt">{s.titleF}</label><input id="rt" required maxLength={120} /></div>
      <div className="field"><label htmlFor="rw">{s.what}</label><textarea id="rw" required /></div>
      <DistrictSelect lang={lang} label={s.district} name="rdist" />
      <div className="field"><label htmlFor="rwhen">{s.when}</label><input id="rwhen" type="date" /></div>
      <div className="field"><label htmlFor="rv">{s.video}</label><input id="rv" type="url" placeholder="https://" /></div>
      <div className="field">
        <label htmlFor="rp">{s.photos}</label>
        <label className="dropzone" htmlFor="rp">
          <span>{s.photos}</span>
          <small>{s.photosHint}</small>
        </label>
        <input
          id="rp" type="file" accept="image/*" multiple className="sr-only"
          onChange={(e) => setPhotos([...e.target.files].slice(0, 6).map((f) => URL.createObjectURL(f)))}
        />
        {photos.length > 0 && (
          <div className="thumbs">{photos.map((src) => <img key={src} src={src} alt="" />)}</div>
        )}
      </div>
      <label className="check"><input type="checkbox" required /> {s.consent}</label>
      <button className="btn btn-saffron" type="submit">{s.submit}</button>
      <p className="form-note">{c.demoNote}</p>
    </form>
  );
}

// Change password. LIVE: checks the current password with Firebase, then sets the new one.
const PW_ERR = {
  en: { wrong: "Your current password is not right.", weak: "Choose a new password of at least 8 characters.", error: "Couldn't change it. Please try again." },
  bn: { wrong: "বর্তমান পাসওয়ার্ডটি সঠিক নয়।", weak: "অন্তত ৮ অক্ষরের নতুন পাসওয়ার্ড দিন।", error: "বদলানো যায়নি। আবার চেষ্টা করুন।" },
  hi: { wrong: "आपका मौजूदा पासवर्ड सही नहीं है।", weak: "कम से कम 8 अक्षरों का नया पासवर्ड चुनें।", error: "बदला नहीं जा सका। फिर कोशिश करें।" },
};

export function PasswordForm({ s }) {
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const lang = typeof document !== "undefined" ? document.documentElement.lang : "en";
  const tx = PW_ERR[lang] || PW_ERR.en;

  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const current = form.cp.value, next = form.np.value;
    setErr("");
    if (!LIVE) { setOk(true); form.reset(); setTimeout(() => setOk(false), 2500); return; }
    if (next.length < 8) { setErr(tx.weak); return; }
    setBusy(true);
    try {
      const { auth, authMod } = await loadFirebase();
      const u = auth.currentUser;
      await authMod.reauthenticateWithCredential(u, authMod.EmailAuthProvider.credential(u.email, current));
      await authMod.updatePassword(u, next);
      setOk(true); form.reset(); setTimeout(() => setOk(false), 3000);
    } catch (e2) {
      const c = e2?.code || "";
      setErr(c.includes("wrong-password") || c.includes("invalid-credential") ? tx.wrong : c.includes("weak-password") ? tx.weak : tx.error);
    }
    setBusy(false);
  }

  return (
    <form className="card form" onSubmit={submit}>
      <h2 style={{ fontSize: 20, margin: 0 }}>{s.password}</h2>
      <div className="field"><label htmlFor="cp">{s.current}</label><PasswordInput id="cp" name="cp" required autoComplete="current-password" /></div>
      <div className="field"><label htmlFor="np">{s.newP}</label><PasswordInput id="np" name="np" required minLength={8} autoComplete="new-password" /></div>
      {err && <p className="form-note form-err" role="alert"><Icon name="alert" size={16} /> {err}</p>}
      <button className="btn btn-navy" type="submit" disabled={busy}>{ok ? `✓ ${s.updated}` : busy ? "…" : s.update}</button>
    </form>
  );
}
