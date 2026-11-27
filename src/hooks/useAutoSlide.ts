"use client";

import { useCallback, useEffect, useState } from "react";
import type { AutoSlideOptions, AutoSlideState } from "@/types/props/product";

// Index + timer state for an auto-advancing gallery.
// - Advances every `delay` ms only when count > 1, the pointer isn't over the
//   gallery (pause()/resume()) and the tab is visible.
// - prev()/next() move immediately (wrapping) and restart the timer, so a
//   manual step is never followed by an instant automatic one.
// - When `resetKey` changes (e.g. a different variant), the index returns to 0
//   and the timer restarts.
// All timers/listeners are cleaned up.
export default function useAutoSlide(count: number, { delay = 4000, resetKey }: AutoSlideOptions = {}): AutoSlideState {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [hidden, setHidden] = useState(false);
  // Bumped on manual navigation / reset so the interval effect re-runs.
  const [timerEpoch, setTimerEpoch] = useState(0);
  const [prevResetKey, setPrevResetKey] = useState(resetKey);

  // Reset during render (React-recommended over an effect): no frame shows a
  // stale slide index from the previous variant.
  if (prevResetKey !== resetKey) {
    setPrevResetKey(resetKey);
    setIndex(0);
    setTimerEpoch((e) => e + 1);
  }

  const safeIndex = count > 0 ? index % count : 0;

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (count <= 1 || hovered || hidden) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), delay);
    return () => clearInterval(id);
  }, [count, hovered, hidden, delay, timerEpoch]);

  const next = useCallback(() => {
    if (count <= 1) return;
    setIndex((i) => ((i % count) + 1) % count);
    setTimerEpoch((e) => e + 1);
  }, [count]);

  const prev = useCallback(() => {
    if (count <= 1) return;
    setIndex((i) => ((i % count) - 1 + count) % count);
    setTimerEpoch((e) => e + 1);
  }, [count]);

  const pause = useCallback(() => setHovered(true), []);
  const resume = useCallback(() => setHovered(false), []);

  return { index: safeIndex, next, prev, pause, resume };
}
