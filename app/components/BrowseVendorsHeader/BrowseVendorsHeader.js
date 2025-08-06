'use client';
import Image from 'next/image';
import styles from './BrowseVendorsHeader.module.css';

const BrowseVendorsHeader = () => {
  return (
    <div className={styles.browseVendorsHeader}>
      {/* Header Section */}
      <div className={styles.bgPurpleHeader}>
        <div className="header-content">
          <h1 className="page-title">Browse Vendors</h1>
          <p className="page-subtitle">
            Discover how Mehfil simplifies event planning with expert services and vendor booking options
          </p>
          <div className={styles.browseSearchRow}>
            <form className={styles.browseSearchBar}>
              <span className={styles.searchIconWrap}>
                <Image src="/search_icon.png" alt="Search" width={18} height={18} className="search-icon" />
              </span>
              <input
                type="text"
                className={styles.browseSearchInput}
                placeholder="Wedding Venues"
              />
              <span className={styles.searchDivider} />
              <span className={styles.searchIn}>in</span>
              <input
                type="text"
                className={styles.browseLocationInput}
                placeholder="Location"
              />
            </form>
            <button className={styles.browseSearchBtn}>Search</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseVendorsHeader; 