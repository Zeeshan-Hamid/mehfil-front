import Image from 'next/image';
import styles from './EventHighlightsSection.module.css';

export default function EventHighlightsSection() {
  return (
    <section className={styles.eventHighlightsSection}>
      {/* Background */}
      <div className={styles.background}></div>
      
      {/* Decorative Elements */}
      <div className={styles.decorativeElements}>
        {/* Left Purple Rectangle */}
        <div className={styles.leftPurpleRect}></div>
        
        {/* Right Purple Rectangle */}
        <div className={styles.rightPurpleRect}></div>
        
        {/* Left Mask Group */}
        <div className={styles.leftMaskGroup}>
          <div className={styles.leftVector}></div>
          <div className={styles.leftInnerRect}></div>
        </div>
        
        {/* Right Mask Group */}
        <div className={styles.rightMaskGroup}>
          <div className={styles.rightVector}></div>
          <div className={styles.rightInnerRect}></div>
        </div>
        
        {/* Center Image Container */}
        <div className={styles.centerImageContainer}>
          <div className={styles.centerPurpleRect}></div>
          <div className={styles.centerImage}>
            <Image 
              src="/06.png" 
              alt="Event Highlights"
              width={342}
              height={338}
              style={{ transform: 'rotate(-17.66deg)' }}
            />
          </div>
        </div>
      </div>
      
      {/* Header Section */}
      <div className={styles.header}>
        <h2 className={styles.title}>Event Highlights</h2>
        <p className={styles.subtitle}>
          Discover major highights of Mehfil's past events
        </p>
      </div>
    </section>
  );
} 