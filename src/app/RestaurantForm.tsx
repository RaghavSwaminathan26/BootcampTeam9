"use client";

import { useAccount } from "@/components/AccountProvider";
import { useState } from "react";
import { Restaurant } from "@/types/restaurant";
import styles from "@/styles/RestraurantForm.module.css";

type RestaurantFormProps = {
  status?: "visited" | "want-to-visit";
  onRestaurantAdded: (restaurant: Restaurant) => void;
};

export default function RestaurantForm({ onRestaurantAdded, status = "visited" }: RestaurantFormProps) {
  const { refresh } = useAccount();
  const [saving, setSaving] = useState(false);
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
    setSaving(true);

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
          status,
        }),
      });
      if (response.status === 401) {
        await refresh();
        return;
      }
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add restaurant");
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
      setMessage(error instanceof Error ? error.message : "Unable to add");
    } finally {
      setSaving(false);
    }
  }
  return (
    //when the form is sumbitted the handleSumbit function will run
    <form className={styles.restForm} onSubmit={handleSubmit}>
      <h2>Add a restaurant</h2>
      <div className={styles.restaurantInput}>
        <input
          type="text"
          aria-label="Restaurant name"
          placeholder="Restaurant name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={200}
          disabled={saving}
          required
        />
        <input
          type="text"
          aria-label="Cuisine"
          placeholder="Cuisine"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          maxLength={200}
          disabled={saving}
          required
        />
        <input
          type="text"
          aria-label="Location"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          maxLength={200}
          disabled={saving}
          required
        />
      </div>

      <button className={styles.inputButton} type="submit" disabled={saving}>
        {saving ? "Adding…" : "Add Restaurant"}
      </button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
