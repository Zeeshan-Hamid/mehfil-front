import Image from 'next/image';
import styles from '../ProfileListingPage.module.css';
import { useState, useRef, useEffect } from 'react';
import { useUserStore } from '../../state/userStore';
import { useVendorStore } from '../../state/userStore';
import { FiLogOut } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import NotificationBell from '../../components/Notifications/NotificationBell';
import GlobalNotificationProvider from '../../components/Providers/GlobalNotificationProvider';

export default function TopBar({ selectedMenu, allowBackOnLogout, sidebarCollapsed, setSidebarCollapsed }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useUserStore();
  const { vendorData } = useVendorStore();
  const showCompleteProfile = user && !user.profileCompleted;
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      // Consider mobile if width is small OR if height is much larger than width (vertical monitor)
      const isSmallWidth = window.innerWidth <= 600;
      const isVerticalMonitor = window.innerHeight > window.innerWidth * 1.2;
      const mobileState = isSmallWidth || isVerticalMonitor;
      setIsMobile(mobileState);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Refs for click outside
  const profilePhotoRef = useRef(null);
  const profilePopoutRef = useRef(null);

  // Close popouts on outside click
  useEffect(() => {
    function handleClick(e) {
      // Close profile menu if clicking outside
      if (showProfileMenu) {
        if (
          profilePhotoRef.current &&
          !profilePhotoRef.current.contains(e.target) &&
          profilePopoutRef.current &&
          !profilePopoutRef.current.contains(e.target)
        ) {
          setShowProfileMenu(false);
        }
      }
    }
    
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showProfileMenu]);

  // Logout handler: allow back, clear user, redirect to login
  const handleLogout = () => {
    if (allowBackOnLogout) allowBackOnLogout();
    logout();
    router.push('/login');
  };

  return (
    <GlobalNotificationProvider>
      <div className={styles['profile-listing-topbar']} style={{ paddingRight: 'clamp(20px, 2.5vw, 32px)' }}>
        {/* Mobile Hamburger Button - Left Side */}
        <button 
          className={styles['mobile-hamburger-btn']}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className={styles['topbar-title']}>
          {selectedMenu === 'Dashboard' ? 'Vendor Dashboard' : selectedMenu}
        </div>
        <div className={styles['topbar-actions']}>
          {showCompleteProfile && (
            <button className={styles['complete-profile-btn']}>Complete Profile</button>
          )}
          <NotificationBell 
            customIcon={
              <Image src="/notification_bell_icon.png" alt="Notifications" width={24} height={24} />
            }
            customStyles={{
              padding: 'clamp(6px, 1vh, 8px)',
              borderRadius: 'clamp(6px, 0.8vw, 8px)'
            }}
            dropdownPosition="right"
          />
          <div
            className={styles['profile-photo-business-container']}
            onClick={() => setShowProfileMenu((v) => !v)}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}
            ref={profilePhotoRef}
          >
            {/* Show only the profile photo, no name */}
            <div 
              className={styles['profile-photo-large']} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                background: '#E5D6F0', 
                color: '#9A7DA6', 
                fontWeight: 700, 
                fontSize: 'clamp(16px, 2vw, 22px)', 
                borderRadius: 'clamp(8px, 1vw, 12px)', 
                width: 'clamp(36px, 4vw, 45px)', 
                height: 'clamp(34px, 4vw, 43px)', 
                userSelect: 'none',
                textTransform: 'uppercase',
                letterSpacing: 1
              }}
            >
              {vendorData && vendorData.businessName ? vendorData.businessName.charAt(0) : '?'}
            </div>
            {showProfileMenu && (
              <div className={styles['profile-menu-drawer']} ref={profilePopoutRef}>
                {/* Show full name above logout button */}
                {vendorData && vendorData.ownerName && (
                  <div style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600,
                    fontSize: 'clamp(12px, 1.4vw, 15px)',
                    color: '#222',
                    padding: 'clamp(8px, 1vh, 10px) clamp(16px, 2vw, 20px) clamp(4px, 0.5vh, 4px) clamp(16px, 2vw, 20px)',
                    borderBottom: '1px solid #eee',
                    marginBottom: 'clamp(2px, 0.5vh, 4px)'
                  }}>{vendorData.ownerName}</div>
                )}
                <button className={styles['profile-menu-logout-btn']} onClick={handleLogout}>
                  <FiLogOut style={{ marginRight: 8, fontSize: 18 }} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </GlobalNotificationProvider>
  );
} 