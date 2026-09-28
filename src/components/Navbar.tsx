import Link from "next/link";
import styles from "@/styles/Navbar.module.css";

export default function Navbar() {
  return (
    <div className={styles.navbar}>
      <nav>
        <ul>
          <li key="home">
            <Link href="/">Home</Link>
          </li>
          <li key="about">
            <Link href="/about">About</Link>
          </li>
          <li key="visited">
            <Link href="/visited">Visited</Link>
          </li>
          <li key="want-to-visit">
            <Link href="/want-to-visit">Want to Visit</Link>
          </li>
          <li key="contact">
            <Link href="/contact">Contact</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
