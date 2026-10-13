"use client";

import { AccountGate, useAccount } from "@/components/AccountProvider";
import RestaurantForm from "@/app/RestaurantForm";
import { useState, useEffect, useCallback } from "react";
import { Restaurant } from "@/types/restaurant";
import RestaurantCards from "@/components/RestaurantCards";
import styles from "@/styles/RestaurantsList.module.css";

type ExternalRestaurant = {
  id: string;
  name: string;
  location: string;
};

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

  // Store external restaurant data from Geoapify
  const [externalRestaurants, setExternalRestaurants] = useState<ExternalRestaurant[]>([]);
  const [externalLoading, setExternalLoading] = useState(false);
  const [externalError, setExternalError] = useState("");

  // Fetch the logged-in user's wishlist
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

  // Fetch real restaurants from Geoapify
  async function fetchExternalRestaurants() {
    setExternalLoading(true);
    setExternalError("");

    try {
      const response = await fetch("/api/external-restaurants");

      if (!response.ok) {
        throw new Error("Unable to retrieve external restaurants");
      }

      const data: ExternalRestaurant[] = await response.json();
      setExternalRestaurants(data);
    } catch (error) {
      console.error(error);
      setExternalError("Unable to load restaurant suggestions.");
    } finally {
      setExternalLoading(false);
    }
  }

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

      {/* Geoapify restaurant discovery section */}
      <section>
        <h2>Discover Restaurants</h2>
        <p>Explore real restaurants in San Luis Obispo.</p>

        <button type="button" onClick={fetchExternalRestaurants} disabled={externalLoading}>
          {externalLoading ? "Loading..." : "Find Restaurants"}
        </button>

        {externalError && <p role="alert">{externalError}</p>}

        <ul>
          {externalRestaurants.map((restaurant) => (
            <li key={restaurant.id}>
              <strong>{restaurant.name}</strong>
              <p>{restaurant.location}</p>
            </li>
          ))}
        </ul>

        {externalRestaurants.length > 0 && (
          <p>Restaurant information provided by Geoapify. © OpenStreetMap contributors.</p>
        )}
      </section>
    </main>
  );
}
