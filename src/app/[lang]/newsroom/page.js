import { getDictionary } from "@/i18n/config";
import { posts, statementRegistry } from "@/data/placeholder";
import PageHead from "@/components/PageHead";
import PostCard from "@/components/PostCard";
import NewsFeed from "@/components/NewsFeed";
import VerifyMessage from "@/components/VerifyMessage";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDictionary(lang).nav.newsroom };
}

export default async function NewsroomPage({ params }) {
  const { lang } = await params;
  const d = getDictionary(lang);
  const n = d.news;
  const cards = Object.fromEntries(posts.map((p) => [p.id, <PostCard key={p.id} post={p} lang={lang} n={n} reveal={false} />]));

  return (
    <>
      <PageHead crumbHref={`/${lang}`} crumbLabel={d.nav.home} eyebrow={n.eyebrow} title={n.title} lead={n.sub} />
      <section className="section" style={{ paddingTop: 28 }}>
        <div className="wrap" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 28 }}>
          <div style={{ maxWidth: 560 }}>
            <VerifyMessage lang={lang} n={n} known={statementRegistry} />
          </div>
          <div>
            <NewsFeed n={n} cards={cards} />
          </div>
        </div>
      </section>
    </>
  );
}
