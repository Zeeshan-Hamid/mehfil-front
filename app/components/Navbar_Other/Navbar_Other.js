'use client';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar_Other.module.css';

const Navbar_Other = ({ isPreview = false }) => {
  // Common content for both interactive and non-interactive modes
  const logoContent = (
    <div className={styles.logoSection}>
      <Image 
        src="/logo.png" 
        alt="Mehfil Logo" 
        width={35} 
        height={45}
        className={styles.logo}
      />
      <span className={styles.brandName}>
        Mehfil
      </span>
    </div>
  );

  const navLinksContent = (
    <div className={styles.navLinks}>
      <span className={`${styles.navLink} ${isPreview ? styles.nonInteractive : ''}`}>
        Home
      </span>
      <span className={`${styles.navLink} ${isPreview ? styles.nonInteractive : ''}`}>
        Services
      </span>
      <span className={`${styles.navLink} ${isPreview ? styles.nonInteractive : ''}`}>
        Vendors
      </span>
      <span className={`${styles.navLink} ${isPreview ? styles.nonInteractive : ''}`}>
        Contact
      </span>
    </div>
  );

  const rightSectionContent = (
    <div className={styles.rightSection}>
      <div className={styles.rightActions}>
        {/* Login button */}
        <span className={`${styles.loginButton} ${isPreview ? styles.nonInteractive : ''}`}>
          <span className={styles.buttonText}>Login</span>
        </span>

        {/* Sign Up button */}
        <span className={`${styles.signupButton} ${isPreview ? styles.nonInteractive : ''}`}>
          <span className={styles.buttonText}>Sign Up</span>
        </span>

        {/* Join as Vendor button */}
        <span className={`${styles.vendorButton} ${isPreview ? styles.nonInteractive : ''}`}>
          <span className={styles.vendorButtonText}>Join as Vendor</span>
        </span>
      </div>
      <div className={styles.iconsSection}>
        {/* Search icon */}
        <div className={`${styles.iconWrapper} ${isPreview ? styles.nonInteractive : ''}`}>
          <Image 
            src="/white_search_icon.png" 
            alt="Search" 
            width={32} 
            height={32}
            className={styles.icon}
          />
        </div>
        {/* Like icon */}
        <div className={`${styles.iconWrapper} ${isPreview ? styles.nonInteractive : ''}`}>
          <Image 
            src="/white_like_icon.png" 
            alt="Like" 
            width={32} 
            height={32}
            className={styles.icon}
          />
        </div>
        {/* Cart icon */}
        <div className={`${styles.iconWrapper} ${isPreview ? styles.nonInteractive : ''}`}>
          <Image 
            src="/white_cart_icon.png" 
            alt="Cart" 
            width={32} 
            height={32}
            className={styles.icon}
          />
        </div>
      </div>
    </div>
  );

  return (
    <nav className={styles.navbar}>
      {/* Main navbar container */}
      <div className={styles.navbarContainer}>
        {/* Logo and brand - interactive vs non-interactive */}
        {isPreview ? logoContent : (
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            {logoContent}
          </Link>
        )}

        {/* Navigation links - different rendering based on preview mode */}
        {isPreview ? navLinksContent : (
          <div className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>
              Home
            </Link>
            <Link href="#" className={styles.navLink}>
              Services
            </Link>
            <Link href="/vendor_listings" className={styles.navLink}>
              Vendors
            </Link>
            <Link href="/vendor_listing_details/123" className={styles.navLink}>
              Contact
            </Link>
          </div>
        )}

        {/* Right section - different rendering based on preview mode */}
        {isPreview ? rightSectionContent : (
          <div className={styles.rightSection}>
            <div className={styles.rightActions}>
              {/* Login button */}
              <Link href="/login" className={styles.loginButton}>
                <span className={styles.buttonText}>Login</span>
              </Link>

              {/* Sign Up button */}
              <Link href="/customer_signup" className={styles.signupButton}>
                <span className={styles.buttonText}>Sign Up</span>
              </Link>

              {/* Join as Vendor button */}
              <Link href="/vendor_signup" className={styles.vendorButton}>
                <span className={styles.vendorButtonText}>Join as Vendor</span>
              </Link>
            </div>
            <div className={styles.iconsSection}>
              {/* Search icon */}
              <div className={styles.iconWrapper}>
                <Image 
                  src="/white_search_icon.png" 
                  alt="Search" 
                  width={32} 
                  height={32}
                  className={styles.icon}
                />
              </div>
              {/* Like icon */}
              <div className={styles.iconWrapper}>
                <Image 
                  src="/white_like_icon.png" 
                  alt="Like" 
                  width={32} 
                  height={32}
                  className={styles.icon}
                />
              </div>
              {/* Cart icon */}
              <div className={styles.iconWrapper}>
                <Image 
                  src="/white_cart_icon.png" 
                  alt="Cart" 
                  width={32} 
                  height={32}
                  className={styles.icon}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar_Other; 