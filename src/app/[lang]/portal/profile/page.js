import { getDictionary } from "@/i18n/config";
import { PasswordForm } from "@/components/PortalForms";
import { ProfileFacts } from "@/components/MyMember";
import Icon from "@/components/Icon";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDictionary(lang).portal.profile.title };
}

// The signed-in member's own details (only they and Admins can read them).
export default async function ProfilePage({ params }) {
  const { lang } = await params;
  const d = getDictionary(lang);
  const s = d.portal.profile;
  return (
    <div className="portal-stack" style={{ maxWidth: 720 }}>
      <div>
        <h1 className="portal-title">{s.title}</h1>
        <p className="portal-lead">{s.lead}</p>
      </div>
      <ProfileFacts lang={lang} s={{ memberId: s.memberId, district: s.district, group: s.group, tier: s.tier, tierNew: s.tierNew, since: s.since }} />
      <p className="privacy-note"><span aria-hidden="true"><Icon name="lock" /></span><span><b>{s.visibility}.</b> {s.visibilityText}</span></p>
      <PasswordForm s={s} />
    </div>
  );
}
