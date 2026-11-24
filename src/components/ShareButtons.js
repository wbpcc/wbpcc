"use client";

import { useState } from "react";
import Icon from "./Icon";

// WhatsApp first — that's where Bengal shares news.
export default function ShareButtons({ title, c }) {
  const [copied, setCopied] = useState(false);
  const url = () => (typeof window !== "undefined" ? window.location.href : "");
  return (
    <div className="share">
      <b>{c.share}:</b>
      <a
        className="btn btn-sm btn-ghost"
        href="#"
        onClick={(e) => { e.preventDefault(); window.open(`https://wa.me/?text=${encodeURIComponent(`${title} ${url()}`)}`, "_blank", "noopener"); }}
      >
        <Icon name="chat" size={16} /> {c.whatsapp}
      </a>
      <button
        className="btn btn-sm btn-ghost"
        onClick={async () => {
          try { await navigator.clipboard.writeText(url()); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
        }}
      >
        <Icon name="link" size={16} /> {copied ? c.copied : c.copy}
      </button>
    </div>
  );
}
