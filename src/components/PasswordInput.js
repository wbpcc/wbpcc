"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

// A password box with a show / hide button (eye icon) on the right.
// Takes every normal <input> prop; the language comes from the URL (/en, /bn, /hi).
const LABELS = {
  en: ["Show password", "Hide password"],
  bn: ["পাসওয়ার্ড দেখুন", "পাসওয়ার্ড লুকান"],
  hi: ["पासवर्ड दिखाएँ", "पासवर्ड छिपाएँ"],
};

export default function PasswordInput(props) {
  const [show, setShow] = useState(false);
  const lang = (usePathname() || "").split("/")[1];
  const [showL, hideL] = LABELS[lang] || LABELS.en;
  return (
    <div className="pw-wrap">
      <input {...props} type={show ? "text" : "password"} autoCapitalize="none" spellCheck={false} />
      <button
        type="button"
        className="pw-eye"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? hideL : showL}
        aria-pressed={show}
        title={show ? hideL : showL}
      >
        <Icon name={show ? "eyeOff" : "eye"} size={20} />
      </button>
    </div>
  );
}
