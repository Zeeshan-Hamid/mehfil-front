'use client';
import { useState } from 'react';
import TopSection from './components/TopSection';
import BottomSection from './components/BottomSection';
import StandardCard from './components/StandardCard';
import ProCard from './components/ProCard';
import styles from './SubscriptionVendorPage.module.css';
import { useVendorAuth } from '../hooks/useVendorAuth';

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

export default function SubscriptionVendorPage() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  
  // Use the efficient vendor auth hook
  const { isAuthorized, isChecking } = useVendorAuth();

  // Don't render anything if not authorized or still checking
  if (isChecking || !isAuthorized) {
    return null;
  }

  return (
    <>
      <TopSection
        billingCycle={billingCycle}
        onToggleBillingCycle={setBillingCycle}
      />
      <div className={styles.cardsRowWrapper}>
        <StandardCard billingCycle={billingCycle} />
        {/* Mobile features section - appears between cards on mobile */}
        <div className={styles.mobileFeaturesSection}>
          <div className={styles.mobileFeaturesLeft}>
            {featuresLeft.map((feature, idx) => (
              <div className={styles.mobileFeatureRow} key={idx}>
                <span className={styles.mobileCheckCircle}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="8" fill="#050D35"/>
                    <path d="M5 8.5L7 10.5L11 6.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className={styles.mobileFeatureText}>{feature}</span>
              </div>
            ))}
          </div>
        </div>
        <ProCard billingCycle={billingCycle} />
      </div>
      <BottomSection />
    </>
  );
} 