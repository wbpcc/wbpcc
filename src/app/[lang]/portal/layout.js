import { getDictionary, t, fill, formatNumber } from "@/i18n/config";
import { districts, findGroup } from "@/data/placeholder";
import { demoMember } from "@/data/portal";
import PortalNav from "@/components/PortalNav";
import MemberGate from "@/components/MemberGate";
import { MemberIdLine, MemberTier } from "@/components/MyMember";
import Icon from "@/components/Icon";
import { LIVE } from "@/lib/live";

const CHECKING = { en: "Checking your sign-in…", bn: "আপনার সাইন ইন যাচাই হচ্ছে…", hi: "आपका साइन इन जाँचा जा रहा है…" };

// Member portal shell: member card on top, menu on the left (top on phones).
// Phase 2: only reachable with a signed-in member session.
export default async function PortalLayout({ children, params }) {
  const { lang } = await params;
  const d = getDictionary(lang);
  const p = d.portal;
  return (
    <MemberGate lang={lang} checking={CHECKING[lang] || CHECKING.en}>
    <div className="portal">
      <section className="portal-hero">
        <div className="wrap">
          {!LIVE && <p className="demo-note dark">{d.auth.demo}</p>}
          <div className="portal-id">
            <div>
              <p className="eyebrow" style={{ color: "var(--yellow)" }}>{p.title}</p>
              <h1>{p.hello}</h1>
              <MemberIdLine lang={lang} />
            </div>
            <MemberTier lang={lang} p={{ tier: p.tier, private: p.private }} />
          </div>
        </div>
      </section>
      <div className="wrap portal-body">
        <PortalNav lang={lang} n={{ dashboard: p.nav.dashboard, resources: d.resources.title, appointment: d.appointment.title, feedback: d.contactForm.types.feedback, profile: p.nav.profile }} signout={d.auth.signout} />
        <div className="portal-main">{children}</div>
      </div>
    </div>
    </MemberGate>
  );
}
