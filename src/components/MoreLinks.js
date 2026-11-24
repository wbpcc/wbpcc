import Link from "next/link";

// History lives on its own page (later phase) but is linked from home.
export default function MoreLinks({ lang, d }) {
  const m = d.more;
  const items = [
    { title: m.historyTitle, text: m.historyText, href: `/${lang}/history` },
    { title: m.aboutTitle, text: m.aboutText, href: `/${lang}/about` },
    { title: m.contactTitle, text: m.contactText, href: `/${lang}/contact` },
    { title: d.footer.pressKit, text: m.pressText, href: `/${lang}/press-kit` },
  ];
  return (
    <section className="section deco deco-b">
      <div className="wrap more-grid">
        {items.map((it, i) => (
          <Link key={it.href} href={it.href} className="card card-link more" data-reveal style={{ "--i": i }}>
            
            <div>
              <h3>{it.title} →</h3>
              <p>{it.text}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
