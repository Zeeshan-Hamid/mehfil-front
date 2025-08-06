'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './FileTypeDropdown.module.css';

export default function FileTypeDropdown({ isOpen, onClose, onFileTypeSelect }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleFileTypeClick = (type) => {
    onFileTypeSelect(type);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <div className={styles.dropdownContent}>
        <button 
          className={styles.dropdownItem}
          onClick={() => handleFileTypeClick('image')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
            <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
            <polyline points="21,15 16,10 5,21" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <div className={styles.dropdownItemContent}>
            <span>Image</span>
            <small>Up to 4 images</small>
          </div>
        </button>
        
        <button 
          className={styles.dropdownItem}
          onClick={() => handleFileTypeClick('document')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Document</span>
        </button>
      </div>
    </div>
  );
} 