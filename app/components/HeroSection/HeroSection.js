import Link from "next/link";
import Image from "next/image";
import Navbar from "../Navbar/Navbar";
import styles from './HeroSection.module.css';

export default function HeroSection() {
  return (
    <section className={styles.heroSection}>
      {/* Background Image */}
      <div className={styles.heroBgImage}>
        <img src="/hero_bg_blur.png" alt="Background" className={styles.heroBgImageImg} />
      </div>
      
      {/* Overlay with blur effect */}
      <div className={styles.heroOverlay}></div>
      
      {/* Front Flower Image */}
      <div className={styles.heroFrontFlower}>
        <img src="/hero_front_flower.png" alt="Flower" className={styles.heroFrontFlowerImg} />
      </div>

      {/* Navigation */}
      <Navbar />

      {/* Hero Content */}
      <div className={styles['hero-content']}>
        <h1 className={styles['hero-title']}>
          Search for best venues to make your occasions unforgettable
        </h1>
        <p className={styles['hero-subtitle']}>
          From vendor selection to seamless bookings, Mehfil helps you plan a perfect event to make your joyous moments timeless.
        </p>
        
        <div className={styles['hero-buttons']}>
          <Link href="/customer_signup" className={`${styles['hero-btn']} ${styles['get-started-btn']}`}>Get Started</Link>
          <Link href="/vendor_signup" className={`${styles['hero-btn']} ${styles['join-vendor-btn']}`}>Join as Vendor</Link>
          
        </div>
      </div>
    </section>
  );
} 