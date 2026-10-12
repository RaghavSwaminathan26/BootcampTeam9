"use client";

import { useAccount } from "@/components/AccountProvider";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "@/styles/Home.module.css";

export default function Home() {
  const { user, loading } = useAccount();
  const [visitedCount, setVisitedCount] = useState<number | null>(null);
  const [wantToVisitCount, setWantToVisitCount] = useState<number | null>(null);
  const [isLoadingVisitedCount, setIsLoadingVisitedCount] = useState(true);
  const [isLoadingWantToVisitCount, setIsLoadingWantToVisitCount] = useState(true);
  const [visitedCountError, setVisitedCountError] = useState<string | null>(null);
  const [wantToVisitCountError, setWantToVisitCountError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    let active = true;
    setIsLoadingVisitedCount(true);
    setIsLoadingWantToVisitCount(true);
    setVisitedCountError(null);
    setWantToVisitCountError(null);
    async function loadCount(
      endpoint: string,
      setCount: (count: number) => void,
      setError: (error: string) => void,
      setIsLoading: (isLoading: boolean) => void,
      errorMessage: string,
    ) {
      try {
        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error("Unable to load restaurant count.");
        }

        const data: { count: number } = await response.json();
        if (active) setCount(data.count);
      } catch {
        if (active) setError(errorMessage);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadCount(
      "/api/restaurants/visited-count",
      setVisitedCount,
      setVisitedCountError,
      setIsLoadingVisitedCount,
      "We could not load your visited restaurant count. Please try again later.",
    );
    loadCount(
      "/api/restaurants/want-to-visit-count",
      setWantToVisitCount,
      setWantToVisitCountError,
      setIsLoadingWantToVisitCount,
      "We could not load your want-to-visit restaurant count. Please try again later.",
    );
    return () => {
      active = false;
    };
  }, [user, loading]);

  return (
    <main className={styles.homeMain}>
      <section className={styles.hero}>
        <h1>Home</h1>
      </section>
      <section className={styles.collections} aria-label="Your restaurant collections">
        <Link className={styles.collection} href="/visited">
          <div className={styles.cardTop}>
            <span className={styles.icon} aria-hidden="true">
              ⌖
            </span>
            <span className={styles.arrow} aria-hidden="true">
              ↗
            </span>
          </div>
          <h2>Visited restaurants</h2>
          {isLoadingVisitedCount ? (
            <p className={styles.collectionStatus} role="status">
              Loading your visited restaurant count…
            </p>
          ) : visitedCountError ? (
            <p className={styles.collectionError} role="alert">
              {visitedCountError}
            </p>
          ) : (
            <p className={styles.collectionStatus}>
              {visitedCount} {visitedCount === 1 ? "restaurant" : "restaurants"} visited
            </p>
          )}
        </Link>
        <Link className={styles.collection} href="/want-to-visit">
          <div className={styles.cardTop}>
            <span className={styles.icon} aria-hidden="true">
              ＋
            </span>
            <span className={styles.arrow} aria-hidden="true">
              ↗
            </span>
          </div>
          <h2>Want to visit</h2>
          {isLoadingWantToVisitCount ? (
            <p className={styles.collectionStatus} role="status">
              Loading your want-to-visit restaurant count…
            </p>
          ) : wantToVisitCountError ? (
            <p className={styles.collectionError} role="alert">
              {wantToVisitCountError}
            </p>
          ) : (
            <p className={styles.collectionStatus}>
              {wantToVisitCount} {wantToVisitCount === 1 ? "restaurant" : "restaurants"} to visit
            </p>
          )}
        </Link>
      </section>
    </main>
  );
}
