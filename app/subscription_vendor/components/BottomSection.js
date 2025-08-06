import React from 'react';
import styles from '../SubscriptionVendorPage.module.css';

const featuresLeft = [
  'Full customizable profile',
  'Advanced Analytics',
  'Advanced Analytics',
];
const featuresRight = [
  'Advanced Analytics',
  'Advanced Analytics',
  'Advanced Analytics',
];

const BottomSection = () => {
  return (
    <section className={styles.bottomSectionBg}>
      <div className={styles.featuresCardBanner}>
        <div className={styles.featuresGridBanner}>
          <div className={styles.featuresColBanner}>
            {featuresLeft.map((feature, idx) => (
              <div className={styles.featureRowBanner} key={idx}>
                <span className={styles.checkCircleBanner}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="8" fill="#050D35"/>
                    <path d="M5 8.5L7 10.5L11 6.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className={styles.featureTextBanner}>{feature}</span>
              </div>
            ))}
          </div>
          <div className={styles.featuresColBanner}>
            {featuresRight.map((feature, idx) => (
              <div className={styles.featureRowBanner} key={idx}>
                <span className={styles.checkCircleBanner}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="8" fill="#050D35"/>
                    <path d="M5 8.5L7 10.5L11 6.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className={styles.featureTextBanner}>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.bottomLogoGroup}>
        <div className={styles.bottomLogoIcon}>
          <img src="/logo.png" alt="Mehfil Logo" width={40} height={48} />
        </div>
        <span className={styles.bottomLogoText}>Mehfil</span>
      </div>
      <form className={styles.subscribeForm}>
        <input
          type="email"
          className={styles.emailInput}
          placeholder="Enter your email"
        />
        <button type="submit" className={styles.subscribeBtn2}>
          Subscribe
        </button>
      </form>
    </section>
  );
};

export default BottomSection; 