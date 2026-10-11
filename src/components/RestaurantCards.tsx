"use client";

import Image from "next/image";
import { useState } from "react";
import type { Restaurant } from "@/types/restaurant";
import styles from "./RestaurantCards.module.css";

type RestaurantCardsProps = {
  restaurant: Restaurant;
  onRatingChange?: (rating: number) => Promise<void>;
};

/** Reusable summary card for a restaurant from the shared data set. */
export default function RestaurantCards({ restaurant, onRatingChange }: RestaurantCardsProps) {
  const ratingLabel = restaurant.rating === undefined ? "No rating recorded" : `${restaurant.rating} out of 5 stars`;
  const [isSavingRating, setIsSavingRating] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);

  async function handleRatingChange(rating: number) {
    if (!onRatingChange) {
      return;
    }

    setIsSavingRating(true);
    setRatingError(null);

    try {
      await onRatingChange(rating);
    } catch {
      setRatingError("We could not save your rating. Please try again.");
    } finally {
      setIsSavingRating(false);
    }
  }

  return (
    <article className={styles.card}>
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
            <fieldset className={styles.ratingControl} disabled={isSavingRating}>
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
        {ratingError && (
          <p className={styles.ratingError} role="alert">
            {ratingError}
          </p>
        )}
      </div>
    </article>
  );
}
