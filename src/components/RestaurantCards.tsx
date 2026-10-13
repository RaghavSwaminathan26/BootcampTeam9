"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { useAccount } from "./AccountProvider";
import Image from "next/image";
import type { Restaurant } from "@/types/restaurant";
import styles from "./RestaurantCards.module.css";

const exitDuration = 750;

type RestaurantCardsProps = {
  restaurant: Restaurant;
  onRatingChange?: (rating: number) => Promise<void>;
  onRestaurantChanged?: (restaurant: Restaurant | null) => void;
};

// Display a restaurant with controls for its place in the dining journal.
export default function RestaurantCards({ restaurant, onRestaurantChanged, onRatingChange }: RestaurantCardsProps) {
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
    if (pending.current || !onRestaurantChanged) return;
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
        setSaving(false);
        pending.current = false;
        return;
      }
      if (!response.ok) throw new Error("Unable to update restaurant");
      window.dispatchEvent(new Event("dining-updated"));

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
  const [isSavingRating, setIsSavingRating] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);

  async function handleRatingChange(rating: number) {
    if (!onRatingChange || pending.current) {
      return;
    }

    pending.current = true;
    setIsSavingRating(true);
    setRatingError(null);

    try {
      await onRatingChange(rating);
    } catch {
      setRatingError("We could not save your rating. Please try again.");
    } finally {
      pending.current = false;
      setIsSavingRating(false);
    }
  }

  return (
    <article
      className={`${styles.card} ${celebrating ? styles.celebrating : ""} ${leaving ? styles.leaving : ""}`}
      style={{ "--exit-duration": `${exitDuration}ms` } as CSSProperties}
      aria-busy={saving || isSavingRating}
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
          {onRatingChange ? (
            <fieldset className={styles.ratingControl} disabled={saving || isSavingRating}>
              <legend className={styles.srOnly}>Rate {restaurant.name}</legend>
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  className={styles.starButton}
                  key={rating}
                  type="button"
                  aria-label={`Set rating to ${rating} out of 5 stars`}
                  aria-pressed={restaurant.rating === rating}
                  onClick={() => handleRatingChange(rating)}
                >
                  <span
                    className={rating <= (restaurant.rating ?? 0) ? styles.filledStar : undefined}
                    aria-hidden="true"
                  >
                    ★
                  </span>
                </button>
              ))}
            </fieldset>
          ) : (
            <span className={styles.rating} aria-label={ratingLabel}>
              <span aria-hidden="true">★</span>
              {restaurant.rating ?? "—"}
            </span>
          )}
        </div>
        <h2 className={styles.name}>{restaurant.name}</h2>
        <p className={styles.location}>
          <span aria-hidden="true">⌖</span> {restaurant.location}
        </p>
        {onRestaurantChanged && (
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.starButton}
              aria-pressed={starred || celebrating}
              aria-label={`${starred ? "Unstar" : "Star"} ${restaurant.name}${starred ? " to remove from" : " to move to"} Want to visit`}
              disabled={saving || isSavingRating}
              onClick={() => changeRestaurant(starred ? null : "want-to-visit")}
            >
              <span aria-hidden="true">{starred || celebrating ? "★" : "☆"}</span>
              {celebrating ? "Starred!" : starred ? "Unstar" : "Want to visit"}
            </button>
            <button
              type="button"
              disabled={saving || isSavingRating}
              aria-label={`${starred ? "Mark" : "Remove"} ${restaurant.name} ${starred ? "as visited" : "from visited"}`}
              onClick={() => changeRestaurant(starred ? "visited" : null)}
            >
              {starred ? "Mark visited" : "Remove"}
            </button>
          </div>
        )}
        {error && <p role="alert">{error}</p>}
        {ratingError && (
          <p className={styles.ratingError} role="alert">
            {ratingError}
          </p>
        )}
      </div>
    </article>
  );
}
