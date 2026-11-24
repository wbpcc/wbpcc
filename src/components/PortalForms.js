"use client";

import { useState } from "react";
import { t } from "@/i18n/config";
import { groups } from "@/data/placeholder";
import { Done, DistrictSelect } from "./Forms";
import Icon from "./Icon";
import PasswordInput from "./PasswordInput";

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

export function PasswordForm({ s }) {
  const [ok, setOk] = useState(false);
  return (
    <form className="card form" onSubmit={(e) => { e.preventDefault(); setOk(true); e.currentTarget.reset(); setTimeout(() => setOk(false), 2500); }}>
      <h2 style={{ fontSize: 20, margin: 0 }}>{s.password}</h2>
      <div className="field"><label htmlFor="cp">{s.current}</label><PasswordInput id="cp" required autoComplete="current-password" /></div>
      <div className="field"><label htmlFor="np">{s.newP}</label><PasswordInput id="np" required minLength={8} autoComplete="new-password" /></div>
      <button className="btn btn-navy" type="submit">{ok ? `✓ ${s.updated}` : s.update}</button>
    </form>
  );
}
