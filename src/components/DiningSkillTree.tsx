"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  getSkillProgress,
  SKILL_NODES,
  skillRequirement,
  isPathOpen,
  TREE_SIZE,
  type SkillNode,
} from "@/data/skillTree";
import { useTreeCamera } from "@/hooks/useTreeCamera";
import type { Restaurant } from "@/types/restaurant";
import styles from "@/styles/SkillTree.module.css";

const BRANCHES = {
  origin: { name: "Your journey", color: "#f4b477" },
  explorer: { name: "World explorer", color: "#86bdbc" },
  regular: { name: "Seasoned diner", color: "#e4bd72" },
  italian: { name: "Italian trail", color: "#a7ba82" },
  japanese: { name: "Japanese trail", color: "#d499a6" },
};

function NodeIcon({ node }: { node: SkillNode }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {node.reward ? (
        <>
          <rect x="5" y="13" width="22" height="14" rx="2" />
          <path d="M3 9h26v6H3zM16 9v18M16 9C5 9 7 1 12 4l4 5Zm0 0c11 0 9-8 4-5l-4 5Z" />
        </>
      ) : node.branch === "explorer" ? (
        <>
          <circle cx="16" cy="16" r="11" />
          <ellipse cx="16" cy="16" rx="5" ry="11" />
          <path d="M5 16h22M7 10h18M7 22h18" />
        </>
      ) : node.branch === "regular" ? (
        <path d="m16 4 3.7 7.5 8.3 1.2-6 5.8 1.4 8.2-7.4-3.9-7.4 3.9L10 18.5l-6-5.8 8.3-1.2Z" />
      ) : node.branch === "italian" ? (
        <>
          <path d="m16 4 12 23H4L16 4ZM6 23h20" />
          <circle cx="15" cy="15" r="1.5" />
          <circle cx="19" cy="20" r="1.5" />
          <path d="m12 19-1 1" />
        </>
      ) : node.branch === "japanese" ? (
        <>
          <path d="M5 16h22a11 11 0 0 1-22 0ZM11 28h10M19 3l-6 13M26 4 16 16M5 12h22" />
        </>
      ) : (
        <>
          <path d="M7 5v8a4 4 0 0 0 8 0V5M11 5v22M24 5c-4 3-5 7-5 12h5M24 5v22" />
        </>
      )}
    </svg>
  );
}

