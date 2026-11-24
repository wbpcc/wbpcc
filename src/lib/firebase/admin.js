// Firebase on the SERVER (Next.js server components & API routes).
// Never import this from a "use client" file — it has full database access.
//
// Credentials (first one found):
//   FIRESTORE_EMULATOR_HOST    local emulator
//   FIREBASE_SERVICE_ACCOUNT   the key JSON on one line (Vercel → Environment Variables)
//   FIREBASE_KEY_FILE          path to the key file on this computer (.env.local)
// Keep keys out of git — never commit or share them.
import { readFileSync } from "node:fs";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

export const adminReady = !!(process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_KEY_FILE);

function keyJson() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  if (process.env.FIREBASE_KEY_FILE) return JSON.parse(readFileSync(process.env.FIREBASE_KEY_FILE, "utf8"));
  return null;
}

export function admin() {
  if (!adminReady) return null;
  if (!getApps().length) {
    const key = process.env.FIRESTORE_EMULATOR_HOST ? null : keyJson();
    const projectId = key?.project_id || process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-wbpcc";
    initializeApp(key ? { credential: cert(key), projectId } : { projectId });
  }
  return { db: getFirestore(), auth: getAuth() };
}
