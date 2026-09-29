import Navbar from "@/components/Navbar";
import styles from "@/styles/About.module.css";

export default function About() {
  return (
    <>
      <main className={styles.aboutMain}>
        <section className={styles.aboutSection}>
          <p className={styles.preHeader}>The Story</p>
          <h1>About</h1>

          <h2>A journal for the table</h2>
          <p className={styles.pText}>
            A personal dining journal — a place to record the restaurants that have moved you, and to keep track of the
            ones you&apos;ve been dreaming about. We believe every great meal is an experience worth preserving: the
            ambience, the cooking, the company.
          </p>

          <h2>Curated, not crowdsourced</h2>
          <p className={styles.pText}>
            Unlike review platforms that aggregate thousands of opinions, Tableaux is yours alone. Your tastes, your
            memories, your wishlist. No noise, no algorithms — just an honest record of where you&apos;ve been and where
            you want to go.
          </p>

          <h2>Built for curious eaters</h2>
          <p className={styles.pText}>
            Whether you&apos;re chasing Michelin stars across Europe or hunting down the best neighbourhood trattoria in
            your Tableaux keeps your discoveries organised and beautiful.
          </p>
        </section>
      </main>
    </>
  );
}
