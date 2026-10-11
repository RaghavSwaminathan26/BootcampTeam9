"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { useAccount } from "./AccountProvider";
import Image from "next/image";
import type { Restaurant } from "@/types/restaurant";
import styles from "./RestaurantCards.module.css";

const exitDuration = 750;

type RestaurantCardsProps = {
  restaurant: Restaurant;
  onRestaurantChanged: (restaurant: Restaurant | null) => void;
};

// Display a restaurant with controls for its place in the dining journal.
export default function RestaurantCards({ restaurant, onRestaurantChanged }: RestaurantCardsProps) {
  const { refresh } = useAccount();
  const [saving, setSaving] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const animationTimer = useRef<ReturnType<typeof setTimeout>>();
  const starred = restaurant.status === "want-to-visit";

  useEffect(() => () => clearTimeout(animationTimer.current), []);

  async function changeRestaurant(status: Restaurant["status"] | null) {
    if (pending.current) return;
    pending.current = true;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/restaurants", {
        method: status ? "PATCH" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: restaurant.id, ...(status ? { status } : {}) }),
      });
      if (response.status === 401) {
        await refresh();
        return;
      }
      if (!response.ok) throw new Error("Unable to update restaurant");

      const finish = () => {
        onRestaurantChanged(status ? { ...restaurant, status } : null);
        setCelebrating(false);
        setSaving(false);
        pending.current = false;
      };
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const leave = () => {
        setCelebrating(false);
        setLeaving(true);
        animationTimer.current = setTimeout(finish, exitDuration);
      };
      // Save first, then celebrate and fade before removing the card from the list.
      if (reducedMotion) {
        finish();
      } else if (status === "want-to-visit") {
        setCelebrating(true);
        animationTimer.current = setTimeout(leave, 2000);
      } else {
        leave();
      }
    } catch {
      setError("We could not update this restaurant. Please try again.");
      setSaving(false);
      pending.current = false;
    }
  }

  const ratingLabel = restaurant.rating === undefined ? "No rating recorded" : `${restaurant.rating} out of 5 stars`;

  return (
    <article
      className={`${styles.card} ${celebrating ? styles.celebrating : ""} ${leaving ? styles.leaving : ""}`}
      style={{ "--exit-duration": `${exitDuration}ms` } as CSSProperties}
      aria-busy={saving}
    >
      {celebrating && (
        <span className={styles.flyingStar} aria-hidden="true">
          ★
        </span>
      )}
      <div className={styles.imageWrapper}>
        {restaurant.imageURL ? (
          <Image
            className={styles.image}
            src={restaurant.imageURL}
            alt={`${restaurant.name} interior`}
            width={500}
            height={300}
          />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true">
            Restaurant photo coming soon
          </div>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.topRow}>
          <p className={styles.cuisine}>{restaurant.cuisine}</p>
          <span className={styles.rating} aria-label={ratingLabel}>
            <span aria-hidden="true">★</span>
            {restaurant.rating ?? "—"}
          </span>
        </div>
        <h2 className={styles.name}>{restaurant.name}</h2>
        <p className={styles.location}>
          <span aria-hidden="true">⌖</span> {restaurant.location}
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.starButton}
            aria-pressed={starred || celebrating}
            aria-label={`${starred ? "Unstar" : "Star"} ${restaurant.name}${starred ? " to remove from" : " to move to"} Want to visit`}
            disabled={saving}
            onClick={() => changeRestaurant(starred ? null : "want-to-visit")}
          >
            <span aria-hidden="true">{starred || celebrating ? "★" : "☆"}</span>
            {celebrating ? "Starred!" : starred ? "Unstar" : "Want to visit"}
          </button>
          <button
            type="button"
            disabled={saving}
            aria-label={`${starred ? "Mark" : "Remove"} ${restaurant.name} ${starred ? "as visited" : "from visited"}`}
            onClick={() => changeRestaurant(starred ? "visited" : null)}
          >
            {starred ? "Mark visited" : "Remove"}
          </button>
        </div>
        {celebrating && <p role="status">Added to Want to visit!</p>}
        {error && <p role="alert">{error}</p>}
      </div>
    </article>
  );
}
