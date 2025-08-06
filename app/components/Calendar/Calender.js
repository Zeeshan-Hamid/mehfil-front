import React, { useState, useEffect } from "react";
import styles from "./Calender.module.css";
import apiService from "../../utils/api.js";

export const Calendar = () => {
  const daysOfWeek = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both bookings and todos
      const [bookingsResponse, todosResponse] = await Promise.all([
        apiService.getCustomerBookings(),
        apiService.getPriorityTodos()
      ]);

      console.log('Bookings response:', bookingsResponse);
      console.log('Todos response:', todosResponse);

      const events = {};

      // Process bookings
      if (bookingsResponse.success && bookingsResponse.data?.bookings) {
        bookingsResponse.data.bookings.forEach(booking => {
          if (booking.eventDate) {
            try {
              const eventDate = new Date(booking.eventDate);
              if (!isNaN(eventDate.getTime())) {
                const dateKey = eventDate.toISOString().split('T')[0];
                
                if (!events[dateKey]) {
                  events[dateKey] = [];
                }
                
                events[dateKey].push({
                  type: 'booking',
                  title: booking.package?.name || booking.event?.name || 'Event',
                  description: `Booking: ${booking.package?.name || booking.event?.name}`,
                  status: booking.status,
                  price: booking.totalPrice,
                  vendor: booking.vendor?.vendorProfile?.businessName || booking.event?.name,
                  attendees: booking.attendees
                });
              }
            } catch (error) {
              console.error('Error parsing booking date:', booking.eventDate, error);
            }
          }
        });
      }

      // Process todos
      if (todosResponse.status === 'success' && todosResponse.data?.priorityTodos) {
        todosResponse.data.priorityTodos.forEach(todo => {
          if (todo.startDate) {
            try {
              const startDate = new Date(todo.startDate);
              if (!isNaN(startDate.getTime())) {
                const dateKey = startDate.toISOString().split('T')[0];
                
                if (!events[dateKey]) {
                  events[dateKey] = [];
                }
                
                events[dateKey].push({
                  type: 'todo',
                  title: todo.taskName,
                  description: `Task: ${todo.taskName}`,
                  status: todo.status,
                  member: todo.member,
                  isCompleted: todo.isCompleted,
                  daysUntilDue: todo.daysUntilDue
                });
              }
            } catch (error) {
              console.error('Error parsing todo date:', todo.startDate, error);
            }
          }
        });
      }

      setCalendarEvents(events);
      console.log('Calendar events:', events);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      setError('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={styles['calendar-day']}></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
      const dayEvents = calendarEvents[dateKey] || [];
      const hasEvents = dayEvents.length > 0;
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

      days.push(
        <div 
          key={day} 
          className={`${styles['calendar-day']} ${hasEvents ? styles['has-events'] : ''} ${isToday ? styles['today'] : ''}`}
        >
          <span className={styles['day-number']}>{day}</span>
          {hasEvents && <div className={styles['event-dot']}></div>}
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <div className={styles['calendar-card']}>
        <div className={styles['calendar-content']}>
          <div className={styles['calendar-header']}>
            <span>Loading calendar...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['calendar-card']}>
        <div className={styles['calendar-content']}>
          <div className={styles['calendar-header']}>
            <span>Error: {error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['calendar-card']}>
      <div className={styles['calendar-content']}>
        <div className={styles['calendar-header']}>
          <button className={styles['nav-button']} onClick={handlePrevMonth}>
            <div className={styles['nav-icon']}>
              <img
                className={`${styles['nav-arrow']} ${styles['prev-arrow']}`}
                alt="Previous"
                src="/union.svg"
              />
            </div>
          </button>

          <div className={styles['month-year-selectors']}>
            <div className={styles['month-selector']}>
              <span className={styles['month-text']}>{months[currentDate.getMonth()]}</span>
            </div>

            <div className={styles['year-selector']}>
              <span className={styles['year-text']}>{currentDate.getFullYear()}</span>
            </div>
          </div>

          <button className={styles['nav-button']} onClick={handleNextMonth}>
            <div className={styles['nav-icon']}>
              <img
                className={`${styles['nav-arrow']} ${styles['next-arrow']}`}
                alt="Next"
                src="/union-1.svg"
              />
            </div>
          </button>
        </div>

        {/* Days of week */}
        <div className={styles['days-of-week']}>
          {daysOfWeek.map((day, index) => (
            <div key={index} className={styles['day-header']}>
              <span className={styles['day-text']}>{day}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className={styles['calendar-grid']}>
          {generateCalendarDays()}
        </div>
      </div>
    </div>
  );
};
