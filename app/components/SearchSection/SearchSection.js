'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './SearchSection.module.css';
import apiService from '../../utils/api'; 
import { debounce } from 'lodash';

export default function SearchSection() {
  const [serviceQuery, setServiceQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchSuggestions = async (searchQuery) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.searchListings({ q: searchQuery, limit: 5 });
      if (response.success) {
        setSuggestions(response.data.listings);
      } else {
        setError(response.message || 'Failed to fetch suggestions.');
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'An error occurred while searching.');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 300), []);

  useEffect(() => {
    // Search based on either service query or location query
    const searchQuery = serviceQuery || locationQuery;
    debouncedFetchSuggestions(searchQuery);
    // Cleanup the debounced function on unmount
    return () => {
      debouncedFetchSuggestions.cancel();
    };
  }, [serviceQuery, locationQuery, debouncedFetchSuggestions]);

  const handleServiceInputChange = (e) => {
    setServiceQuery(e.target.value);
  };

  const handleLocationInputChange = (e) => {
    setLocationQuery(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchQuery = serviceQuery || locationQuery;
    if (searchQuery.trim()) {
      // Redirect to a search results page, or handle search directly
      console.log('Performing search for:', searchQuery);
      // Example redirect:
      // router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className={styles.searchSection}>
      {/* Title */}
      <h1 className={styles.title}>Browse Vendors</h1>
      
      {/* Subtitle */}
      <p className={styles.subtitle}>
        Discover how Mehfil simplifies event planning with expert services and vendor booking options.
      </p>
      
      {/* Search Bar Container */}
      <form onSubmit={handleSearch} className={styles.searchContainer}>
        <div className={styles.searchInputWrapper}>
          {/* Desktop Search Input Group */}
          {!isMobile && (
            <div className={styles.searchInputGroup}>
              {/* Search Icon */}
              <div className={styles.searchIcon}>
                <Image 
                  src="/search_icon.png" 
                  alt="Search" 
                  width={32} 
                  height={32}
                />
              </div>
              
              {/* Service Type Input */}
              <input 
                type="text" 
                placeholder="Vendors/Listings" 
                className={styles.serviceInput}
                value={serviceQuery}
                onChange={handleServiceInputChange}
              />
              
              {/* "in" text */}
              {/* <span className={styles.inText}></span> */}
              
              {/* Location Input */}
              <input 
                type="text" 
                placeholder="Location" 
                className={styles.locationInput}
                value={locationQuery}
                onChange={handleLocationInputChange}
              />
            </div>
          )}
          
          {/* Mobile Search Input */}
          {isMobile && (
            <div className={styles.mobileSearchInputGroup}>
              <div className={styles.mobileSearchIcon}>
                <Image 
                  src="/search_icon.png" 
                  alt="Search" 
                  width={24} 
                  height={24}
                />
              </div>
              <input 
                type="text" 
                placeholder="Search for vendors, services, or location..." 
                className={styles.mobileSearchInput}
                value={serviceQuery || locationQuery}
                onChange={(e) => {
                  setServiceQuery(e.target.value);
                  setLocationQuery(e.target.value);
                }}
              />
            </div>
          )}
          
          {/* Suggestions Box */}
          {(isLoading || suggestions.length > 0 || error) && (
            <div className={styles.suggestionsBox}>
              {isLoading && <div className={styles.suggestionItem}>Loading...</div>}
              {error && <div className={`${styles.suggestionItem} ${styles.error}`}>{error}</div>}
              {!isLoading && !error && suggestions.map((listing) => (
                <Link key={listing._id} href={`/vendor_listing_details/${listing._id}`} passHref>
                  <div className={styles.suggestionItem}>
                    <p className={styles.suggestionName}>{listing.name}</p>
                    <p className={styles.suggestionLocation}>
                      {listing.location.city}, {listing.location.state}
                    </p>
                  </div>
                </Link>
              ))}
              {!isLoading && !error && suggestions.length === 0 && (serviceQuery.length > 1 || locationQuery.length > 1) && (
                <div className={styles.suggestionItem}>No results found.</div>
              )}
            </div>
          )}
        </div>
        
        {/* Search Button */}
        <button type="submit" className={styles.searchButton}>
          Search
        </button>
      </form>
    </section>
  );
} 