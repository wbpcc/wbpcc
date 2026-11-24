// End-to-end check of real sign-in + console saving + publish check,
// against the LOCAL emulator with the demo logins.
//   npm run test:flow
import { test } from "node:test";
import assert from "node:assert/strict";
import { signIn, clearSession } from "../src/components/session.js";
import { saveItem, removeItem, savePage } from "../src/lib/cms.js";
import { POST } from "../src/app/api/publish/route.js";
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

test("publish: only an Admin may rebuild the site", async () => {
  assert.equal((await publish(null)).status, 401);
  assert.equal((await publish("not-a-token")).status, 401);

  await signIn("contributor", "contributor1@wbpcc.org", pw("contributor"));
  assert.equal((await publish(await token())).status, 403);
  await signOut();

  await signIn("admin", "admin@wbpcc.org", pw("admin"));
  const r = await publish(await token());
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: true, rebuilding: false, reason: "no-deploy-hook" });
  await clearSession();
});
