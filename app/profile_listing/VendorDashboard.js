import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useVendorStore } from '../state/userStore';
import apiService from '../utils/api';
import Avatar from '../components/Avatar/Avatar';
import styles from './VendorDashboard.module.css';

// You may want to move these to /public and use next/image for real assets
const logoImg = '/logo.png';
const analyticsEmojis = [
  '🏠', // Bookings
  '💵', // Total Revenue
  '⭐', // Avg Rating
  '👁️', // Profile Views
];

function BookingsList({ onClose }) {
  return (
    <div style={{ background: '#fff', borderRadius: 15, padding: 32, width: '100%', minHeight: 400 }}>
      <button onClick={onClose} style={{ float: 'right', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>✕</button>
      <h2 style={{ marginTop: 0 }}>All Bookings</h2>
      <ul style={{ padding: 0, listStyle: 'none' }}>
        {["Wedding Photography", "Birthday Event", "Corporate Gala"].map((b, i) => (
          <li key={i} style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>{b}</li>
        ))}
      </ul>
    </div>
  );
}

function OrdersList({ onClose }) {
  return (
    <div style={{ background: '#fff', borderRadius: 15, padding: 32, width: '100%', minHeight: 400 }}>
      <button onClick={onClose} style={{ float: 'right', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>✕</button>
      <h2 style={{ marginTop: 0 }}>All Orders</h2>
      <ul style={{ padding: 0, listStyle: 'none' }}>
        {["Order #12345", "Order #12346", "Order #12347"].map((o, i) => (
          <li key={i} style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>{o}</li>
        ))}
      </ul>
    </div>
  );
}

function ReviewsList({ onClose }) {
  return (
    <div style={{ background: '#fff', borderRadius: 15, padding: 32, width: '100%', minHeight: 400 }}>
      <button onClick={onClose} style={{ float: 'right', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>✕</button>
      <h2 style={{ marginTop: 0 }}>All Reviews & Ratings</h2>
      <ul style={{ padding: 0, listStyle: 'none' }}>
        {[
          { name: 'Joha Dew', text: 'Amazing service!', stars: 5 },
          { name: 'Lisa', text: 'Great experience.', stars: 4 },
          { name: 'Sam', text: 'Would recommend.', stars: 5 },
        ].map((r, i) => (
          <li key={i} style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 600 }}>{r.name}</span>: {r.text} {' '}
            <span style={{ color: '#FFC107' }}>{'⭐'.repeat(r.stars)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProfileViewsList({ onClose }) {
  return (
    <div style={{ background: '#fff', borderRadius: 15, padding: 32, width: '100%', minHeight: 400 }}>
      <button onClick={onClose} style={{ float: 'right', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>✕</button>
      <h2 style={{ marginTop: 0 }}>All Profile Views</h2>
      <ul style={{ padding: 0, listStyle: 'none' }}>
        {[
          { name: 'Alice', listing: 'Wedding Photography' },
          { name: 'Bob', listing: 'Birthday Event' },
          { name: 'Charlie', listing: 'Corporate Gala' },
        ].map((v, i) => (
          <li key={i} style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 600 }}>{v.name}</span> viewed <span style={{ fontStyle: 'italic' }}>{v.listing}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InquiriesList({ onClose }) {
  return (
    <div style={{ background: '#fff', borderRadius: 15, padding: 32, width: '100%', minHeight: 400 }}>
      <button onClick={onClose} style={{ float: 'right', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>✕</button>
      <h2 style={{ marginTop: 0 }}>All Pending Inquiries</h2>
      <ul style={{ padding: 0, listStyle: 'none' }}>
        {[
          { name: 'Lisa', inquiry: 'Photography inquiry' },
          { name: 'John', inquiry: 'Catering inquiry' },
        ].map((inq, i) => (
          <li key={i} style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 600 }}>{inq.name}</span>: {inq.inquiry}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ListingsList({ onClose }) {
  return (
    <div style={{ background: '#fff', borderRadius: 15, padding: 32, width: '100%', minHeight: 400 }}>
      <button onClick={onClose} style={{ float: 'right', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>✕</button>
      <h2 style={{ marginTop: 0 }}>All Your Listings</h2>
      <ul style={{ padding: 0, listStyle: 'none' }}>
        {[
          { name: 'Wedding Photography', price: '$160/head', status: 'Active' },
          { name: 'Catering and Decor Package', price: '$160/head', status: 'Active' },
        ].map((l, i) => (
          <li key={i} style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 600 }}>{l.name}</span> - {l.price} <span style={{ color: '#2CE226', marginLeft: 8 }}>{l.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function VendorDashboard({ onNavigate }) {
  const { vendorData } = useVendorStore();
  const [showList, setShowList] = useState(null); // null, 'bookings', 'orders', 'reviews', 'views', 'inquiries', 'listings'
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    bookings: 0,
    totalRevenue: 0,
    avgRating: 0,
    profileViews: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await apiService.getVendorBookings();
        if (response.success) {
          setBookings(response.data.bookings);
        }
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const response = await apiService.getVendorReviews(1, 4); // Get 4 most recent reviews
        if (response.success) {
          setReviews(response.data.reviews);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };

    const fetchListings = async () => {
      try {
        setListingsLoading(true);
        // Fetching listings, you can adjust pagination as needed
        const response = await apiService.getVendorEvents(1, 10);
        if (response.success) {
          setListings(response.data.events);
        }
      } catch (error) {
        console.error('Failed to fetch listings:', error);
      } finally {
        setListingsLoading(false);
      }
    };

    const fetchDashboardStats = async () => {
      try {
        setStatsLoading(true);
        const response = await apiService.getDashboardStats();
        if (response.success) {
          setDashboardStats(response.data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchBookings();
    fetchReviews();
    fetchListings();
    fetchDashboardStats();
  }, []);

  console.log('VendorDashboard - vendorData:', vendorData);

  if (!vendorData) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading vendor data...</div>;
  }

  // Custom back button behavior for View All sections
  useEffect(() => {
    if (showList) {
      window.history.pushState({ showList }, '');
    }
    const onPopState = (e) => {
      if (showList) {
        setShowList(null);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, [showList]);

  const handleCardClick = idx => {
    if (idx === 0) setShowList('bookings');
    if (idx === 1) setShowList('orders');
    if (idx === 2) setShowList('reviews');
    if (idx === 3) setShowList('views');
  };

  // Handlers for View All buttons
  const handleViewAll = (type) => setShowList(type);

  // Use real dashboard stats from API
  const stats = statsLoading ? {
    bookings: 0,
    totalRevenue: 0,
    avgRating: 0,
    profileViews: 0
  } : dashboardStats;
  const recentBookings = bookings.slice(0, 2); // Display the most recent 2 bookings
  const recentReviews = reviews; // Use real reviews from API
  const pendingInquiries = vendorData.pendingInquiries || [];
  const recentListings = listings.slice(0, 2);
  const businessName = vendorData.businessName || 'Your Business';
  const profileImg = vendorData.profilePhoto || '/man-in-suit2-removebg-preview.png';

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Confirmed':
        return styles['status-confirmed'];
      case 'Cancelled':
        return styles['status-cancelled'];
      case 'Completed':
        return styles['status-completed'];
      case 'Pending':
      default:
        return styles['status-pending'];
    }
  };

  // Helper for empty state
  const EmptyState = ({ emoji, text }) => (
    <div className={styles['empty-state']}>
      <span className={styles['empty-state-emoji']}>{emoji}</span>
      {text}
    </div>
  );

  // Helper for empty stat
  const StatValue = ({ value, emoji }) => (
    value && value > 0
      ? <span>{value}</span>
      : <span style={{ color: '#666' }}>0</span>
  );

  return (
    <div className={styles['dashboard-container']}>
      {/* Top Analytics Cards */}
      <div className={styles['analytics-grid']}>
        {/* Bookings */}
        <div className={styles['analytics-card']}>
          <div className={styles['analytics-icon']}>
            <div className={styles['analytics-icon-bg']} style={{ background: '#DA431A', opacity: 0.15 }} />
            <span className={styles['analytics-icon-emoji']} style={{ color: stats.bookings ? '#DA431A' : '#999' }}>🏠</span>
          </div>
          <div className={styles['analytics-content']}>
            <div className={styles['analytics-value']}><StatValue value={stats.bookings} emoji="🏠" /></div>
            <div className={styles['analytics-label']}>Bookings</div>
          </div>
        </div>
        {/* Total Revenue */}
        <div className={styles['analytics-card']}>
          <div className={styles['analytics-icon']}>
            <div className={styles['analytics-icon-bg']} style={{ background: '#0FCC70', opacity: 0.15 }} />
            <span className={styles['analytics-icon-emoji']} style={{ color: stats.totalRevenue ? '#0FCC70' : '#999' }}>💵</span>
          </div>
          <div className={styles['analytics-content']}>
            <div className={styles['analytics-value']}><StatValue value={stats.totalRevenue} emoji="💵" /></div>
            <div className={styles['analytics-label']}>Total Revenue</div>
          </div>
        </div>
        {/* Avg Rating */}
        <div className={styles['analytics-card']}>
          <div className={styles['analytics-icon']}>
            <div className={styles['analytics-icon-bg']} style={{ background: '#FBCB2B', opacity: 0.15 }} />
            <span className={styles['analytics-icon-emoji']} style={{ color: stats.avgRating ? '#FBCB2B' : '#999' }}>⭐</span>
          </div>
          <div className={styles['analytics-content']}>
            <div className={styles['analytics-value']}><StatValue value={stats.avgRating} emoji="⭐" /></div>
            <div className={styles['analytics-label']}>Avg Rating</div>
          </div>
        </div>
        {/* Total Listings */}
        <div className={styles['analytics-card']}>
          <div className={styles['analytics-icon']}>
            <div className={styles['analytics-icon-bg']} style={{ background: '#9A7DA6', opacity: 0.15 }} />
            <span className={styles['analytics-icon-emoji']} style={{ color: stats.totalListings ? '#9A7DA6' : '#999' }}>📦</span>
          </div>
          <div className={styles['analytics-content']}>
            <div className={styles['analytics-value']}><StatValue value={stats.totalListings} emoji="📦" /></div>
            <div className={styles['analytics-label']}>Total Listings</div>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className={styles['main-content']}>
        {showList === null && (
          // Dashboard content as before
          <div className={styles['dashboard-grid']}>
            {/* Left Column: Bookings & Reviews */}
            <div className={styles['left-column']}>
              {/* Recent Bookings */}
              <div className={styles['dashboard-card']}>
                <div className={styles['card-header']}>
                  <div className={styles['card-title']}>Recent Bookings</div>
                  <div className={styles['view-all-btn']} onClick={() => onNavigate('Bookings')}>View All</div>
                </div>
                <div className={styles['card-content']}>
                  {loading ? (
                    <div className={styles['loading-text']}>Loading bookings...</div>
                  ) : recentBookings.length === 0 ? (
                    <EmptyState emoji="📭" text="No recent bookings yet!" />
                  ) : (
                    recentBookings.map((booking, i) => (
                      <div 
                        key={i} 
                        className={styles['booking-item']}
                        onClick={() => router.push(`/profile_listing/bookings/${booking._id}`)}
                      >
                        <img src={booking.event.imageUrls[0]} alt="Booking" className={styles['booking-image']} />
                        <div className={styles['booking-content']}>
                          <div className={styles['booking-title']}>{booking.event.name}</div>
                          <div className={styles['booking-subtitle']}>{booking.customer.customerProfile.fullName}</div>
                        </div>
                        <div className={styles['booking-actions']}>
                          <span className={`${styles['status-badge']} ${getStatusStyle(booking.status)}`}>
                            {booking.status}
                          </span>
                          <span className={styles['booking-price']}>${booking.totalPrice}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              {/* Recent Reviews */}
              <div className={styles['dashboard-card']}>
                <div className={styles['card-header']}>
                  <div className={styles['card-title']}>Recent Reviews</div>
                  <div className={styles['view-all-btn']} onClick={() => onNavigate('Reviews')}>View All</div>
                </div>
                <div className={styles['card-content']}>
                  {reviewsLoading ? (
                    <div className={styles['loading-text']}>Loading reviews...</div>
                  ) : recentReviews.length === 0 ? (
                    <EmptyState emoji="📝" text="No recent reviews yet!" />
                  ) : (
                    recentReviews.slice(0, 3).map((review, i) => (
                      <div key={i} className={styles['review-item']}>
                        <Avatar 
                          user={{
                            name: review.customer.customerProfile.fullName,
                            profileImage: review.customer.customerProfile.profileImage
                          }}
                          size="small"
                        />
                        <div className={styles['review-content']}>
                          <div className={styles['review-author']}>{review.customer.customerProfile.fullName}</div>
                          <div className={styles['review-text']}>{review.comment}</div>
                          <div className={styles['review-meta']}>
                            <div className={styles['stars']}>
                              {[...Array(review.rating)].map((_,j) => <span key={j} className={styles['star']}>★</span>)}
                            </div>
                            <span className={styles['review-date']}>{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            {/* Right Column: Quick Actions, Pending Inquiries, Your Listings */}
            <div className={styles['right-column']}>
              {/* Quick Actions */}
              <div className={styles['dashboard-card']}>
                <div className={styles['card-title']}>Quick Actions</div>
                <div className={styles['quick-actions']}>
                  <button 
                    className={styles['create-listing-btn']}
                    onClick={() => router.push('/listing_create_edit')}
                  >
                    + Create New Listing
                  </button>
                  <button 
                    className={styles['manage-bookings-btn']}
                    onClick={() => onNavigate && onNavigate('Bookings')}
                  >
                    Manage Bookings
                  </button>
                </div>
              </div>
              {/* Your Listings */}
              <div className={styles['dashboard-card']}>
                <div className={styles['card-header']}>
                  <div className={styles['card-title']}>Your Listings</div>
                  <div className={styles['view-all-btn']} onClick={() => onNavigate('Listings')}>View All</div>
                </div>
                <div className={styles['card-content']}>
                  {listingsLoading ? (
                    <div className={styles['loading-text']}>Loading listings...</div>
                  ) : recentListings.length === 0 ? (
                    <EmptyState emoji="📦" text="No listings yet!" />
                  ) : (
                    recentListings.map((listing, i) => (
                      <div key={i} className={styles['listing-item']}>
                        <img src={listing.imageUrls[0]} alt={listing.name} className={styles['listing-image']} />
                        <div className={styles['listing-content']}>
                          <div className={styles['listing-title']}>{listing.name}</div>
                          <div className={styles['listing-price']}>{listing.packages.length > 0 ? `$${listing.packages[0].price}/head` : 'No packages'}</div>
                        </div>
                        <span className={`${styles['listing-status']} ${listing.isActive ? styles['status-active'] : styles['status-inactive']}`}>
                          Active
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {showList === 'bookings' && <BookingsList onClose={() => setShowList(null)} />}
        {showList === 'orders' && <OrdersList onClose={() => setShowList(null)} />}
        {showList === 'reviews' && <ReviewsList onClose={() => setShowList(null)} />}
        {showList === 'views' && <ProfileViewsList onClose={() => setShowList(null)} />}
        {showList === 'inquiries' && <InquiriesList onClose={() => setShowList(null)} />}
        {showList === 'listings' && <ListingsList onClose={() => setShowList(null)} />}
      </div>
    </div>
  );
} 