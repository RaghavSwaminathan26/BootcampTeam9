"use client";

import { useAccount } from "@/components/AccountProvider";
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
  const { user } = useAccount();
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
          <li>
            <Link href="/login" aria-current={pathname === "/login" ? "page" : undefined}>
              <span>{user ? "Account" : "Log in"}</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
