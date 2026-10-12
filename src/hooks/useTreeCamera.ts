"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { zoomTree, type TreeCamera } from "@/data/skillTree";

const INITIAL_CAMERA = { x: 0, y: 0, scale: 0.65 };

// Paint transforms directly once per frame; the graph does not re-render during zoom or drag.
export function useTreeCamera() {
  const world = useRef<HTMLDivElement>(null);
  const current = useRef<TreeCamera>(INITIAL_CAMERA);
  const target = useRef<TreeCamera>(INITIAL_CAMERA);
  const frame = useRef<number | null>(null);
  const [scale, setScale] = useState(INITIAL_CAMERA.scale);

  const paint = useCallback((camera: TreeCamera) => {
    current.current = camera;
    if (world.current)
      world.current.style.transform = `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.scale})`;
  }, []);

  const stop = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    target.current = current.current;
  }, []);

  const move = useCallback(
    (update: TreeCamera | ((camera: TreeCamera) => TreeCamera)) => {
      stop();
      const next = typeof update === "function" ? update(current.current) : update;
      target.current = next;
      paint(next);
      setScale(next.scale);
    },
    [paint, stop],
  );

  const zoom = useCallback(
    (factor: number, anchor: { x: number; y: number }) => {
      // Start from the visible camera when the cursor moves; retain the accumulated target scale.
      const nextScale = zoomTree(target.current, factor, anchor).scale;
      target.current = zoomTree(current.current, nextScale / current.current.scale, anchor);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        move(target.current);
        return;
      }
      if (frame.current !== null) return;
      let lastTime = performance.now();
      const tick = (time: number) => {
        const amount = 1 - Math.exp(-Math.min(64, time - lastTime) / 55);
        lastTime = time;
        const from = current.current;
        const to = target.current;
        const done =
          Math.abs(to.scale - from.scale) < 0.0002 && Math.abs(to.x - from.x) < 0.1 && Math.abs(to.y - from.y) < 0.1;
        paint(
          done
            ? to
            : {
                x: from.x + (to.x - from.x) * amount,
                y: from.y + (to.y - from.y) * amount,
                scale: from.scale + (to.scale - from.scale) * amount,
              },
        );
        if (done) {
          frame.current = null;
          setScale(to.scale);
        } else frame.current = requestAnimationFrame(tick);
      };
      frame.current = requestAnimationFrame(tick);
    },
    [move, paint],
  );

  useEffect(() => stop, [stop]);
  return { world, scale, move, zoom, stop };
}
