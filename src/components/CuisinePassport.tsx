"use client";

import { useEffect, useRef, useState } from "react";
import { CUISINES, cuisineFlag, cuisineFlagImage, cuisineCountryName, normalizeCuisine } from "@/data/cuisines";
import { Restaurant } from "@/types/restaurant";
import styles from "@/styles/Passport.module.css";

type Passport = { unlockedCuisines: string[]; restaurants: Restaurant[] };

export default function CuisinePassport({ username }: { username: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cuisineDialog = useRef<HTMLDialogElement>(null);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [passportClosing, setPassportClosing] = useState(false);
  const [cuisineClosing, setCuisineClosing] = useState(false);
  const [passport, setPassport] = useState<Passport | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("passport") === "open") setOpen(true);
  }, []);

  // Native modal dialogs trap focus, support Escape, and restore focus to the opener.
  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    element?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
    };
  }, [open]);

  useEffect(() => {
    if (!selectedCuisine) return;
    const element = cuisineDialog.current;
    element?.showModal();
    return () => element?.close();
  }, [selectedCuisine]);

  // Keep dialogs in the top layer until their exit animation finishes.
  useEffect(() => {
    if (!passportClosing) return;
    const timer = window.setTimeout(
      () => {
        setSelectedCuisine(null);
        setOpen(false);
        setPassportClosing(false);
      },
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 260,
    );
    return () => window.clearTimeout(timer);
  }, [passportClosing]);

  useEffect(() => {
    if (!cuisineClosing) return;
    const timer = window.setTimeout(
      () => {
        setSelectedCuisine(null);
        setCuisineClosing(false);
      },
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 260,
    );
    return () => window.clearTimeout(timer);
  }, [cuisineClosing]);

  function closePassport() {
    setPassportClosing(true);
  }

  function closeCuisine() {
    setCuisineClosing(true);
  }

  // Reload on every opening and cancel stale requests when the modal closes.
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setPassport(null);
    setError("");
    async function load() {
      try {
        const response = await fetch("/api/passport", { cache: "no-store", signal: controller.signal });
        if (!response.ok)
          throw new Error(
            response.status === 401
              ? "Please log in again to view your passport."
              : "Unable to load your passport. Please try again.",
          );
        const data: Passport = await response.json();
        if (!controller.signal.aborted) setPassport(data);
      } catch (error) {
        if (!controller.signal.aborted)
          setError(error instanceof Error ? error.message : "Unable to load your passport.");
      }
    }
    void load();
    return () => controller.abort();
  }, [open, attempt]);

  const earned = passport?.unlockedCuisines ?? [];
  const visitedRestaurants =
    passport?.restaurants.filter(
      (restaurant) => restaurant.status === "visited" && normalizeCuisine(restaurant.cuisine) === selectedCuisine,
    ) ?? [];
  // Preserve older custom cuisines as additional pages outside the predefined collection.
  const cuisines = [...CUISINES, ...earned.filter((cuisine) => !CUISINES.some((option) => option === cuisine))];

  return (
    <>
      <button
        className={styles.passportButton}
        onClick={() => setOpen(true)}
        aria-label={`Open ${username}’s cuisine passport`}
      >
        <svg
          className={styles.passportIcon}
          viewBox="0 0 40 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="5" y="3" width="30" height="42" rx="4" />
          <path d="M9 3v42" />
          <circle cx="22" cy="21" r="9" />
          <ellipse cx="22" cy="21" rx="4" ry="9" />
          <path d="M13 21h18M17 36h10" />
        </svg>
        <span>Your Passport</span>
      </button>
      <dialog
        ref={dialog}
        className={styles.dialog}
        data-closing={passportClosing}
        aria-labelledby="passport-title"
        onClose={() => {
          setSelectedCuisine(null);
          setOpen(false);
          setPassportClosing(false);
        }}
        onCancel={(event) => {
          event.preventDefault();
          closePassport();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closePassport();
        }}
      >
        <div className={styles.book}>
          <header className={styles.header}>
            <h2 id="passport-title">My Passport</h2>
            <button
              type="button"
              className={styles.close}
              onClick={closePassport}
              aria-label="Close passport"
              autoFocus
            >
              ×
            </button>
          </header>
          {!passport && !error && <p role="status">Opening your passport…</p>}
          {error && (
            <div role="alert">
              <p>{error}</p>
              <button onClick={() => setAttempt((value) => value + 1)}>Try again</button>
            </div>
          )}
          {passport && (
            <div className={styles.pages}>
              {cuisines.map((cuisine) => {
                const unlocked = earned.includes(cuisine);
                const flagImage = cuisineFlagImage(cuisine);
                const country = cuisineCountryName(cuisine);
                return (
                  <button
                    type="button"
                    key={cuisine}
                    className={`${styles.cuisinePage} ${unlocked ? styles.unlocked : styles.locked}`}
                    onClick={() => {
                      if (!passportClosing) setSelectedCuisine(cuisine);
                    }}
                    aria-label={`${country}, ${cuisine} cuisine, ${unlocked ? "unlocked" : "locked"}. View visited restaurants`}
                    aria-haspopup="dialog"
                  >
                    <span
                      className={styles.flag}
                      aria-hidden="true"
                      style={flagImage ? { backgroundImage: `url("${flagImage}")` } : undefined}
                    >
                      {!flagImage && cuisineFlag(cuisine)}
                    </span>
                    <span className={styles.cuisineName}>{country}</span>
                    {!unlocked && (
                      <svg
                        className={styles.lockIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <rect x="5" y="10" width="14" height="11" rx="2" />
                        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                        <path d="M12 14v3" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </dialog>
      <dialog
        ref={cuisineDialog}
        className={`${styles.dialog} ${styles.restaurantDialog}`}
        data-closing={cuisineClosing}
        aria-labelledby="cuisine-title"
        onClose={() => {
          setSelectedCuisine(null);
          setCuisineClosing(false);
        }}
        onCancel={(event) => {
          event.preventDefault();
          closeCuisine();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeCuisine();
        }}
      >
        <div className={styles.book}>
          <header className={styles.header}>
            <h2 id="cuisine-title">
              <span aria-hidden="true">{selectedCuisine && cuisineFlag(selectedCuisine)}</span>{" "}
              {selectedCuisine && cuisineCountryName(selectedCuisine)}
            </h2>
            <button
              type="button"
              className={styles.close}
              onClick={closeCuisine}
              aria-label="Back to My Passport"
              autoFocus
            >
              ×
            </button>
          </header>
          {visitedRestaurants.length > 0 ? (
            <ul className={styles.restaurants}>
              {visitedRestaurants.map((restaurant) => (
                <li key={restaurant.id}>
                  <strong>{restaurant.name}</strong>
                  <span>{restaurant.location}</span>
                  {restaurant.rating != null && (
                    <span aria-label={`Rated ${restaurant.rating} out of 5`}>★ {restaurant.rating} / 5</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>You haven’t visited any {selectedCuisine} restaurants yet.</p>
          )}
        </div>
      </dialog>
    </>
  );
}
