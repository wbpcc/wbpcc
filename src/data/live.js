// The latest published content, downloaded from Firestore when the site is
// built (scripts/pull-content.mjs). When it isn't available, every data file
// falls back to its built-in placeholder content.
import snapshot from "./live-content.json";

export const live = snapshot && snapshot.ok ? snapshot : null;

/** A whole list from the database (even an empty one), else the fallback. */
export const fromLive = (key, fallback) => (live && Array.isArray(live[key]) ? live[key] : fallback);

/** One field of a page section from the database, else the fallback. */
export const fromPage = (page, key, fallback) => live?.pages?.[page]?.[key] ?? fallback;
