import Link from "next/link";
import { t } from "@/i18n/config";
import { posts } from "@/data/placeholder";
import PostCard, { KindBadge, PLATFORM, postDate } from "./PostCard";
import Rail from "./Rail";
import Icon from "./Icon";

// Homepage newsroom: the latest official statement (video) up top with
// the next few headlines beside it, then a swipeable rail of reels + blogs.
export default function NewsroomSection({ lang, d }) {
  const n = d.news;
  const featured = posts.find((p) => p.kind === "statement");
  const rest = posts.filter((p) => p !== featured);
  const headlines = rest.slice(0, 4);

  return (
    <section className="section newsroom-sec" id="newsroom">
      <div className="wrap">
        <div className="section-head" data-reveal>
          <div>
            <p className="eyebrow" style={{ color: "var(--yellow)" }}>{n.eyebrow}</p>
            <h2 className="h-section">{n.title}</h2>
            <p>{n.sub}</p>
          </div>
          <Link className="link-arrow" href={`/${lang}/newsroom`}>{n.viewAll} →</Link>
        </div>

        <div className="news-top">
          <Link href={`/${lang}/newsroom/${featured.id}`} className="featured-post" data-reveal>
            <div className="media-frame media-16x9">
              {featured.platform && <span className="platform">{PLATFORM[featured.platform]} · {n.video}</span>}
              <span className="play" aria-hidden="true"><Icon name="play" size={24} /></span>
            </div>
            <div className="body">
              <KindBadge post={featured} n={n} />
              <h3>{t(featured.title, lang)}</h3>
              <p>{t(featured.excerpt, lang)}</p>
              <div className="meta-row">
                <span>{n.id}: <code>{featured.statementId}</code></span>
                <span>{n.issued}: {postDate(featured, lang)}</span>
              </div>
            </div>
          </Link>

          <div className="headlines" data-reveal style={{ "--i": 1 }}>
            {headlines.map((p) => (
              <Link key={p.id} href={`/${lang}/newsroom/${p.id}`} className="headline">
                <span className={`headline-thumb ${p.format === "reel" ? "is-reel" : ""}`} aria-hidden="true">
                  <Icon name={p.format === "blog" ? "doc" : "play"} size={14} />
                </span>
                <span className="headline-text">
                  <KindBadge post={p} n={n} />
                  <b>{t(p.title, lang)}</b>
                  <small>{p.format === "blog" ? n.blog : `${PLATFORM[p.platform]} · ${p.format === "reel" ? n.reel : n.video}`} · {postDate(p, lang)}</small>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <Rail title={n.latest}>
          {rest.map((p, i) => <PostCard key={p.id} post={p} lang={lang} n={n} i={i} />)}
        </Rail>
      </div>
    </section>
  );
}
