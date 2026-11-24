// POST /api/count-signature { pid, sid } — someone just signed a petition;
// add 1 to the petition's public count.
//
// Browsers can't change the count themselves (firestore.rules). The server
// only counts a signature that REALLY exists, is less than 15 minutes old,
// belongs to a published petition and hasn't been counted before. The +1 and
// the "counted" mark are written together, so the count can't drift.
import { getDoc, commit, docName, serverReady } from "@/lib/server/firestoreRest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (body, status = 200) => Response.json(body, { status });
const ID = /^[A-Za-z0-9_-]{3,80}$/;

export async function POST(req) {
  try {
    const { pid, sid } = await req.json().catch(() => ({}));
    if (!ID.test(String(pid || "")) || !/^[A-Za-z0-9]{10,40}$/.test(String(sid || ""))) return json({ counted: false, reason: "bad-request" }, 400);
    if (!serverReady()) return json({ counted: false, reason: "server-not-configured" }, 503);

    const pet = await getDoc(`petitions/${pid}`);
    if (!pet || pet.status !== "published") return json({ counted: false, reason: "no-petition" }, 404);
    const sig = await getDoc(`petitions/${pid}/signatures/${sid}`);
    if (!sig) return json({ counted: false, reason: "not-found" }, 404);
    if (sig.counted) return json({ counted: false, reason: "already-counted" });
    const age = Date.now() - Date.parse(sig.createdAt || 0);
    if (!(age >= 0 && age < 15 * 60 * 1000)) return json({ counted: false, reason: "too-old" });

    await commit([
      {
        update: { name: docName(`petitions/${pid}/signatures/${sid}`), fields: { counted: { booleanValue: true } } },
        updateMask: { fieldPaths: ["counted"] },
        currentDocument: { exists: true },
      },
      {
        transform: {
          document: docName(`petitions/${pid}`),
          fieldTransforms: [{ fieldPath: "signatures", increment: { integerValue: "1" } }],
        },
      },
    ]);
    return json({ counted: true });
  } catch (e) {
    console.error("count-signature failed", e);
    return json({ counted: false, reason: "server-error" }, 500);
  }
}
