"use client";

import { AccountGate, useAccount } from "@/components/AccountProvider";
import RestaurantForm from "@/app/RestaurantForm";
import { useState, useEffect, useCallback } from "react";
import { Restaurant } from "@/types/restaurant";
import RestaurantCards from "@/components/RestaurantCards";
import styles from "@/styles/RestaurantsList.module.css";

export default function WishlistPage() {
  return (
    <AccountGate>
      <MyWishlist />
    </AccountGate>
  );
}

function MyWishlist() {
  const { refresh } = useAccount();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  const fetchRestaurants = useCallback(async () => {
    setStatus("loading");

    try {
      const response = await fetch("/api/restaurants");
      if (response.status === 401) {
        await refresh();
        return;
      }
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data: Restaurant[] = await response.json();
      setRestaurants(data.filter((restaurant) => restaurant.status === "want-to-visit"));
      setStatus("loaded");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }, [refresh]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <h1>Want to visit</h1>
      </header>
      {status === "loaded" && (
        <RestaurantForm
          status="want-to-visit"
          onRestaurantAdded={(restaurant) => setRestaurants((previous) => [...previous, restaurant])}
        />
      )}
      {status === "loading" ? (
        <p className={styles.message} role="status">
          Loading your wishlist…
        </p>
      ) : status === "error" ? (
        <p className={styles.error} role="alert">
          We could not load your wishlist. Please try again later.
        </p>
      ) : restaurants.length === 0 ? (
        <p className={styles.empty}>You have not added any restaurants to your wishlist yet.</p>
      ) : (
        <ul className={styles.grid} aria-label="Restaurants on your wishlist">
          {restaurants.map((restaurant) => (
            <li key={restaurant.id}>
              <RestaurantCards
                restaurant={restaurant}
                onRestaurantChanged={() =>
                  setRestaurants((previous) => previous.filter((item) => item.id !== restaurant.id))
                }
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
