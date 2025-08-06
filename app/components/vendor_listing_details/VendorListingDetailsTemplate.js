'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import VendorListingImageGrid from './VendorListingImageGrid';
import TagLabel from './TagLabel';
import Image from 'next/image';
import Link from 'next/link';
import ServicesDescSection from './Services_Desc';
import PriceAndPackages from './PriceAndPackages';
import Location from './Location';
import AI_Review_Summary from './AI_Review_Summary';
import SimilarVendors from './SimilarVendors';
import Reviews from './Reviews';
import Footer from '../Footer/Footer';
import Navbar from '../Navbar/Navbar';
import styles from './VendorListingDetailsTemplate.module.css';
import apiService from '../../utils/api';
import { toast } from 'react-toastify';

// Static similar vendors data
const staticSimilarVendors = [
  {
    id: 'glass-hall',
    name: 'Glass Hall',
    image: '/hero_bg_blur.png',
    location: '1700 S Elmhurst Rd.',
    rating: 4,
    reviews: 20,
  },
  {
    id: 'royal-banquet',
    name: 'Royal Banquet',
    image: '/hero_bg_blur.png',
    location: '123 Main St.',
    rating: 5,
    reviews: 35,
  },
  {
    id: 'event-palace',
    name: 'Event Palace',
    image: '/hero_bg_blur.png',
    location: '456 Park Ave.',
    rating: 3,
    reviews: 12,
  },
  {
    id: 'sunset-venue',
    name: 'Sunset Venue',
    image: '/hero_bg_blur.png',
    location: '789 Lake Rd.',
    rating: 4,
    reviews: 18,
  },
  {
    id: 'emerald-hall',
    name: 'Emerald Hall',
    image: '/hero_bg_blur.png',
    location: '321 River St.',
    rating: 5,
    reviews: 27,
  },
];

// Loading skeleton components
function LoadingSkeleton() {
  return (
    <div className={styles['main-section']}>
      <div style={{ width: '100%', height: 'clamp(200px, 30vw, 400px)', background: '#f0f0f0', borderRadius: 'clamp(8px, 1.5vw, 12px)', marginBottom: 'clamp(20px, 3vw, 32px)' }} />
      <div style={{ width: '60%', height: 'clamp(20px, 3vw, 32px)', background: '#f0f0f0', borderRadius: 'clamp(4px, 0.8vw, 6px)', marginBottom: 'clamp(12px, 2vw, 16px)' }} />
      <div style={{ width: '40%', height: 'clamp(16px, 2.5vw, 20px)', background: '#f0f0f0', borderRadius: 'clamp(4px, 0.8vw, 6px)', marginBottom: 'clamp(12px, 2vw, 16px)' }} />
      <div style={{ width: '30%', height: 'clamp(16px, 2.5vw, 20px)', background: '#f0f0f0', borderRadius: 'clamp(4px, 0.8vw, 6px)', marginBottom: 'clamp(20px, 3vw, 32px)' }} />
      <div style={{ width: '25%', height: 'clamp(16px, 2.5vw, 20px)', background: '#f0f0f0', borderRadius: 'clamp(4px, 0.8vw, 6px)', marginBottom: 'clamp(20px, 3vw, 32px)' }} />
    </div>
  );
}

function ErrorDisplay({ error, onRetry }) {
  return (
    <div className={styles['main-section']} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(12px, 2vw, 16px)' }}>
      <h2 style={{ color: '#d32f2f', fontSize: 'clamp(18px, 3.5vw, 24px)', fontWeight: '500' }}>Error Loading Vendor</h2>
      <p style={{ color: '#666', fontSize: 'clamp(14px, 2.5vw, 16px)' }}>{error}</p>
      <button 
        onClick={onRetry}
        style={{
          padding: 'clamp(10px, 2vw, 12px) clamp(20px, 4vw, 24px)',
          background: '#AF8EBA',
          color: 'white',
          border: 'none',
          borderRadius: 'clamp(4px, 0.8vw, 6px)',
          cursor: 'pointer',
          fontSize: 'clamp(14px, 2.5vw, 16px)'
        }}
      >
        Try Again
      </button>
    </div>
  );
}

