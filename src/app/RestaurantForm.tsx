"use client";

import { useState } from "react";
import { Restaurant } from "@/types/restaurant";
import styles from "@/styles/RestraurantForm.module.css";

type RestaurantFormProps = {
  onRestaurantAdded: (restaurant: Restaurant) => void;
};

export default function RestaurantForm({ onRestaurantAdded }: RestaurantFormProps) {
  //state variables
  const [name, setName] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [location, setLocation] = useState("");
  //return message
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    //make sure that brower doesn't refresh
    e.preventDefault();
    //clear previous message
    setMessage("");

    if (name === "" || cuisine === "" || location === "") {
      setMessage("Please fill out all required fields.");
      return null;
    }

    try {
      //send info inputed to backend
      const response = await fetch("/api/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          cuisine,
          location,
          status: "visited",
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        setMessage(data.error || "Unable to add restaurant");
        return;
      }
      //get new Restaurant from backend
      const newRestaurant: Restaurant = await response.json();
      onRestaurantAdded(newRestaurant);
      setMessage("New Restaurant successfully added");
      setName("");
      setCuisine("");
      setLocation("");
    } catch (error) {
      console.error(error);
      setMessage("Unable to add");
    }
  }
  return (
    //when the form is sumbitted the handleSumbit function will run
    <form className={styles.restForm} onSubmit={handleSubmit}>
      <h2>Add a restaurant!</h2>
      <div className={styles.restaurantInput}>
        <input
          type="text"
          placeholder="Restaurant name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Cuisine"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </div>

      <button className={styles.inputButton} type="submit">
        Add Restaurant
      </button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
