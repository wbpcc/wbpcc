// End-to-end check of real sign-in + console saving + publish check,
// against the LOCAL emulator with the demo logins.
//   npm run test:flow
import { test } from "node:test";
import assert from "node:assert/strict";
import { signIn, clearSession } from "../src/components/session.js";
import { saveItem, removeItem, savePage } from "../src/lib/cms.js";
import { POST } from "../src/app/api/publish/route.js";
import { POST as NOTIFY } from "../src/app/api/notify/route.js";
import { POST as COUNT } from "../src/app/api/count-signature/route.js";
import { POST as APPROVE } from "../src/app/api/members/approve/route.js";
import { POST as REINVITE } from "../src/app/api/members/invite/route.js";
import { POST as ACTIVATE } from "../src/app/api/members/activate/route.js";
import { submitForm } from "../src/lib/submit.js";
import { patchItem, logView, createSubmission, updateSubmission, acceptSubmission } from "../src/lib/cms.js";
import { publicDocFor } from "../src/lib/submissions.js";
import { loadFirebase } from "../src/components/session.js";
import { DEMO_USERS } from "../scripts/demo-users.mjs";

const pw = (key) => DEMO_USERS.find((u) => u.key === key).password;
const signOut = async () => { const { auth, authMod } = await loadFirebase(); await authMod.signOut(auth); };
const token = async () => (await loadFirebase()).auth.currentUser.getIdToken();
const publish = (tok) => POST(new Request("http://x/api/publish", { method: "POST", headers: tok ? { Authorization: `Bearer ${tok}` } : {} }));

test("each category signs in with the right login", async () => {
  assert.equal(await signIn("admin", "admin@wbpcc.org", pw("admin")), "admin");
  await signOut();
  assert.equal(await signIn("contributor", "contributor1@wbpcc.org", pw("contributor")), "contributor");
  await signOut();
  assert.equal(await signIn("member", "90000 00001", pw("member")), "member"); // mobile with a space
  await signOut();
});

test("wrong category or password is refused", async () => {
  await assert.rejects(signIn("admin", "contributor1@wbpcc.org", pw("contributor")), { code: "wrong-category" });
  await assert.rejects(signIn("contributor", "9000000001@member.wbpcc.org", pw("member")), { code: "wrong-category" });
  await assert.rejects(signIn("admin", "admin@wbpcc.org", "nope-nope"), (e) => e.code.startsWith("auth/"));
  await assert.rejects(signIn("member", "WB-HWH-YTH-0421", "x"), { code: "use-mobile" });
  const { auth } = await loadFirebase();
  assert.equal(auth.currentUser, null, "a refused login must not stay signed in");
});

test("admin adds, edits and removes a leader; it is logged", async () => {
  await signIn("admin", "admin@wbpcc.org", pw("admin"));
  const { db } = await loadFirebase();
  const m = await import("firebase/firestore");
  const item = { id: "leader-test", level: "vp", initials: "TT", name: { en: "Test Leader", bn: "", hi: "" }, role: { en: "Vice President" }, phone: "1", email: "", bio: { en: "" }, junk: undefined };
  await saveItem("leaders", item, { order: 9, label: "office-bearer “Test Leader”" });
  const saved = (await m.getDoc(m.doc(db, "leaders", "leader-test"))).data();
  assert.equal(saved.status, "published");
  assert.equal(saved.updatedBy, "admin@wbpcc.org");
  assert.equal(saved.name.en, "Test Leader");

  await saveItem("leaders", { ...item, name: { en: "Renamed" } }, { order: 9, label: "x" });
  assert.equal((await m.getDoc(m.doc(db, "leaders", "leader-test"))).data().name.en, "Renamed");

  await removeItem("leaders", "leader-test", "office-bearer “Renamed”");
  assert.equal((await m.getDoc(m.doc(db, "leaders", "leader-test"))).exists(), false);

  const log = await m.getDocs(m.query(m.collection(db, "audit"), m.where("actorEmail", "==", "admin@wbpcc.org")));
  assert.ok(log.size >= 3, "saves and removal are in the audit log");
  await signOut();
});

