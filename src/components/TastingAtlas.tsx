"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useAccount } from "./AccountProvider";
import { ACHIEVEMENTS, Achievement } from "@/data/achievements";
import AtlasIcon from "./AtlasIcon";
import styles from "./TastingAtlas.module.css";

type AtlasData = { earned: string[]; progress: Record<string, number> };
const AtlasContext = createContext<{ data: AtlasData; error: string; loading: boolean; refresh: () => void }>({
  data: { earned: [], progress: {} },
  error: "",
  loading: true,
  refresh: () => {},
});
export function TastingAtlasProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAccount();
  const [data, setData] = useState<AtlasData>({ earned: [], progress: {} });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<Achievement[]>([]);
  const seenInSession = useRef(new Map<string, string[]>());
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((n) => n + 1), []);
  useEffect(() => {
    window.addEventListener("dining-updated", refresh);
    return () => window.removeEventListener("dining-updated", refresh);
  }, [refresh]);
  useEffect(() => {
    setQueue([]);
    setData({ earned: [], progress: {} });
  }, [user?.username]);
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    fetch("/api/achievements", { method: "POST", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load your Tasting Atlas. Try again.");
        return response.json() as Promise<AtlasData>;
      })
      .then((next) => {
        if (controller.signal.aborted) return;
        setData(next);
        setError("");
        // A per-account receipt avoids replaying old celebrations on navigation.
        const key = `DiningDiary-atlas-seen:${user.username}`;
        let seen = seenInSession.current.get(key) ?? next.earned;
        try {
          const stored: unknown = JSON.parse(window.localStorage.getItem(key) || "null");
          if (Array.isArray(stored)) seen = stored;
          window.localStorage.setItem(key, JSON.stringify(next.earned));
        } catch {
          /* Keep celebrating within this session if storage is unavailable. */
        }
        seenInSession.current.set(key, next.earned);
        setQueue((items) => [
          ...items,
          ...ACHIEVEMENTS.filter(
            (node) =>
              next.earned.includes(node.id) && !seen.includes(node.id) && !items.some((item) => item.id === node.id),
          ),
        ]);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [user, revision]);
  const active = queue[0];
  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => setQueue((items) => items.slice(1)), 4500);
    return () => clearTimeout(timer);
  }, [active]);
  return (
    <AtlasContext.Provider value={{ data, error, loading, refresh }}>
      {children}
      <div className={styles.notifications} aria-live="polite" aria-atomic="true">
        {active && (
          <div key={active.id} className={styles.toast}>
            <div className={styles.toastInner}>
              <Link
                className={styles.toastLink}
                href={`/login#atlas=${encodeURIComponent(active.id)}`}
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-tasting-atlas", { detail: active.id }));
                  setQueue((items) => items.slice(1));
                }}
              >
                <span className={styles.toastIcon}>
                  <AtlasIcon name={active.icon} regular={active.metric === "cuisine" && active.target === 3} />
                </span>
                <div>
                  <small>{active.reward ? "REWARD MILESTONE REACHED" : "A NEW DISCOVERY"}</small>
                  <strong>{active.title}</strong>
                  <span>View in your atlas →</span>
                </div>
              </Link>
              <button aria-label="Dismiss achievement" onClick={() => setQueue((items) => items.slice(1))}>
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </AtlasContext.Provider>
  );
}

export default function TastingAtlas() {
  const { data, error, loading, refresh } = useContext(AtlasContext);
  const [open, setOpen] = useState(false);
  const [initialNode, setInitialNode] = useState(ACHIEVEMENTS[0].id);
  useEffect(() => {
    const openFromLink = (event?: Event) => {
      const id =
        event instanceof CustomEvent ? event.detail : new URLSearchParams(window.location.hash.slice(1)).get("atlas");
      if (typeof id !== "string") return;
      setInitialNode(ACHIEVEMENTS.find((node) => node.id === id)?.id || ACHIEVEMENTS[0].id);
      setOpen(true);
    };
    openFromLink();
    window.addEventListener("hashchange", openFromLink);
    window.addEventListener("open-tasting-atlas", openFromLink);
    return () => {
      window.removeEventListener("hashchange", openFromLink);
      window.removeEventListener("open-tasting-atlas", openFromLink);
    };
  }, []);
  const close = () => {
    setOpen(false);
    if (window.location.hash.startsWith("#atlas=")) {
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    }
  };
  return (
    <>
      <button className={styles.launch} onClick={() => setOpen(true)}>
        Your Atlas
      </button>
      {open &&
        createPortal(
          <AtlasModal
            data={data}
            error={error}
            loading={loading}
            refresh={refresh}
            initialNode={initialNode}
            close={close}
          />,
          document.body,
        )}
    </>
  );
}

