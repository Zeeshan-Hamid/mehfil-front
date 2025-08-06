import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '../../utils/api';
import styles from './ReviewsContent.module.css';

export default function ReviewsContent() {
    const router = useRouter();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);
    const [filters, setFilters] = useState({
        rating: '',
        sort: '-createdAt'
    });

    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getVendorReviews(
                currentPage, 
                10, 
                filters.rating || null, 
                filters.sort
            );
            
            if (response.success) {
                setReviews(response.data.reviews);
                setTotalPages(response.pagination.totalPages);
                setTotalReviews(response.pagination.totalReviews);
            } else {
                setError('Failed to fetch reviews');
            }
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError(err.message || 'Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [currentPage, filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1); // Reset to first page when filters change
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleReviewClick = (review) => {
        // Navigate to the listing details page with the review ID
        // This will scroll to the specific review when the details page loads
        router.push(`/vendor_listing_details/${review.event.id}?reviewId=${review._id}`);
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <span 
                key={i} 
                className={`${styles.star} ${i < rating ? styles.filled : styles.empty}`}
            >
                ★
            </span>
        ));
    };

    const getInitials = (fullName) => {
        if (!fullName) return '?';
        return fullName
            .split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const renderCustomerAvatar = (customer) => {
        const { profileImage, fullName } = customer.customerProfile;
        
        if (profileImage) {
            return (
                <img 
                    src={profileImage} 
                    alt="Customer" 
                    className={styles.customerAvatar}
                />
            );
        }
        
        return (
            <div className={styles.customerAvatarFallback}>
                {getInitials(fullName)}
            </div>
        );
    };

    if (loading && reviews.length === 0) {
        return (
            <div className={styles.loadingState}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading reviews...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorState}>
                <div className={styles.errorIcon}>⚠️</div>
                <h3>Error Loading Reviews</h3>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className={styles.reviewsContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>
                    Customer Reviews ({totalReviews})
                </h2>
            </div>

            {/* Filters */}
            <div className={styles.filtersBar}>
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>
                        Filter by Rating:
                    </label>
                    <select
                        value={filters.rating}
                        onChange={(e) => handleFilterChange('rating', e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="">All Ratings</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>
                        Sort by:
                    </label>
                    <select
                        value={filters.sort}
                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="-createdAt">Newest First</option>
                        <option value="createdAt">Oldest First</option>
                        <option value="-rating">Highest Rating</option>
                        <option value="rating">Lowest Rating</option>
                    </select>
                </div>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📝</div>
                    <h3>No Reviews Found</h3>
                    <p>No reviews match your current criteria.</p>
                </div>
            ) : (
                <div className={styles.reviewsList}>
                    {reviews.map((review) => (
                        <div 
                            key={review._id}
                            className={styles.reviewCard}
                            onClick={() => handleReviewClick(review)}
                        >
                            <div className={styles.reviewHeader}>
                                <div className={styles.customerInfo}>
                                    {renderCustomerAvatar(review.customer)}
                                    <div className={styles.customerDetails}>
                                        <div className={styles.customerName}>
                                            {review.customer.customerProfile.fullName}
                                        </div>
                                        <div className={styles.eventName}>
                                            {review.event.name}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.reviewMeta}>
                                    <div className={styles.starsContainer}>
                                        {renderStars(review.rating)}
                                    </div>
                                    <div className={styles.reviewDate}>
                                        {formatDate(review.createdAt)}
                                    </div>
                                </div>
                            </div>
                            
                            {review.comment && (
                                <div className={styles.reviewComment}>
                                    "{review.comment}"
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`${styles.paginationBtn} ${currentPage === 1 ? styles.disabled : ''}`}
                    >
                        Previous
                    </button>
                    
                    <span className={styles.pageInfo}>
                        Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className={`${styles.paginationBtn} ${currentPage === totalPages ? styles.disabled : ''}`}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
} 