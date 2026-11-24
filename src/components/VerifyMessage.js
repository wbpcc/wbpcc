"use client";

import { useState } from "react";
import { fill, intlLocale } from "@/i18n/config";
import Icon from "./Icon";

// "Is this forwarded statement real?" — checks the ID against the registry.
// Phase 2: checks the database and also works by scanning the QR on the PDF.
export default function VerifyMessage({ lang, n, known }) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState(null);

  function check(e) {
    e.preventDefault();
    const id = value.trim().toUpperCase().replace(/\s+/g, "");
    if (!id) return;
    const hit = known.find((k) => k.id === id);
    if (hit) {
      const date = new Intl.DateTimeFormat(intlLocale[lang], { day: "numeric", month: "long", year: "numeric" }).format(new Date(hit.date));
      setResult({ ok: true, text: fill(n.verifyOk, { date }) });
    } else {
      setResult({ ok: false, text: n.verifyBad });
    }
  }

  return (
    <div className="verify" id="verify">
      <h3>{n.verifyTitle}</h3>
      <p>{n.verifyText}</p>
      <form onSubmit={check}>
        <input
          value={value}
          onChange={(e) => { setValue(e.target.value); setResult(null); }}
          placeholder={n.verifyPlaceholder}
          aria-label={n.id}
        />
        <button className="btn btn-navy btn-sm" type="submit">{n.verifyBtn}</button>
      </form>
      {result && (
        <p key={result.text} className={`verify-result ${result.ok ? "ok" : "bad"}`} role="status">
          <Icon name={result.ok ? "check" : "alert"} size={16} /> {result.text}
        </p>
      )}
    </div>
  );
}
