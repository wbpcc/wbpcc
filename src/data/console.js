// =====================================================================
// DEMO DATA for the team console. Phase 2: all of this comes from the
// database, filtered by the signed-in team member's role.
// Applicant names are obvious placeholders — never put real people here.
// =====================================================================

// =====================================================================
// ACCESS LEVELS (4): Visitor · Member (public site / member portal)
// and two team roles in this console:
//   contributor — writes articles / blogs, creates petitions & campaigns and
//                 submits them. Until an Admin accepts, they are visible to
//                 Admins only — not the public, not members.
//   admin       — full access: reviews & accepts (publishes) or rejects,
//                 edits any section, the leadership team, the members list.
// (There is no separate "President" role — the State President's office
//  uses an Admin account.)
// =====================================================================
export const ROLES = {
  admin: { label: "Admin", email: "admin@wbpcc.org", icon: "shield" },
  contributor: { label: "Contributor", email: "contributor1@wbpcc.org", icon: "pen" },
};

const PA = ["admin"];
export const NAV = [
  { href: "/console", icon: "home", label: "Dashboard", roles: ["admin", "contributor"] },
  { href: "/console/mine", icon: "pen", label: "Add article, campaign or petition", roles: ["contributor"] },
  { href: "/console/edit", icon: "pen", label: "Edit a page", roles: PA },
  { group: "Review & publish" },
  { href: "/console/review", icon: "check", label: "Review queue", roles: PA },
  { href: "/console/campaigns", icon: "flag", label: "Petitions & campaigns", roles: PA },
  { href: "/console/statements", icon: "shield", label: "Official statements", roles: PA },
  { href: "/console/appointments", icon: "calendar", label: "Appointments", roles: PA },
  { group: "People" },
  { href: "/console/members", icon: "lock", label: "Members list", roles: PA },
  { href: "/console/content", icon: "landmark", label: "Leadership & organisation", roles: PA },
  { group: "Website" },
  { href: "/console/landing", icon: "layout", label: "Landing page", roles: PA },
  { href: "/console/pages", icon: "doc", label: "Site pages", roles: PA },
  { href: "/console/posts", icon: "megaphone", label: "Newsroom posts", roles: PA },
  { href: "/console/translations", icon: "globe", label: "Translations", roles: PA },
  { group: "Admin" },
  { href: "/console/team", icon: "users", label: "Team & roles", roles: PA },
  { href: "/console/audit", icon: "list", label: "Audit log", roles: PA },
];

export const navAllows = (n, role) => !!n && n.roles.includes(role);
export const canSee = (role, href) => navAllows(NAV.find((n) => n.href === href), role);

// Which team account wrote each newsroom post (Content Editors may edit only their own).
export const postAuthors = {
  "teacher-recruitment-statement": "president@wbpcc.org",
  "price-rise-statement": "admin@wbpcc.org",
  "youth-rally-highlights": "contributor1@wbpcc.org",
  "what-is-delimitation": "contributor1@wbpcc.org",
  "tea-garden-voices": "contributor2@wbpcc.org",
  "howrah-waterlogging": "admin@wbpcc.org",
  "murshidabad-ration": "admin@wbpcc.org",
  "malda-health-centre": "contributor2@wbpcc.org",
};

export const applications = [
  { id: "APP-1042", name: "Sample Applicant 1", phone: "+91 00000 00001", email: "applicant1@example.com", district: "howrah", constituency: "Shibpur", groups: ["youth-congress"], date: "2026-11-23", status: "new" },
  { id: "APP-1041", name: "Sample Applicant 2", phone: "+91 00000 00002", email: "", district: "kolkata", constituency: "Chowringhee", groups: ["mahila-congress", "chhatra-parishad"], date: "2026-11-22", status: "verifying", note: "Call booked for 25 Nov, 11 AM" },
  { id: "APP-1039", name: "Sample Applicant 3", phone: "+91 00000 00003", email: "applicant3@example.com", district: "malda", constituency: "English Bazar", groups: ["kisan-congress"], date: "2026-11-20", status: "new" },
  { id: "APP-1035", name: "Sample Applicant 4", phone: "+91 00000 00004", email: "", district: "darjeeling", constituency: "Siliguri", groups: ["intuc"], date: "2026-11-18", status: "approved", memberId: "WB-DJL-LAB-0388" },
  { id: "APP-1030", name: "Sample Applicant 5", phone: "+91 00000 00005", email: "", district: "nadia", constituency: "Krishnanagar Uttar", groups: [], date: "2026-11-15", status: "rejected", note: "Could not be reached after 3 calls" },
];

