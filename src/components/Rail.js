"use client";

import Carousel from "./Carousel";

// A titled carousel row (events, news & reels, inspiring people).
// variant="light" for cream backgrounds, default "dark" for the navy newsroom.
export default function Rail({ title, children, variant = "dark", className = "" }) {
  return (
    <Carousel
      label={title}
      variant={variant}
      trackClass={className}
      head={<div className={`rail-head rail-${variant}`}><h3>{title}</h3></div>}
    >
      {children}
    </Carousel>
  );
}
