// Proves firestore.rules give each access level exactly what we agreed.
//   npm run test:rules     (starts a throw-away Firestore emulator, runs, stops)
import { test, before, after, beforeEach } from "node:test";
import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment, assertSucceeds, assertFails,
} from "@firebase/rules-unit-testing";
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, collection, serverTimestamp,
} from "firebase/firestore";

let env;
const [host, port] = (process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8180").split(":");

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-wbpcc-rules",
    firestore: { rules: readFileSync("firestore.rules", "utf8"), host, port: Number(port) },
  });
});
after(async () => { await env?.cleanup(); });

beforeEach(async () => {
  await env.clearFirestore();
  // Starting data, written with rules switched off.
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "posts/live"), { status: "published", title: { en: "Live" } });
    await setDoc(doc(db, "posts/draft"), { status: "draft", title: { en: "Draft" } });
    await setDoc(doc(db, "pages/home"), { status: "published", tickerItems: [] });
    await setDoc(doc(db, "members/m1"), { name: "Member One", district: "howrah" });
    await setDoc(doc(db, "members/m2"), { name: "Member Two", district: "malda" });
    await setDoc(doc(db, "submissions/s-c1"), { kind: "petition", authorUid: "c1", status: "pending", title: { en: "Mine" }, createdAt: new Date() });
    await setDoc(doc(db, "submissions/s-c2"), { kind: "post", authorUid: "c2", status: "pending", title: { en: "Theirs" }, createdAt: new Date() });
    await setDoc(doc(db, "inbox/i1"), { type: "feedback", email: "a@b.c", message: "hi", status: "new" });
    await setDoc(doc(db, "resources/r1"), { status: "published", kind: "announcement" });
  });
});

const visitor = () => env.unauthenticatedContext().firestore();
const member = (uid = "m1") => env.authenticatedContext(uid, { role: "member" }).firestore();
const contributor = (uid = "c1") => env.authenticatedContext(uid, { role: "contributor" }).firestore();
const admin = () => env.authenticatedContext("a1", { role: "admin" }).firestore();
const noRole = () => env.authenticatedContext("x1", {}).firestore();

// ---------------- Visitor ----------------
test("visitor reads published content, not drafts", async () => {
  await assertSucceeds(getDoc(doc(visitor(), "posts/live")));
  await assertSucceeds(getDoc(doc(visitor(), "pages/home")));
  await assertFails(getDoc(doc(visitor(), "posts/draft")));
});

test("visitor cannot edit the website", async () => {
  await assertFails(setDoc(doc(visitor(), "posts/new"), { status: "published" }));
  await assertFails(updateDoc(doc(visitor(), "pages/home"), { tickerItems: ["x"] }));
});

test("visitor never sees members, inbox or the review queue", async () => {
  await assertFails(getDoc(doc(visitor(), "members/m1")));
  await assertFails(getDoc(doc(visitor(), "inbox/i1")));
  await assertFails(getDoc(doc(visitor(), "submissions/s-c1")));
  await assertFails(getDoc(doc(visitor(), "resources/r1")));
});

test("visitor can send the contact form (valid only)", async () => {
  const ok = { type: "grievance", email: "x@y.z", message: "Road broken", status: "new", createdAt: serverTimestamp() };
  await assertSucceeds(addDoc(collection(visitor(), "inbox"), ok));
  await assertFails(addDoc(collection(visitor(), "inbox"), { ...ok, type: "spam" }));
  await assertFails(addDoc(collection(visitor(), "inbox"), { ...ok, message: "" }));
  await assertFails(addDoc(collection(visitor(), "inbox"), { ...ok, isAdmin: true }));
  await assertFails(addDoc(collection(visitor(), "inbox"), { ...ok, status: "done" }));
});

test("visitor can ask for an appointment (listed fields only)", async () => {
  const ok = { name: "Asha", phone: "9000000000", reason: "Local issue", date: "2026-12-01", people: 2, updates: true, status: "new", createdAt: serverTimestamp() };
  await assertSucceeds(addDoc(collection(visitor(), "appointments"), ok));
  await assertFails(addDoc(collection(visitor(), "appointments"), { ...ok, aadhaar: "1234 5678 9012" }));
  const { date, ...noDate } = ok;
  await assertFails(addDoc(collection(visitor(), "appointments"), noDate));
  await assertFails(addDoc(collection(visitor(), "appointments"), { ...ok, people: 50 }));
  await assertFails(addDoc(collection(visitor(), "appointments"), { ...ok, status: "confirmed" }));
  await assertFails(getDoc(doc(visitor(), "appointments/x")));
});

test("join form: ₹5, declarations, and no Voter ID field allowed", async () => {
  const ok = { name: "Ravi", mobile: "9000000002", district: "nadia", declarations: true, status: "pending_payment", fee: 5, createdAt: serverTimestamp() };
  await assertSucceeds(addDoc(collection(visitor(), "applications"), ok));
  await assertFails(addDoc(collection(visitor(), "applications"), { ...ok, voterId: "ABC1234567" }));
  await assertFails(addDoc(collection(visitor(), "applications"), { ...ok, fee: 0 }));
  await assertFails(addDoc(collection(visitor(), "applications"), { ...ok, declarations: false }));
  await assertFails(addDoc(collection(visitor(), "applications"), { ...ok, status: "approved" }));
  await assertFails(addDoc(collection(visitor(), "applications"), { ...ok, password: "Secret#123" }));
  await assertFails(addDoc(collection(visitor(), "applications"), { ...ok, aadhaar: "1234 5678 9012" }));
  await assertSucceeds(addDoc(collection(visitor(), "applications"), { ...ok, block: "Shibpur", ward: "12", group: "youth-congress", whatsapp: "9000000002" }));
  await assertFails(getDoc(doc(visitor(), "applications/x")));
});

