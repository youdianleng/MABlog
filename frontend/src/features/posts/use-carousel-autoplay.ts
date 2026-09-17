"use client";
import { Dispatch, SetStateAction, useEffect } from "react";

/** Advance a carousel every five seconds while motion and interaction settings permit it. */
export function useCarouselAutoplay(options: {
  count: number;
  paused: boolean;
  hovered: boolean;
  focused: boolean;
  reduced: boolean;
  setActive: Dispatch<SetStateAction<number>>;
}) {
  const { count, paused, hovered, focused, reduced, setActive } = options;
  useEffect(
    /** Start one interval only while automatic movement is allowed. */ function scheduleAdvance() {
      if (paused || hovered || focused || reduced || count < 2) return;
      // Five seconds gives readers time to scan the complete center card before movement.
      const timer = setInterval(
        /** Advance to the next card and wrap at the final item. */ function advance() {
          setActive(
            /** Keep the next position within the available card count. */ function next(index) { return (index + 1) % count; },
          );
        },
        5000,
      );
      return /** Stop the interval whenever interaction state changes. */ function cleanup() { clearInterval(timer); };
    },
    [count, paused, hovered, focused, reduced, setActive],
  );
}
