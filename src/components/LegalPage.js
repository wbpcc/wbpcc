import PageHead from "./PageHead";

// Privacy / Terms layout. Text is English-only until a lawyer signs it off;
// then it gets proper Bangla + Hindi versions (not machine translation).
export default function LegalPage({ lang, d, title, sections }) {
  const l = d.legal;
  return (
    <>
      <PageHead crumbHref={`/${lang}`} crumbLabel={d.nav.home} eyebrow={l.updated} title={title} />
      <div className="wrap legal">
        <p className="form-note">{l.draft}</p>
        {lang !== "en" && l.englishOnly && <p className="form-note" lang={lang}>{l.englishOnly}</p>}
        <nav className="legal-toc" aria-label="Contents">
          {sections.map((s, i) => <a key={i} href={`#s${i + 1}`}>{i + 1}. {s.h}</a>)}
        </nav>
        <div lang="en">
          {sections.map((s, i) => (
            <section key={i} id={`s${i + 1}`}>
              <h2>{i + 1}. {s.h}</h2>
              {s.p.map((p, j) => <p key={j}>{p}</p>)}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
