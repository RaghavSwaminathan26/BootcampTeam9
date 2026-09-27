import Link from "next/link";

export default function Navbar() {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/my-wishlist">My Wishlist</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
