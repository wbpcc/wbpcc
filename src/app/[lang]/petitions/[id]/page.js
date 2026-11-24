import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, t, fill } from "@/i18n/config";
import { petitions, findPetition, findGroup, districts, campaignForPetition } from "@/data/placeholder";
import PageHead from "@/components/PageHead";
import ShareButtons from "@/components/ShareButtons";
import PetitionCard from "@/components/PetitionCard";
import { PetitionSignBox } from "@/components/Forms";
import Icon from "@/components/Icon";

export function generateStaticParams() {
  return petitions.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
  const { lang, id } = await params;
  const p = findPetition(id);
  return p ? { title: t(p.title, lang) } : {};
}

export default async function PetitionPage({ params }) {
  const { lang, id } = await params;
  const pet = findPetition(id);
  if (!pet) notFound();
  const d = getDictionary(lang);
  const a = d.action, p = d.petition;
  const group = pet.group ? findGroup(pet.group) : null;
  const camp = campaignForPetition(pet.id);
  const startedBy = pet.startedBy === "leadership" ? p.byLeadership : fill(p.byMember, { district: t(districts[pet.district], lang) });

  return (
    <>
      <PageHead
        crumbHref={`/${lang}/petitions`}
        crumbLabel={a.viewAll}
        badges={<span className={`pill ${pet.type === "formal" ? "tag-formal" : "tag-online"}`}>{pet.type === "formal" ? <><Icon name="landmark" size={15} /> {a.formal}</> : <><Icon name="globe" size={15} /> {a.online}</>}</span>}
        title={t(pet.title, lang)}
        lead={t(pet.desc, lang)}
      />
      <div className="wrap detail">
        <div>
          <div className="facts" data-reveal>
            <div className="fact"><i><Icon name="landmark" /></i><div><b>{p.addressedTo}</b><span>{t(pet.addressedTo, lang)}</span></div></div>
            <div className="fact"><i><Icon name="user" /></i><div><b>{p.startedBy}</b><span>{startedBy}</span></div></div>
            {camp && <div className="fact"><i><Icon name="flag" /></i><div><b>{d.campaign.partOf}</b><Link className="link-arrow" href={`/${lang}/campaigns/${camp.id}`}>{t(camp.title, lang)}</Link></div></div>}
            {group && (
              <div className="fact"><i><Icon name="users" /></i><div><b>{d.groups.eyebrow}</b><Link className="link-arrow" href={`/${lang}/groups/${group.id}`}>{t(group.name, lang)}</Link></div></div>
            )}
          </div>
          <div className="prose" data-reveal>
            <h2>{p.why}</h2>
            <p>{d.ph.petitionBody}</p>
          </div>
          <ShareButtons title={t(pet.title, lang)} c={d.common} />
        </div>
        <aside>
          <PetitionSignBox petition={pet} lang={lang} a={a} p={p} c={d.common} />
        </aside>
      </div>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="action-grid">
            {petitions.filter((x) => x.id !== pet.id).map((x, i) => <PetitionCard key={x.id} p={x} lang={lang} a={a} i={i} />)}
          </div>
        </div>
      </section>
    </>
  );
}
