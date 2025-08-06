import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../../state/userStore';
import { useVendorStore } from '../../state/userStore';
import { FiLogOut } from 'react-icons/fi';
import styles from '../SubscriptionVendorPage.module.css';

const TopSection = ({ billingCycle, onToggleBillingCycle }) => {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useUserStore();
  const { vendorData } = useVendorStore();
  
  // Refs for click outside
  const avatarRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu) {
        if (!avatarRef.current?.contains(event.target) && !dropdownRef.current?.contains(event.target)) {
          setShowProfileMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  // Logout handler
  const handleLogout = () => {
    logout();
    router.push('/login');
  };



  return (
    <section className={styles.topSectionBg}>
      {/* Left: Logo and brand */}
      <div className={styles.brandGroup}>
        <div className={styles.logoImg} />
        <span className={styles.MehfilText}>Mehfil</span>
      </div>
      
      {/* Center: Home */}
      <div className={styles.homeGroup}>
        <button className={styles.homeBtn} onClick={() => router.push('/profile_listing')}>Home</button>
      </div>
      
      {/* Right: Avatar with dropdown */}
      <div className={styles.avatarGroup}>
        <div
          className={styles['profile-photo-business-container']}
          onClick={() => setShowProfileMenu((v) => !v)}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}
          ref={avatarRef}
        >
        {/* Show only the profile photo, no name */}
        <div 
          className={styles['profile-photo-large']} 
          // All responsive styles are now handled by CSS
        >
          {vendorData && vendorData.businessName ? vendorData.businessName.charAt(0) : '?'}
        </div>
        {showProfileMenu && (
          <div className={styles['profile-menu-drawer']} ref={dropdownRef}>
            {/* Show full name above logout button */}
            {vendorData && vendorData.ownerName && (
              <div style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                fontSize: 15,
                color: '#222',
                padding: '10px 20px 4px 20px',
                borderBottom: '1px solid #eee',
                marginBottom: 4
              }}>{vendorData.ownerName}</div>
            )}
            <button className={styles['profile-menu-logout-btn']} onClick={handleLogout}>
              <FiLogOut style={{ marginRight: 8, fontSize: 18 }} /> Logout
            </button>
          </div>
        )}
        </div>
      </div>
      
      {/* Pricing badge */}
      <div className={styles.pricingBadge}>Friendly Pricing</div>
      
      {/* Main heading */}
      <h1 className={styles.topHeading}>Start Your Business<br/>Journey Together</h1>
      
      {/* Monthly/Yearly toggle with sliding background */}
      <div className={styles.toggleGroupSlider}>
        <span
          className={styles.toggleSliderBg}
          style={{ left: billingCycle === 'monthly' ? 0 : '50%' }}
        />
        <button
          className={billingCycle === 'monthly' ? styles.toggleBtnActive : styles.toggleBtn}
          onClick={() => onToggleBillingCycle('monthly')}
        >
          Monthly
        </button>
        <button
          className={billingCycle === 'yearly' ? styles.toggleBtnActive : styles.toggleBtn}
          onClick={() => onToggleBillingCycle('yearly')}
        >
          Yearly
        </button>
      </div>
    </section>
  );
};

export default TopSection; 