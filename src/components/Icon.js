// Plain line icons — simple outlines that take the text colour (navy / sky /
// white from the brand palette). Use only where an icon helps: where, when,
// phone, email, privacy, download, video…
//
// <Icon name="pin" />  — also accepts an old emoji (from stored content) and
// shows the matching line icon, or nothing if there's no plain equivalent.
const P = {
  pin: <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  users: <><circle cx="9" cy="8.5" r="3.2" /><path d="M3 19.5c.6-3.4 3-5.3 6-5.3s5.4 1.9 6 5.3" /><path d="M15.5 5.6a3 3 0 0 1 0 5.8M17.5 14.6c1.9.7 3.2 2.4 3.5 4.9" /></>,
  user: <><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20c.8-4 3.8-6.2 7.5-6.2s6.7 2.2 7.5 6.2" /></>,
  phone: <path d="M5 4h3.5l1.7 4.3-2.2 1.4a11 11 0 0 0 5.3 5.3l1.4-2.2L19 14.5V18a2 2 0 0 1-2 2A14 14 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  mail: <><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="m3.5 7 8.5 6 8.5-6" /></>,
  lock: <><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></>,
  shield: <path d="M12 3 5 6v5.5c0 4.4 3 8 7 9.5 4-1.5 7-5.1 7-9.5V6z" />,
  id: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2.2" /><path d="M5.8 16.2c.6-1.7 1.8-2.6 3.2-2.6s2.6.9 3.2 2.6M14.5 10h4M14.5 13.5h3" /></>,
  landmark: <path d="M3 9.5 12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18" />,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.2 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.2-3.6-8.5S9.6 5.8 12 3.5z" /></>,
  flag: <path d="M5 21V4M5 4.5h11l-2 3.8 2 3.7H5" />,
  link: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
  download: <path d="M12 4v11M7 10.5l5 5 5-5M4.5 19.5h15" />,
  upload: <path d="M12 16V5M7 9.5l5-5 5 5M4.5 19.5h15" />,
  play: <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none" />,
  print: <><path d="M7 9V4h10v5" /><rect x="3.5" y="9" width="17" height="7.5" rx="1.5" /><path d="M7 14h10v6H7z" /></>,
  megaphone: <path d="M4 10v4h3l7 4.5V5.5L7 10zM17.5 9a4 4 0 0 1 0 6" />,
  chat: <path d="M4.5 5.5h15v10h-8l-4.5 3.5v-3.5H4.5z" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  alert: <><path d="M12 4 2.8 19.5h18.4z" /><path d="M12 10v4M12 16.8v.2" /></>,
  info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8v.2" /></>,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.8" /></>,
  eyeOff: <path d="M3 3l18 18M10.6 6c.5-.1.9-.1 1.4-.1 6 0 9.5 6.1 9.5 6.1a17 17 0 0 1-3 3.6M6.3 7.4A17 17 0 0 0 2.5 12S6 18.5 12 18.5a9 9 0 0 0 4.2-1M9.9 10a2.8 2.8 0 0 0 4 4" />,
  doc: <><path d="M6 3.5h8l4 4v13H6z" /><path d="M14 3.5v4h4M9 12h6M9 15.5h6" /></>,
  pen: <path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5zM13.5 7l3 3" />,
  home: <path d="M4 11 12 4l8 7M6 9.5V20h12V9.5" />,
  layout: <><rect x="3.5" y="4" width="17" height="16" rx="2" /><path d="M3.5 9h17M9.5 9v11" /></>,
  list: <path d="M8 6.5h12M8 12h12M8 17.5h12M4 6.5h.01M4 12h.01M4 17.5h.01" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  logout: <path d="M10 5H5.5v14H10M14 8l4 4-4 4M18 12H9" />,
  star: <path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z" />,
  trash: <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" />,
};

// Old emojis (still present in stored content) → plain icons. Anything not
// listed simply isn't drawn.
const EMOJI = {
  "📍": "pin", "🗓": "calendar", "📅": "calendar", "🕓": "clock", "🕙": "clock", "⏰": "clock",
  "👥": "users", "👤": "user", "📞": "phone", "☎": "phone", "✉": "mail", "📧": "mail",
  "🔒": "lock", "🔐": "lock", "🛡": "shield", "🪪": "id", "🆔": "id", "🏛": "landmark",
  "🌐": "globe", "🏳": "flag", "🔗": "link", "⬇": "download", "▶": "play", "🖨": "print",
  "📣": "megaphone", "💬": "chat", "✅": "check", "✔": "check", "⚠": "alert", "📜": "doc",
  "📄": "doc", "📝": "doc", "✍": "pen", "✏": "pen", "🏠": "home", "⭐": "star", "🗑": "trash",
};

export default function Icon({ name, size = 18, className = "", title }) {
  if (!name) return null;
  const key = P[name] ? name : EMOJI[String(name).replace(/️/g, "").trim()];
  const paths = key && P[key];
  if (!paths) return null;
  return (
    <svg
      className={`ico${className ? " " + className : ""}`}
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden={title ? undefined : true} role={title ? "img" : undefined} focusable="false"
    >
      {title && <title>{title}</title>}
      {paths}
    </svg>
  );
}
