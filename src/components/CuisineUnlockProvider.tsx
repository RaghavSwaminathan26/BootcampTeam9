"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "@/components/AccountProvider";
import styles from "@/styles/Passport.module.css";

const UnlockContext = createContext<(cuisine: string) => void>(() => {});

export function CuisineUnlockProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAccount();
  const [unlocks, setUnlocks] = useState<string[]>([]);
  const notify = useCallback((cuisine: string) => setUnlocks((queue) => [...queue, cuisine]), []);
  const [leaving, setLeaving] = useState(false);
  const dismiss = useCallback(() => setLeaving(true), []);
  const cuisine = unlocks[0];

  // Keep celebrations across navigation, but never across account changes.
  useEffect(() => {
    setUnlocks([]);
    setLeaving(false);
  }, [user?.username]);
  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => {
      setUnlocks((queue) => queue.slice(1));
      setLeaving(false);
    }, 320);
    return () => window.clearTimeout(timer);
  }, [leaving]);
  useEffect(() => {
    if (!cuisine) return;
    const timer = window.setTimeout(dismiss, 8000);
    return () => window.clearTimeout(timer);
  }, [cuisine, dismiss]);

  return (
    <UnlockContext.Provider value={notify}>
      {children}
      <aside className={styles.toastRegion} aria-label="Cuisine achievements">
        <div role="status" aria-live="polite" aria-atomic="true">
          {cuisine && user && (
            <div key={cuisine} className={`${styles.toast} ${leaving ? styles.toastLeaving : ""}`}>
              <span className={styles.eyebrow}>New cuisine unlocked</span>
              <strong>{cuisine}</strong>
              <p>A new stamp in your dining passport.</p>
              <Link href="/login?passport=open">Open passport →</Link>
              <button type="button" onClick={dismiss} aria-label="Dismiss cuisine notification">
                ×
              </button>
            </div>
          )}
        </div>
      </aside>
    </UnlockContext.Provider>
  );
}

export function useCuisineUnlock() {
  return useContext(UnlockContext);
}
