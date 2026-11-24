"use client";

import { useEffect, useState } from "react";
import { t } from "@/i18n/config";
import { districts } from "@/data/placeholder";

// Small building blocks shared by the console screens.

export function PageTitle({ title, sub, children }) {
  return (
    <div className="cs-head">
      <div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {children && <div className="cs-head-actions">{children}</div>}
    </div>
  );
}

export function Panel({ title, actions, children, className = "" }) {
  return (
    <section className={`cs-panel ${className}`}>
      {(title || actions) && (
        <div className="cs-panel-head">
          {title && <h2>{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Status({ kind, children }) {
  return <span className={`status st-${kind}`}>{children}</span>;
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map(([id, label, n]) => (
        <button key={id} type="button" role="tab" aria-selected={value === id} onClick={() => onChange(id)}>
          {label}{n != null && <span className="count-badge">{n}</span>}
        </button>
      ))}
    </div>
  );
}

/** Side panel for editing one record. */
export function Drawer({ open, title, onClose, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="cs-drawer-wrap" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="cs-drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="cs-drawer-head">
          <h2>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="cs-drawer-body">{children}</div>
        {footer && <div className="cs-drawer-foot">{footer}</div>}
      </aside>
    </div>
  );
}

const LANGS = [["en", "EN"], ["bn", "বাং"], ["hi", "हिं"]];

/**
 * One text field with EN / বাং / हिं tabs — the core editing pattern.
 * "Auto-translate" fills empty Bangla/Hindi (demo: marks them as auto).
 */
export function LangField({ label, value, onChange, multiline = false, rows = 4 }) {
  const [tab, setTab] = useState("en");
  const v = value || { en: "", bn: "", hi: "" };
  const Input = multiline ? "textarea" : "input";
  return (
    <div className="field lang-field">
      <div className="lang-field-head">
        <label>{label}</label>
        <div className="lang-tabs">
          {LANGS.map(([k, l]) => (
            <button key={k} type="button" aria-pressed={tab === k} onClick={() => setTab(k)}>
              {l}{k !== "en" && !v[k] && <i className="dot-miss" title="Missing" />}
            </button>
          ))}
        </div>
      </div>
      <Input
        value={v[tab] || ""}
        rows={multiline ? rows : undefined}
        lang={tab}
        onChange={(e) => onChange({ ...v, [tab]: e.target.value })}
        placeholder={tab === "en" ? "Write in English" : "Auto-translated from English, or type it"}
      />
      {tab === "en" && (
        <button
          type="button"
          className="text-btn"
          style={{ justifySelf: "start" }}
          onClick={() => onChange({ en: v.en, bn: v.bn || (v.en ? `🟡 ${v.en}` : ""), hi: v.hi || (v.en ? `🟡 ${v.en}` : "") })}
        >
          🌐 Auto-translate to বাংলা & हिन्दी
        </button>
      )}
    </div>
  );
}

export function DistrictPick({ value, onChange, label = "District" }) {
  return (
    <div className="field">
      <label>{label}</label>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">— None (state-wide) —</option>
        {Object.entries(districts).map(([id, dn]) => <option key={id} value={id}>{t(dn, "en")}</option>)}
      </select>
    </div>
  );
}

export function Flash({ msg }) {
  if (!msg) return null;
  const bad = msg.startsWith("⚠️");
  return <div className={`cs-flash${bad ? " cs-flash-bad" : ""}`} role={bad ? "alert" : "status"}>{bad ? msg : `✓ ${msg}`}</div>;
}

export function useFlash() {
  const [msg, setMsg] = useState("");
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), m.startsWith("⚠️") ? 9000 : 6000); };
  return [msg, flash];
}

export const fmtDate = (iso) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

/**
 * Confirm & submit — shown before any edit goes live.
 * Admin reviews what is being published, ticks the check, then submits.
 */
export function ConfirmPublish({ open, page, changes = [], onConfirm, onCancel }) {
  const [checked, setChecked] = useState(false);
  useEffect(() => { if (open) setChecked(false); }, [open]);
  if (!open) return null;
  return (
    <div className="cs-drawer-wrap cs-modal-wrap" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="cs-modal" role="dialog" aria-modal="true" aria-label="Confirm and submit">
        <span className="cs-modal-icon" aria-hidden="true">🚀</span>
        <h2>Publish these changes?</h2>
        <p><b>{page}</b> is saved straight away and appears on the public website in about 2 minutes.</p>
        {changes.length > 0 && <ul className="cs-modal-list">{changes.map((x) => <li key={x}>{x}</li>)}</ul>}
        <p className="cs-muted">Every change is recorded in the audit log with your name and the time.</p>
        <label className="check"><input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} /> I have checked the English, Bangla and Hindi text.</label>
        <div className="cs-row">
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>Go back & edit</button>
          <button className="btn btn-saffron btn-sm" disabled={!checked} onClick={onConfirm} title={checked ? "" : "Tick the box above first"}>{checked ? "Confirm & submit" : "☝️ Tick the box to submit"}</button>
        </div>
      </div>
    </div>
  );
}

/** Read ?key=value once on load (console pages are static, so no server params). */
export function useQueryParam(key, apply) {
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get(key);
    if (v) apply(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}