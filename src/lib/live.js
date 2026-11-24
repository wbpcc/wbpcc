// True when the site is connected to Firebase (real logins and saving).
// Safe to import from server AND client code (no "use client" here).
export const LIVE = process.env.NEXT_PUBLIC_USE_EMULATORS === "1" || !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
