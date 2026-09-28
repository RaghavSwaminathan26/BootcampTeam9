import Navbar from "@/components/Navbar";
import styles from "@/styles/Home.module.css";

export default function Home() {
  return (
    <>
      <main className={styles.homeMain}>
        <section className={styles.hero}>
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroText}>
            <p className={styles.preHeader}>YOUR PERSONAL DINNING JOURNAL</p>
            <h1>
              Every great meal <br /> <em>deserves to be remembered.</em>
            </h1>
          </div>
        </section>

        <section className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>6</span>
            <span className={styles.statLabel}>RESTAURANTS VISITED</span>
          </div>

          <div className={styles.stat}>
            <span className={styles.statNumber}>6</span>
            <span className={styles.statLabel}>ON THE WISHLIST</span>
          </div>

          <div className={styles.stat}>
            <span className={styles.statNumber}>6</span>
            <span className={styles.statLabel}>COUNTRIES EXPLORED</span>
          </div>

          <div className={styles.stat}>
            <span className={styles.statNumber}>4.8</span>
            <span className={styles.statLabel}>AVERAGE RATING</span>
          </div>
        </section>

        <section className={styles.highlights}>
          <div className={styles.highlightHeader}>
            <p className={styles.highlightPreheader}>Recent Highlights</p>
            <h2>From the Dining Log</h2>
            <a href="/visited">See All</a>
          </div>
        </section>
      </main>
    </>
  );
}
