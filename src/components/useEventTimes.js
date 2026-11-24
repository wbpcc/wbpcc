"use client";

import { useEffect, useState } from "react";

const HOUR = 3600 * 1000;

// Events from the database have a real start date (startsAt). Built-in
// placeholder events use "hours from now". Works out Live/Upcoming/Past in the browser.
export function withTimes(e, now) {
  const start = e.startsAt ? Date.parse(e.startsAt) : now + e.startInHours * HOUR;
  const end = start + e.durationHours * HOUR;
  const status = start <= now && now < end ? "live" : start > now ? "soon" : "past";
  return { ...e, start, end, status };
}

export function useNow(intervalMs = 60000) {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
