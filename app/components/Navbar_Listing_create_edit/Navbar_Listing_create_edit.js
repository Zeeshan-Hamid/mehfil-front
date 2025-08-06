"use client";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useUserStore } from '../../state/userStore';
import { useVendorStore } from '../../state/userStore';
import { FiLogOut, FiUser, FiMenu, FiX } from 'react-icons/fi';
import styles from './Navbar_Listing_create_edit.module.css';

export default function Navbar_Listing_create_edit() {
  const router = useRouter();
  const { user, logout } = useUserStore();
  const { vendorData } = useVendorStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleNavigation = (path) => {
    setShowMobileMenu(false);
    router.push(path);
  };

  return (
    <header className={styles['listing-create-edit-topbar']}>
      {/* Logo Section */}
      <div className={styles['topbar-logo-group']}>

        <Image src="/logo.png" alt="Mehfil Logo" width={35} height={45} className={styles['topbar-logo-img']} />
        <span className={styles['topbar-logo-text']}>MEHFIL</span>

      </div>

      {/* Desktop Navigation */}
      <nav className={styles['topbar-nav']}>
        <button 
          className={styles['topbar-nav-link']} 
          onClick={() => handleNavigation('/profile_listing')}
        >
          Dashboard
        </button>
        <button 
          className={styles['topbar-nav-link']} 
          onClick={() => handleNavigation('/profile_listing')}
        >
          Listings
        </button>
        <button 
          className={styles['topbar-nav-link']} 
          onClick={() => handleNavigation('/subscription_vendor')}
        >
          Plans
        </button>
      </nav>

      {/* Desktop User Section */}
      <div className={styles['topbar-user-group']}>
        <div 
          className={styles['topbar-profile-photo']}
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          ref={profileRef}
        >
          {vendorData && vendorData.businessName ? (
            <span className={styles['profile-initial']}>
              {vendorData.businessName.charAt(0).toUpperCase()}
            </span>
          ) : (
            <FiUser size={16} />
          )}
        </div>
        
        {showProfileMenu && (
          <div className={styles['profile-menu']}>
            {vendorData && vendorData.ownerName && (
              <div className={styles['profile-menu-name']}>
                {vendorData.ownerName}
              </div>
            )}
            <button 
              className={styles['profile-menu-logout']} 
              onClick={handleLogout}
            >
              <FiLogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button 
        className={styles['mobile-menu-btn']}
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        ref={mobileMenuRef}
      >
        {showMobileMenu ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className={styles['mobile-menu']}>
          <div className={styles['mobile-menu-header']}>
            <div className={styles['mobile-profile']}>
              <div className={styles['mobile-profile-photo']}>
                {vendorData && vendorData.businessName ? (
                  <span className={styles['profile-initial']}>
                    {vendorData.businessName.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <FiUser size={20} />
                )}
              </div>
              <div className={styles['mobile-profile-info']}>
                <div className={styles['mobile-profile-name']}>
                  {vendorData?.ownerName || 'User'}
                </div>
                <div className={styles['mobile-profile-business']}>
                  {vendorData?.businessName || 'Business'}
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles['mobile-menu-links']}>
            <button 
              className={styles['mobile-menu-link']}
              onClick={() => handleNavigation('/profile_listing')}
            >
              Dashboard
            </button>
            <button 
              className={styles['mobile-menu-link']}
              onClick={() => handleNavigation('/profile_listing')}
            >
              Listings
            </button>
            <button 
              className={styles['mobile-menu-link']}
              onClick={() => handleNavigation('/subscription_vendor')}
            >
              Plans
            </button>
            <button 
              className={styles['mobile-menu-link']}
              onClick={handleLogout}
            >
              <FiLogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
} 