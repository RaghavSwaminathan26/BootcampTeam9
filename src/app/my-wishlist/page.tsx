"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "@/styles/MyWishList.module.css";
import { Restaurant } from "@/types/restaurant";

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
      <div>
        <ul className={styles.list}>
          {restaurants?.map((restaurant) => {
            return (
              <li key={restaurant.id}>
                <h2>{restaurant.name}</h2>
                <div className={styles.desc}>
                  <p>{restaurant.cuisine}</p>
                  <p>{restaurant.location}</p>
                  <p>{restaurant.rating}</p>
                </div>
                <Image src={restaurant.imageURL || ""} alt={restaurant.name} width={300} height={200} />
              </li>
            );
          })}
        </ul>
        ;
      </div>
    );
  }

  //creates the list according to the current status
  const List = () => {
    if (status === "loading") {
      return <p>Loading...</p>;
    } else if (status === "error") {
      return <p>Error loading restaurants.</p>;
    } else if (restaurants.length === 0) {
      return <p>No restaurants to display.</p>;
    } else {
      return <RestaurantsList />;
    }
  };

  return (
    <div className={styles.container}>
      <h1>My Wishlist</h1>
      <List />
    </div>
  );
}
