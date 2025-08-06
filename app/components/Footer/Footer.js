'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './Footer.module.css';
import apiService from '../../utils/api';

export default function Footer({ isPreview = false }) {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubscribe = async (e) => {
    e.preventDefault();
    
    if (isPreview) return;
    
    if (!email.trim()) {
      alert('Please enter a valid email address');
      return;
    }

    setIsSubscribing(true);

    try {
      const response = await apiService.subscribeNewsletter(email);
      
      if (response.success) {
        alert('Thank you for subscribing to our newsletter!');
        setEmail('');
      } else {
        alert(response.message || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      alert(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.linksSection}>
          <div className={styles.linkGroup}>
            <div className={styles.linkHeading}>Product</div>
            <div className={styles.linkItem}>Employee database</div>
            <div className={styles.linkItem}>Payroll</div>
          </div>
          <div className={styles.linkGroup}>
            <div className={styles.linkHeading}>Information</div>
            <div className={styles.linkItem}>FAQ</div>
            <div className={styles.linkItem}>Blog</div>
            <div className={styles.linkItem}>Support</div>
          </div>
          <div className={styles.linkGroup}>
            <div className={styles.linkHeading}>Company</div>
            <div className={styles.linkItem}>About us</div>
            <div className={styles.linkItem}>Contact us</div>
            <div className={styles.linkItem}>Hutte.io</div>
          </div>
        </div>
        <div className={styles.newsletterSection}>
          <div className={styles.newsletterHeading}>Subscribe to our Newsletter</div>
          <div className={styles.newsletterSubheading}>Stay up-to-date with the latest event planning tips, vendor spotlights, and exclusive offers from Mehfil</div>
          <form className={styles.newsletterForm} onSubmit={handleNewsletterSubscribe}>
            <input 
              className={styles.emailInput} 
              type="email" 
              placeholder="Enter your email" 
              disabled={isPreview || isSubscribing}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button 
              className={styles.subscribeButton} 
              type="submit" 
              disabled={isPreview || isSubscribing}
            >
              {isSubscribing ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>
      <div className={styles.divider} />
      <div className={styles.bottomRow}>
        <div className={styles.logoSection} style={isPreview ? { pointerEvents: 'none', cursor: 'default' } : {}}>
          <img src="/logo.png" alt="Mehfil Logo" className={styles.logoImg} />
          <span className={styles.logoText}>Mehfil</span>
        </div>
        <div className={styles.legalLinks} style={isPreview ? { pointerEvents: 'none', cursor: 'default' } : {}}>
          <span>Pricing</span>
          <span>Terms</span>
          <span>Privacy</span>
          <span>Cookies</span>
        </div>
        <div className={styles.socialSection}>
          {isPreview ? (
            <span className={styles.socialIcon} aria-label="X">
              <Image src="/X_twitter_icon.png" alt="X" width={14} height={14} />
            </span>
          ) : (
            <a href="#" className={styles.socialIcon} aria-label="X">
              <Image src="/X_twitter_icon.png" alt="X" width={14} height={14} />
            </a>
          )}
          {isPreview ? (
            <span className={styles.socialIcon} aria-label="Instagram">
              <Image src="/Insta_icon.png" alt="Instagram" width={14} height={14} />
            </span>
          ) : (
            <a href="#" className={styles.socialIcon} aria-label="Instagram">
              <Image src="/Insta_icon.png" alt="Instagram" width={14} height={14} />
            </a>
          )}
          {isPreview ? (
            <span className={styles.socialIcon} aria-label="LinkedIn">
              <Image src="/Linkedin_icon.png" alt="LinkedIn" width={14} height={14} />
            </span>
          ) : (
            <a href="#" className={styles.socialIcon} aria-label="LinkedIn">
              <Image src="/Linkedin_icon.png" alt="LinkedIn" width={14} height={14} />
            </a>
          )}
        </div>
      </div>
      <div className={styles.copyright}>
        © Copyright 2025 Mehfil. All rights reserved
      </div>
    </footer>
  );
} 