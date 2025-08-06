import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import apiService from '../../utils/api';
import styles from './BookingsContent.module.css';

export default function BookingsContent() {
    const router = useRouter();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('Date');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeDropdown, setActiveDropdown] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const response = await apiService.getVendorBookings();
                if (response.success && response.data && response.data.bookings) {
                    setBookings(response.data.bookings);
                } else {
                    setError(response.message || 'Failed to fetch bookings');
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch bookings.');
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const handleStatusChange = async (bookingId, newStatus) => {
        try {
            const response = await apiService.updateBookingStatus(bookingId, newStatus);
            console.log('Status update response:', response); // Debug log
            
            if (response && response.success) {
                // Update the booking in state
                setBookings(currentBookings =>
                    currentBookings.map(b =>
                        b._id === bookingId ? { ...b, status: newStatus } : b
                    )
                );
                console.log('Status updated successfully');
            } else {
                console.error('Failed to update booking status: Invalid response', response);
                alert('Failed to update booking status. Please try again.');
            }
        } catch (error) {
            console.error('Failed to update booking status:', error);
            alert('Failed to update booking status. Please try again.');
        }
    };

    const handleRowClick = (bookingId) => {
        if (activeDropdown !== bookingId) {
            router.push(`/profile_listing/bookings/${bookingId}`);
        }
    };

    const handleDropdownClick = (e, bookingId) => {
        e.stopPropagation();
        setActiveDropdown(bookingId);
    };

    const handleDropdownChange = (e, bookingId) => {
        e.stopPropagation();
        handleStatusChange(bookingId, e.target.value);
        setActiveDropdown(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return styles['status-pending'];
            case 'confirmed':
                return styles['status-confirmed'];
            case 'cancelled':
                return styles['status-cancelled'];
            case 'completed':
                return styles['status-completed'];
            default:
                return styles['status-pending'];
        }
    };

    const getCustomerInitials = (fullName) => {
        return fullName
            .split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Filter and sort bookings
    const filteredAndSortedBookings = bookings
        .filter(booking => 
            booking.customer.customerProfile.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.package.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'Date') {
                return new Date(b.eventDate) - new Date(a.eventDate);
            } else if (sortBy === 'Customer') {
                return (a.customer.customerProfile.fullName || '').localeCompare(b.customer.customerProfile.fullName || '');
            } else if (sortBy === 'Event') {
                return (a.event.name || '').localeCompare(b.event.name || '');
            } else if (sortBy === 'Status') {
                return (a.status || '').localeCompare(b.status || '');
            }
            return 0;
        });

    if (loading) {
        return (
            <div className={styles['bookings-container']}>
                <div className={styles['loading-state']}>
                    <div className={styles['loading-spinner']}></div>
                    <div>Loading your bookings...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles['bookings-container']}>
                <div className={styles['error-state']}>
                    <div className={styles['error-icon']}>⚠️</div>
                    <div className={styles['error-text']}>Something went wrong</div>
                    <div className={styles['error-subtext']}>{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles['bookings-container']}>
            {/* Sort and Filter Bar */}
            <div className={styles['actions-bar']}>
                <div className={styles['search-bar']}>
                    <input 
                        type="text" 
                        placeholder="Search bookings by customer, event, or package..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles['search-input']}
                    />
                    <button className={styles['search-btn']}>
                        <Image src="/search_icon.png" alt="Search" width={24} height={24} />
                    </button>
                </div>
                <div className={styles['sort-filter']}>
                    <span>Sort By:</span>
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className={styles['sort-select']}
                    >
                        <option value="Date">Date</option>
                        <option value="Customer">Customer</option>
                        <option value="Event">Event</option>
                        <option value="Status">Status</option>
                    </select>
                </div>
            </div>

            {/* Table Header */}
            <div className={styles['table-header']}>
                <span data-label="Sr. No.">Sr. No.</span>
                <span data-label="Customer">Customer</span>
                <span data-label="Event">Event</span>
                <span data-label="Package">Package</span>
                <span data-label="Date & Time">Date & Time</span>
                <span data-label="Attendees">Attendees</span>
                <span data-label="Price">Price</span>
                <span data-label="Status">Status</span>
                <span data-label="Actions">Actions</span>
            </div>

            {/* Booking Rows */}
            {filteredAndSortedBookings.length === 0 ? (
                <div className={styles['empty-state']}>
                    <div className={styles['empty-state-icon']}>📅</div>
                    <div className={styles['empty-state-text']}>No bookings yet</div>
                    <div className={styles['empty-state-subtext']}>
                        {searchTerm ? 'No bookings found matching your search.' : 'When customers book your services, they\'ll appear here'}
                    </div>
                </div>
            ) : (
                <>
                    {filteredAndSortedBookings.map((booking, idx) => (
                        <div
                            className={styles['table-row']}
                            key={booking._id}
                            onClick={() => handleRowClick(booking._id)}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleRowClick(booking._id); }}
                            tabIndex={0}
                            role="button"
                        >
                            <span data-label="Sr. No.">{idx + 1}</span>
                            <span className={styles['customer-cell']} data-label="Customer">
                                <div className={styles['customer-info']}>
                                    <div className={styles['customer-avatar']}>
                                        {getCustomerInitials(booking.customer.customerProfile.fullName)}
                                    </div>
                                    <div className={styles['customer-details']}>
                                        <div className={styles['customer-name']}>
                                            {booking.customer.customerProfile.fullName}
                                        </div>
                                        <div className={styles['customer-email']}>
                                            {booking.customer.email}
                                        </div>
                                    </div>
                                </div>
                            </span>
                            <span className={styles['event-cell']} data-label="Event">
                                <div className={styles['event-info']}>
                                    <div className={styles['event-name']}>
                                        {booking.event.name}
                                    </div>
                                    <div className={styles['event-type']}>
                                        {booking.event.eventType || 'Event'}
                                    </div>
                                </div>
                            </span>
                            <span className={styles['package-cell']} data-label="Package">
                                <div className={styles['package-name']}>
                                    {booking.package.name}
                                </div>
                            </span>
                            <span className={styles['date-cell']} data-label="Date & Time">
                                <div className={styles['date-info']}>
                                    <div className={styles['event-date']}>
                                        {formatDate(booking.eventDate)}
                                    </div>
                                    <div className={styles['event-time']}>
                                        {formatTime(booking.eventDate)}
                                    </div>
                                </div>
                            </span>
                            <span className={styles['attendees-cell']} data-label="Attendees">
                                <div className={styles['attendees-count']}>
                                    {booking.attendees}
                                </div>
                            </span>
                            <span className={styles['price-cell']} data-label="Price">
                                <div className={styles['price-amount']}>
                                    ${booking.totalPrice}
                                </div>
                            </span>
                            <span className={styles['status-cell']} data-label="Status">
                                <span 
                                    className={`${styles['status-badge']} ${getStatusClass(booking.status)}`}
                                    title={booking.status}
                                >
                                    {booking.status}
                                </span>
                            </span>
                            <span className={styles['action-buttons']} data-label="Actions">
                                <select
                                    className={styles['status-select']}
                                    value={booking.status} 
                                    onClick={(e) => handleDropdownClick(e, booking._id)}
                                    onChange={(e) => handleDropdownChange(e, booking._id)}
                                    onFocus={() => setActiveDropdown(booking._id)}
                                    onBlur={() => setActiveDropdown(null)}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </span>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
} 