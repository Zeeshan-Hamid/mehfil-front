import Image from 'next/image';
import styles from '../ProfileListingPage.module.css';
import { useRouter } from 'next/navigation';

export default function Sidebar({ menuItems, selectedMenu, setSelectedMenu, collapsed, setCollapsed }) {
  const router = useRouter();
  // Map menu items to icon filenames
  const iconMap = {
    'Dashboard': 'dashboard_icon.png',
    'Analytics': 'analytics_icon.png',
    'Bookings': 'bookings_icon.png',
    'Listings': 'listings_icon.png',
    'Reviews': 'star1.png',
    'Invoices': 'invoices_icon.png',
    'Messages': 'messages_icon.png',
    'Settings': 'settings__icon.png',
    'Marketing': 'analytics_icon.png', // Placeholder icon for Marketing
  };
  return (
    <aside className={`${styles['profile-listing-menu']} ${collapsed ? styles['menu-collapsed'] : ''}`}>

      {/* Logo/Title */}
      <div className={styles['menu-logo-group']}>
        <Image 
          src="/logo.png" 
          alt="Mehfil Logo" 
          width={0}
          height={0}
          sizes="(max-width: 600px) 24px, (max-width: 1200px) 32px, 35px"
          className={styles['menu-logo']}
          style={{
            width: 'clamp(24px, 3vw, 35px)',
            height: 'clamp(32px, 4vw, 45px)'
          }}
        />
        <span className={`${styles['menu-brand']} ${collapsed ? styles['brand-collapsed'] : ''}`}>MEHFIL</span>
      </div>
      
      {/* Menu Items */}
      <nav className={styles['menu-items']}>
        {menuItems.map((item) => (
          <button
            key={item}
            className={
              selectedMenu === item
                ? `${styles['menu-item']} ${styles['active']}`
                : styles['menu-item']
            }
            onClick={() => setSelectedMenu(item)}
            title={collapsed ? item : ''}
          >
            {iconMap[item] && (
              <Image
                src={`/${iconMap[item]}`}
                alt={`${item} icon`}
                width={0}
                height={0}
                sizes="(max-width: 600px) 16px, (max-width: 1200px) 20px, 22px"
                className={styles['menu-item-icon']}
                style={{
                  width: 'clamp(16px, 2.2vw, 22px)',
                  height: 'clamp(16px, 2.2vw, 22px)'
                }}
              />
            )}
            <span className={`${styles['menu-item-text']} ${collapsed ? styles['text-collapsed'] : ''}`}>
              {item}
            </span>
          </button>
        ))}
      </nav>
      
      <div style={{ flex: 1 }} />
      
      {/* Upgrade Now Box */}
      <div className={`${styles['upgrade-now-group']} ${collapsed ? styles['upgrade-collapsed'] : ''}`}>
        {/* Frosted Glass Background */}
        <div className={styles['upgrade-glass-bg']} />
        {/* Gem and Sparkles */}
        <div className={styles['upgrade-gem-center']}>
          <Image 
            src="/premium_star.png" 
            alt="Premium Star" 
            width={0}
            height={0}
            sizes="(max-width: 600px) 30px, (max-width: 1200px) 60px, 90px"
            className={styles['gem-img']}
            style={{
              width: 'clamp(30px, 8vw, 90px)',
              height: 'auto'
            }}
          />
          {/* Sparkles */}
          <span className={styles['sparkle1']} />
          <span className={styles['sparkle2']} />
          <span className={styles['sparkle3']} />
          <span className={styles['sparkle4']} />
          <span className={styles['sparkle5']} />
          {/* Ellipse Shadow */}
          <div className={styles['gem-ellipse']} />
        </div>
        {/* Upgrade Button */}
        <button className={styles['upgrade-btn-rect']} onClick={() => router.push('/subscription_vendor')}>
          <span className={`${styles['upgrade-btn-text']} ${collapsed ? styles['upgrade-text-collapsed'] : ''}`}>
            {collapsed ? 'Upgrade' : 'Upgrade Now'}
          </span>
        </button>
      </div>
      
      <div style={{ flex: 1 }} />
    </aside>
  );
} 