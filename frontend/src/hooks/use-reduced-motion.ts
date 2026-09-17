"use client";
import { useEffect, useState } from "react";

/** Track the operating-system reduced-motion preference, including live changes. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(
    /** Subscribe to the media query and remove the listener when its consumer unmounts. */ function trackMotion() {
      const media = matchMedia("(prefers-reduced-motion: reduce)");
      /** Copy the current media-query result into React state. */
      function update() { setReduced(media.matches); }
      update();
      media.addEventListener("change", update);
      return /** Stop observing the media query after unmount. */ function cleanup() { media.removeEventListener("change", update); };
    },
    [],
  );
  return reduced;
}
