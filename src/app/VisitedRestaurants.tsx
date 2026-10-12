"use client";

import { useAccount } from "@/components/AccountProvider";
import RestaurantCards from "@/components/RestaurantCards";
import type { Restaurant } from "@/types/restaurant";
import { useEffect, useState } from "react";
import styles from "./VisitedRestaurants.module.css";
import RestaurantForm from "./RestaurantForm";

export default function VisitedRestaurants() {
  const { refresh } = useAccount();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRestaurants() {
      try {
        const response = await fetch("/api/restaurants");

        if (response.status === 401) {
          await refresh();
          return;
        }
        if (!response.ok) {
          throw new Error("Unable to load restaurants.");
        }

        const data: Restaurant[] = await response.json();
        setRestaurants(data);
      } catch {
        setError("We could not load your restaurants. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    loadRestaurants();
  }, [refresh]);

  const visitedRestaurants = restaurants.filter((restaurant) => restaurant.status === "visited");

  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <h1>Visited restaurants</h1>
      </header>
      {!isLoading && !error && (
        <RestaurantForm
          onRestaurantAdded={(restaurant) => {
            setRestaurants((prev) => [...prev, restaurant]);
          }}
        />
      )}

      {isLoading ? (
        <p className={styles.message} role="status">
          Loading your visited restaurants…
        </p>
      ) : error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : visitedRestaurants.length ? (
        <section className={styles.grid} aria-label="Visited restaurants">
          {visitedRestaurants.map((restaurant) => (
            <RestaurantCards
              key={restaurant.id}
              restaurant={restaurant}
              onRatingChange={async (rating) => {
                const response = await fetch(`/api/restaurants/${restaurant.id}/rating`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ rating }),
                });
                if (response.status === 401) {
                  await refresh();
                  return;
                }
                if (!response.ok) throw new Error("Unable to update rating");
                const updated: Restaurant = await response.json();
                setRestaurants((previous) => previous.map((item) => (item.id === updated.id ? updated : item)));
              }}
              onRestaurantChanged={(updated) =>
                setRestaurants((previous) =>
                  previous.flatMap((item) => (item.id === restaurant.id ? (updated ? [updated] : []) : [item])),
                )
              }
            />
          ))}
        </section>
      ) : (
        <p className={styles.empty}>You have not marked any restaurants as visited yet.</p>
      )}
    </main>
  );
}