function AtlasModal({
  data,
  error,
  loading,
  refresh,
  initialNode,
  close,
}: {
  data: AtlasData;
  error: string;
  loading: boolean;
  refresh: () => void;
  initialNode: string;
  close: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(
    () => ACHIEVEMENTS.find((node) => node.id === initialNode) || ACHIEVEMENTS[0],
  );
  const [detailNode, setDetailNode] = useState(selected);
  const [detailLeaving, setDetailLeaving] = useState(false);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    setSelected(ACHIEVEMENTS.find((node) => node.id === initialNode) || ACHIEVEMENTS[0]);
  }, [initialNode]);
  useEffect(() => {
    if (selected.id === detailNode.id) {
      setDetailLeaving(false);
      return;
    }
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setDetailNode(selected);
      return;
    }
    setDetailLeaving(true);
    const timer = window.setTimeout(() => {
      setDetailNode(selected);
      setDetailLeaving(false);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [selected, detailNode]);
  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(close, window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? 0 : 220);
    return () => window.clearTimeout(timer);
  }, [closing, close]);
  const [view, setView] = useState({ x: 0, y: 0, scale: 0.5 });
  const current = useRef(view);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const [dragging, setDragging] = useState(false);
  const update = useCallback((next: typeof view) => {
    current.current = next;
    setView(next);
  }, []);
  const fit = useCallback(() => {
    const rect = viewport.current?.getBoundingClientRect();
    if (rect)
      update({
        x: rect.width / 2,
        y: rect.height / 2,
        scale: Math.max(0.18, Math.min(rect.width / 1660, rect.height / 1660)),
      });
  }, [update]);
  const zoom = useCallback(
    (factor: number, x?: number, y?: number) => {
      const rect = viewport.current?.getBoundingClientRect();
      if (!rect) return;
      const old = current.current;
      const scale = Math.max(0.18, Math.min(2, old.scale * factor));
      const px = x ?? rect.width / 2,
        py = y ?? rect.height / 2;
      update({ scale, x: px - ((px - old.x) * scale) / old.scale, y: py - ((py - old.y) * scale) / old.scale });
    },
    [update],
  );
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    fit();
    const element = viewport.current!;
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      zoom(Math.exp(-event.deltaY * 0.002), event.clientX - rect.left, event.clientY - rect.top);
    };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => {
      observer.disconnect();
      element.removeEventListener("wheel", wheel);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [fit, zoom]);
  const unlocked = data.earned.includes(detailNode.id);
  const accessible = !detailNode.parents.length || detailNode.parents.some((id) => data.earned.includes(id));
  return (
    <dialog
      ref={dialog}
      className={`${styles.modal} ${closing ? styles.closing : ""}`}
      onCancel={(event) => {
        event.preventDefault();
        setClosing(true);
      }}
      aria-labelledby="atlas-title"
    >
      <header className={styles.header}>
        <div>
          <h2 id="atlas-title">The Tasting Atlas</h2>
        </div>
        <button className={styles.close} onClick={() => setClosing(true)} aria-label="Close Tasting Atlas">
          ×
        </button>
      </header>
      <div className={styles.meta}>
        <span>
          <b>{data.earned.length}</b> / {ACHIEVEMENTS.length} discoveries
        </span>
        <span>
          ✦ {data.earned.filter((id) => ACHIEVEMENTS.find((node) => node.id === id)?.reward).length} / 6 reward
          destinations
        </span>
        <span className={styles.legend}>
          ● Earned <span>◇ Undiscovered</span>
        </span>
      </div>
      {error && (
        <div role="alert" className={styles.error}>
          {error} <button onClick={refresh}>Retry</button>
        </div>
      )}
      {loading && (
        <div role="status" className={styles.loading}>
          Updating your discoveries…
        </div>
      )}
      <div className={styles.body}>
        <div className={styles.mapArea}>
          <div
            ref={viewport}
            className={styles.viewport}
            tabIndex={0}
            aria-label="Achievement map. Drag to pan, scroll or pinch to zoom. Use arrow keys to pan and plus or minus to zoom."
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return;
              const shifts: Record<string, [number, number]> = {
                ArrowLeft: [60, 0],
                ArrowRight: [-60, 0],
                ArrowUp: [0, 60],
                ArrowDown: [0, -60],
              };
              if (shifts[event.key]) {
                event.preventDefault();
                const [x, y] = shifts[event.key];
                update({ ...current.current, x: current.current.x + x, y: current.current.y + y });
              }
              if (["+", "=", "-"].includes(event.key)) {
                event.preventDefault();
                zoom(event.key === "-" ? 0.8 : 1.25);
              }
            }}
            onPointerDown={(event) => {
              if ((event.target as Element).closest("button")) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
              setDragging(true);
            }}
            onPointerMove={(event) => {
              const old = pointers.current.get(event.pointerId);
              if (!old) return;
              const next = { x: event.clientX, y: event.clientY };
              const other = Array.from(pointers.current.entries()).find(([id]) => id !== event.pointerId)?.[1];
              if (other) {
                const before = Math.hypot(old.x - other.x, old.y - other.y),
                  after = Math.hypot(next.x - other.x, next.y - other.y);
                const rect = event.currentTarget.getBoundingClientRect();
                if (before > 0)
                  zoom(after / before, (next.x + other.x) / 2 - rect.left, (next.y + other.y) / 2 - rect.top);
              } else
                update({
                  ...current.current,
                  x: current.current.x + next.x - old.x,
                  y: current.current.y + next.y - old.y,
                });
              pointers.current.set(event.pointerId, next);
            }}
            onPointerUp={(event) => {
              pointers.current.delete(event.pointerId);
              setDragging(pointers.current.size > 0);
            }}
            onPointerCancel={(event) => {
              pointers.current.delete(event.pointerId);
              setDragging(pointers.current.size > 0);
            }}
          >
            <div
              className={`${styles.world} ${dragging ? styles.dragging : ""}`}
              style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
            >
              <svg className={styles.lines} viewBox="-820 -820 1640 1640" aria-hidden="true">
                {ACHIEVEMENTS.flatMap((node) =>
                  node.parents.map((parent) => {
                    const from = ACHIEVEMENTS.find((a) => a.id === parent)!;
                    return (
                      <path
                        key={`${parent}-${node.id}`}
                        d={`M ${from.x} ${from.y} C ${from.x + (node.x - from.x) * 0.2} ${from.y + (node.y - from.y) * 0.65}, ${from.x + (node.x - from.x) * 0.8} ${from.y + (node.y - from.y) * 0.2}, ${node.x} ${node.y}`}
                        className={
                          data.earned.includes(parent) && data.earned.includes(node.id)
                            ? styles.earnedLine
                            : styles.lockedLine
                        }
                      />
                    );
                  }),
                )}
              </svg>
              {ACHIEVEMENTS.map((node) => (
                <button
                  key={node.id}
                  className={`${styles.node} ${data.earned.includes(node.id) ? styles.earned : ""} ${node.reward ? styles.reward : ""} ${selected.id === node.id ? styles.selected : ""}`}
                  style={{ left: node.x, top: node.y }}
                  onClick={() => setSelected(node)}
                  onFocus={(event) => {
                    setSelected(node);
                    if (!dragging && event.currentTarget.matches(":focus-visible")) {
                      const rect = viewport.current?.getBoundingClientRect();
                      if (rect)
                        update({
                          ...current.current,
                          x: rect.width / 2 - node.x * current.current.scale,
                          y: rect.height / 2 - node.y * current.current.scale,
                        });
                    }
                  }}
                  aria-label={`${node.title}. ${data.earned.includes(node.id) ? "Earned" : "Locked"}`}
                  aria-pressed={selected.id === node.id}
                >
                  <span>
                    <AtlasIcon name={node.icon} regular={node.metric === "cuisine" && node.target === 3} />
                  </span>
                  <small>{node.reward ? node.trail : node.title}</small>
                  {data.earned.includes(node.id) && <b className={styles.check}>✓</b>}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.controls}>
            <button onClick={() => zoom(0.8)} aria-label="Zoom out">
              −
            </button>
            <span>{Math.round(view.scale * 100)}%</span>
            <button onClick={() => zoom(1.25)} aria-label="Zoom in">
              +
            </button>
            <button onClick={fit}>Fit map</button>
          </div>
          <p className={styles.help}>Drag to explore · Scroll or pinch to zoom</p>
        </div>
        <aside className={styles.detail} aria-live="polite">
          <div key={detailNode.id} className={`${styles.detailContent} ${detailLeaving ? styles.detailLeaving : ""}`}>
            <small>{detailNode.trail}</small>
            <div className={styles.detailIcon}>
              <AtlasIcon name={detailNode.icon} regular={detailNode.metric === "cuisine" && detailNode.target === 3} />
            </div>
            <span className={styles.badge}>
              {unlocked ? "DISCOVERED" : accessible ? "READY TO EXPLORE" : "UNEXPLORED"}
            </span>
            <h3>{detailNode.title}</h3>
            <p>{detailNode.description}</p>
            <progress
              max={detailNode.target}
              value={unlocked ? detailNode.target : Math.min(data.progress[detailNode.id] || 0, detailNode.target)}
            />
            <p className={styles.count}>
              {unlocked ? detailNode.target : Math.min(data.progress[detailNode.id] || 0, detailNode.target)} /{" "}
              {detailNode.target}
            </p>
            {detailNode.parents.length > 0 && (
              <div className={styles.routes}>
                <small>COMPLETE ANY ONE CONNECTING STOP</small>
                {detailNode.parents.map((id) => {
                  const parent = ACHIEVEMENTS.find((node) => node.id === id)!;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        setSelected(parent);
                        const rect = viewport.current?.getBoundingClientRect();
                        if (rect)
                          update({
                            ...current.current,
                            x: rect.width / 2 - parent.x * current.current.scale,
                            y: rect.height / 2 - parent.y * current.current.scale,
                          });
                      }}
                    >
                      {data.earned.includes(id) ? "✓" : "◇"} {parent.title} <span>↗</span>
                    </button>
                  );
                })}
              </div>
            )}
            {detailNode.reward && (
              <div className={styles.rewardCard}>
                <small>PARTNER REWARD PREVIEW</small>
                <h4>{detailNode.reward}</h4>
                <p>This preview is not a redeemable coupon.</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </dialog>
  );
}
