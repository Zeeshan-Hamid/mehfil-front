import Image from 'next/image';
import styles from './CustomerProfileDashPage.module.css';
import { useRouter } from 'next/navigation';

export default function Sidebar({ menuItems, selectedMenu, setSelectedMenu, collapsed, setCollapsed }) {
  const router = useRouter();
  // Map menu items to icon filenames
  const iconMap = {
    'Dashboard': 'dashboard_icon.png',
    'My Orders': 'white_cart_icon.png',
    'My Events': 'listings_icon.png',
    'Calendar': 'listings_icon.png', // TODO: Replace with calendar icon if added to public/
    'Messages': 'messages_icon.png',
    'Favorites': 'white_like_icon.png',
    'Settings': 'settings__icon.png',
  };
  return (
    <aside className={`${styles['profile-listing-menu']} ${collapsed ? styles['menu-collapsed'] : ''}`}>
      {/* Collapsible Toggle Button - Positioned on right border */}
      <button 
        className={styles['sidebar-collapse-toggle']}
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <div className={`${styles['collapse-arrow']} ${collapsed ? styles['arrow-collapsed'] : ''}`}>
          {/* Arrow Icon for Desktop */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {/* Logo/Title */}
      <div className={styles['menu-logo-group']}>
        <Image src="/logo.png" alt="Mehfil Logo" width={35} height={45} className={styles['menu-logo']} />
        <span className={`${styles['menu-brand']} ${collapsed ? styles['brand-collapsed'] : ''}`}>Mehfil</span>
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
                width={22}
                height={22}
                className={styles['menu-item-icon']}
              />
            )}
            <span className={`${styles['menu-item-text']} ${collapsed ? styles['text-collapsed'] : ''}`}>
              {item}
            </span>
          </button>
        ))}
      </nav>
    </aside>
  );
} 