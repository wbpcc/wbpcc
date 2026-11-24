"use client";

import Link from "next/link";
import { useSession } from "./session";
import Icon from "./Icon";

// Top-bar link: "Sign in" when signed out; otherwise goes to the right home
// for the role (account / member portal / team console).
export default function AccountLink({ lang, a, areaLabel }) {
  const s = useSession();
  let href = `/${lang}/signin`, label = areaLabel || a.signinLink, icon = "user";
  if (s?.role === "member") { href = `/${lang}/portal`; label = a.memberPortal; icon = "id"; }
  if (s?.role === "team") { href = `/console`; label = a.consoleTitle; icon = "shield"; }
  return (
    <Link href={href} className="account-link">
      <Icon name={icon} size={16} /> {label}
    </Link>
  );
}
