"use client";

import RestaurantCards from "@/components/RestaurantCards";
import type { Restaurant } from "@/types/restaurant";
import { useEffect, useState } from "react";
import styles from "./VisitedRestaurants.module.css";
import RestaurantForm from "./RestaurantForm";

export default function VisitedRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRestaurants() {
      try {
        const response = await fetch("/api/restaurants");

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
  }, []);

  const visitedRestaurants = restaurants.filter((restaurant) => restaurant.status === "visited");

  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Your dining journal</p>
        <h1>Visited restaurants</h1>
        <p className={styles.description}>A collection of the places you have already enjoyed.</p>
      </header>
      <RestaurantForm
        onRestaurantAdded={(restaurant) => {
          setRestaurants((prev) => [...prev, restaurant]);
        }}
      />

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
            <RestaurantCards key={restaurant.id} restaurant={restaurant} />
          ))}
        </section>
      ) : (
        <p className={styles.empty}>You have not marked any restaurants as visited yet.</p>
      )}
    </main>
  );
}
