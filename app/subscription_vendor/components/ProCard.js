import React from 'react';
import styles from '../SubscriptionVendorPage.module.css';
import Image from 'next/image';

const features = [
  'Advanced Analytics',
  'Early Payouts',
  'Priority Support',
  'Custom Dashboard',
  'Exclusive Discounts',
  'Unlimited Listings',
];

const ProCard = ({ billingCycle }) => {
  const price = billingCycle === 'yearly' ? 500 * 12 : 500;
  const period = billingCycle === 'yearly' ? '/year' : '/month';

  return (
    <div className={styles.proCard}>
      <div className={styles.cardIconWrapper}>
        <Image src="/premium_star.png" alt="Pro Icon" width={48} height={48} />
      </div>
      <div className={styles.cardTitleRow}>
        <span className={styles.cardTitle}>Pro</span>
      </div>
      <div className={styles.cardPriceRow}>
        <span className={styles.cardPrice}>$ {price}</span>
        <span className={styles.cardPerMonth}>{period}</span>
      </div>
      <hr className={styles.cardDivider} />
      <ul className={styles.cardFeaturesList}>
        {features.map((feature, idx) => (
          <li className={styles.cardFeatureItem} key={idx}>
            <span className={styles.cardFeatureText}>{feature}</span>
            <span className={styles.cardCheckCircle}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="10" fill="#050D35"/>
                <path d="M6.5 10.5L9 13L14 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </li>
        ))}
      </ul>
      <button className={styles.cardUnlockBtn}>Unlock</button>
    </div>
  );
};

export default ProCard; 