test("visitor signs a petition but cannot read signatures", async () => {
  const sig = doc(visitor(), "petitions/live-p/signatures/s1");
  await assertSucceeds(setDoc(sig, { name: "Mita", contact: "9000000000", district: "kolkata", showName: false, createdAt: serverTimestamp() }));
  await assertFails(getDoc(doc(visitor(), "petitions/live-p/signatures/s1")));
  // No extra fields, no self-"counting", and the public count can't be changed from a browser.
  await assertFails(setDoc(doc(visitor(), "petitions/live-p/signatures/s2"), { name: "X", contact: "x", district: "kolkata", counted: true, createdAt: serverTimestamp() }));
  await assertFails(setDoc(doc(visitor(), "petitions/live-p/signatures/s3"), { name: "X", district: "kolkata", createdAt: serverTimestamp() }));
  await assertFails(updateDoc(doc(visitor(), "posts/live"), { signatures: 99999 }));
});

// ---------------- Member ----------------
test("member reads own record and Members-area resources", async () => {
  await assertSucceeds(getDoc(doc(member("m1"), "members/m1")));
  await assertSucceeds(getDoc(doc(member(), "resources/r1")));
});

test("member never sees another member", async () => {
  await assertFails(getDoc(doc(member("m1"), "members/m2")));
});

test("invite codes are server-only — nobody's browser can read or write them", async () => {
  await assertFails(getDoc(doc(visitor(), "memberInvites/m1")));
  await assertFails(getDoc(doc(member("m1"), "memberInvites/m1")));
  await assertFails(getDoc(doc(admin(), "memberInvites/m1")));
  await assertFails(setDoc(doc(admin(), "memberInvites/m1"), { hash: "x" }));
});

test("member edits only safe fields of own profile", async () => {
  await assertSucceeds(updateDoc(doc(member("m1"), "members/m1"), { language: "bn" }));
  await assertFails(updateDoc(doc(member("m1"), "members/m1"), { status: "admin" }));
  await assertFails(updateDoc(doc(member("m1"), "members/m2"), { language: "bn" }));
});

test("member cannot submit articles or edit pages", async () => {
  await assertFails(addDoc(collection(member(), "submissions"), {
    kind: "post", authorUid: "m1", status: "pending", title: { en: "x" }, createdAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(doc(member(), "pages/home"), { tickerItems: [] }));
});

test("signed-in account with no role is treated like a visitor", async () => {
  await assertFails(getDoc(doc(noRole(), "resources/r1")));
  await assertFails(getDoc(doc(noRole(), "members/m1")));
});

// ---------------- Contributor ----------------
test("contributor submits for review as themselves", async () => {
  const s = { kind: "campaign", authorUid: "c1", status: "pending", title: { en: "Night walks" }, createdAt: serverTimestamp() };
  await assertSucceeds(addDoc(collection(contributor("c1"), "submissions"), s));
  await assertFails(addDoc(collection(contributor("c1"), "submissions"), { ...s, authorUid: "c2" }));
  await assertFails(addDoc(collection(contributor("c1"), "submissions"), { ...s, status: "accepted" }));
});

test("contributor sees only their own submissions", async () => {
  await assertSucceeds(getDoc(doc(contributor("c1"), "submissions/s-c1")));
  await assertFails(getDoc(doc(contributor("c1"), "submissions/s-c2")));
});

test("contributor cannot accept their own work or publish directly", async () => {
  await assertFails(updateDoc(doc(contributor("c1"), "submissions/s-c1"), { status: "accepted" }));
  await assertFails(updateDoc(doc(contributor("c1"), "submissions/s-c1"), { reviewedBy: "c1" }));
  await assertFails(setDoc(doc(contributor("c1"), "posts/sneaky"), { status: "published" }));
  await assertSucceeds(updateDoc(doc(contributor("c1"), "submissions/s-c1"), { title: { en: "Mine, edited" } }));
});

test("contributor cannot see members, inbox or drafts", async () => {
  await assertFails(getDoc(doc(contributor(), "members/m1")));
  await assertFails(getDoc(doc(contributor(), "inbox/i1")));
  await assertFails(getDoc(doc(contributor(), "posts/draft")));
});

// ---------------- Admin ----------------
test("admin reads everything private", async () => {
  await assertSucceeds(getDoc(doc(admin(), "members/m1")));
  await assertSucceeds(getDoc(doc(admin(), "inbox/i1")));
  await assertSucceeds(getDoc(doc(admin(), "submissions/s-c2")));
  await assertSucceeds(getDoc(doc(admin(), "posts/draft")));
});

test("admin accepts submissions and edits pages live", async () => {
  await assertSucceeds(updateDoc(doc(admin(), "submissions/s-c1"), { status: "accepted", reviewedBy: "a1" }));
  await assertSucceeds(setDoc(doc(admin(), "petitions/new-one"), { status: "published", title: { en: "New" } }));
  await assertSucceeds(updateDoc(doc(admin(), "pages/home"), { tickerItems: [{ text: { en: "Hi" } }] }));
  await assertSucceeds(deleteDoc(doc(admin(), "posts/live")));
});

test("audit log: staff add own entries, nobody rewrites history", async () => {
  const db = contributor("c1");
  await assertSucceeds(addDoc(collection(db, "audit"), { actorUid: "c1", action: "Submitted", createdAt: serverTimestamp() }));
  await assertFails(addDoc(collection(db, "audit"), { actorUid: "a1", action: "Fake", createdAt: serverTimestamp() }));
  await env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), "audit/x"), { actorUid: "a1" }));
  await assertFails(updateDoc(doc(admin(), "audit/x"), { action: "changed" }));
  await assertFails(deleteDoc(doc(admin(), "audit/x")));
});
