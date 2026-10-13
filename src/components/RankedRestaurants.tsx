"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount } from "./AccountProvider";
import type { Restaurant } from "@/types/restaurant";
import styles from "@/styles/Home.module.css";

const pageSize = 10;

export default function RankedRestaurants() {
  const { refresh } = useAccount();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRestaurants() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/restaurants", { cache: "no-store", signal: controller.signal });
        if (response.status === 401) {
          await refresh();
          return;
        }
        if (!response.ok) throw new Error("Unable to load restaurants");
        const data: Restaurant[] = await response.json();

        // Keep unrated entries last and break rating ties by name, then ID.
        data.sort(
          (a, b) => (b.rating ?? -1) - (a.rating ?? -1) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
        );
        if (!controller.signal.aborted) {
          setRestaurants(data);
          setVisibleCount(pageSize);
        }
      } catch {
        if (!controller.signal.aborted) setError("We could not load your restaurants. Please try again.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadRestaurants();
    return () => controller.abort();
  }, [refresh, attempt]);

  return (
    <section className={styles.ranking} aria-labelledby="ranked-restaurants-heading">
      <header>
        <h2 id="ranked-restaurants-heading">Your Restaurants</h2>
      </header>
      {loading ? (
        <p role="status">Loading your restaurants…</p>
      ) : error ? (
        <>
          <p role="alert">{error}</p>
          <button className={styles.primaryLink} onClick={() => setAttempt((previous) => previous + 1)}>
            Try again
          </button>
        </>
      ) : restaurants.length === 0 ? (
        <p>
          Your journal is ready for its first restaurant. <Link href="/visited">Add a visited restaurant →</Link>
        </p>
      ) : (
        <>
          <ol className={styles.rankedList}>
            {restaurants.slice(0, visibleCount).map((restaurant, index) => (
              <li className={styles.rankedRestaurant} key={restaurant.id}>
                <span className={styles.rank} aria-hidden="true">
                  {index + 1}
                </span>
                <div className={styles.restaurantDetails}>
                  <h3>{restaurant.name}</h3>
                  <p>
                    {restaurant.cuisine} · {restaurant.location}
                  </p>
                  <span className={styles.restaurantStatus}>
                    {restaurant.status === "visited" ? "Visited" : "Want to visit"}
                  </span>
                </div>
                <span
                  className={styles.rating}
                  aria-label={restaurant.rating == null ? "Not rated" : `${restaurant.rating} out of 5 stars`}
                >
                  {restaurant.rating == null ? "Not rated" : `★ ${restaurant.rating.toFixed(1)}`}
                </span>
              </li>
            ))}
          </ol>
          <div className={styles.pagination}>
            <p role="status">
              Showing {Math.min(visibleCount, restaurants.length)} of {restaurants.length} restaurants
            </p>
            {visibleCount < restaurants.length && (
              <button className={styles.primaryLink} onClick={() => setVisibleCount((count) => count + pageSize)}>
                Load more
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
