"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from 'react';
import styles from './Navbar.module.css';
import { useUserStore } from '@/app/state/userStore';
import apiService from '../../utils/api';
import { debounce } from 'lodash';

export default function Navbar({ backgroundColor, customHeight }) {
  const { user, logout } = useUserStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchSuggestions = async (searchQuery) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.searchListings({ q: searchQuery, limit: 5 });
      if (response.success) {
        setSuggestions(response.data.listings);
      } else {
        setError(response.message || 'Failed to fetch suggestions.');
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'An error occurred while searching.');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 300), []);

  useEffect(() => {
    debouncedFetchSuggestions(searchQuery);
    return () => {
      debouncedFetchSuggestions.cancel();
    };
  }, [searchQuery, debouncedFetchSuggestions]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      setIsSearchExpanded(false);
      setSearchQuery('');
      setSuggestions([]);
    }
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded) {
      setTimeout(() => {
        const searchInput = document.getElementById('navbar-search-input');
        if (searchInput) searchInput.focus();
      }, 100);
    }
  };

  const closeSearch = () => {
    setIsSearchExpanded(false);
    setSearchQuery('');
    setSuggestions([]);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest(`.${styles['mobile-menu-content']}`) && !event.target.closest(`.${styles['mobile-menu-toggle']}`)) {
        closeMenu();
      }
      if (isUserMenuOpen && !event.target.closest(`.${styles.userMenuContainer}`)) {
        setIsUserMenuOpen(false);
      }
      if (isSearchExpanded && !event.target.closest(`.${styles.desktopSearchContainer}`) && !event.target.closest(`.${styles.mobileSearchContainer}`)) {
        closeSearch();
      }
    };

    // Prevent body scroll when menu is open
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen, isUserMenuOpen, isSearchExpanded]);

  const customerName = user?.customerProfile?.fullName || user?.email || 'My Account';

  return (
    <nav 
      className={styles['main-nav']} 
      style={{
        ...(backgroundColor ? { background: backgroundColor } : {}),
        ...(customHeight ? { padding: customHeight } : {})
      }}
    >
      {/* Desktop Navigation */}
      <div className={styles['nav-left']}>
        <div className={styles.logo}>
          <Image
            src="/logo.png"
            alt="Mehfil Logo"
            width={60}
            height={40}
            className={styles['logo-image']}
          />
          <span className={styles['logo-text']}>MEHFIL</span>
        </div>
        
        <div className={styles['nav-links']}>
          <Link href="/" className={styles['nav-link']}>Home</Link>
          <Link href="/vendor_listings" className={styles['nav-link']}>Vendors</Link>
          <Link href="/contact" className={styles['nav-link']}>Contact</Link>
          <Link href="/about" className={styles['nav-link']}>About Us</Link>
        </div>
      </div>

      {/* Desktop Search - Center of Navbar */}
      <div className={`${styles.desktopSearchContainer} ${isSearchExpanded ? styles.searchExpanded : ''}`}>
        <form onSubmit={handleSearch} className={styles.navbarSearchForm}>
          <input
            id="navbar-search-input"
            type="text"
            placeholder="Search for vendors, services, or events..."
            value={searchQuery}
            onChange={handleInputChange}
            className={styles.navbarSearchInput}
          />
          <button type="submit" className={styles.navbarSearchBtn}>
            <Image
              src="/white_search_icon.png"
              alt="Search"
              width={16}
              height={16}
              style={{ objectFit: 'contain' }}
            />
          </button>
        </form>
        
        {/* Desktop Suggestions Box */}
        {(isLoading || suggestions.length > 0 || error) && isSearchExpanded && (
          <div className={styles.suggestionsBox}>
            {isLoading && <div className={styles.suggestionItem}>Loading...</div>}
            {error && <div className={`${styles.suggestionItem} ${styles.error}`}>{error}</div>}
            {!isLoading && !error && suggestions.map((listing) => (
              <Link key={listing._id} href={`/vendor_listing_details/${listing._id}`} passHref>
                <div className={styles.suggestionItem}>
                  <p className={styles.suggestionName}>{listing.name}</p>
                  <p className={styles.suggestionLocation}>
                    {listing.location.city}, {listing.location.state}
                  </p>
                </div>
              </Link>
            ))}
            {!isLoading && !error && suggestions.length === 0 && searchQuery.length > 1 && (
              <div className={styles.suggestionItem}>No results found.</div>
            )}
          </div>
        )}
      </div>

      <div className={styles['nav-right']}>
        <div className={styles['nav-icons']}>
          <div className={`${styles.icon} ${styles['search-icon']} ${styles.searchIcon}`} onClick={toggleSearch}>
            <Image
              src="/white_search_icon.png"
              alt="Search"
              width={32}
              height={32}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <Link href="/cart" className={`${styles.icon} ${styles['cart-icon']}`}>
            <Image
              src="/white_cart_icon.png"
              alt="Cart"
              width={32}
              height={32}
              style={{ objectFit: 'contain' }}
            />
          </Link>
          <Link href="/customer_profile_dash" className={`${styles.icon} ${styles['love-icon']}`}>
            <Image
              src="/white_like_icon.png"
              alt="Like"
              width={32}
              height={32}
              style={{ objectFit: 'contain' }}
            />
          </Link>
        </div>

        {isMounted && user && user.role === 'customer' && (
          <Link href="/customer_profile_dash" className={`${styles['auth-btn']} ${styles['profile-btn']}`}>
            My Profile
          </Link>
        )}

        {isMounted && user && user.role === 'customer' ? (
          <div className={styles.userMenuContainer}>
            <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className={`${styles.authBtn} ${styles.userNameBtn}`}>
              {customerName}
            </button>
            {isUserMenuOpen && (
              <div className={styles.userDropdown}>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={styles['auth-buttons']}>
            <Link href="/login" className={`${styles['auth-btn']} ${styles['login-btn']}`}>Login</Link>
            <Link href="/customer_signup" className={`${styles['auth-btn']} ${styles['signup-btn']}`}>Sign Up</Link>
            <Link href="/vendor_signup" className={`${styles['auth-btn']} ${styles['vendor-btn']}`}>Join as Vendor</Link>
          </div>
        )}
      </div>

      {/* Mobile Hamburger Menu */}
      <div className={styles['mobile-menu-toggle']} onClick={toggleMenu}>
        <div className={`${styles['hamburger-line']} ${isMenuOpen ? styles['hamburger-line-open'] : ''}`}></div>
        <div className={`${styles['hamburger-line']} ${isMenuOpen ? styles['hamburger-line-open'] : ''}`}></div>
        <div className={`${styles['hamburger-line']} ${isMenuOpen ? styles['hamburger-line-open'] : ''}`}></div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`${styles['mobile-menu-overlay']} ${isMenuOpen ? styles['mobile-menu-overlay-open'] : ''}`}>
        <div className={styles['mobile-menu-content']}>
          <div className={styles['mobile-menu-header']}>
            <div className={styles['mobile-logo']}>
              <Image
                src="/logo.png"
                alt="Mehfil Logo"
                width={45}
                height={28}
                className={styles['mobile-logo-image']}
              />
              <span className={styles['mobile-logo-text']}>MEHFIL</span>
            </div>
          </div>
          
          <div className={styles['mobile-nav-links']}>
            <Link href="/" className={styles['mobile-nav-link']} onClick={closeMenu}>Home</Link>
            <Link href="/about" className={styles['mobile-nav-link']} onClick={closeMenu}>About Us</Link>
            {isMounted && user && user.role === 'customer' && (
              <Link href="/customer_profile_dash" className={styles['mobile-nav-link']} onClick={closeMenu}>My Profile</Link>
            )}
            <Link href="/vendor_listings" className={styles['mobile-nav-link']} onClick={closeMenu}>Vendors</Link>
            <Link href="/contact" className={styles['mobile-nav-link']} onClick={closeMenu}>Contact</Link>
          </div>

          {/* Mobile Search Input */}
          <div className={`${styles.mobileSearchContainer} ${isSearchExpanded ? styles.searchExpanded : ''}`}>
            <form onSubmit={handleSearch} className={styles.mobileSearchForm}>
              <input
                id="mobile-search-input"
                type="text"
                placeholder="Search for vendors, services, or events..."
                value={searchQuery}
                onChange={handleInputChange}
                className={styles.mobileSearchInput}
              />
              <button type="submit" className={styles.mobileSearchBtn}>
                <Image
                  src="/white_search_icon.png"
                  alt="Search"
                  width={16}
                  height={16}
                  style={{ objectFit: 'contain' }}
                />
              </button>
            </form>
            
            {/* Mobile Suggestions Box */}
            {(isLoading || suggestions.length > 0 || error) && isSearchExpanded && (
              <div className={styles.suggestionsBox}>
                {isLoading && <div className={styles.suggestionItem}>Loading...</div>}
                {error && <div className={`${styles.suggestionItem} ${styles.error}`}>{error}</div>}
                {!isLoading && !error && suggestions.map((listing) => (
                  <Link key={listing._id} href={`/vendor_listing_details/${listing._id}`} passHref>
                    <div className={styles.suggestionItem}>
                      <p className={styles.suggestionName}>{listing.name}</p>
                      <p className={styles.suggestionLocation}>
                        {listing.location.city}, {listing.location.state}
                      </p>
                    </div>
                  </Link>
                ))}
                {!isLoading && !error && suggestions.length === 0 && searchQuery.length > 1 && (
                  <div className={styles.suggestionItem}>No results found.</div>
                )}
              </div>
            )}
          </div>

          <div className={styles['mobile-nav-icons']}>
            <div className={styles['mobile-icon']} onClick={toggleSearch}>
              <Image
                src="/white_search_icon.png"
                alt="Search"
                width={24}
                height={24}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <Link href="/cart" className={styles['mobile-icon']} onClick={closeMenu}>
              <Image
                src="/white_cart_icon.png"
                alt="Cart"
                width={24}
                height={24}
                style={{ objectFit: 'contain' }}
              />
            </Link>
            <Link href="/customer_profile_dash" className={styles['mobile-icon']} onClick={closeMenu}>
              <Image
                src="/white_like_icon.png"
                alt="Like"
                width={24}
                height={24}
                style={{ objectFit: 'contain' }}
              />
            </Link>
          </div>

          {isMounted && user && user.role === 'customer' ? (
            <div className={styles['mobile-auth-buttons']}>
              <span className={styles.mobileUserName}>Welcome, {customerName}</span>
              <button onClick={handleLogout} className={`${styles['mobile-auth-btn']} ${styles['mobile-login-btn']}`}>
                Sign Out
              </button>
            </div>
          ) : (
            <div className={styles['mobile-auth-buttons']}>
              <Link href="/login" className={`${styles['mobile-auth-btn']} ${styles['mobile-login-btn']}`} onClick={closeMenu}>Login</Link>
              <Link href="/customer_signup" className={`${styles['mobile-auth-btn']} ${styles['mobile-signup-btn']}`} onClick={closeMenu}>Sign Up</Link>
              <Link href="/vendor_signup" className={`${styles['mobile-auth-btn']} ${styles['mobile-vendor-btn']}`} onClick={closeMenu}>Join as Vendor</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}