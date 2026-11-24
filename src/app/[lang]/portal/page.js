import Link from "next/link";
import { getDictionary } from "@/i18n/config";
import { MemberAnnouncements, MemberUpcoming } from "@/components/MyMember";
import Icon from "@/components/Icon";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDictionary(lang).portal.title };
}

// Members-area home: quick links, announcements (members-only, from the
// database) and upcoming events in the member's own district.
export default async function PortalDashboard({ params }) {
  const { lang } = await params;
  const d = getDictionary(lang);
  const p = d.portal;
  const quick = [
    ["/resources", "print", d.resources.title, d.resources.ready + " · " + d.resources.create],
    ["/appointment", "calendar", d.appointment.title, d.appointment.eyebrow],
    ["/feedback", "chat", d.contactForm.types.feedback, d.contactForm.types.suggestion + " · " + d.contactForm.types.grievance],
  ];

  return (
    <div className="portal-stack">
      <div>
        <h2 className="portal-h">{p.quick}</h2>
        <div className="quick-grid">
          {quick.map(([href, icon, title, sub], i) => (
            <Link key={href} href={`/${lang}/portal${href}`} className="card card-link quick" data-reveal style={{ "--i": i }}>
              <i aria-hidden="true"><Icon name={icon} size={24} /></i>
              <b>{title}</b>
              <small>{sub}</small>
            </Link>
          ))}
        </div>
      </div>

      <div className="two-col">
        <div>
          <h2 className="portal-h">{p.announcements}</h2>
          <MemberAnnouncements lang={lang} />
        </div>
        <div>
          <h2 className="portal-h">{p.upcoming}</h2>
          <MemberUpcoming lang={lang} />
        </div>
      </div>
    </div>
  );
}
