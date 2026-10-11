import Link from "next/link";
import styles from "@/styles/Home.module.css";
import { AccountGate } from "@/components/AccountProvider";
import RankedRestaurants from "@/components/RankedRestaurants";

export default function Home() {
  return (
    <AccountGate>
      <main className={styles.homeMain}>
        <section className={styles.hero}>
          <h1>Home</h1>
        </section>
        <section className={styles.collections} aria-label="Your restaurant collections">
          <Link className={styles.collection} href="/visited">
            <div className={styles.cardTop}>
              <span className={styles.icon} aria-hidden="true">
                ⌖
              </span>
              <span className={styles.arrow} aria-hidden="true">
                ↗
              </span>
            </div>
            <h2>Visited restaurants</h2>
          </Link>
          <Link className={styles.collection} href="/want-to-visit">
            <div className={styles.cardTop}>
              <span className={styles.icon} aria-hidden="true">
                ＋
              </span>
              <span className={styles.arrow} aria-hidden="true">
                ↗
              </span>
            </div>
            <h2>Want to visit</h2>
          </Link>
        </section>
        <RankedRestaurants />
      </main>
    </AccountGate>
  );
}
