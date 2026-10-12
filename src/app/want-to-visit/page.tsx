"use client";

import { useState, useEffect } from "react";
import { Restaurant } from "@/types/restaurant";
import RestaurantCards from "@/components/RestaurantCards";
import styles from "@/styles/RestaurantsList.module.css";

//MyWishlist page
export default function MyWishlist() {
  //create state to allow for dynamic updates to restaurants list
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  //load status
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  //store external restaurant data from Geoapify
  const [externalRestaurants, setExternalRestaurants] = useState<{ id: string; name: string; location: string }[]>([]);

  const [externalLoading, setExternalLoading] = useState(false);
  const [externalError, setExternalError] = useState("");

  //fetches restaurants from the api/restaurants route
  async function fetch_restaurants() {
    setStatus("loading");

    try {
      const response = await fetch("/api/restaurants");
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      //get the data and filter for want-to-visit restaurants
      const data = await response.json();
      setRestaurants([]);
      data.forEach((restaurant: Restaurant) => {
        if (restaurant.status == "want-to-visit") {
          setRestaurants((prevRestaurants) => [...prevRestaurants, restaurant]);
        }
      });

      //finished loading
      setStatus("loaded");

      //handle errors
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }

  useEffect(() => {
    //fetch the restaurants when the component mounts
    fetch_restaurants();
  }, []);

  async function fetchExternalRestaurants() {
    setExternalLoading(true);
    setExternalError("");

    try {
      const response = await fetch("/api/external-restaurants");

      if (!response.ok) {
        throw new Error("Unable to retrieve external restaurants");
      }

      const data = await response.json();
      setExternalRestaurants(data);
    } catch (error) {
      console.error(error);
      setExternalError("Unable to load restaurant suggestions.");
    } finally {
      setExternalLoading(false);
    }
  }

  function RestaurantsList() {
    return (
      <ul className={styles.grid} aria-label="Restaurants on your wishlist">
        {restaurants.map((restaurant) => (
          <li key={restaurant.id}>
            <RestaurantCards restaurant={restaurant} />
          </li>
        ))}
      </ul>
    );
  }

  //creates the list according to the current status
  const List = () => {
    if (status === "loading") {
      return (
        <p className={styles.message} role="status">
          Loading your wishlist…
        </p>
      );
    } else if (status === "error") {
      return (
        <p className={styles.error} role="alert">
          We could not load your wishlist. Please try again later.
        </p>
      );
    } else if (restaurants.length === 0) {
      return <p className={styles.empty}>You have not added any restaurants to your wishlist yet.</p>;
    } else {
      return <RestaurantsList />;
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Your dining journal</p>
        <h1>My wishlist</h1>
        <p className={styles.description}>A collection of the restaurants you would like to experience next.</p>
      </header>

      <List />

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
