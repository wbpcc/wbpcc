// One-time invite codes for new members. Only a hash is stored (in the
// server-only "memberInvites" collection), never the code itself.
import { createHash, randomInt } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I — easy to read out on a call
export const INVITE_DAYS = 14;
export const MAX_ATTEMPTS = 5;

export function newInviteCode() {
  let s = "";
  for (let i = 0; i < 8; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return `${s.slice(0, 4)}-${s.slice(4)}`;
}

export const normaliseCode = (c) => String(c || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

/** Hash tied to the member's login, so a code only works for that one person. */
export const hashCode = (code, uid) => createHash("sha256").update(`${normaliseCode(code)}:${uid}`).digest("hex");

export function inviteRecord(code, uid, adminEmail) {
  return {
    hash: hashCode(code, uid),
    expiresAt: new Date(Date.now() + INVITE_DAYS * 24 * 3600 * 1000),
    attempts: 0,
    createdBy: adminEmail,
    createdAt: new Date(),
  };
}

const code3 = (s) => String(s || "GEN").replace(/[^a-z]/gi, "").slice(0, 3).toUpperCase() || "GEN";
export const newMemberId = (district, group) =>
  `WB-${code3(district)}-${code3(String(group || "").split("-")[0])}-${String(randomInt(1000, 10000))}`;
