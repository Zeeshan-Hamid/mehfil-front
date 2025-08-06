'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './VendorCard.module.css';

const VendorCard = ({
  id,
  image,
  featured,
  name,
  category,
  location,
  price,
  rating,
  ratingCount,
  onClick
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (id) {
      router.push(`/vendor_listing_details/${id}`);
    }
  };

  return (
    <div 
      className={styles['vendor-card']}
      onClick={handleClick}
    >
      <div className={styles['vendor-card-image-container']}>
        <Image
          src={image || '/hero_bg_blur.png'}
          alt={name}
          fill
          className={styles['vendor-card-image']}
        />
        {featured && (
          <div className={styles['featured-badge']}>
            Featured
          </div>
        )}
      </div>
      <div className={styles['vendor-card-content']}>
        <h3 className={styles['vendor-name']}>{name}</h3>
        {category && (
          <p className={styles['vendor-category']}>{category}</p>
        )}
        <div className={styles['location-container']}>
          <Image 
            src="/location_icon.png" 
            alt="Location" 
            width={16} 
            height={16}
            className={styles['location-icon']}
          />
          <span className={styles['location-text']}>{location}</span>
        </div>
        <div className={styles['card-footer']}>
          <div className={styles['price']}>{price}</div>
          <div className={styles['rating-container']}>
            <span className={styles['star-icon']}>★</span>
            <span className={styles['rating-text']}>{rating} ({ratingCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorCard; 