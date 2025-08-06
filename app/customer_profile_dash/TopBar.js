import Link from "next/link";
import Image from "next/image";
import styles from "../components/Navbar/Navbar.module.css";
import topbarStyles from "./TopBar.module.css";

export default function TopBar() {
  return (
    <div className={topbarStyles["topbar-fullwidth"]}>
      <div className={topbarStyles["topbar-inner"]}>
        <div className={topbarStyles["topbar-left"]}>
          <div className={topbarStyles["topbar-logo-group"]}>
            <Image
              src="/logo.png"
              alt="Mehfil Logo"
              width={50}
              height={15}
              style={{ objectFit: "contain" }}
            />
            <span className={styles["logo-text"]}>Mehfil</span>
          </div>
          <div className={topbarStyles["topbar-links"]}>
            <Link href="/" className={styles["nav-link"]}>Home</Link>
            <Link href="/customer_profile_dash" className={styles["nav-link"]}>Services</Link>
            <Link href="/vendor_listings" className={styles["nav-link"]}>Vendors</Link>
            <Link href="/vendor_listing_details/123" className={styles["nav-link"]}>Contact</Link>
          </div>
        </div>
        <div className={topbarStyles["topbar-spacer"]}></div>
        <div className={topbarStyles["topbar-right"]}>
          <div className={topbarStyles["topbar-search"]}>
            <Image
              src="/search_icon.png"
              alt="Search"
              width={20}
              height={20}
              style={{ objectFit: "contain", marginRight: 8 }}
            />
            <input
              type="text"
              placeholder="Search Services..."
            />
          </div>
          <div className={topbarStyles["topbar-icons"]}>
            <div className={topbarStyles["topbar-icon-btn"]}>
              <Image
                src="/white_like_icon.png"
                alt="Like"
                width={24}
                height={24}
                style={{ objectFit: "contain" }}
              />
            </div>
            <Link href="/cart" className={topbarStyles["topbar-icon-btn"]}>
              <Image
                src="/white_cart_icon.png"
                alt="Cart"
                width={24}
                height={24}
                style={{ objectFit: "contain" }}
              />
            </Link>
          </div>
          <div className={topbarStyles["topbar-auth"]}>
            <Link href="/customer_signup" className={topbarStyles["topbar-signup"]}>Sign Up</Link>
            <Link href="/login" className={topbarStyles["topbar-login"]}>Login</Link>
            <Link href="/vendor_signup" className={topbarStyles["topbar-vendor"]}>Join as Vendor ?</Link>
          </div>
        </div>
      </div>
    </div>
  );
} 