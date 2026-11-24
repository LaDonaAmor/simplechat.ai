import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

const KEY = "simplechat:sidebarWidth";
const MIN = 240;
const MAX = 440;
const DEFAULT = 286;

export function useSidebarWidth() {
  const [width, setWidth] = useState<number>(() => {
    try {
      const raw = Number(localStorage.getItem(KEY));
      return Number.isFinite(raw) && raw >= MIN && raw <= MAX ? raw : DEFAULT;
    } catch {
      return DEFAULT;
    }
  });
  const dragging = useRef(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, String(width));
    } catch {
      /* storage unavailable, ignore */
    }
  }, [width]);

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (!dragging.current) return;
    setWidth(Math.min(MAX, Math.max(MIN, e.clientX)));
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const reset = useCallback(() => setWidth(DEFAULT), []);

  return { width, onPointerDown, onPointerMove, onPointerUp, reset };
}
