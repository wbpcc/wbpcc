import { getDictionary, t, intlLocale } from "@/i18n/config";
import { districts, findGroup } from "@/data/placeholder";
import { demoMember } from "@/data/portal";
import { PasswordForm } from "@/components/PortalForms";
import Icon from "@/components/Icon";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDictionary(lang).portal.profile.title };
}

export default async function ProfilePage({ params }) {
  const { lang } = await params;
  const d = getDictionary(lang);
  const s = d.portal.profile;
  const g = findGroup(demoMember.group);
  const since = new Intl.DateTimeFormat(intlLocale[lang], { day: "numeric", month: "long", year: "numeric" }).format(new Date(demoMember.since));
  const rows = [
    ["id", s.memberId, <code key="id">{demoMember.id}</code>],
    ["pin", s.district, t(districts[demoMember.district], lang)],
    [g.icon, s.group, t(g.name, lang)],
    ["star", s.tier, s.tierNew],
    ["calendar", s.since, since],
  ];
  return (
    <div className="portal-stack" style={{ maxWidth: 720 }}>
      <div>
        <h1 className="portal-title">{s.title}</h1>
        <p className="portal-lead">{s.lead}</p>
      </div>
      <div className="card" style={{ display: "grid", gap: 14 }}>
        {rows.map(([icon, label, value]) => (
          <div key={label} className="fact"><i><Icon name={icon} /></i><div><b>{label}</b><span>{value}</span></div></div>
        ))}
      </div>
      <p className="privacy-note"><span aria-hidden="true"><Icon name="lock" /></span><span><b>{s.visibility}.</b> {s.visibilityText}</span></p>
      <PasswordForm s={s} />
    </div>
  );
}
