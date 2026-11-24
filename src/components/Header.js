import Link from "next/link";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileMenu from "./MobileMenu";
import LiveTicker from "./LiveTicker";
import HeaderShell from "./HeaderShell";
import NavLinks from "./NavLinks";
import AccountLink from "./AccountLink";

// Main menu (agreed with the party):
// About ▾ · Leadership · Organisation · News · Take action ▾ · Contact · Members area
export function navItems(lang, d) {
  const L = (p) => `/${lang}${p}`;
  return [
    {
      label: d.nav.about,
      href: L("/about"),
      children: [
        { href: L("/about"), label: d.menu.aboutUs },
        { href: L("/history"), label: d.footer.history },
        { href: L("/about#ideology"), label: d.about.ideology },
        { href: L("/about#values"), label: d.about.values },
        { href: L("/manifesto"), label: d.footer.manifesto },
        { href: L("/inspiration"), label: d.inspiration.eyebrow },
      ],
    },
    { href: L("/leadership"), label: d.nav.leadership },
    { href: L("/groups"), label: d.org.nav },
    { href: L("/newsroom"), label: d.nav.news },
    {
      label: d.action.eyebrow,
      href: L("/campaigns"),
      children: [
        { href: L("/campaigns"), label: d.campaign.listTitle },
        { href: L("/petitions"), label: d.nav.petitions },
        { href: L("/events"), label: d.nav.events },
        { href: L("/join"), label: d.header.joinLong },
        { href: L("/donate"), label: d.menu.donate },
      ],
    },
    { href: L("/contact"), label: d.nav.contact },
    { href: L("/signin"), label: d.menu.membersArea, accent: true },
  ];
}

// Two tiers:
//  1. navy utility bar — LIVE ticker + account link + language switcher
//  2. main bar — logo, menu, and the Join button (always visible, every page)
export default function Header({ lang, d }) {
  const items = navItems(lang, d);
  return (
    <HeaderShell>
      <div className="utility">
        <div className="wrap">
          <LiveTicker lang={lang} d={d} />
          <AccountLink lang={lang} a={d.auth} areaLabel={d.members.area} />
          <LanguageSwitcher lang={lang} label={d.header.langLabel} />
        </div>
      </div>
      <header className="header">
        <div className="wrap">
          <Logo lang={lang} />
          <NavLinks items={items} />
          <div className="header-actions">
            <Link href={`/${lang}/join`} className="btn btn-saffron btn-join">
              {d.header.join}
            </Link>
            <MobileMenu items={[{ href: `/${lang}`, label: d.nav.home }, ...items]} joinHref={`/${lang}/join`} d={d} />
          </div>
        </div>
      </header>
    </HeaderShell>
  );
}
