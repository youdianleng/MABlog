"use client";
import { RefObject, useEffect, useState } from "react";

/** Observe an element and return its current content width for responsive rendering. */
export function useElementWidth(element: RefObject<HTMLElement | null>, initialWidth: number) {
  const [width, setWidth] = useState(initialWidth);
  useEffect(
    /** Attach one ResizeObserver to the supplied element. */ function observeSize() {
      const observer = new ResizeObserver(
        /** Store the latest measured width from the browser observer. */ function resized(entries) {
          if (entries[0]) setWidth(entries[0].contentRect.width);
        },
      );
      if (element.current) observer.observe(element.current);
      return /** Disconnect all observer targets after unmount. */ function cleanup() { observer.disconnect(); };
    },
    [element],
  );
  return width;
}
