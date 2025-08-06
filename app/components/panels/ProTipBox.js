import { useState, useEffect } from 'react';
import styles from './ProTipBox.module.css';

export default function ProTipBox({ storageKey }) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'minimized') setOpen(false);
  }, [storageKey]);

  const handleToggle = () => {
    setOpen((prev) => {
      const next = !prev;
      localStorage.setItem(storageKey, next ? 'open' : 'minimized');
      return next;
    });
  };

  if (!open) {
    return (
      <div className={styles.proTipBar} onClick={handleToggle} tabIndex={0} role="button" aria-label="Expand pro tip" onKeyPress={e => (e.key === 'Enter' || e.key === ' ') && handleToggle()}>
        <span className={styles.proTipBarLabel}>Pro tip</span>
        <span className={styles.proTipBarChevron}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path d="M5 7l4 4 4-4" stroke="#767676" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
        </span>
      </div>
    );
  }

  return (
    <div className={styles.proTipBox}>
      <button className={styles.minimizeBtn} onClick={handleToggle} aria-label="Minimize">
        <svg width="18" height="18" viewBox="0 0 18 18"><path d="M5 11l4-4 4 4" stroke="#767676" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
      </button>
      <div className={styles.proTipTitle}>Pro tip: Prioritize representation and inclusivity</div>
      <div className={styles.proTipText}>in your selections--diverse imagery allows couples to connect with and imagine themselves in your work.</div>
      <div className={styles.proTipText}>Credit photographers and other vendors by tagging them.</div>
      <div className={styles.proTipStrong}><span className={styles.proTipStrongText}>We need photographer credit to </span>feature your images on social media!</div>
    </div>
  );
} 