export default function VendorListingDetailsTemplate({ 
  vendorData, 
  loading = false, 
  error = null, 
  onRetry = null, 
  isPreview = false 
}) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const params = useParams();
  const eventId = params.id;
  const router = useRouter();

  // Check if current event is in favorites on component mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const response = await apiService.getFavorites();
        if (response.status === 'success') {
          const isInFavorites = response.data.favorites.some(
            favorite => favorite.event._id === eventId
          );
          setIsFavorite(isInFavorites);
        }
      } catch (error) {
        // Silently fail - user might not be logged in
        console.log('Could not check favorite status:', error.message);
      }
    };

    if (!isPreview && eventId) {
      checkFavoriteStatus();
    }
  }, [eventId, isPreview]);

  const handleFavoriteToggle = async () => {
    if (isPreview) return;
    
    setIsLoadingFavorite(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await apiService.removeFromFavorites(eventId);
        if (response.status === 'success') {
          setIsFavorite(false);
          toast.success('Removed from favorites!');
        } else {
          toast.error(response.message || 'Failed to remove from favorites');
        }
      } else {
        // Add to favorites
        const response = await apiService.addToFavorites(eventId);
        if (response.status === 'success') {
          setIsFavorite(true);
          toast.success('Added to favorites!');
        } else {
          toast.error(response.message || 'Failed to add to favorites');
        }
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoadingFavorite(false);
    }
  };
  // Static rating data (will be replaced with separate API call later)
  const staticRating = { average: 4.2, count: 20 };

  if (loading) {
    return (
      <div className={styles['details-page-container']}>
        <Navbar isPreview={isPreview} />
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['details-page-container']}>
        <Navbar isPreview={isPreview} />
        <ErrorDisplay error={error} onRetry={onRetry} />
      </div>
    );
  }

  if (!vendorData) {
    return (
      <div className={styles['details-page-container']}>
        <Navbar isPreview={isPreview} />
        <div className={styles['main-section']} style={{ textAlign: 'center' }}>
          <h2>Vendor not found</h2>
        </div>
      </div>
    );
  }

  console.log('Vendor data in template:', vendorData);
  console.log('Vendor object:', vendorData?.vendor);

  return (
    <div className={styles['details-page-container']}>
      <Navbar backgroundColor="#AF8EBA" customHeight="25px 20px"/>
      <section className={styles['main-section']}>
        <VendorListingImageGrid images={vendorData.images || []} isPreview={isPreview} />
        <div className={styles['header-section']}>
          <div className={styles['title-row']}>
            <h2 className={styles['vendor-title']} style={{ 
              color: vendorData.name?.includes('goes here') ? '#999' : '#000',
              fontStyle: vendorData.name?.includes('goes here') ? 'italic' : 'normal'
            }}>
              {vendorData.name}
            </h2>
            <div className={styles['actions-row']}>
              <button 
                className={styles['message-btn']}
                onClick={() => {
                  if (!isPreview) {
                    // Navigate to customer profile dashboard messages tab with vendor-only conversation
                    router.push(`/customer_profile_dash?tab=Messages&vendorId=${vendorData.vendor?._id}`);
                  }
                }}
                disabled={isPreview}
                style={{ opacity: isPreview ? 0.6 : 1 }}
              >
                <Image 
                  src="/chat_bubble_icon.svg" 
                  alt="Message" 
                  width={16} 
                  height={16} 
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
                Message Vendor
              </button>
              <button 
                className={styles['action-icon-btn']}
                onClick={handleFavoriteToggle}
                disabled={isLoadingFavorite}
                style={{ opacity: isLoadingFavorite ? 0.6 : 1 }}
              >
                <Image 
                  src={isFavorite ? "/like_icon.png" : "/like_icon.png"} 
                  alt={isFavorite ? "Remove from favorites" : "Add to favorites"} 
                  width={32} 
                  height={32} 
                  style={{ 
                    filter: isFavorite ? 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)' : 'none'
                  }}
                />
              </button>
              <button className={styles['action-icon-btn']}>
                <Image src="/share_icon.png" alt="Share" width={32} height={32} />
              </button>
            </div>
          </div>
          {vendorData.vendor && (
            <div style={{ marginTop: 'clamp(4px, 1vw, 8px)', marginBottom: 'clamp(8px, 1.5vw, 16px)' }}>
              <p className={styles['vendor-by-text']}>
                by{' '}
                <Link 
                  href={`/vendor/${vendorData.vendor._id}`}
                  className={styles['vendor-link']}
                >
                  {vendorData.vendor.vendorProfile?.businessName || 'Unknown Business'}
                </Link>
              </p>
            </div>
          )}
          <button
            className={styles['info-btn']}
            style={{
              color: vendorData.locationDisplay?.includes('goes here') ? '#999' : '#424242',
              fontStyle: vendorData.locationDisplay?.includes('goes here') ? 'italic' : 'normal',
            }}
            onClick={() => {/* handle location click */}}
          >
            <Image src="/location_icon.png" alt="Location" width={20} height={20} className={styles['location-icon']} />
            {vendorData.locationDisplay}
          </button>
          <button
            className={styles['info-btn']}
            onClick={() => {/* handle reviews click */}}
          >
            <span className={styles['star-rating']}>{'★'.repeat(Math.round(staticRating.average))}</span>
            <span className={styles['rating-text']}>{staticRating.average} ({staticRating.count} Reviews)</span>
          </button>
          <div className={styles['price-display']} style={{
            color: vendorData.displayPrice?.includes('goes here') ? '#999' : '#000',
            fontStyle: vendorData.displayPrice?.includes('goes here') ? 'italic' : 'normal'
          }}>
            From {vendorData.displayPrice}
          </div>
          <div className={styles['tags-container']}>
            {vendorData.displayTags?.map((tag, i) => (
              <TagLabel key={i} tag={tag} />
            )) || []}
          </div>
        </div>
      </section>
      {/* Separator line */}
      <div className={styles['separator']}>
        <div className={styles['separator-line']} />
      </div>
      <section className={styles['content-section']}>
        <ServicesDescSection 
          description={vendorData.description}
          services={vendorData.servicesDisplay}
        />
      </section>
      {/* Separator line */}
      <div className={styles['separator']}>
        <div className={styles['separator-line']} />
      </div>
      <section className={styles['content-section']}>
        <PriceAndPackages packages={vendorData.packagesDisplay} />
      </section>
      {/* Separator line */}
      <div className={styles['separator']}>
        <div className={styles['separator-line']} />
      </div>
      <Location address={vendorData.fullAddress} displayText={vendorData.locationDisplay} />
      {/* Why use Mehfil to message vendors? container - Static for now */}
      <div className={styles['why-mehfil-section']}>
        <div className={styles['why-mehfil-container']}>
          <div className={styles['why-mehfil-title']}>
            Why use Mehfil to message vendors ?
          </div>
          <div className={styles['why-mehfil-list']}>
            {[
              'Fast and reliable.',
              'Effortlessly manage vendor communications and planning details in one centralized location.',
              'Our mobile apps ensure you can stay connected with vendors anytime, anywhere.',
              'For customized pricing and package information, messaging the vendor directly is the quickest way to get the details you need.'
            ].map((text, idx) => (
              <div key={idx} className={styles['why-mehfil-item']}>
                <span className={styles['checkmark']}>&#10003;</span>
                <span className={styles['item-text']}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* AI Review Summary section - Static for now */}
      <div className={styles['content-section']} style={{ marginTop: 'clamp(8px, 1.5vw, 12px)' }}>
        <AI_Review_Summary summary={vendorData.aiReviewSummary} />
      </div>
      {/* Reviews section */}
      <Reviews 
        eventId={vendorData._id} 
        vendorData={vendorData} 
        isPreview={isPreview} 
      />
      {/* Separator line */}
      <div className={styles['separator']}>
        <div className={styles['separator-line']} />
      </div>
      {/* Similar Vendors section - Static for now */}
      <SimilarVendors vendors={staticSimilarVendors} isPreview={isPreview} />
      {/* Separator line */}
      <div className={styles['separator']}>
        <div className={styles['separator-line']} />
      </div>
      <Footer isPreview={isPreview} />
      <style jsx>{`
        .accent-hover-btn:hover {
          color: #AF8EBA !important;
        }
        .accent-hover-btn:hover span {
          color: #AF8EBA !important;
        }
        .icon-accent-hover:hover {
          background: #AF8EBA22;
        }
        .icon-accent-hover:hover :global(img) {
          filter: brightness(0) saturate(100%) invert(36%) sepia(19%) saturate(1162%) hue-rotate(230deg) brightness(97%) contrast(92%);
        }
      `}</style>
    </div>
  );
} 