export const proposals = [
  { id: "PR-221", kind: "event", title: "Street-corner meeting in Shibpur", by: "WB-HWH-YTH-0421", district: "howrah", date: "2026-11-23", why: "Residents want a public meeting on rising vegetable and gas prices before the survey results are out.", when: "2026-12-01" },
  { id: "PR-219", kind: "petition", title: "Clean drinking water for Ward 9", by: "WB-HWH-YTH-0421", district: "howrah", date: "2026-11-21", why: "Taps have run brown for three weeks. 400+ households affected.", authority: "Howrah Municipal Corporation", ptype: "formal" },
  { id: "PR-215", kind: "campaign", title: "Night-safety walk in Barasat", by: "WB-N24-WOM-0102", district: "n24pgs", date: "2026-11-19", why: "Monthly walk with residents to map dark streets and report them to the municipality.", when: "2026-12-06" },
];

export const petitionRequests = [
  { id: "RQ-088", title: "Bus shelter near Krishnanagar station", district: "nadia", ptype: "online", date: "2026-11-22", problem: "Commuters wait in the rain and sun; the old shelter was removed in 2025." },
  { id: "RQ-087", title: "Reopen the closed health sub-centre", district: "malda", ptype: "formal", date: "2026-11-20", problem: "The sub-centre in our panchayat has been locked since August." },
];

export const reportQueue = [
  { id: "GR-080", title: "Broken bridge railing on the canal road", by: "WB-N24-YTH-0217", district: "n24pgs", date: "2026-11-23", photos: 3, video: null, what: "The railing has been broken for a month; two cyclists have fallen in." },
  { id: "GR-079", title: "Mid-day meals stopped for a week", by: "WB-MSD-STU-0144", district: "murshidabad", date: "2026-11-22", photos: 2, video: "https://youtube.com/shorts/xxxxxxxxxxx", what: "Children at the primary school have had no mid-day meal since Monday." },
  { id: "GR-077", title: "Street lights off on GT Road", by: "WB-HWH-YTH-0421", district: "howrah", date: "2026-11-15", photos: 0, video: null, what: "About 1 km of GT Road has had no street lights for ten days." },
];

export const team = [
  { email: "president@wbpcc.org", role: "admin", holder: "State President's office", twofa: true, last: "2026-11-24" },
  { email: "admin@wbpcc.org", role: "admin", holder: "Office secretary", twofa: true, last: "2026-11-24" },
  { email: "media@wbpcc.org", role: "admin", holder: "Media cell head", twofa: true, last: "2026-11-23" },
  { email: "contributor1@wbpcc.org", role: "contributor", holder: "Contributor — Howrah", twofa: true, last: "2026-11-24" },
  { email: "contributor2@wbpcc.org", role: "contributor", holder: "Contributor — North Bengal", twofa: false, last: "2026-11-21" },
  { email: "bangla@wbpcc.org", role: "contributor", holder: "Bangla writer", twofa: true, last: "2026-11-22" },
];

export const auditLog = [
  { at: "2026-11-24 10:42", who: "president@wbpcc.org", action: "Published official statement", target: "WBPCC/ST/2026/041" },
  { at: "2026-11-24 10:15", who: "admin@wbpcc.org", action: "Opened member vault record", target: "APP-1041" },
  { at: "2026-11-24 09:58", who: "admin@wbpcc.org", action: "Verified ground report", target: "Ward 12 still waterlogged after 9 days" },
  { at: "2026-11-23 21:30", who: "bangla@wbpcc.org", action: "Edited Bangla translation", target: "Homepage · hero headline" },
  { at: "2026-11-23 19:04", who: "admin@wbpcc.org", action: "Changed landing page", target: "Ticker: added 1 item" },
  { at: "2026-11-23 18:47", who: "contributor2@wbpcc.org", action: "Created post", target: "Tea garden workers speak about wages" },
  { at: "2026-11-23 16:12", who: "admin@wbpcc.org", action: "Approved member proposal", target: "Repair the Shibpur–Santragachi road" },
  { at: "2026-11-23 11:20", who: "president@wbpcc.org", action: "Changed role", target: "contributor2@wbpcc.org → Contributor" },
];

