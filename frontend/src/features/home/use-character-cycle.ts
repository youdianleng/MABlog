"use client";
import { type RefObject, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/** The approved 3.5-second interval sits in the middle of the requested 3–4 second range. */
const CHARACTER_CYCLE_INTERVAL_MS = 3500;

export type CharacterName = "catgirl" | "robot" | "reader";

type CharacterPair = {
  left: CharacterName;
  right: CharacterName;
};

type CharacterCycleState = {
  pair: CharacterPair;
  cycleRef: RefObject<HTMLDivElement | null>;
};

/** Keep both sides offset by one character while following catgirl, robot, then reader. */
const CHARACTER_PAIRS: readonly CharacterPair[] = [
  { left: "catgirl", right: "robot" },
  { left: "robot", right: "reader" },
  { left: "reader", right: "catgirl" },
];

/** Rotate the decorative pair only while its hero is visible and motion is allowed. */
export function useCharacterCycle(): CharacterCycleState {
  const [activePair, setActivePair] = useState(0);
  const [inViewport, setInViewport] = useState(false);
  const cycleRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(
    /** Track whether the character scene can currently contribute visible pixels. */
    function observeShowcaseVisibility() {
      const cycle = cycleRef.current;
      if (!cycle || !("IntersectionObserver" in window)) {
        setInViewport(true);
        return undefined;
      }
      const observer = new IntersectionObserver(
        /** Pause decorative state updates as soon as the scene leaves the viewport. */
        function updateShowcaseVisibility(entries) {
          setInViewport(entries.some(
            /** Identify whether any observation reports visible hero content. */
            function isVisible(entry) {
              return entry.isIntersecting;
            },
          ));
        },
        { threshold: 0.01 },
      );
      observer.observe(cycle);
      return /** Release the observer when the Discover hero unmounts. */ function cleanupObserver() {
        observer.disconnect();
      };
    },
    [],
  );

  useEffect(
    /** Own the timer and visibility listener for the lifetime of the homepage showcase. */
    function scheduleCharacterCycle() {
      let timer: number | undefined;

      /** Stop an existing timer before rescheduling or unmounting. */
      function stopTimer() {
        if (timer !== undefined) window.clearInterval(timer);
        timer = undefined;
      }

      /** Run the approved sequence only while the page is visible and motion is allowed. */
      function synchronizeTimer() {
        stopTimer();
        if (reducedMotion || document.hidden || !inViewport) return;
        timer = window.setInterval(
          /** Advance one pair with wraparound at the end of the three-step sequence. */
          function advancePair() {
            setActivePair(
              /** Calculate the next valid pair index without duplicating sequence state. */
              function nextPair(previousPair) {
                return (previousPair + 1) % CHARACTER_PAIRS.length;
              },
            );
          },
          CHARACTER_CYCLE_INTERVAL_MS,
        );
      }

      if (reducedMotion) setActivePair(0);
      synchronizeTimer();
      document.addEventListener("visibilitychange", synchronizeTimer);
      return /** Remove the global listener and timer when the showcase unmounts. */ function cleanup() {
        document.removeEventListener("visibilitychange", synchronizeTimer);
        stopTimer();
      };
    },
    [inViewport, reducedMotion],
  );

  return { pair: CHARACTER_PAIRS[activePair], cycleRef };
}
