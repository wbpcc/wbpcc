import Link from "next/link";
import { t, intlLocale } from "@/i18n/config";
import { districts } from "@/data/placeholder";
import Icon from "./Icon";

export const PLATFORM = { youtube: "YouTube", instagram: "Instagram", facebook: "Facebook" };

export function KindBadge({ post, n }) {
  if (post.kind === "statement") return <span className="badge-official">● {n.official}</span>;
  if (post.kind === "report") return <span className="badge-verified">✓ {n.report}</span>;
  return <span className="badge-kind">{post.kind === "explainer" ? n.explainer : n.story}</span>;
}

export function postDate(post, lang) {
  return new Intl.DateTimeFormat(intlLocale[lang], { day: "numeric", month: "short" }).format(new Date(post.date));
}

export function PostMeta({ post, lang, n }) {
  const bits = [];
  if (post.kind === "report") bits.push(n.byMember);
  if (post.district) bits.push(t(districts[post.district], lang));
  bits.push(postDate(post, lang));
  return <small>{bits.join(" · ")}</small>;
}

// One card, three looks: reel (9:16), video (16:9), blog (text).
export default function PostCard({ post, lang, n, i = 0, wide = false, reveal = true }) {
  const href = `/${lang}/newsroom/${post.id}`;
  const rv = reveal ? { "data-reveal": true } : {};

  if (post.format === "blog") {
    return (
      <Link href={href} className="post-card post-blog" {...rv} style={{ "--i": i }}>
        <div style={{ display: "grid", gap: 10 }}>
          <span className="blog-icon" aria-hidden="true"><Icon name={post.kind === "statement" ? "doc" : "pen"} size={22} /></span>
          <div><KindBadge post={post} n={n} /></div>
          <h4>{t(post.title, lang)}</h4>
          <p>{t(post.excerpt, lang)}</p>
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <PostMeta post={post} lang={lang} n={n} />
          <span className="link-arrow" style={{ justifySelf: "start" }}>{n.blog} →</span>
        </div>
      </Link>
    );
  }

  if (post.format === "reel") {
    return (
      <Link href={href} className="post-card post-reel" {...rv} style={{ "--i": i }}>
        <div className="media-frame media-9x16">
          {post.platform && <span className="platform">{PLATFORM[post.platform]} · {n.reel}</span>}
          <span className="play" aria-hidden="true"><Icon name="play" size={24} /></span>
          <div className="overlay">
            <KindBadge post={post} n={n} />
            <h4>{t(post.title, lang)}</h4>
            <PostMeta post={post} lang={lang} n={n} />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className={`post-card${wide ? " wide" : ""}`} {...rv} style={{ "--i": i }}>
      <div className="media-frame media-16x9">
        {post.platform && <span className="platform">{PLATFORM[post.platform]} · {n.video}</span>}
        <span className="play" aria-hidden="true"><Icon name="play" size={24} /></span>
      </div>
      <KindBadge post={post} n={n} />
      <h4>{t(post.title, lang)}</h4>
      <PostMeta post={post} lang={lang} n={n} />
    </Link>
  );
}
