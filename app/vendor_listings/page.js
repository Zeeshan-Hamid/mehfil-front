'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/Navbar/Navbar";
import VendorCard from "../components/VendorCard/VendorCard";
import styles from './VendorListingsPage.module.css';
import apiService from '../utils/api';
import { debounce } from 'lodash';
import CustomerChatbot from "../components/CustomerChatbot/CustomerChatbot";

export default function VendorListingsPage() {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    eventType: '',
    city: '',
    state: '',
    rating: '',
    minPrice: '',
    maxPrice: '',
    tags: [],
    sort: 'featured',
    page: 1
  });
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isMobileFiltersCollapsed, setIsMobileFiltersCollapsed] = useState(true);
  
  const fetchListings = useCallback(debounce(async (currentFilters, isLoadMore) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getMarketplaceListings(currentFilters);
      if (response.status === 'success') {
        if (isLoadMore) {
          setListings(prev => [...prev, ...response.data.events]);
        } else {
          setListings(response.data.events);
        }
        setPagination(response.data.pagination);
      } else {
        setError('Failed to fetch listings.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching listings.');
    } finally {
      setIsLoading(false);
    }
  }, 300), []);

  useEffect(() => {
    fetchListings(filters, filters.page > 1);
  }, [filters, fetchListings]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      page: 1, // Reset to first page on filter change
      [filterType]: value
    }));
  };
  
  const handleSortChange = (e) => {
    handleFilterChange('sort', e.target.value);
  };
  
  const handleLoadMore = () => {
    setFilters(prev => ({ ...prev, page: prev.page + 1 }));
  };
  
  const clearAllFilters = () => {
    setFilters({
      eventType: '',
      city: '',
      state: '',
      rating: '',
      minPrice: '',
      maxPrice: '',
      tags: [],
      sort: 'featured',
      page: 1
    });
  };

  const handleNewsletterSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubscribing(true);

    try {
      const response = await apiService.subscribeNewsletter(email);
      
      if (response.status === 'success') {
        toast.success('Thank you for subscribing to our newsletter!');
        setEmail('');
      } else {
        toast.error(response.message || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className={styles['vendor-listings-page']}>
      <Navbar backgroundColor="#AF8EBA" customHeight="35px 20px"/>
      
      {/* Browse Vendors Header Component */}


      {/* Main Content */}
      <div className={styles['main-content']}>
        {/* Filters Sidebar */}
        <div className={styles['filters-sidebar']}>
            <div className={styles['filters-header']} onClick={() => setIsMobileFiltersCollapsed(!isMobileFiltersCollapsed)}>
              <h3>Filters</h3>
              <button 
                className={styles['clear-all']}
                onClick={(e) => { e.stopPropagation(); clearAllFilters(); }}
              >
                Clear all
              </button>
              <span className={`${styles.collapseIcon} ${!isMobileFiltersCollapsed ? styles.isExpanded : ''}`}></span>
            </div>

            <div className={`${styles.filtersContent} ${isMobileFiltersCollapsed ? styles.collapsed : ''}`}>
                {/* Event Type Filter */}
                <div className={styles['filter-section']}>
                  <h4>Event Type</h4>
                  <div className={styles['filter-options']}>
                    {['wedding', 'engagement', 'aqeeqah', 'nikah', 'walima', 'mehendi', 'birthday', 'anniversary', 'corporate', 'other'].map((type) => (
                      <div
                        key={type}
                        className={`${styles['filter-option']} ${filters.eventType === type ? styles['filter-option-active'] : ''}`}
                        onClick={() => handleFilterChange('eventType', type)}
                      >
                        <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Filters */}
                <div className={styles['filter-section']}>
                  <h4>Location</h4>
                  <input
                    type="text"
                    placeholder="City"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className={styles.filterInput}
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                    className={styles.filterInput}
                  />
                </div>

                {/* Price Range Filter */}
                <div className={styles['filter-section']}>
                  <h4>Price Range</h4>
                  <div className={styles.priceInputs}>
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className={styles.filterInput}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className={styles.filterInput}
                    />
                  </div>
                </div>

                {/* Rating Filter */}
                <div className={styles['filter-section']}>
                  <h4>Rating</h4>
                  <div className={styles['filter-options']}>
                    {['Any', '4', '4.5', '5'].map((rating) => (
                      <div 
                        key={rating}
                        className={`${styles['filter-option']} ${filters.rating === rating ? styles['filter-option-active'] : ''}`}
                        onClick={() => handleFilterChange('rating', rating === 'Any' ? '' : rating)}
                      >
                        <span>{rating === 'Any' ? 'Any Rating' : `${rating}+ Stars`}</span>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
        </div>

        {/* Vendors Section */}
        <div className={styles['vendors-section']}>
          {/* Results Header */}
          <div className={styles['results-header']}>
            <div className={styles['results-info']}>
              <h2>Vendor Listings</h2>
              <p>{pagination.totalEvents || 0} vendors found</p>
            </div>
            <div className={styles['sort-controls']}>
              <select className={styles['sort-dropdown']} value={filters.sort} onChange={handleSortChange}>
                <option value="featured">Featured First</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Vendors Grid */}
          {isLoading && <p>Loading...</p>}
          {error && <p>Error: {error}</p>}
          {!isLoading && !error && (
            <>
              <div className={styles['vendors-grid']}>
                {listings.map((vendor) => (
                  <VendorCard
                    key={vendor._id}
                    id={vendor._id}
                    image={vendor.imageUrls[0]}
                    featured={vendor.tags?.includes('featured')}
                    name={vendor.name}
                    category={vendor.eventType}
                    location={`${vendor.location.city}, ${vendor.location.state}`}
                    price={vendor.packages?.[0]?.price ? `Starting from $${vendor.packages[0].price}` : 'Price on enquiry'}
                    rating={vendor.averageRating}
                    ratingCount={vendor.totalReviews}
                  />
                ))}
              </div>
              {pagination.hasNextPage && (
                <div className={styles.loadMoreContainer}>
                    <button onClick={handleLoadMore} className={styles.loadMoreButton}>Load More</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <footer className={styles['vendor-footer']}>
        <div className={styles['footer-content']}>
          {/* Footer Links */}
          <div className={styles['footer-links']}>
            <div className={styles['footer-column']}>
              <h4>Product</h4>
              <ul>
                <li>Employee database</li>
                <li>Payroll</li>
              </ul>
            </div>
            <div className={styles['footer-column']}>
              <h4>Information</h4>
              <ul>
                <li>FAQ</li>
                <li>Blog</li>
                <li>Support</li>
              </ul>
            </div>
            <div className={styles['footer-column']}>
              <h4>Company</h4>
              <ul>
                <li>About us</li>
                <li>Contact us</li>
                <li>Hutte.io</li>
              </ul>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className={styles['newsletter-section']}>
            <h3>Subscribe to our Newsletter</h3>
            <p>Stay up-to-date with the latest event planning tips, vendor spotlights, and exclusive offers from Mehfil</p>
            <form onSubmit={handleNewsletterSubscribe} className={styles['newsletter-form']}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubscribing}
              />
              <button 
                type="submit" 
                className={styles['subscribe-btn']}
                disabled={isSubscribing}
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className={styles['footer-divider']}></div>

        {/* Bottom Section */}
        <div className={styles['footer-bottom']}>
          <div className={styles['footer-brand']}>
            <Image 
              src="/logo.png" 
              alt="Mehfil Logo" 
              width={47} 
              height={61}
              className={styles['footer-logo']}
            />
            <span className={styles['footer-brand-text']}>Mehfil</span>
          </div>

          {/* Social Links */}
          <div className={styles['social-links']}>
            <a href="#" className={styles['social-link']}>
              <Image src="/X_twitter_icon.png" alt="X" width={14} height={14} />
            </a>
            <a href="#" className={styles['social-link']}>
              <Image src="/Insta_icon.png" alt="Instagram" width={14} height={14} />
            </a>
            <a href="#" className={styles['social-link']}>
              <Image src="/Linkedin_icon.png" alt="LinkedIn" width={14} height={14} />
            </a>
          </div>

          {/* Legal Links */}
          <div className={styles['legal-links']}>
            <a href="#">Pricing</a>
            <a href="#">Privacy</a>
            <a href="#">Cookies</a>
          </div>

          {/* Copyright */}
          <div className={styles['copyright']}>
            © Copyright 2025 Mehfil. All rights reserved
          </div>
        </div>
      </footer>
      <CustomerChatbot />
    </div>
  );
}