// Translation status per item and language: auto · outdated · reviewed
export const translationItems = [
  { id: "home-hero", area: "Landing page", title: "Hero headline & sub-line", bn: "reviewed", hi: "auto" },
  { id: "teacher-recruitment-statement", area: "Statement", title: "Statement on the teacher recruitment delay", bn: "auto", hi: "auto" },
  { id: "youth-rally-highlights", area: "Newsroom", title: "Jobs for Youth rally — highlights", bn: "reviewed", hi: "reviewed" },
  { id: "what-is-delimitation", area: "Newsroom", title: "What is delimitation? A simple guide", bn: "outdated", hi: "auto" },
  { id: "fill-teacher-posts", area: "Petition", title: "Fill all vacant government teacher posts", bn: "reviewed", hi: "auto" },
  { id: "manifesto-jobs", area: "Manifesto", title: "Jobs & economy promises", bn: "auto", hi: "auto" },
];

// Contributors' work waiting for the Admin / President.
// kind: article | blog | petition | campaign · status: review | approved | changes | rejected
export const submissionQueue = [
  { id: "SUB-031", kind: "article", status: "review", by: "contributor1@wbpcc.org", date: "2026-11-24", title: "How the Howrah price-rise survey works", summary: "Volunteers visited 1,200 homes; here is what people pay now for rice, oil and gas compared with last year.", format: "blog" },
  { id: "SUB-030", kind: "petition", status: "review", by: "contributor1@wbpcc.org", date: "2026-11-23", title: "Clean drinking water for Ward 9", summary: "Taps have run brown for three weeks. 400+ households affected.", ptype: "formal", authority: "Howrah Municipal Corporation", district: "howrah" },
  { id: "SUB-029", kind: "campaign", status: "review", by: "contributor2@wbpcc.org", date: "2026-11-22", title: "Night-safety walks", summary: "Monthly walks with residents to map dark streets and report them to the municipality.", district: "n24pgs" },
  { id: "SUB-027", kind: "blog", status: "approved", by: "contributor2@wbpcc.org", date: "2026-11-20", title: "Voices from the tea gardens", summary: "Three workers on what a day's wage buys.", format: "reel" },
  { id: "SUB-024", kind: "petition", status: "changes", by: "contributor1@wbpcc.org", date: "2026-11-18", title: "Street lights on GT Road", summary: "About 1 km of GT Road has had no street lights for ten days.", note: "Add who should act and a photo." },
];

// Appointment requests for the State President (from the members' form).
export const appointments = [
  { id: "APT-104", name: "Sample Member 1", memberId: "WB-HWH-YTH-0421", phone: "+91 00000 00011", district: "howrah", who: "Congress party worker", reason: "Local / area issue", date: "2026-11-28", time: "11:00", mode: "In person", people: 2, status: "new", describe: "Waterlogging in Ward 12 — want to hand over residents' signatures." },
  { id: "APT-103", name: "Sample Member 2", memberId: "WB-MLD-FRM-0233", phone: "+91 00000 00012", district: "malda", who: "Farmer", reason: "Agriculture", date: "2026-11-30", time: "15:00", mode: "Either", people: 3, status: "new", describe: "Mango growers' price issue this season." },
  { id: "APT-101", name: "Sample Member 3", memberId: "WB-KOL-STU-0102", phone: "+91 00000 00013", district: "kolkata", who: "Student", reason: "Education", date: "2026-11-26", time: "12:00", mode: "Online", people: 1, status: "confirmed", slot: "26 Nov, 12:30 PM (online)", describe: "Scholarship delays at two colleges." },
];