test("admin can load every list the Leadership & organisation screen needs", async () => {
  await signIn("admin", "admin@wbpcc.org", pw("admin"));
  const { db } = await loadFirebase();
  const m = await import("firebase/firestore");
  for (const col of ["leaders", "districtPresidents", "groups", "events", "inspiration"]) {
    const snap = await m.getDocs(m.collection(db, col));
    assert.ok(snap.size > 0, `${col} loads`);
  }
  await signOut();
});

test("admin edits the homepage hero and page sections (merged, not replaced)", async () => {
  await signIn("admin", "admin@wbpcc.org", pw("admin"));
  const { db } = await loadFirebase();
  const m = await import("firebase/firestore");
  await savePage("text", { hero: { title: { en: "BENGAL IS CALLING GUYS!", bn: "", hi: "" } } }, "Home page · hero");
  await savePage("text", { footer: { address: { en: "New address", bn: "", hi: "" } } }, "Footer");
  const text = (await m.getDoc(m.doc(db, "pages", "text"))).data();
  assert.equal(text.hero.title.en, "BENGAL IS CALLING GUYS!");
  assert.equal(text.footer.address.en, "New address", "second save kept the first");
  assert.equal(text.status, "published");

  await savePage("home", { numbers: { events: 30, districts: 35 } }, "Home page");
  const home = (await m.getDoc(m.doc(db, "pages", "home"))).data();
  assert.equal(home.numbers.events, 30);
  assert.ok(Array.isArray(home.tickerItems), "ticker kept when only numbers change");
  await signOut();
});

test("drafts stay hidden from visitors", async () => {
  await signIn("admin", "admin@wbpcc.org", pw("admin"));
  await saveItem("petitions", { id: "draft-pet", title: { en: "Draft" }, stage: "draft" }, { order: 0, label: "x", status: "draft" });
  await signOut();
  const { db } = await loadFirebase();
  const m = await import("firebase/firestore");
  await assert.rejects(m.getDoc(m.doc(db, "petitions", "draft-pet")), { code: "permission-denied" });
});

test("contributor cannot edit page sections", async () => {
  await signIn("contributor", "contributor1@wbpcc.org", pw("contributor"));
  await assert.rejects(savePage("text", { hero: { title: { en: "x" } } }, "x"), { code: "permission-denied" });
  await signOut();
});

test("contributor cannot change the website directly", async () => {
  await signIn("contributor", "contributor1@wbpcc.org", pw("contributor"));
  await assert.rejects(saveItem("leaders", { id: "sneaky", name: { en: "x" } }, { order: 0, label: "x" }), { code: "permission-denied" });
  await signOut();
});

