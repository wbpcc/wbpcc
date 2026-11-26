// Contributor submissions ↔ website items. Pure functions (no database) so
// they can be tested on their own.
//
// A submission (collection "submissions"):
//   kind: post | petition | campaign      status: draft | pending | changes | accepted | rejected
//   authorUid, authorEmail, title {en,bn,hi}, body {en,bn,hi}, district, group,
//   post:     format (blog|reel|video), link
//   petition: ptype (online|formal), authority {en,bn,hi}, goal
//   campaign: start, end, events []

export const UI_TO_KIND = { article: "post", blog: "post", petition: "petition", campaign: "campaign" };
export const KIND_LABEL = { post: "Article", petition: "Petition", campaign: "Campaign" };
export const PUBLIC_COL = { post: "posts", petition: "petitions", campaign: "campaigns" };
export const PUBLIC_PATH = { post: "newsroom", petition: "petitions", campaign: "campaigns" };

const tri = (x) => (x && typeof x === "object" ? x : { en: x || "", bn: "", hi: "" });
const slug = (s) =>
  String(s || "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "item";

export const platformOf = (url = "") =>
  /youtu\.?be/.test(url) ? "youtube" : /instagram\.com/.test(url) ? "instagram"
  : /facebook\.com|fb\.watch/.test(url) ? "facebook" : /(twitter|x)\.com/.test(url) ? "x" : null;

/**
 * An edit request (submission with editOf: { col, id }) → the fields to change
 * on that published item. Never touches a petition's signature count.
 */
export function editPatchFor(sub) {
  const { col, id } = sub.editOf || {};
  if (!col || !id) throw new Error("Not an edit request");
  const body = tri(sub.body || sub.summary);
  const title = tri(sub.title);
  if (sub.kind === "post") {
    const video = sub.format && sub.format !== "blog" && sub.link ? sub.link : null;
    return { col, id, patch: { title, excerpt: body, format: sub.format || "blog", videoUrl: video, platform: video ? platformOf(video) : null } };
  }
  if (sub.kind === "petition") {
    return { col, id, patch: { title, desc: body, addressedTo: tri(sub.authority), type: sub.ptype === "formal" ? "formal" : "online", goal: Math.max(100, Number(sub.goal) || 5000) } };
  }
  if (sub.kind === "campaign") {
    return { col, id, patch: { title, goal: body, desc: body, start: sub.start || "", end: sub.end || "", events: sub.events || [] } };
  }
  throw new Error(`Unknown submission kind: ${sub.kind}`);
}

/** A published website item → the fields of an edit-request form, pre-filled. */
export function submissionFromPublished(kind, item) {
  const base = { kind, title: tri(item.title), district: item.district || "", group: item.group || "", editOf: { col: PUBLIC_COL[kind], id: item.id } };
  if (kind === "post") return { ...base, body: tri(item.excerpt), format: item.format || "blog", link: item.videoUrl || "" };
  if (kind === "petition") return { ...base, body: tri(item.desc), authority: tri(item.addressedTo), ptype: item.type || "online", goal: item.goal || 5000 };
  return { ...base, body: tri(item.desc || item.goal), start: item.start || "", end: item.end || "", events: item.events || [] };
}

/** The website item an accepted submission becomes: { col, doc } (doc.id included). */
export function publicDocFor(sub, today = new Date()) {
  const id = `${slug(sub.title?.en)}-${String(sub.id).slice(0, 4).toLowerCase()}`;
  const body = tri(sub.body || sub.summary);
  const base = {
    title: tri(sub.title), district: sub.district || null, group: sub.group || null,
    fromSubmission: sub.id, author: sub.authorEmail || null,
  };
  if (sub.kind === "post") {
    const video = sub.format && sub.format !== "blog" && sub.link ? sub.link : null;
    return {
      col: "posts",
      doc: {
        id, ...base, kind: "story", format: sub.format || "blog", videoUrl: video, platform: video ? platformOf(video) : null,
        date: today.toISOString().slice(0, 10), leaderId: null, statementId: null, excerpt: body,
      },
    };
  }
  if (sub.kind === "petition") {
    return {
      col: "petitions",
      doc: {
        id, ...base, type: sub.ptype === "formal" ? "formal" : "online", signatures: 0,
        goal: Math.max(100, Number(sub.goal) || 5000), startedBy: "member", desc: body,
        addressedTo: tri(sub.authority), stage: "live",
      },
    };
  }
  if (sub.kind === "campaign") {
    return {
      col: "campaigns",
      doc: { id, ...base, start: sub.start || "", end: sub.end || "", featured: false, events: sub.events || [], petitions: [], goal: body, desc: body },
    };
  }
  throw new Error(`Unknown submission kind: ${sub.kind}`);
}
