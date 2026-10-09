"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/styles/Navbar.module.css";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/visited", label: "Visited" },
  { href: "/want-to-visit", label: "Want to Visit" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <div className={styles.navbar}>
      <nav aria-label="Main navigation">
        <ul>
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} aria-current={pathname === href ? "page" : undefined}>
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
