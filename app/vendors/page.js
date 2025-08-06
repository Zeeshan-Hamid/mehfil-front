"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import apiService from '../utils/api';
import styles from './Vendors.module.css';

export default function VendorsPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    'Wedding Planning',
    'Catering',
    'Photography',
    'Venue',
    'Decoration',
    'Music & Entertainment',
    'Transportation',
    'Beauty & Makeup',
    'Other'
  ];

  const locations = [
    'Los Angeles',
    'New York',
    'Chicago',
    'Houston',
    'Phoenix',
    'Philadelphia',
    'San Antonio',
    'San Diego',
    'Dallas',
    'San Jose'
  ];

  useEffect(() => {
    fetchVendors();
  }, [currentPage, selectedCategory, selectedLocation]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: 12
      };
      
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      
      if (selectedLocation) {
        params.location = selectedLocation;
      }
      
      const response = await apiService.getAllVendors(params);
      
      if (response.success) {
        setVendors(response.data.vendors);
        setTotalPages(response.data.pagination.pages);
      } else {
        setError('Failed to fetch vendors');
      }
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError(err.message || 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleVendorClick = (vendorId) => {
    router.push(`/vendor-profile/${vendorId}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchVendors();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedLocation('');
    setCurrentPage(1);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className={styles.star}>⭐</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className={styles.star}>⭐</span>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className={styles.emptyStar}>☆</span>);
    }
    
    return stars;
  };

  const formatAddress = (address) => {
    if (!address) return 'Location not available';
    return `${address.city}, ${address.state}`;
  };

  if (loading && vendors.length === 0) {
    return (
      <div className={styles.container}>
        <Navbar />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading vendors...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Navbar />
      
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Find Your Perfect Vendor</h1>
          <p className={styles.subtitle}>
            Discover trusted vendors for your special events
          </p>
        </div>

        {/* Search and Filters */}
        <div className={styles.filtersSection}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchInput}>
              <input
                type="text"
                placeholder="Search vendors by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.input}
              />
              <button type="submit" className={styles.searchButton}>
                🔍 Search
              </button>
            </div>
          </form>

          <div className={styles.filters}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={styles.select}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className={styles.select}
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            <button onClick={clearFilters} className={styles.clearButton}>
              Clear Filters
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className={styles.errorContainer}>
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={fetchVendors} className={styles.retryButton}>
              Try Again
            </button>
          </div>
        )}

        {/* Vendors Grid */}
        {!error && (
          <>
            <div className={styles.resultsInfo}>
              <p>
                Showing {vendors.length} vendors
                {selectedCategory && ` in ${selectedCategory}`}
                {selectedLocation && ` from ${selectedLocation}`}
              </p>
            </div>

            <div className={styles.vendorsGrid}>
              {vendors.map((vendor) => (
                <div
                  key={vendor._id}
                  className={styles.vendorCard}
                  onClick={() => handleVendorClick(vendor._id)}
                >
                  <div className={styles.vendorImage}>
                    <img
                      src={vendor.vendorProfile?.profileImage || '/logo.png'}
                      alt={vendor.vendorProfile?.businessName}
                      onError={(e) => {
                        e.target.src = '/logo.png';
                      }}
                    />
                  </div>
                  
                  <div className={styles.vendorInfo}>
                    <h3 className={styles.businessName}>
                      {vendor.vendorProfile?.businessName}
                    </h3>
                    <p className={styles.ownerName}>
                      {vendor.vendorProfile?.ownerName}
                    </p>
                    
                    <div className={styles.location}>
                      📍 {formatAddress(vendor.vendorProfile?.businessAddress)}
                    </div>
                    
                    {vendor.vendorProfile?.rating > 0 && (
                      <div className={styles.rating}>
                        <div className={styles.stars}>
                          {renderStars(vendor.vendorProfile.rating)}
                        </div>
                        <span className={styles.ratingText}>
                          {vendor.vendorProfile.rating.toFixed(1)} ({vendor.vendorProfile.totalReviews || 0})
                        </span>
                      </div>
                    )}
                    
                    {vendor.vendorProfile?.primaryServiceCategory && (
                      <div className={styles.category}>
                        <span className={styles.categoryTag}>
                          {vendor.vendorProfile.primaryServiceCategory}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={styles.paginationButton}
                >
                  ← Previous
                </button>
                
                <span className={styles.pageInfo}>
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={styles.paginationButton}
                >
                  Next →
                </button>
              </div>
            )}

            {vendors.length === 0 && !loading && (
              <div className={styles.noResults}>
                <h3>No vendors found</h3>
                <p>Try adjusting your search criteria or filters.</p>
              </div>
            )}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
} 