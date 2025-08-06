'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '../../state/userStore';
import apiService from '../../utils/api';
import { toast } from 'react-toastify';
import Avatar from '../Avatar/Avatar';
import styles from './Reviews.module.css';

export default function Reviews({ eventId, vendorData, isPreview = false }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const { user } = useUserStore();

  // Check if user has already reviewed this event
  const [hasReviewed, setHasReviewed] = useState(false);
  const [userReview, setUserReview] = useState(null);

  useEffect(() => {
    if (eventId && !isPreview) {
      loadReviews();
    }
  }, [eventId, currentPage, isPreview]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await apiService.getEventReviews(eventId, currentPage, 10);
      
      if (response.status === 'success') {
        setReviews(response.data.reviews);
        setTotalPages(response.data.pagination.totalPages);
        setTotalReviews(response.data.pagination.totalReviews);
        
        // Check if current user has reviewed
        if (user) {
          const userReview = response.data.reviews.find(
            review => review.customer._id === user._id
          );
          setHasReviewed(!!userReview);
          setUserReview(userReview);
        }
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to submit a review');
      return;
    }

    if (!reviewForm.comment.trim()) {
      toast.error('Please provide a comment');
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiService.addReview(eventId, reviewForm);
      
      if (response.status === 'success') {
        toast.success('Review submitted successfully!');
        setShowReviewForm(false);
        setReviewForm({ rating: 5, comment: '' });
        setHasReviewed(true);
        setUserReview(response.data.review);
        loadReviews(); // Reload to get updated data
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.message?.includes('already submitted')) {
        toast.error('You have already submitted a review for this event');
      } else {
        toast.error('Failed to submit review');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      const response = await apiService.deleteReview(eventId, reviewId);
      
      if (response.status === 'success') {
        toast.success('Review deleted successfully!');
        setHasReviewed(false);
        setUserReview(null);
        loadReviews(); // Reload to get updated data
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            className={`${styles.star} ${star <= rating ? styles.filled : styles.empty}`}
            onClick={interactive ? () => onChange(star) : undefined}
            disabled={!interactive}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isPreview) {
    return (
      <div className={styles.reviewsContainer}>
        <div className={styles.reviewsHeader}>
          <h2 className={styles.reviewsTitle}>Reviews</h2>
          <div className={styles.reviewsSummary}>
            <div className={styles.ratingDisplay}>
              {renderStars(4.5)}
              <span className={styles.ratingText}>4.5 (24 reviews)</span>
            </div>
          </div>
        </div>
        
        <div className={styles.previewMessage}>
          <p>Reviews will be displayed here in the live version.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.reviewsContainer}>
      <div className={styles.reviewsHeader}>
        <h2 className={styles.reviewsTitle}>Reviews</h2>
        <div className={styles.reviewsSummary}>
          <div className={styles.ratingDisplay}>
            {renderStars(vendorData.averageRating || 0)}
            <span className={styles.ratingText}>
              {vendorData.averageRating || 0} ({totalReviews} reviews)
            </span>
          </div>
          
          {user && user.role === 'customer' && !hasReviewed && (
            <button
              className={styles.addReviewButton}
              onClick={() => setShowReviewForm(true)}
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className={styles.reviewFormContainer}>
            <form onSubmit={handleSubmitReview} className={styles.reviewForm}>
              <div className={styles.formHeader}>
                <h3>Write Your Review</h3>
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={() => setShowReviewForm(false)}
                >
                  ×
                </button>
              </div>
              
              <div className={styles.ratingSection}>
                <label>Rating:</label>
                {renderStars(reviewForm.rating, true, (rating) => 
                  setReviewForm(prev => ({ ...prev, rating }))
                )}
              </div>
              
              <div className={styles.commentSection}>
                <label htmlFor="comment">Comment:</label>
                <textarea
                  id="comment"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your experience with this vendor..."
                  maxLength={500}
                  required
                />
                <span className={styles.charCount}>
                  {reviewForm.comment.length}/500
                </span>
              </div>
              
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowReviewForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* User's Review */}
        {userReview && (
          <div className={styles.userReviewContainer}>
            <div className={styles.userReviewHeader}>
              <h3>Your Review</h3>
              <button
                className={styles.deleteButton}
                onClick={() => handleDeleteReview(userReview._id)}
              >
                Delete
              </button>
            </div>
            <div className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <Avatar 
                  user={{
                    name: userReview.customer?.customerProfile?.fullName || 'Unknown User',
                    profileImage: userReview.customer?.customerProfile?.profileImage || '/default_dp.jpg'
                  }}
                  size="small"
                />
                <div className={styles.reviewInfo}>
                  <span className={styles.reviewerName}>
                    {userReview.customer?.customerProfile?.fullName || 'Unknown User'}
                  </span>
                  <span className={styles.reviewDate}>
                    {formatDate(userReview.createdAt)}
                  </span>
                </div>
                <div className={styles.reviewRating}>
                  {renderStars(userReview.rating)}
                </div>
              </div>
              <p className={styles.reviewComment}>{userReview.comment}</p>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className={styles.reviewsList}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className={styles.noReviews}>
              <p>No reviews yet. Be the first to review this vendor!</p>
            </div>
          ) : (
            reviews
              .filter(review => !userReview || review._id !== userReview._id) // Don't show user's review twice
              .map((review) => (
                <div key={review._id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <Avatar 
                      user={{
                        name: review.customer?.customerProfile?.fullName || 'Unknown User',
                        profileImage: review.customer?.customerProfile?.profileImage || '/default_dp.jpg'
                      }}
                      size="small"
                    />
                    <div className={styles.reviewInfo}>
                      <span className={styles.reviewerName}>
                        {review.customer?.customerProfile?.fullName || 'Unknown User'}
                      </span>
                      <span className={styles.reviewDate}>
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <div className={styles.reviewRating}>
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  {review.comment && (
                    <p className={styles.reviewComment}>{review.comment}</p>
                  )}
                </div>
              ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.paginationButton}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </button>
            <span className={styles.paginationInfo}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className={styles.paginationButton}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 