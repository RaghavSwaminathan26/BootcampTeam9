import styles from "@/styles/About.module.css";

export default function About() {
  return (
    <main className={styles.aboutMain}>
      <h1>About</h1>
      <div className={styles.aboutSection}>
        <section>
          <p>
            Tableaux is a restaurant tracker. View restaurants you’ve visited, including their cuisine, location, and
            rating, and keep a wishlist of places you want to visit.
          </p>
        </section>
      </div>
    </main>
  );
}
