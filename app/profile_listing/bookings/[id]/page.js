'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiService from '../../../utils/api';
import styles from './BookingDetailsPage.module.css';
import Image from 'next/image';

export default function BookingDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (id) {
            const fetchBookingDetails = async () => {
                try {
                    setLoading(true);
                    const response = await apiService.getBookingDetails(id);
                    console.log('Booking details response:', response); // Debug log
                    
                    if (response.success && response.data && response.data.booking) {
                        setBooking(response.data.booking);
                        setStatus(response.data.booking.status);
                    } else {
                        setError(response.message || 'Failed to fetch booking details');
                    }
                } catch (err) {
                    setError(err.message || 'Failed to fetch booking details.');
                } finally {
                    setLoading(false);
                }
            };
            fetchBookingDetails();
        }
    }, [id]);

    const handleStatusUpdate = async () => {
        if (status === booking.status) return;
        try {
            setIsUpdating(true);
            const response = await apiService.updateBookingStatus(id, status);
            console.log('Status update response:', response); // Debug log
            
            if (response && response.success) {
                // Update the booking with the new data
                if (response.data && response.data.booking) {
                    setBooking(response.data.booking);
                } else {
                    // If no booking data returned, update the status locally
                    setBooking(prev => ({ ...prev, status }));
                }
                console.log('Status updated successfully');
            } else {
                // Revert status on failed API call
                setStatus(booking.status);
                alert('Failed to update status. Please try again.');
            }
        } catch (err) {
            console.error("Failed to update status", err);
            setStatus(booking.status);
            alert('Failed to update status. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };
    
    if (loading) return (
        <div className={styles.pageWrapper}>
            <div className={styles.centered}>
                <div className={styles.spinner}></div>
                <p className={styles.loadingText}>Loading booking details...</p>
            </div>
        </div>
    );
    
    if (error) return (
        <div className={styles.pageWrapper}>
            <div className={styles.centered}>
                <div className={styles.errorCard}>
                    <h3>Error</h3>
                    <p>{error}</p>
                    <button className={styles.backButton} onClick={() => router.back()}>
                        &larr; Go Back
                    </button>
                </div>
            </div>
        </div>
    );
    
    if (!booking) return (
        <div className={styles.pageWrapper}>
            <div className={styles.centered}>
                <div className={styles.errorCard}>
                    <h3>Booking Not Found</h3>
                    <p>The requested booking could not be found.</p>
                    <button className={styles.backButton} onClick={() => router.back()}>
                        &larr; Go Back
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className={styles.pageWrapper}>
            {/* Header Section */}
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() => router.back()}>
                    <span className={styles.backIcon}>&larr;</span>
                    <span className={styles.backText}>Back to Bookings</span>
                </button>
                <h1 className={styles.mainTitle}>Booking Details</h1>
            </div>
            
            {/* Summary Cards Section */}
            <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryIcon}>👤</div>
                    <div className={styles.summaryText}>
                        <div className={styles.summaryLabel}>Customer</div>
                        <div className={styles.summaryValue}>{booking.customer.customerProfile.fullName}</div>
                    </div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryIcon}>🗓️</div>
                    <div className={styles.summaryText}>
                        <div className={styles.summaryLabel}>Event Date</div>
                        <div className={styles.summaryValue}>{new Date(booking.eventDate).toLocaleDateString()}</div>
                    </div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryIcon}>🏷️</div>
                     <div className={styles.summaryText}>
                        <div className={styles.summaryLabel}>Event</div>
                        <div className={styles.summaryValue}>{booking.event.name}</div>
                    </div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryIcon}>💲</div>
                    <div className={styles.summaryText}>
                        <div className={styles.summaryLabel}>Total Price</div>
                        <div className={styles.summaryValue}>${booking.totalPrice.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Details Grid Section */}
            <div className={styles.detailsGrid}>
                {/* Left Column */}
                <div className={styles.column}>
                    <div className={styles.infoCard}>
                        <h3 className={styles.cardTitle}>Customer Details</h3>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Email:</span>
                            <span className={styles.infoValue}>{booking.customer.email}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Phone:</span>
                            <span className={styles.infoValue}>{booking.customer.phoneNumber}</span>
                        </div>
                    </div>
                     <div className={styles.infoCard}>
                        <h3 className={styles.cardTitle}>Package Details</h3>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Package Name:</span>
                            <span className={styles.infoValue}>{booking.package.name}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Attendees:</span>
                            <span className={styles.infoValue}>{booking.attendees}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Booked On:</span>
                            <span className={styles.infoValue}>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className={styles.column}>
                    <div className={styles.infoCard}>
                        <h3 className={styles.cardTitle}>Update Booking Status</h3>
                        <div className={styles.statusUpdateWrapper}>
                            <div className={styles.statusSection}>
                                <div className={styles.statusLabel}>Current Status:</div>
                                <div className={`${styles.statusBadge} ${styles[status.toLowerCase()]}`}>
                                    {status}
                                </div>
                            </div>
                            <div className={styles.statusControls}>
                                <select
                                    className={styles.statusSelect}
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    disabled={isUpdating}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Completed">Completed</option>
                                </select>
                                <button
                                    className={styles.updateButton}
                                    onClick={handleStatusUpdate}
                                    disabled={isUpdating || status === booking.status}
                                >
                                    {isUpdating ? 'Updating...' : 'Update Status'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 