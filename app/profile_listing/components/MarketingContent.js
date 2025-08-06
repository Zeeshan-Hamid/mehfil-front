import React from 'react';
import styles from './MarketingContent.module.css';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function MarketingContent() {
  const router = useRouter();
  return (
    <div className={styles.marketingRoot}>
      <div className={styles.featuredVendorTitle}>Featured Vendor Program</div>
      <div className={styles.featuredVendorDescription}>
        Elevate your vendor profile and gain a competitive edge in the marketplace with our Featured Vendor Program. For a weekly fee of $100, your profile will receive premium placement, ensuring maximum visibility to potential clients. This enhanced exposure translates to increased bookings and revenue, making it a valuable investment for your business.
      </div>
      <div className={styles.benefitsTitle}>Benefits</div>
      <div className={styles.benefitsRow}>
        <div className={styles.benefitCard}>
          <div className={styles.benefitCardBg} />
          <div className={styles.benefitCardIcon}>
            <Image src="/top__search_badge.png" alt="Top Search Placement" width={48} height={48} />
          </div>
          <div className={styles.benefitCardTitle}>Top Search Placement</div>
          <div className={styles.benefitCardDesc}>
            Your profile will be prominently displayed at the top of search results, ensuring it's the first thing potential clients see.
          </div>
        </div>
        <div className={styles.benefitCard}>
          <div className={styles.benefitCardBg} />
          <div className={styles.benefitCardIcon}>
            <Image src="/homepage_feature.png" alt="Homepage Feature" width={48} height={48} />
          </div>
          <div className={styles.benefitCardTitle}>Homepage Feature</div>
          <div className={styles.benefitCardDesc}>
            Gain exclusive visibility on the marketplace homepage, reaching a broader audience and attracting more clients.
          </div>
        </div>
        <div className={styles.benefitCard}>
          <div className={styles.benefitCardBg} />
          <div className={styles.benefitCardIcon}>
            <Image src="/featured_vendor_badge.png" alt="Featured Vendor Badge" width={48} height={48} />
          </div>
          <div className={styles.benefitCardTitle}>Featured Vendor Badge</div>
          <div className={styles.benefitCardDesc}>
            Stand out from the competition with a visually appealing badge on your profile, highlighting your status as a Featured Vendor
          </div>
        </div>
        <div className={styles.benefitCard}>
          <div className={styles.benefitCardBg} />
          <div className={styles.benefitCardIcon}>
            <Image src="/priority__support.png" alt="Priority Support" width={48} height={48} />
          </div>
          <div className={styles.benefitCardTitle}>Priority Support</div>
          <div className={styles.benefitCardDesc}>
            Receive priority support from our team, ensuring any questions or issues are addressed promptly
          </div>
        </div>
      </div>
      <div className={styles.pricingTitle}>Pricing and Terms</div>
      <div className={styles.pricingDescription}>
        The Featured Vendor Program is available for a weekly fee of $100. Enrollment is on a week-to-week basis, with the option to cancel at any time. Payment will be automatically charged to your account at the beginning of each week. By enrolling, you agree to the program's terms and conditions
      </div>
      <div className={styles.enrollBtnRow}>
        <button className={styles.enrollBtn} onClick={() => router.push('/subscription_vendor')}>Enroll Now</button>
      </div>
    </div>
  );
} 