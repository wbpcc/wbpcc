import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, t, fill, intlLocale } from "@/i18n/config";
import { posts, findPost, findLeader, districts, youtubeEmbed } from "@/data/placeholder";
import PageHead from "@/components/PageHead";
import ShareButtons from "@/components/ShareButtons";
import PostCard, { KindBadge, PLATFORM } from "@/components/PostCard";
import Icon from "@/components/Icon";

export function generateStaticParams() {
  return posts.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
  const { lang, id } = await params;
  const p = findPost(id);
  return p ? { title: t(p.title, lang), description: t(p.excerpt, lang) } : {};
}

// A post = the video (embedded from YouTube, or linked to Instagram/Facebook)
// + the written story. Statements also carry their verifiable ID.
export default async function PostPage({ params }) {
  const { lang, id } = await params;
  const post = findPost(id);
  if (!post) notFound();
  const d = getDictionary(lang);
  const n = d.news;
  const leader = post.leaderId ? findLeader(post.leaderId) : null;
  const embed = youtubeEmbed(post.videoUrl);
  const date = new Intl.DateTimeFormat(intlLocale[lang], { day: "numeric", month: "long", year: "numeric" }).format(new Date(post.date));
  const related = posts.filter((p) => p.id !== post.id).slice(0, 4);

  return (
    <>
      <PageHead
        crumbHref={`/${lang}/newsroom`}
        crumbLabel={d.nav.newsroom}
        badges={<KindBadge post={post} n={n} />}
        title={t(post.title, lang)}
        lead={t(post.excerpt, lang)}
      />
      <div className="wrap detail">
        <div>
          {post.format !== "blog" && (
            <div
              className={`media-frame ${post.format === "reel" ? "media-9x16" : "media-16x9"}`}
              style={{ maxWidth: post.format === "reel" ? 380 : "none", marginBottom: 24 }}
              data-reveal
            >
              {embed ? (
                <iframe src={embed} title={t(post.title, lang)} allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen loading="lazy" />
              ) : post.videoUrl ? (
                <a className="btn btn-saffron" href={post.videoUrl} target="_blank" rel="noopener noreferrer"><Icon name="play" /> {fill(n.watchOn, { platform: PLATFORM[post.platform] })}</a>
              ) : (
                <>
                  <span className="play" aria-hidden="true"><Icon name="play" size={26} /></span>
                  <span className="media-note">{n.videoPlaceholder}</span>
                </>
              )}
            </div>
          )}
          <div className="prose" data-reveal>
            <p><b>{t(post.excerpt, lang)}</b></p>
            <p>{d.ph.postBody}</p>
          </div>
          <ShareButtons title={t(post.title, lang)} c={d.common} />
        </div>
        <aside>
          <div className="card" style={{ display: "grid", gap: 12 }}>
            {post.statementId && (
              <>
                <span className="badge-official" style={{ justifySelf: "start" }}>● {n.official}</span>
                <div className="fact"><i><Icon name="id" /></i><div><b>{n.id}</b><code style={{ fontWeight: 800 }}>{post.statementId}</code></div></div>
                {/* Phase 2: a real QR code that opens this page, printed on the PDF */}
                <div style={{ width: 120, height: 120, borderRadius: 12, background: "repeating-conic-gradient(var(--navy) 0 25%, var(--white) 0 50%) 0 0 / 20px 20px", border: "6px solid var(--white)", boxShadow: "0 0 0 1px var(--line)" }} aria-label="QR code placeholder" />
              </>
            )}
            <div className="fact"><i><Icon name="calendar" /></i><div><b>{n.issued}</b><span>{date}</span></div></div>
            {leader && (
              <div className="fact"><i><Icon name="pen" /></i><div><b>{n.signedBy}</b><Link className="link-arrow" href={`/${lang}/leadership/${leader.id}`}>{t(leader.role, lang)}</Link></div></div>
            )}
            {post.kind === "report" && (
              <div className="fact"><i><Icon name="user" /></i><div><b>{n.report}</b><span>{n.byMember}{post.district ? ` · ${t(districts[post.district], lang)}` : ""}</span></div></div>
            )}
            {post.videoUrl && post.platform && (
              <a className="btn btn-outline btn-sm" href={post.videoUrl} target="_blank" rel="noopener noreferrer">{fill(n.watchOn, { platform: PLATFORM[post.platform] })} ↗</a>
            )}
          </div>
        </aside>
      </div>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2 className="h-section" style={{ fontSize: 30 }}>{n.related}</h2>
          <div className="news-grid">
            {related.map((p, i) => <PostCard key={p.id} post={p} lang={lang} n={n} i={i} />)}
          </div>
        </div>
      </section>
    </>
  );
}
