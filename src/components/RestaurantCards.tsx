import Image from "next/image";
import type { Restaurant } from "@/types/restaurant";
import styles from "./RestaurantCards.module.css";

type RestaurantCardsProps = {
  restaurant: Restaurant;
};

/** Reusable summary card for a restaurant from the shared data set. */
export default function RestaurantCards({ restaurant }: RestaurantCardsProps) {
  const ratingLabel = restaurant.rating === undefined ? "No rating recorded" : `${restaurant.rating} out of 5 stars`;

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
          <span className={styles.rating} aria-label={ratingLabel}>
            <span aria-hidden="true">★</span>
            {restaurant.rating ?? "—"}
          </span>
        </div>
        <h2 className={styles.name}>{restaurant.name}</h2>
        <p className={styles.location}>
          <span aria-hidden="true">⌖</span> {restaurant.location}
        </p>
      </div>
    </article>
  );
}
