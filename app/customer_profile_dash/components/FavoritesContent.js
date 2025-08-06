import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import styles from "./FavoritesContent.module.css";
import apiService from '../../utils/api';
import { toast } from 'react-toastify';

export default function FavoritesContent() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch favorites on component mount
  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getFavorites();
      if (response.status === 'success') {
        setFavorites(response.data.favorites);
      } else {
        setError(response.message || 'Failed to fetch favorites');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (eventId) => {
    try {
      const response = await apiService.removeFromFavorites(eventId);
      if (response.status === 'success') {
        setFavorites(favorites.filter(item => item.event._id !== eventId));
        toast.success('Removed from favorites!');
      } else {
        toast.error(response.message || 'Failed to remove from favorites');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    }
  };

  const handleViewDetails = (eventId) => {
    router.push(`/vendor_listing_details/${eventId}`);
  };

  if (isLoading) {
    return (
      <div className={styles["favorites-root"]}>
        <div className={styles["empty-favorites"]}>
          <div className={styles["empty-favorites-icon"]}>⏳</div>
          <h2>Loading favorites...</h2>
          <p>Please wait while we fetch your favorites.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles["favorites-root"]}>
        <div className={styles["empty-favorites"]}>
          <div className={styles["empty-favorites-icon"]}>❌</div>
          <h2>Error loading favorites</h2>
          <p>{error}</p>
          <button 
            className={styles["retry-button"]}
            onClick={fetchFavorites}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className={styles["favorites-root"]}>
        <div className={styles["empty-favorites"]}>
          <div className={styles["empty-favorites-icon"]}>❤️</div>
          <h2>No favorites yet</h2>
          <p>Start adding vendors to your favorites to see them here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["favorites-root"]}>
      <h1 className={styles["favorites-title"]}>Your Favorites</h1>
      <div className={styles["favorites-subtitle"]}>Favorites ({favorites.length})</div>
      
      <div className={styles["favorites-container"]}>
        {favorites.map(favorite => {
          const event = favorite.event;
          const vendor = event.vendor;
          return (
            <div className={styles["favorite-item-card"]} key={favorite._id}>
              <div className={styles["favorite-item-image-container"]}>
                <img 
                  src={event.imageUrls && event.imageUrls.length > 0 ? event.imageUrls[0] : "/logo.png"} 
                  alt={event.name} 
                  className={styles["favorite-item-img"]} 
                />
              </div>
              
              <div className={styles["favorite-item-content"]}>
                <div className={styles["favorite-item-info"]}>
                  <div className={styles["favorite-item-name"]}>{event.name}</div>
                  <div className={styles["favorite-item-desc"]}>{vendor?.vendorProfile?.businessName || 'Vendor'}</div>
                  <div className={styles["favorite-item-rating"]}>
                    {Array.from({ length: Math.round(event.averageRating || 0) }).map((_, i) => (
                      <span key={i} className={styles["star-icon"]}>⭐</span>
                    ))}
                    <span className={styles["favorite-item-reviews"]}>({event.totalReviews || 0} Reviews)</span>
                  </div>
                  <div className={styles["favorite-item-meta"]}>
                    <span className={styles["meta-item"]}>Type: {event.eventType}</span>
                    <span className={styles["meta-item"]}>Location: {event.location?.city || 'N/A'}</span>
                  </div>
                </div>
                
                <div className={styles["favorite-item-actions"]}>
                  <button 
                    className={styles["favorite-action-btn"]}
                    onClick={() => handleViewDetails(event._id)}
                  >
                    View Details
                  </button>
                  <button 
                    className={styles["favorite-remove-btn"]}
                    onClick={() => handleRemoveFavorite(event._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 