// ---------------- Contact form → inbox → email alert ----------------
const notify = (body) => NOTIFY(new Request("http://x/api/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));

test("visitor sends the contact form; it is saved but visitors can't read it", async () => {
  await signOut();
  const { ref, id } = await submitForm("inbox", { type: "grievance", name: "Asha", email: "asha@example.com", phone: "9000000000", message: "Street lights broken", lang: "bn", status: "new" }, "WB");
  assert.match(ref, /^WB-[A-Z0-9]{6}$/);
  const { db } = await loadFirebase();
  const m = await import("firebase/firestore");
  await assert.rejects(m.getDoc(m.doc(db, "inbox", id)), { code: "permission-denied" });
  globalThis.__lastInboxId = id;
});

test("contact form refuses unexpected fields and bad types", async () => {
  await assert.rejects(submitForm("inbox", { type: "spam", email: "a@b.c", message: "x", status: "new" }), { code: "permission-denied" });
  await assert.rejects(submitForm("inbox", { type: "feedback", email: "a@b.c", message: "x", status: "new", isAdmin: true }), { code: "permission-denied" });
});

test("email alert: refuses fakes, sends once, never personal details", async () => {
  assert.equal((await notify({ col: "members", id: "abcdefghijkl" })).status, 400);
  assert.equal((await notify({ col: "inbox", id: "doesNotExist1234" })).status, 404);

  // No email key yet → nothing sent, message stays un-alerted.
  delete process.env.RESEND_API_KEY;
  assert.equal((await (await notify({ col: "inbox", id: globalThis.__lastInboxId })).json()).reason, "no-email-key");

  // With a key: intercept the email service and check what would be sent.
  process.env.RESEND_API_KEY = "test-key";
  const realFetch = globalThis.fetch;
  let sentBody = null;
  globalThis.fetch = async (url, opts) => {
    if (String(url).startsWith("https://api.resend.com")) { sentBody = JSON.parse(opts.body); return new Response("{}", { status: 200 }); }
    return realFetch(url, opts);
  };
  try {
    const first = await (await notify({ col: "inbox", id: globalThis.__lastInboxId })).json();
    assert.equal(first.sent, true);
    assert.deepEqual(sentBody.to, ["sm.wbpcc@gmail.com"]);
    assert.match(sentBody.subject, /Grievance/);
    for (const secret of ["Asha", "asha@example.com", "9000000000", "Street lights"]) {
      assert.ok(!JSON.stringify(sentBody).includes(secret), `email must not contain "${secret}"`);
    }
    const again = await (await notify({ col: "inbox", id: globalThis.__lastInboxId })).json();
    assert.equal(again.reason, "already-sent", "only one email per message");
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.RESEND_API_KEY;
  }
});

test("admin reads the inbox newest-first and marks a message replied", async () => {
  await signIn("admin", "admin@wbpcc.org", pw("admin"));
  const { db } = await loadFirebase();
  const m = await import("firebase/firestore");
  const snap = await m.getDocs(m.query(m.collection(db, "inbox"), m.orderBy("createdAt", "desc"), m.limit(50)));
  assert.ok(snap.docs.some((d) => d.id === globalThis.__lastInboxId));
  await patchItem("inbox", globalThis.__lastInboxId, { status: "replied" }, "Marked message as replied");
  const after = (await m.getDoc(m.doc(db, "inbox", globalThis.__lastInboxId))).data();
  assert.equal(after.status, "replied");
  assert.equal(after.handledBy, "admin@wbpcc.org");
  const count = await m.getCountFromServer(m.query(m.collection(db, "inbox"), m.where("status", "==", "new")));
  assert.equal(typeof count.data().count, "number");
  await signOut();
});

test("contributor and member cannot read the inbox", async () => {
  const { db } = await loadFirebase();
  const m = await import("firebase/firestore");
  await signIn("contributor", "contributor1@wbpcc.org", pw("contributor"));
  await assert.rejects(m.getDocs(m.collection(db, "inbox")), { code: "permission-denied" });
  await signOut();
  await signIn("member", "9000000001", pw("member"));
  await assert.rejects(m.getDocs(m.collection(db, "inbox")), { code: "permission-denied" });
  await signOut();
});

// ---------------- Appointment form ----------------
test("appointment request: saved, alert has no personal details, admin confirms a slot", async () => {
  await signOut();
  const { id } = await submitForm("appointments", {
    name: "Ravi Das", guardian: "Late S. Das", gender: "male", occupation: "Teacher", phone: "9000000123",
    email: "ravi@example.com", address: "12, Station Road, Shibpur", district: "howrah", pin: "711102",
    who: "worker", date: "2026-12-05", time: "11:00", mode: "person", people: 2, duration: "30",
    topic: Object.keys((await import("../src/i18n/config.js")).getDictionary("en").appointment.reasons)[0],
    reason: "Waterlogging in Ward 12 for nine days", updates: true, lang: "en", status: "new",
  }, "APT");

  // Extra fields (like an ID number) are refused.
  await assert.rejects(submitForm("appointments", { name: "X", phone: "9", reason: "x", date: "2026-12-05", status: "new", voterId: "ABC123" }), { code: "permission-denied" });

  process.env.RESEND_API_KEY = "test-key";
  const realFetch = globalThis.fetch;
  let sent = null;
  globalThis.fetch = async (url, opts) => {
    if (String(url).startsWith("https://api.resend.com")) { sent = JSON.parse(opts.body); return new Response("{}", { status: 200 }); }
    return realFetch(url, opts);
  };
  try {
    const r = await (await notify({ col: "appointments", id })).json();
    assert.equal(r.sent, true);
    assert.match(sent.subject, /appointment request \(Howrah\)/);
    assert.match(sent.text, /2026-12-05/);
    for (const secret of ["Ravi", "9000000123", "ravi@example.com", "Waterlogging", "Station Road"]) {
      assert.ok(!JSON.stringify(sent).includes(secret), `alert must not contain "${secret}"`);
    }
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.RESEND_API_KEY;
  }

  await signIn("admin", "admin@wbpcc.org", pw("admin"));
  await patchItem("appointments", id, { status: "confirmed", slot: "5 Dec, 11:30 AM" }, "Confirmed appointment");
  const { db } = await loadFirebase();
  const m = await import("firebase/firestore");
  const saved = (await m.getDoc(m.doc(db, "appointments", id))).data();
  assert.equal(saved.status, "confirmed");
  assert.equal(saved.slot, "5 Dec, 11:30 AM");
  assert.equal(saved.people, 2);
  await signOut();
});

// ---------------- Join form ----------------
test("join: application saved without password, alert has no personal details, admin approves", async () => {
  await signOut();
  const base = {
    district: "nadia", assembly: "Krishnanagar Uttar", block: "Krishnanagar-I", ward: "7", name: "Mita Ghosh", gender: "female",
    guardian: "Tapan Ghosh", dob: "1995-04-02", occupation: "Nurse", workplace: "District Hospital", group: "mahila-congress",
    address: "3, Lake Road", pin: "741101", mobile: "9000000456", whatsapp: "9000000456", email: "mita@example.com",
    lang: "bn", declarations: true, status: "pending_payment", fee: 5,
  };
  const { ref, id } = await submitForm("applications", base, "JOIN");
  assert.match(ref, /^JOIN-[A-Z0-9]{6}$/);
  await assert.rejects(submitForm("applications", { ...base, password: "Secret#123" }), { code: "permission-denied" });
  await assert.rejects(submitForm("applications", { ...base, voterId: "WB/01/123" }), { code: "permission-denied" });
  await assert.rejects(submitForm("applications", { ...base, fee: 0 }), { code: "permission-denied" });

  process.env.RESEND_API_KEY = "test-key";
  const realFetch = globalThis.fetch;
  let sent = null;
  globalThis.fetch = async (url, opts) => {
    if (String(url).startsWith("https://api.resend.com")) { sent = JSON.parse(opts.body); return new Response("{}", { status: 200 }); }
    return realFetch(url, opts);
  };
  try {
    const r = await (await notify({ col: "applications", id })).json();
    assert.equal(r.sent, true);
    assert.match(sent.subject, /membership application \(Nadia\)/);
    for (const secret of ["Mita", "9000000456", "mita@example.com", "Lake Road", "1995"]) {
      assert.ok(!JSON.stringify(sent).includes(secret), `alert must not contain "${secret}"`);
    }
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.RESEND_API_KEY;
  }

  await signIn("admin", "admin@wbpcc.org", pw("admin"));
  await logView("applications", id, "membership application");
  await patchItem("applications", id, { status: "approved", memberId: "WB-NAD-MAH-1234", verifiedBy: "Phone call" }, "Approved membership application");
  const { db } = await loadFirebase();
  const m = await import("firebase/firestore");
  const saved = (await m.getDoc(m.doc(db, "applications", id))).data();
  assert.equal(saved.status, "approved");
  assert.equal(saved.memberId, "WB-NAD-MAH-1234");
  assert.ok(!("password" in saved));
  const log = await m.getDocs(m.query(m.collection(db, "audit"), m.where("target", "==", `applications/${id}`)));
  assert.ok(log.docs.some((d) => d.data().action === "Opened membership application"), "opening is logged");
  await signOut();
});

// ---------------- Petition signatures ----------------
const count = (body) => COUNT(new Request("http://x/api/count-signature", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));

test("signing: saved privately, counted exactly once, admin edits keep the count", async () => {
  await signOut();
  const { db } = await loadFirebase();
  const m = await import("firebase/firestore");
  const pid = "fill-teacher-posts";
  const before = (await m.getDoc(m.doc(db, "petitions", pid))).data().signatures;

  const { id } = await submitForm(`petitions/${pid}/signatures`, { name: "Bina Roy", contact: "9000000789", district: "kolkata", showName: false, forGovt: false, lang: "en" }, "SIG", { notify: false });
  await assert.rejects(m.getDoc(m.doc(db, "petitions", pid, "signatures", id)), { code: "permission-denied" });

  // Fakes are refused; a real one is counted once.
  assert.equal((await count({ pid, sid: "notARealSignature1" })).status, 404);
  assert.equal((await count({ pid: "no-such-petition", sid: id })).status, 404);
  assert.equal((await (await count({ pid, sid: id })).json()).counted, true);
  assert.equal((await (await count({ pid, sid: id })).json()).reason, "already-counted");
  const after = (await m.getDoc(m.doc(db, "petitions", pid))).data().signatures;
  assert.equal(after, before + 1, "public count went up by exactly 1");

  // A visitor can't bump the count or mark their own signature counted.
  await assert.rejects(m.updateDoc(m.doc(db, "petitions", pid), { signatures: 999999 }), { code: "permission-denied" });

  // Admin: sees the signature; editing the petition text keeps the live count.
  await signIn("admin", "admin@wbpcc.org", pw("admin"));
  const sigs = await m.getDocs(m.query(m.collection(db, `petitions/${pid}/signatures`), m.orderBy("createdAt", "desc")));
  const mine = sigs.docs.find((d) => d.id === id)?.data();
  assert.equal(mine.name, "Bina Roy");
  assert.equal(mine.counted, true);
  await saveItem("petitions", { id: pid, title: { en: "Fill all vacant teacher posts — now" }, stage: "live" }, { order: 0, label: "petition", merge: true });
  const edited = (await m.getDoc(m.doc(db, "petitions", pid))).data();
  assert.equal(edited.signatures, before + 1, "editing didn't reset the count");
  assert.equal(edited.title.en, "Fill all vacant teacher posts — now");
  assert.ok(edited.goal, "other fields kept");
  await signOut();
});

// ---------------- Contributor submissions → review → published ----------------
async function withResend(fn) {
  process.env.RESEND_API_KEY = "test-key";
  const realFetch = globalThis.fetch;
  const sent = [];
  globalThis.fetch = async (url, opts) => {
    if (String(url).startsWith("https://api.resend.com")) { sent.push(JSON.parse(opts.body)); return new Response("{}", { status: 200 }); }
    if (String(url) === "/api/notify") return new Response("{}", { status: 200 }); // the browser-side call; tested directly below
    return realFetch(url, opts);
  };
  try { return await fn(sent); } finally { globalThis.fetch = realFetch; delete process.env.RESEND_API_KEY; }
}

test("website item shapes from a submission", () => {
  const pet = publicDocFor({ id: "abcd1234xyz", kind: "petition", title: { en: "Clean water for Ward 9" }, body: { en: "Taps run brown." }, ptype: "formal", authority: { en: "HMC" }, goal: "3000", authorEmail: "c@x" });
  assert.equal(pet.col, "petitions");
  assert.equal(pet.doc.id, "clean-water-for-ward-9-abcd");
  assert.equal(pet.doc.type, "formal");
  assert.equal(pet.doc.signatures, 0);
  assert.equal(pet.doc.goal, 3000);
  assert.equal(pet.doc.desc.en, "Taps run brown.");
  const post = publicDocFor({ id: "zz99aa", kind: "post", format: "video", link: "https://youtu.be/x", title: { en: "Voices" }, body: { en: "Story" } });
  assert.equal(post.doc.platform, "youtube");
  assert.equal(post.doc.excerpt.en, "Story");
  assert.equal(publicDocFor({ id: "q1w2e3", kind: "campaign", title: { en: "বাংলা" }, body: { en: "x" } }).doc.id, "item-q1w2", "non-English titles still get a safe id");
});

test("contributor drafts, submits, gets sent back, resubmits; admin publishes", async () => {
  const { db, auth } = await loadFirebase();
  const m = await import("firebase/firestore");

  await signIn("contributor", "contributor1@wbpcc.org", pw("contributor"));
  const myUid = auth.currentUser.uid;
  const draft = { kind: "post", format: "blog", link: "", title: { en: "How the Howrah survey works", bn: "", hi: "" }, body: { en: "Volunteers visited 1,200 homes.", bn: "", hi: "" }, district: "howrah", group: "" };
  const id = await createSubmission(draft, false);
  let doc = (await m.getDoc(m.doc(db, "submissions", id))).data();
  assert.equal(doc.status, "draft");
  assert.equal(doc.authorUid, myUid);

  // Contributors list only their own; can't accept their own work.
  const mine = await m.getDocs(m.query(m.collection(db, "submissions"), m.where("authorUid", "==", myUid), m.orderBy("createdAt", "desc")));
  assert.ok(mine.docs.some((d) => d.id === id));
  await assert.rejects(m.getDocs(m.collection(db, "submissions")), { code: "permission-denied" });
  await assert.rejects(m.updateDoc(m.doc(db, "submissions", id), { status: "accepted" }), { code: "permission-denied" });

  // Submit → one alert.
  await updateSubmission(id, { ...draft, body: { en: "Volunteers visited 1,200 homes in Shibpur.", bn: "", hi: "" } }, true);
  const waiting = await m.getCountFromServer(m.query(m.collection(db, "submissions"), m.where("authorUid", "==", myUid), m.where("status", "==", "pending")));
  assert.ok(waiting.data().count >= 1, "contributor dashboard count works");
  await withResend(async (sent) => {
    assert.equal((await (await notify({ col: "submissions", id })).json()).sent, true);
    assert.match(sent[0].subject, /article waiting for review/);
    assert.match(sent[0].text, /How the Howrah survey works/);
    assert.equal((await (await notify({ col: "submissions", id })).json()).reason, "already-sent");
  });
  await signOut();

  // Admin sends it back with a note.
  await signIn("admin", "admin@wbpcc.org", pw("admin"));
  await patchItem("submissions", id, { status: "changes", reviewNote: "Add the survey dates." }, "Asked for changes");
  await signOut();

  // Contributor fixes and resubmits → a fresh alert is allowed.
  await signIn("contributor", "contributor1@wbpcc.org", pw("contributor"));
  doc = (await m.getDoc(m.doc(db, "submissions", id))).data();
  assert.equal(doc.reviewNote, "Add the survey dates.");
  await updateSubmission(id, { ...doc, body: { en: "Volunteers visited 1,200 homes in Shibpur, 1–15 Nov.", bn: "", hi: "" } }, true);
  await withResend(async () => {
    assert.equal((await (await notify({ col: "submissions", id })).json()).sent, true, "resubmission alerts again");
  });
  await signOut();

  // Another contributor can't see it.
  // (contributor2 isn't a demo login, so check with the member account instead.)
  await signIn("member", "9000000001", pw("member"));
  await assert.rejects(m.getDoc(m.doc(db, "submissions", id)), { code: "permission-denied" });
  await signOut();

  // Admin accepts → a real, published article appears.
  await signIn("admin", "admin@wbpcc.org", pw("admin"));
  const sub = { id, ...(await m.getDoc(m.doc(db, "submissions", id))).data() };
  const { col, id: pubId } = await acceptSubmission(sub);
  assert.equal(col, "posts");
  const post = (await m.getDoc(m.doc(db, "posts", pubId))).data();
  assert.equal(post.status, "published");
  assert.equal(post.title.en, "How the Howrah survey works");
  assert.match(post.excerpt.en, /1–15 Nov/);
  assert.equal(post.fromSubmission, id);
  const after = (await m.getDoc(m.doc(db, "submissions", id))).data();
  assert.equal(after.status, "accepted");
  assert.equal(after.publishedId, pubId);
  await signOut();

  // Once published, the contributor can't change the submission any more.
  await signIn("contributor", "contributor1@wbpcc.org", pw("contributor"));
  await assert.rejects(updateSubmission(id, { ...draft, title: { en: "Sneaky edit" } }, true), { code: "permission-denied" });
  await signOut();
});

// ---------------- Member logins: approve → invite → activate → sign in ----------------
const call = (fn, path, body, tok) => fn(new Request(`http://x${path}`, { method: "POST", headers: { "Content-Type": "application/json", ...(tok ? { Authorization: `Bearer ${tok}` } : {}) }, body: JSON.stringify(body) }));
const apply = (mobile, name) => submitForm("applications", { name, mobile, district: "howrah", group: "youth-congress", lang: "bn", declarations: true, status: "pending_payment", fee: 5 }, "JOIN");

test("member login: approve creates login + invite; activation sets the password; member signs in", async () => {
  await signOut();
  const { id: appId } = await apply("+91 90000 00999", "Arup Sen");
  const { db } = await loadFirebase();
  const m = await import("firebase/firestore");

  // Only an Admin can approve.
  await signIn("contributor", "contributor1@wbpcc.org", pw("contributor"));
  assert.equal((await call(APPROVE, "/api/members/approve", { applicationId: appId }, await token())).status, 403);
  await signOut();

  await signIn("admin", "admin@wbpcc.org", pw("admin"));
  const adminTok = await token();
  const res = await (await call(APPROVE, "/api/members/approve", { applicationId: appId, verifiedBy: "Phone call" }, adminTok)).json();
  assert.equal(res.ok, true);
  assert.match(res.invite, /^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  assert.match(res.memberId, /^WB-HOW-YOU-\d{4}$/);
  assert.equal(res.mobile, "9000000999");
  const app = (await m.getDoc(m.doc(db, "applications", appId))).data();
  assert.equal(app.status, "approved");
  assert.equal(app.memberUid, res.memberUid);
  const member = (await m.getDoc(m.doc(db, "members", res.memberUid))).data();
  assert.equal(member.status, "invited");
  assert.equal(member.memberId, res.memberId);
  // The invite itself is server-only — even an Admin's browser can't read it.
  await assert.rejects(m.getDoc(m.doc(db, "memberInvites", res.memberUid)), { code: "permission-denied" });
  assert.equal((await call(APPROVE, "/api/members/approve", { applicationId: appId }, adminTok)).status, 409, "no double approval");
  await signOut();

  // Activation: wrong code / wrong mobile give the same answer; then the right one works.
  const act = async (body) => (await call(ACTIVATE, "/api/members/activate", body)).json();
  assert.equal((await act({ mobile: "9000000999", code: "AAAA-BBBB", password: "Secret#2026" })).reason, "invalid");
  assert.equal((await act({ mobile: "9000000111", code: res.invite, password: "Secret#2026" })).reason, "invalid");
  assert.equal((await act({ mobile: "9000000999", code: res.invite, password: "short" })).reason, "weak-password");
  const ok = await act({ mobile: "90000 00999", code: res.invite.toLowerCase(), password: "Secret#2026" });
  assert.equal(ok.ok, true);
  assert.equal(ok.memberId, res.memberId);
  assert.equal((await act({ mobile: "9000000999", code: res.invite, password: "Other#2026" })).reason, "invalid", "a code works once");

  // The member signs in with mobile + password and sees only their own record.
  assert.equal(await signIn("member", "9000000999", "Secret#2026"), "member");
  const { auth } = await loadFirebase();
  const mine = (await m.getDoc(m.doc(db, "members", auth.currentUser.uid))).data();
  assert.equal(mine.status, "active");
  assert.equal(mine.memberId, res.memberId);
  await assert.rejects(m.getDoc(m.doc(db, "applications", appId)), { code: "permission-denied" });
  await signOut();

  // A new invite isn't possible once they're active.
  await signIn("admin", "admin@wbpcc.org", pw("admin"));
  assert.equal((await (await call(REINVITE, "/api/members/invite", { applicationId: appId }, await token())).json()).reason, "already-active");
  await signOut();
});

test("member invite locks after 5 wrong codes; a new code works", async () => {
  await signOut();
  const { id: appId } = await apply("9000000888", "Rina Paul");
  await signIn("admin", "admin@wbpcc.org", pw("admin"));
  const tok = await token();
  const first = await (await call(APPROVE, "/api/members/approve", { applicationId: appId }, tok)).json();
  await signOut();

  const act = async (code) => (await call(ACTIVATE, "/api/members/activate", { mobile: "9000000888", code, password: "Secret#2026" })).json();
  for (let i = 0; i < 5; i++) assert.equal((await act("ZZZZ-ZZZZ")).reason, "invalid");
  assert.equal((await act(first.invite)).reason, "locked", "even the right code is refused once locked");

  await signIn("admin", "admin@wbpcc.org", pw("admin"));
  const again = await (await call(REINVITE, "/api/members/invite", { applicationId: appId }, await token())).json();
  assert.equal(again.ok, true);
  assert.notEqual(again.invite, first.invite);
  await signOut();
  assert.equal((await act(first.invite)).reason, "invalid", "old code no longer works");
  assert.equal((await act(again.invite)).ok, true);
});

// ---------------- Members-area announcements ----------------
test("announcements: admin posts one; members read them; visitors can't", async () => {
  const { db } = await loadFirebase();
  const m = await import("firebase/firestore");
  await signIn("admin", "admin@wbpcc.org", pw("admin"));
  await saveItem("resources", { id: "announcement-test", kind: "announcement", date: "2026-11-25", from: { en: "Howrah District Committee" }, text: { en: "Meeting on Sunday at 9 AM." } }, { order: 0, label: "announcement" });
  await signOut();

  await signIn("member", "9000000001", pw("member"));
  const snap = await m.getDocs(m.query(m.collection(db, "resources"), m.where("kind", "==", "announcement")));
  assert.ok(snap.docs.some((d) => d.id === "announcement-test" && d.data().text.en === "Meeting on Sunday at 9 AM."));
  await assert.rejects(saveItem("resources", { id: "member-post", kind: "announcement", text: { en: "x" } }, { order: 0, label: "x" }), { code: "permission-denied" });
  await signOut();

  await assert.rejects(m.getDocs(m.query(m.collection(db, "resources"), m.where("kind", "==", "announcement"))), { code: "permission-denied" });
});

test("publish: only an Admin may rebuild the site", async () => {
  assert.equal((await publish(null)).status, 401);
  const bad = await publish("not-a-token");
  assert.equal(bad.status, 401);
  assert.equal((await bad.json()).reason, "bad-token");

  await signIn("contributor", "contributor1@wbpcc.org", pw("contributor"));
  assert.equal((await publish(await token())).status, 403);
  await signOut();

  await signIn("admin", "admin@wbpcc.org", pw("admin"));
  const r = await publish(await token());
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: true, rebuilding: false, reason: "no-deploy-hook" });
  await clearSession();
});
