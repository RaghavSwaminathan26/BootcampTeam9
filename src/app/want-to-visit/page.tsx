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

  //RestaurantsList component - update this with the card when it is created
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
        <h1>Want to visit</h1>
      </header>
      <List />
    </main>
  );
}
