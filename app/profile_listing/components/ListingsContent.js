import Image from 'next/image';
import styles from './ListingsContent.module.css';
import { useVendorStore } from '../../state/userStore';
import { useState, useEffect } from 'react';
import apiService from '../../utils/api';
import ConfirmationPopup from '../../components/ConfirmationPopup';

export default function ListingsContent({ router }) {
  const { vendorData } = useVendorStore();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('Name');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletePopup, setDeletePopup] = useState({ isOpen: false, listingId: null, listingName: '' });
  const [deleting, setDeleting] = useState(false);

  // Handle back navigation
  const handleBack = () => {
    router.push('/profile_listing?tab=Dashboard');
  };

  // Fetch vendor events from API
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getVendorEvents(currentPage, 10);
        
        if (response.success) {
          setListings(response.data.events);
          setTotalPages(response.data.pagination.totalPages);
        } else {
          setError('Failed to fetch listings');
        }
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError(err.message || 'Failed to fetch listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [currentPage]);

  // Handle delete listing
  const handleDeleteListing = async () => {
    if (!deletePopup.listingId) return;
    
    try {
      setDeleting(true);
      setError(null); // Clear any previous errors
      
      await apiService.deleteEvent(deletePopup.listingId);
      
      // Remove the deleted listing from state
      setListings(prevListings => 
        prevListings.filter(listing => listing._id !== deletePopup.listingId)
      );
      
      // Close popup
      setDeletePopup({ isOpen: false, listingId: null, listingName: '' });
      
      // Show success message (you could add a toast notification here)
      console.log('Listing deleted successfully');
    } catch (err) {
      console.error('Error deleting listing:', err);
      setError(err.message || 'Failed to delete listing');
      // Keep popup open so user can try again
    } finally {
      setDeleting(false);
    }
  };

  // Open delete confirmation popup
  const openDeletePopup = (listingId, listingName) => {
    setDeletePopup({ isOpen: true, listingId, listingName });
  };

  // Close delete confirmation popup
  const closeDeletePopup = () => {
    setDeletePopup({ isOpen: false, listingId: null, listingName: '' });
  };

  // Filter and sort listings
  const filteredAndSortedListings = listings
    .filter(listing => 
      listing.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.eventType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location?.city?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'Name') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (sortBy === 'Event Type') {
        return (a.eventType || '').localeCompare(b.eventType || '');
      } else if (sortBy === 'Location') {
        return (a.location?.city || '').localeCompare(b.location?.city || '');
      } else if (sortBy === 'Created') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

  const formatPrice = (packages) => {
    if (!packages || packages.length === 0) return 'No pricing';
    const minPrice = Math.min(...packages.map(pkg => pkg.price || 0));
    return minPrice > 0 ? `Starting from $${minPrice}` : 'Contact for pricing';
  };

  const formatLocation = (location) => {
    if (!location) return '-';
    const parts = [location.city, location.state].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '-';
  };

  const formatServices = (services) => {
    if (!services || services.length === 0) return '-';
    return services.length > 3 ? `${services.slice(0, 3).join(', ')}...` : services.join(', ');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.listingsContainer}>
        <div className={styles.actionsBar}>
          <button className={styles.createListingBtn} onClick={() => router.push('/listing_create_edit')}>
            Create Listing
          </button>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading listings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.listingsContainer}>
        <div className={styles.actionsBar}>
          <button className={styles.createListingBtn} onClick={() => router.push('/listing_create_edit')}>
            Create Listing
          </button>
        </div>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className={styles.retryBtn}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.listingsContainer}>
      {/* Back Button */}
      <button onClick={handleBack} className={styles.backButton}>
        <span className={styles.backIcon}>←</span>
        <span className={styles.backText}>Back to Dashboard</span>
      </button>

      {/* Actions Bar */}
      <div className={styles.actionsBar}>
        <button className={styles.createListingBtn} onClick={() => router.push('/listing_create_edit')}>
          Create Listing
        </button>
        <div className={styles.sortFilter}>
          <span className={styles.sortLabel}>Sort By:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="Name">Name</option>
            <option value="Event Type">Event Type</option>
            <option value="Location">Location</option>
            <option value="Created">Created Date</option>
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className={styles.searchBar}>
        <input 
          type="text" 
          placeholder="Search listings by name, event type, or location..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <button className={styles.searchBtn}>
          <Image src="/search_icon.png" alt="Search" width={24} height={24} />
        </button>
      </div>

      {/* Desktop Table View */}
      <div className={styles.desktopView}>
        {/* Table Header */}
        <div className={styles.tableHeader}>
          <span>Sr. No.</span>
          <span>Image</span>
          <span>Name</span>
          <span>Event Type</span>
          <span>Location</span>
          <span>Pricing</span>
          <span>Services</span>
          <span>Created</span>
          <span>Actions</span>
        </div>

        {/* Listing Rows */}
        {filteredAndSortedListings.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📦</div>
            <p>
              {searchTerm ? 'No listings found matching your search.' : 'No listings yet! Create your first listing to get started.'}
            </p>
          </div>
        ) : (
          <>
            {filteredAndSortedListings.map((listing, idx) => (
              <div
                className={styles.tableRow}
                key={listing._id}
                onClick={() => router.push(`/listing_create_edit?id=${listing._id}`)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.push(`/listing_create_edit?id=${listing._id}`); }}
                tabIndex={0}
                role="button"
              >
                <span>{idx + 1}</span>
                <span className={styles.imageCell}>
                  {listing.imageUrls && listing.imageUrls.length > 0 ? (
                    <div className={styles.imageContainer}>
                      <Image
                        src={listing.imageUrls[0]}
                        alt={listing.name || 'Event image'}
                        width={60}
                        height={60}
                        className={styles.listingImage}
                      />
                      {listing.imageUrls.length > 1 && (
                        <div className={styles.imageCount}>
                          +{listing.imageUrls.length - 1}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={styles.noImage}>
                      <div className={styles.noImageIcon}>📷</div>
                    </div>
                  )}
                </span>
                <span>{listing.name || 'Untitled Event'}</span>
                <span>{listing.eventType || '-'}</span>
                <span>{formatLocation(listing.location)}</span>
                <span>{formatPrice(listing.packages)}</span>
                <span>{formatServices(listing.services)}</span>
                <span>{formatDate(listing.createdAt)}</span>
                <span className={styles.actionButtons}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/listing_create_edit?id=${listing._id}`);
                    }}
                    className={styles.editBtn}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeletePopup(listing._id, listing.name);
                    }}
                    className={styles.deleteBtn}
                    disabled={deleting}
                  >
                    {deleting && deletePopup.listingId === listing._id ? 'Deleting...' : 'Delete'}
                  </button>
                </span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Mobile Card View */}
      <div className={styles.mobileView}>
        {filteredAndSortedListings.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📦</div>
            <p>
              {searchTerm ? 'No listings found matching your search.' : 'No listings yet! Create your first listing to get started.'}
            </p>
          </div>
        ) : (
          <div className={styles.mobileCards}>
            {filteredAndSortedListings.map((listing, idx) => (
              <div
                className={styles.mobileCard}
                key={listing._id}
                onClick={() => router.push(`/listing_create_edit?id=${listing._id}`)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.push(`/listing_create_edit?id=${listing._id}`); }}
                tabIndex={0}
                role="button"
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardImage}>
                    {listing.imageUrls && listing.imageUrls.length > 0 ? (
                      <div className={styles.mobileImageContainer}>
                        <Image
                          src={listing.imageUrls[0]}
                          alt={listing.name || 'Event image'}
                          width={80}
                          height={80}
                          className={styles.mobileListingImage}
                        />
                        {listing.imageUrls.length > 1 && (
                          <div className={styles.mobileImageCount}>
                            +{listing.imageUrls.length - 1}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={styles.mobileNoImage}>
                        <div className={styles.mobileNoImageIcon}>📷</div>
                      </div>
                    )}
                  </div>
                  <div className={styles.cardTitle}>
                    <h3>{listing.name || 'Untitled Event'}</h3>
                    <span className={styles.cardEventType}>{listing.eventType || '-'}</span>
                  </div>
                  <div className={styles.cardActions}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/listing_create_edit?id=${listing._id}`);
                      }}
                      className={styles.mobileEditBtn}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeletePopup(listing._id, listing.name);
                      }}
                      className={styles.mobileDeleteBtn}
                      disabled={deleting}
                    >
                      {deleting && deletePopup.listingId === listing._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
                <div className={styles.cardDetails}>
                  <div className={styles.cardDetail}>
                    <span className={styles.detailLabel}>Location:</span>
                    <span className={styles.detailValue}>{formatLocation(listing.location)}</span>
                  </div>
                  <div className={styles.cardDetail}>
                    <span className={styles.detailLabel}>Pricing:</span>
                    <span className={styles.detailValue}>{formatPrice(listing.packages)}</span>
                  </div>
                  <div className={styles.cardDetail}>
                    <span className={styles.detailLabel}>Services:</span>
                    <span className={styles.detailValue}>{formatServices(listing.services)}</span>
                  </div>
                  <div className={styles.cardDetail}>
                    <span className={styles.detailLabel}>Created:</span>
                    <span className={styles.detailValue}>{formatDate(listing.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={styles.paginationBtn}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={styles.paginationBtn}
          >
            Next
          </button>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      <ConfirmationPopup
        isOpen={deletePopup.isOpen}
        onClose={closeDeletePopup}
        onConfirm={handleDeleteListing}
        title="Delete Listing"
        message={`Are you sure you want to delete "${deletePopup.listingName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        error={error}
        loading={deleting}
      />
    </div>
  );
} 