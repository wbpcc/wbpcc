import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, t } from "@/i18n/config";
import { leaders, posts, findLeader } from "@/data/placeholder";
import PageHead from "@/components/PageHead";
import PostCard from "@/components/PostCard";
import Icon from "@/components/Icon";

export function generateStaticParams() {
  return leaders.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }) {
  const { lang, id } = await params;
  const p = findLeader(id);
  return p ? { title: t(p.role, lang) } : {};
}

export default async function LeaderPage({ params }) {
  const { lang, id } = await params;
  const p = findLeader(id);
  if (!p) notFound();
  const d = getDictionary(lang);
  const l = d.leaders;
  const theirs = posts.filter((x) => x.leaderId === p.id);

  return (
    <>
      <PageHead crumbHref={`/${lang}/leadership`} crumbLabel={l.viewAll} eyebrow={t(p.role, lang)} title={t(p.name, lang)} />
      <div className="wrap detail">
        <div>
          <div className="prose" data-reveal>
            <h2>{l.bio}</h2>
            <p>{d.ph.leaderBio}</p>
          </div>
          <h2 style={{ marginTop: 28 }}>{l.statements}</h2>
          {theirs.length === 0 && <p style={{ color: "var(--muted)" }}>{l.noStatements}</p>}
          <div className="news-grid">
            {theirs.map((x, i) => <PostCard key={x.id} post={x} lang={lang} n={d.news} i={i} />)}
          </div>
        </div>
        <aside>
          <div className="card leader" style={{ padding: 28 }}>
            {/* PLACEHOLDER: leader photo */}
            <div className="leader-photo" style={{ width: 160, height: 160, fontSize: 52 }} aria-hidden="true">{p.initials}</div>
            <h3>{t(p.name, lang)}</h3>
            <p>{t(p.role, lang)}</p>
            <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
              {p.phone && <a href={`tel:${p.phone.replace(/\s/g, "")}`} className="btn btn-outline btn-sm"><Icon name="phone" size={16} /> {p.phone}</a>}
              {p.email && <a href={`mailto:${p.email}`} className="btn btn-outline btn-sm"><Icon name="mail" size={16} /> {p.email}</a>}
              {p.level === "president" && <Link href={`/${lang}/appointment`} className="btn btn-saffron btn-sm">{d.committee.appointment}</Link>}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