export default function DiningSkillTree() {
  const viewport = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointer: number; x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const { world, scale: cameraScale, move: setCamera, zoom: animateZoom, stop: stopCamera } = useTreeCamera();
  const [selectedId, setSelectedId] = useState("origin");
  const [restaurants, setRestaurants] = useState<Restaurant[] | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const previousUnlocks = useRef<Set<string> | null>(null);

  const centerTree = useCallback(
    (fit = false) => {
      const element = viewport.current;
      if (!element) return;
      const scale = fit
        ? Math.max(0.1, Math.min(element.clientWidth / TREE_SIZE.width, element.clientHeight / TREE_SIZE.height))
        : 0.65;
      setCamera({
        x: element.clientWidth / 2 - TREE_SIZE.originX * scale,
        y: element.clientHeight / 2 - TREE_SIZE.originY * scale,
        scale,
      });
    },
    [setCamera],
  );

  useEffect(() => {
    const controller = new AbortController();
    setError("");
    setRefreshing(true);
    async function load() {
      try {
        const response = await fetch("/api/passport", { cache: "no-store", signal: controller.signal });
        if (!response.ok)
          throw new Error(
            response.status === 401
              ? "Please log in again to load your tree."
              : "Unable to load your skill tree. Please try again.",
          );
        const data: { restaurants: Restaurant[] } = await response.json();
        if (controller.signal.aborted) return;
        const { unlocked } = getSkillProgress(data.restaurants);
        const newlyUnlocked =
          previousUnlocks.current &&
          SKILL_NODES.filter((node) => unlocked.has(node.id) && !previousUnlocks.current!.has(node.id));
        setAnnouncement(
          newlyUnlocked?.length
            ? `New unlocks: ${newlyUnlocked.map((node) => node.name).join(", ")}. New paths are open.`
            : "Your skill tree is up to date.",
        );
        previousUnlocks.current = unlocked;
        setRestaurants(data.restaurants);
      } catch (error) {
        if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Unable to load your tree.");
      } finally {
        if (!controller.signal.aborted) setRefreshing(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [attempt]);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    centerTree();
    const observer = new ResizeObserver(() => centerTree());
    observer.observe(element);
    function wheel(event: WheelEvent) {
      event.preventDefault();
      const rect = element!.getBoundingClientRect();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element!.clientHeight : 1);
      animateZoom(Math.exp(-Math.max(-160, Math.min(160, delta)) * 0.005), {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
    element.addEventListener("wheel", wheel, { passive: false });
    return () => {
      observer.disconnect();
      element.removeEventListener("wheel", wheel);
    };
  }, [centerTree, animateZoom]);

  const { metrics, unlocked } = getSkillProgress(restaurants ?? []);
  const selected = SKILL_NODES.find((node) => node.id === selectedId)!;
  const stateOf = (node: SkillNode) =>
    unlocked.has(node.id) ? "unlocked" : isPathOpen(node, unlocked) ? "available" : "locked";
  const selectedState = stateOf(selected);
  const parents = SKILL_NODES.filter((node) => selected.parents?.includes(node.id) && !unlocked.has(node.id));
  const zoom = (factor: number) => {
    const element = viewport.current;
    if (element) animateZoom(factor, { x: element.clientWidth / 2, y: element.clientHeight / 2 });
  };
  const stopDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  return (
    <section className={styles.section} aria-labelledby="skill-tree-title">
      <header className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>Every meal opens a new path</span>
          <h2 id="skill-tree-title">Your dining skill tree</h2>
        </div>
        <span className={styles.counter}>
          {restaurants ? `${unlocked.size} / ${SKILL_NODES.length} unlocked` : "Loading…"}
        </span>
      </header>
      <p className={styles.intro}>
        Follow a fork, take a detour, or join two paths. Every saved visit brings new skills and rewards closer.
      </p>
      <div className={styles.layout}>
        <div className={styles.mapPanel}>
          <div className={styles.toolbar} aria-label="Tree controls">
            <button type="button" onClick={() => zoom(1 / 1.2)} aria-label="Zoom out" disabled={cameraScale <= 0.1}>
              −
            </button>
            <output aria-label="Zoom level">{Math.round(cameraScale * 100)}%</output>
            <button type="button" onClick={() => zoom(1.2)} aria-label="Zoom in" disabled={cameraScale >= 2.2}>
              +
            </button>
            <button type="button" onClick={() => centerTree(true)}>
              Fit
            </button>
            <button type="button" onClick={() => centerTree()}>
              Center
            </button>
          </div>
          <div
            ref={viewport}
            className={`${styles.viewport} ${dragging ? styles.dragging : ""}`}
            tabIndex={0}
            role="region"
            aria-label="Dining skill tree map"
            aria-describedby="tree-controls-help"
            onPointerDown={(event) => {
              if (event.button !== 0 || (event.target as Element).closest("button")) return;
              stopCamera();
              drag.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY };
              event.currentTarget.setPointerCapture(event.pointerId);
              setDragging(true);
            }}
            onPointerMove={(event) => {
              if (!drag.current || drag.current.pointer !== event.pointerId) return;
              const dx = event.clientX - drag.current.x;
              const dy = event.clientY - drag.current.y;
              drag.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY };
              setCamera((current) => ({ ...current, x: current.x + dx, y: current.y + dy }));
            }}
            onPointerUp={stopDrag}
            onPointerCancel={stopDrag}
            onLostPointerCapture={stopDrag}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return;
              const movement: Record<string, [number, number]> = {
                ArrowLeft: [60, 0],
                ArrowRight: [-60, 0],
                ArrowUp: [0, 60],
                ArrowDown: [0, -60],
              };
              if (movement[event.key]) {
                event.preventDefault();
                const [x, y] = movement[event.key];
                setCamera((current) => ({ ...current, x: current.x + x, y: current.y + y }));
              } else if (["+", "=", "-", "Home"].includes(event.key)) {
                event.preventDefault();
                if (event.key === "Home") centerTree();
                else zoom(event.key === "-" ? 1 / 1.2 : 1.2);
              }
            }}
          >
            <div ref={world} className={styles.world}>
              <svg
                className={styles.connections}
                width={TREE_SIZE.width}
                height={TREE_SIZE.height}
                viewBox={`0 0 ${TREE_SIZE.width} ${TREE_SIZE.height}`}
                aria-hidden="true"
              >
                <circle cx="1100" cy="900" r="300" className={styles.orbit} />
                <circle cx="1100" cy="900" r="650" className={styles.orbit} />
                {SKILL_NODES.flatMap((node) =>
                  (node.parents ?? []).map((parentId) => {
                    const source = SKILL_NODES.find((candidate) => candidate.id === parentId)!;
                    return (
                      <path
                        key={`${parentId}-${node.id}`}
                        d={`M ${source.x} ${source.y} Q ${source.x} ${node.y} ${node.x} ${node.y}`}
                        className={`${styles.connection} ${styles[unlocked.has(node.id) ? "unlocked" : unlocked.has(parentId) ? "available" : "locked"]}`}
                        style={{ color: BRANCHES[node.branch].color }}
                      />
                    );
                  }),
                )}
              </svg>
              <span className={`${styles.branchLabel} ${styles.northWest}`}>World explorer</span>
              <span className={`${styles.branchLabel} ${styles.northEast}`}>Seasoned diner</span>
              <span className={`${styles.branchLabel} ${styles.southWest}`}>Italian trail</span>
              <span className={`${styles.branchLabel} ${styles.southEast}`}>Japanese trail</span>
              {SKILL_NODES.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  className={`${styles.node} ${styles[stateOf(node)]} ${node.reward ? styles.rewardNode : ""} ${selectedId === node.id ? styles.selected : ""}`}
                  style={{ left: node.x, top: node.y, color: BRANCHES[node.branch].color }}
                  disabled={!restaurants}
                  aria-label={`${node.name}. ${stateOf(node) === "available" ? "Path open" : stateOf(node)}. ${skillRequirement(node)}${node.reward ? " Mock reward." : ""}`}
                  aria-pressed={selectedId === node.id}
                  onClick={() => setSelectedId(node.id)}
                  onFocus={(event) => {
                    if (event.currentTarget.matches(":focus-visible") && viewport.current) {
                      const { clientWidth, clientHeight } = viewport.current;
                      setCamera((current) => ({
                        ...current,
                        x: clientWidth / 2 - node.x * current.scale,
                        y: clientHeight / 2 - node.y * current.scale,
                      }));
                      setSelectedId(node.id);
                    }
                  }}
                >
                  <span className={styles.nodeFace}>
                    <NodeIcon node={node} />
                    {unlocked.has(node.id) && (
                      <span className={styles.nodeCheck} aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </span>
                  <span className={styles.nodeName}>{node.name}</span>
                  {node.reward && <span className={styles.rewardLabel}>REWARD</span>}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.mapFooter}>
            <p id="tree-controls-help">Drag to explore · Scroll to zoom · Arrow keys to pan</p>
            <div className={styles.legend}>
              <span>● Unlocked</span>
              <span>◉ Path open</span>
              <span>○ Locked</span>
            </div>
          </div>
        </div>
        <aside className={styles.details} aria-label="Selected skill">
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
          {!restaurants ? (
            <p role="status">{error ? "Your progress is unavailable." : "Loading your dining journey…"}</p>
          ) : (
            <>
              <span className={styles.eyebrow}>{BRANCHES[selected.branch].name}</span>
              <div
                className={`${styles.detailIcon} ${styles[selectedState]}`}
                style={{ color: BRANCHES[selected.branch].color }}
              >
                <NodeIcon node={selected} />
              </div>
              <h3>{selected.name}</h3>
              <span className={styles.status}>
                {selectedState === "unlocked"
                  ? "✓ Unlocked"
                  : selectedState === "available"
                    ? "Path open · keep exploring"
                    : "Path locked"}
              </span>
              <p>{skillRequirement(selected)}</p>
              <progress
                value={Math.min(metrics[selected.metric], selected.target)}
                max={selected.target}
                aria-label={`${selected.name} progress`}
              />
              <span className={styles.progressText}>
                {Math.min(metrics[selected.metric], selected.target)} / {selected.target} completed
              </span>
              {selectedState === "locked" && parents.length > 0 && (
                <div className={styles.prerequisite}>
                  <p>
                    Complete {parents.length > 1 ? "both connected skills" : "the connected skill"} to open this path:
                  </p>
                  {parents.map((parent) => (
                    <button
                      key={parent.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(parent.id);
                        if (viewport.current)
                          setCamera((current) => ({
                            ...current,
                            x: viewport.current!.clientWidth / 2 - parent.x * current.scale,
                            y: viewport.current!.clientHeight / 2 - parent.y * current.scale,
                          }));
                      }}
                    >
                      {parent.name}
                    </button>
                  ))}
                </div>
              )}
              {selected.reward ? (
                <div className={`${styles.coupon} ${selectedState === "unlocked" ? styles.couponEarned : ""}`}>
                  <span className={styles.eyebrow}>
                    {selectedState === "unlocked" ? "Reward unlocked" : "At the end of this path"}
                  </span>
                  <strong>{selected.reward.title}</strong>
                  <span>{selected.reward.restaurant}</span>
                  {selectedState === "unlocked" && <code>{selected.reward.code}</code>}
                  <small>Mock reward · Fictional restaurant. Not redeemable.</small>
                </div>
              ) : (
                <p className={styles.prerequisite}>
                  {selectedState === "unlocked"
                    ? "Connected paths are now open. Choose your next skill on the map."
                    : "This skill unlocks automatically when you meet its requirement and complete its connected prerequisites."}
                </p>
              )}
              <Link className={styles.visitLink} href="/visited">
                View your restaurants →
              </Link>
            </>
          )}
          <button
            type="button"
            className={styles.refresh}
            disabled={refreshing}
            onClick={() => setAttempt((value) => value + 1)}
          >
            {refreshing ? "Checking visits…" : error ? "Try again" : "Refresh progress"}
          </button>
        </aside>
      </div>
      <p className={styles.announcement} role="status">
        {announcement}
      </p>
    </section>
  );
}
