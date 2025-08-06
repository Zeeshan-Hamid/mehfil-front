import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./DashboardContent.module.css";
import NotificationBell from "../../components/Notifications/NotificationBell";
import GlobalNotificationProvider from "../../components/Providers/GlobalNotificationProvider";
import apiService from "../../utils/api.js";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function getToday() {
  const d = new Date();
  return { day: d.getDate(), month: d.getMonth(), year: d.getFullYear() };
}

const DashboardContent = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [vendorsError, setVendorsError] = useState(null);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showInvitePlannerModal, setShowInvitePlannerModal] = useState(false);
  const [showAllTodosModal, setShowAllTodosModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [newTodo, setNewTodo] = useState({ name: "", start: "", end: "", members: 1 });
  const [calendarEvents, setCalendarEvents] = useState({});
  const [hoveredDate, setHoveredDate] = useState(null);
  const [user, setUser] = useState(null);
  
  const today = getToday();
  const [calendar, setCalendar] = useState({ month: today.month, year: today.year });

  // Add click outside handler for popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (hoveredDate && !event.target.closest(`.${styles["dashboard-calendar-popup"]}`)) {
        setHoveredDate(null);
      }
    };

    if (hoveredDate) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [hoveredDate, styles]);

  // Fetch data on component mount
  useEffect(() => {
    console.log('DashboardContent mounted - fetching data...');
    fetchCurrentUser();
    fetchPriorityTodos();
    fetchBookedVendors();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await apiService.getCurrentUser();
      console.log('Current user response:', response);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  // Organize events for calendar display
  useEffect(() => {
    const events = {};
    
    // Add todos to calendar events
    todos.forEach(todo => {
      try {
        // Handle different date formats
        let startDate;
        if (todo.start.includes('/')) {
          // Handle MM/DD/YYYY format
          const [month, day, year] = todo.start.split('/');
          startDate = new Date(year, month - 1, day);
        } else {
          // Handle ISO format (YYYY-MM-DD)
          startDate = new Date(todo.start);
        }
        
        if (!isNaN(startDate.getTime())) {
          const dateKey = startDate.toISOString().split('T')[0];
          
          if (!events[dateKey]) {
            events[dateKey] = [];
          }
          events[dateKey].push({
            type: 'todo',
            title: todo.name,
            description: `Task: ${todo.name}`,
            status: todo.status,
            checked: todo.checked
          });
        }
      } catch (error) {
        console.error('Error parsing todo date:', todo.start, error);
      }
    });
    
    // Add orders to calendar events
    vendors.forEach(order => {
      if (order.eventDate && order.eventDate !== 'Date TBD') {
        try {
          let eventDate;
          if (order.eventDate.includes(',')) {
            // Handle "Dec 15, 2024" format
            eventDate = new Date(order.eventDate);
          } else if (order.eventDate.includes('/')) {
            // Handle MM/DD/YYYY format
            const [month, day, year] = order.eventDate.split('/');
            eventDate = new Date(year, month - 1, day);
          } else {
            // Handle ISO format (YYYY-MM-DD)
            eventDate = new Date(order.eventDate);
          }
          
          if (!isNaN(eventDate.getTime())) {
            const dateKey = eventDate.toISOString().split('T')[0];
            
            if (!events[dateKey]) {
              events[dateKey] = [];
            }
            events[dateKey].push({
              type: 'order',
              title: order.name,
              description: `Order: ${order.name} - $${order.price.toLocaleString()}`,
              status: order.status,
              price: order.price
            });
          }
        } catch (error) {
          console.error('Error parsing order date:', order.eventDate, error);
        }
      }
    });
    
    setCalendarEvents(events);
    
    // Debug: Log all calendar events
    console.log('Calendar Events:', events);
    console.log('Todos:', todos);
    console.log('Vendors:', vendors);
  }, [todos, vendors]);

  const fetchPriorityTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching priority todos...');
      const response = await apiService.getPriorityTodos();
      console.log('API Response for Todos:', response);
      
      if (response.data && response.data.priorityTodos) {
        console.log('Priority todos found:', response.data.priorityTodos.length);
        // Transform API data to match the component's expected format
        const transformedTodos = response.data.priorityTodos.map(todo => ({
          id: todo._id,
          name: todo.taskName,
          start: new Date(todo.startDate).toISOString().split('T')[0], // Use ISO format
          end: new Date(todo.endDate).toISOString().split('T')[0], // Use ISO format
          members: todo.member || 'Unassigned',
          status: todo.status.charAt(0).toUpperCase() + todo.status.slice(1),
          checked: todo.status === 'completed',
          eventTitle: todo.userEvent?.title || 'Unknown Event',
          eventIcon: todo.userEvent?.icon || '🎉'
        }));
        console.log('Transformed Todos:', transformedTodos);
        setTodos(transformedTodos);
      } else {
        console.log('No priority todos found in API response');
        setTodos([]);
      }
    } catch (err) {
      console.error('Error fetching priority todos:', err);
      console.error('Error details:', err.message, err.stack);
      setError('Failed to load priority tasks. Please try again.');
      // Don't fallback to dummy data - keep empty array
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookedVendors = async () => {
    try {
      setVendorsLoading(true);
      setVendorsError(null);
      console.log('Fetching customer bookings...');
      const response = await apiService.getCustomerBookings();
      console.log('API Response for Bookings:', response);
      
      if (response.data && response.data.bookings) {
        console.log('Bookings found:', response.data.bookings.length);
        // Transform API data to match the component's expected format
        const transformedOrders = response.data.bookings
          .filter(booking => booking && booking._id) // Filter out null/undefined bookings
          .map(booking => ({
            id: booking._id,
            name: booking.package?.name || booking.event?.name || booking.vendor?.businessName || 'Unknown Service',
            desc: booking.vendor?.description || booking.event?.description || '',
            price: booking.totalPrice || 0,
            status: booking.status || 'Pending',
            rating: booking.vendor?.rating || 0,
            eventDate: booking.eventDate ? new Date(booking.eventDate).toISOString().split('T')[0] : 'Date TBD', // Use ISO format
            bookingId: booking._id // Keep the original booking ID for navigation
          }));
        console.log('Transformed Orders:', transformedOrders);
        setVendors(transformedOrders);
      } else {
        console.log('No bookings found in API response');
        setVendors([]);
      }
    } catch (err) {
      console.error('Error fetching customer bookings:', err);
      console.error('Error details:', err.message, err.stack);
      setVendorsError('Failed to load your orders. Please try again.');
      // Don't fallback to dummy data - keep empty array
      setVendors([]);
    } finally {
      setVendorsLoading(false);
    }
  };

  // Removed static notification data - now using NotificationBell component

  // To Do Handlers
  const handleCheck = (id) => {
    setTodos(todos => todos.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTodos(todos => todos.filter(t => t.id !== id));
    }
  };

  const handleEdit = (id) => {
    const todo = todos.find(t => t.id === id);
    setEditingTodo(todo);
    setNewTodo({ name: todo.name, start: todo.start, end: todo.end, members: todo.members });
  };

  const handleSaveEdit = () => {
    if (editingTodo) {
      setTodos(todos => todos.map(t => 
        t.id === editingTodo.id 
          ? { ...t, ...newTodo }
          : t
      ));
      setEditingTodo(null);
      setNewTodo({ name: "", start: "", end: "", members: 1 });
    }
  };

  const handleCancelEdit = () => {
    setEditingTodo(null);
    setNewTodo({ name: "", start: "", end: "", members: 1 });
  };

  const handleAddTodo = () => {
    if (newTodo.name && newTodo.start && newTodo.end) {
      const todo = {
        id: Math.max(...todos.map(t => t.id)) + 1,
        ...newTodo,
        status: "Pending",
        checked: false,
      };
      setTodos([...todos, todo]);
      setNewTodo({ name: "", start: "", end: "", members: 1 });
    }
  };

  // Calendar handlers
  const handlePrevMonth = () => {
    setCalendar(({ month, year }) => {
      if (month === 0) return { month: 11, year: year - 1 };
      return { month: month - 1, year };
    });
  };

  const handleNextMonth = () => {
    setCalendar(({ month, year }) => {
      if (month === 11) return { month: 0, year: year + 1 };
      return { month: month + 1, year };
    });
  };

  // Header action handlers
  const handleAddService = () => {
    setShowAddServiceModal(true);
  };

  const handleInvitePlanner = () => {
    setShowInvitePlannerModal(true);
  };

  // Removed handleBellClick - now handled by NotificationBell component

  const handleVendorClick = (vendor) => {
    if (vendor?.vendorId) {
      window.location.href = `/vendor/${vendor.vendorId}`;
    } else {
      alert(`Viewing details for ${vendor?.name}`);
    }
  };

  // Calendar generation
  const daysInMonth = new Date(calendar.year, calendar.month + 1, 0).getDate();
  const firstDay = new Date(calendar.year, calendar.month, 1).getDay();
  let calendarRows = [];
  let day = 1 - ((firstDay + 6) % 7); // Monday start
  for (let w = 0; w < 6; w++) {
    let row = [];
    for (let d = 0; d < 7; d++) {
      if (day < 1 || day > daysInMonth) {
        row.push(<td key={d} className={styles["dashboard-calendar-muted"]}>{day < 1 ? "" : day}</td>);
      } else {
        const isToday = day === today.day && calendar.month === today.month && calendar.year === today.year;
        const dateKey = new Date(calendar.year, calendar.month, day).toISOString().split('T')[0];
        const hasEvents = calendarEvents[dateKey] && calendarEvents[dateKey].length > 0;
        
        row.push(
          <td
            key={d}
            className={`${isToday ? styles["dashboard-calendar-today"] : ""} ${hasEvents ? styles["dashboard-calendar-has-events"] : ""}`}
            onClick={() => hasEvents && setHoveredDate(hoveredDate === dateKey ? null : dateKey)}
            style={{ 
              cursor: hasEvents ? 'pointer' : 'default',
              position: 'relative'
            }}
          >
            {day}
            {hoveredDate === dateKey && hasEvents && (
              createPortal(
                <>
                  {/* Backdrop */}
                  <div 
                    className={styles["dashboard-calendar-popup-backdrop"]}
                    onClick={() => setHoveredDate(null)}
                  />
                  {/* Popup */}
                  <div className={styles["dashboard-calendar-popup"]}>
                    <div className={styles["dashboard-calendar-popup-header"]}>
                      {new Date(dateKey).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className={styles["dashboard-calendar-popup-content"]}>
                      <div className={styles["dashboard-calendar-popup-columns"]}>
                        {/* Events Column */}
                        <div className={styles["dashboard-calendar-popup-column"]}>
                          <div className={styles["dashboard-calendar-popup-section-header"]}>
                            📅 Events
                          </div>
                          <div className={styles["dashboard-calendar-popup-section-content"]}>
                            {calendarEvents[dateKey].filter(event => event.type === 'order').length > 0 ? (
                              calendarEvents[dateKey].filter(event => event.type === 'order').map((event, index) => (
                                <div key={`order-${index}`} className={styles["dashboard-calendar-popup-item"]}>
                                  <div className={styles["dashboard-calendar-popup-item-header"]}>
                                    <span className={styles["dashboard-calendar-popup-item-type"]}>
                                      📅
                                    </span>
                                    <span className={styles["dashboard-calendar-popup-item-title"]}>
                                      {event.title}
                                    </span>
                                  </div>
                                  <div className={styles["dashboard-calendar-popup-item-desc"]}>
                                    {event.description}
                                  </div>
                                  <div className={styles["dashboard-calendar-popup-item-status"]}>
                                    Status: {event.status}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className={styles["dashboard-calendar-popup-empty"]}>
                                No events scheduled
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Tasks Column */}
                        <div className={styles["dashboard-calendar-popup-column"]}>
                          <div className={styles["dashboard-calendar-popup-section-header"]}>
                            📋 Tasks
                          </div>
                          <div className={styles["dashboard-calendar-popup-section-content"]}>
                            {calendarEvents[dateKey].filter(event => event.type === 'todo').length > 0 ? (
                              calendarEvents[dateKey].filter(event => event.type === 'todo').map((event, index) => (
                                <div key={`todo-${index}`} className={styles["dashboard-calendar-popup-item"]}>
                                  <div className={styles["dashboard-calendar-popup-item-header"]}>
                                    <span className={styles["dashboard-calendar-popup-item-type"]}>
                                      📋
                                    </span>
                                    <span className={styles["dashboard-calendar-popup-item-title"]}>
                                      {event.title}
                                    </span>
                                  </div>
                                  <div className={styles["dashboard-calendar-popup-item-desc"]}>
                                    {event.description}
                                  </div>
                                  <div className={styles["dashboard-calendar-popup-item-status"]}>
                                    Status: {event.status}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className={styles["dashboard-calendar-popup-empty"]}>
                                No tasks due
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>,
                document.body
              )
            )}
          </td>
        );
      }
      day++;
    }
    calendarRows.push(<tr key={w}>{row}</tr>);
    if (day > daysInMonth) break;
  }

  return (
    <GlobalNotificationProvider>
      <div className={styles["dashboard-root"]}>
        {/* Header */}
        <div className={styles["dashboard-header-row"]}>
          <h2 className={styles["dashboard-greeting"]}>
            Hi {user?.customerProfile?.fullName || user?.displayName || 'User'}
          </h2>
          <div className={styles["dashboard-header-actions"]}>
            
            <NotificationBell 
              customStyles={{
                padding: 'clamp(6px, 1vw, 8px)',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                borderRadius: '8px'
              }}
              customSize={24}
              dropdownPosition="right"
              iconSrc="/notification_bell_icon.png"
            />
          </div>
        </div>

      {/* Main Content Grid */}
      <div className={styles["dashboard-main-grid"]}>
        {/* To Do Table */}
        <div className={`${styles["dashboard-card"]} ${styles["dashboard-todo"]}`}>
          <div className={styles["dashboard-card-header"]}>
            <span className={styles["dashboard-card-title"]}>To Do</span>
            <button 
              className={styles["dashboard-card-link"]}
              onClick={() => setShowAllTodosModal(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              See More
            </button>
          </div>
          
          
         

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              Loading priority tasks...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#F77B7B' }}>
              {error}
            </div>
          ) : todos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              No priority tasks found. Create some events and tasks to see them here!
            </div>
          ) : (
            <table className={styles["dashboard-table"]}>
              <thead>
                <tr>
                  <th style={{ width: '8%' }}>Check Box</th>
                  <th style={{ width: '12%' }}>Event</th>
                  <th style={{ width: '20%' }}>Task Name</th>
                  <th style={{ width: '12%' }}>Start Date</th>
                  <th style={{ width: '12%' }}>End Date</th>
                  <th style={{ width: '8%' }}>Member</th>
                  <th style={{ width: '12%' }}>Status</th>
                  <th style={{ width: '16%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {todos.slice(0, 3).map(todo => (
                  <tr key={todo.id}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={todo.checked} 
                        onChange={() => handleCheck(todo.id)} 
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>{todo.eventIcon}</span>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>{todo.eventTitle}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {editingTodo?.id === todo.id ? (
                          <input
                            type="text"
                            value={newTodo.name}
                            onChange={(e) => setNewTodo({...newTodo, name: e.target.value})}
                            style={{ 
                              border: '1px solid #AF8EBA', 
                              borderRadius: '4px', 
                              padding: 'clamp(1px, 0.3vw, 2px) clamp(2px, 0.5vw, 4px)' 
                            }}
                          />
                        ) : (
                          <span>{todo.name}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {editingTodo?.id === todo.id ? (
                        <input
                          type="date"
                          value={newTodo.start}
                          onChange={(e) => setNewTodo({...newTodo, start: e.target.value})}
                          style={{ 
                            border: '1px solid #AF8EBA', 
                            borderRadius: '4px', 
                            padding: 'clamp(1px, 0.3vw, 2px) clamp(2px, 0.5vw, 4px)' 
                          }}
                        />
                      ) : (
                        todo.start
                      )}
                    </td>
                    <td className={styles["dashboard-date-red"]}>
                      {editingTodo?.id === todo.id ? (
                        <input
                          type="date"
                          value={newTodo.end}
                          onChange={(e) => setNewTodo({...newTodo, end: e.target.value})}
                          style={{ 
                            border: '1px solid #AF8EBA', 
                            borderRadius: '4px', 
                            padding: 'clamp(1px, 0.3vw, 2px) clamp(2px, 0.5vw, 4px)' 
                          }}
                        />
                      ) : (
                        todo.end
                      )}
                    </td>
                    <td>
                      {editingTodo?.id === todo.id ? (
                        <input
                          type="text"
                          value={newTodo.members}
                          onChange={(e) => setNewTodo({...newTodo, members: e.target.value})}
                          style={{ 
                            border: '1px solid #AF8EBA', 
                            borderRadius: '4px', 
                            padding: 'clamp(1px, 0.3vw, 2px) clamp(2px, 0.5vw, 4px)', 
                            width: 'clamp(60px, 8vw, 80px)' 
                          }}
                        />
                      ) : (
                        todo.members
                      )}
                    </td>
                    <td>
                      <span className={`${styles["dashboard-status"]} ${styles["dashboard-status-pending"]}`}>
                        {todo.status}
                      </span>
                    </td>
                    <td>
                      {editingTodo?.id === todo.id ? (
                        <>
                          <button 
                            className={`${styles["dashboard-action-icon"]} ${styles["edit"]}`} 
                            onClick={handleSaveEdit}
                            title="Save"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                              <polyline points="17,21 17,13 7,13 7,21"/>
                              <polyline points="7,3 7,8 15,8"/>
                            </svg>
                          </button>
                          <button 
                            className={`${styles["dashboard-action-icon"]} ${styles["delete"]}`} 
                            onClick={handleCancelEdit}
                            title="Cancel"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            className={`${styles["dashboard-action-icon"]} ${styles["edit"]}`} 
                            onClick={() => handleEdit(todo.id)}
                            title="Edit"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button 
                            className={`${styles["dashboard-action-icon"]} ${styles["delete"]}`} 
                            onClick={() => handleDelete(todo.id)}
                            title="Delete"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3,6 5,6 21,6"/>
                              <path d="m19,6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              <line x1="10" y1="11" x2="10" y2="17"/>
                              <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Booked Vendors */}
        <div className={`${styles["dashboard-card"]} ${styles["dashboard-vendors"]}`}>
          <div className={styles["dashboard-card-header"]}>
            <span className={styles["dashboard-card-title"]}>My Orders</span>
            <button 
              className={styles["dashboard-card-link"]}
              onClick={() => window.location.href = '/customer_profile_dash?tab=My%20Orders'}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              View All
            </button>
          </div>
          <div className={styles["dashboard-vendor-list"]}>
            {vendorsLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                Loading your orders...
              </div>
            ) : vendorsError ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#F77B7B' }}>
                {vendorsError}
              </div>
            ) : vendors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                No orders found. Book some vendors to see your orders here!
              </div>
            ) : (
              vendors.slice(0, 4).map(order => (
                <div 
                  className={styles["dashboard-vendor-item"]} 
                  key={order.id}
                  onClick={() => handleVendorClick(order)}
                >
                  <span className={`${styles["dashboard-vendor-status"]} ${styles["confirmed"]}`}>
                    {order.status}
                  </span>
                  <div className={styles["dashboard-vendor-title"]}>{order.name}</div>
                  <div className={styles["dashboard-vendor-price"]}>$ {order.price.toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Calendar */}
        <div className={`${styles["dashboard-card"]} ${styles["dashboard-calendar"]}`}>
          <div className={styles["dashboard-calendar-header"]}>
            <span 
              className={styles["dashboard-calendar-arrow"]} 
              onClick={handlePrevMonth}
              style={{ cursor: 'pointer' }}
            >
              &#8592;
            </span>
            <span className={styles["dashboard-calendar-title"]}>
              {months[calendar.month]} <b>{calendar.year}</b>
            </span>
            <span 
              className={styles["dashboard-calendar-arrow"]} 
              onClick={handleNextMonth}
              style={{ cursor: 'pointer' }}
            >
              &#8594;
            </span>
          </div>
          <table className={styles["dashboard-calendar-table"]}>
            <thead>
              <tr>
                <th>Mo</th><th>Tu</th><th>We</th><th>Th</th><th>Fr</th><th>Sa</th><th>Su</th>
              </tr>
            </thead>
            <tbody>
              {calendarRows}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAddServiceModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 'clamp(16px, 3vw, 24px)'
        }}>
          <div style={{
            background: 'white',
            padding: 'clamp(16px, 3vw, 24px)',
            borderRadius: '12px',
            minWidth: 'clamp(300px, 40vw, 400px)',
            maxWidth: 'clamp(400px, 50vw, 500px)',
            width: '100%'
          }}>
            <h3 style={{ 
              margin: '0 0 clamp(12px, 2vw, 16px) 0', 
              color: '#23213D',
              fontSize: 'clamp(16px, 2.5vw, 20px)'
            }}>
              Add New Service
            </h3>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 'clamp(8px, 1.5vw, 12px)' 
            }}>
              <input
                type="text"
                placeholder="Service name"
                style={{ 
                  padding: 'clamp(6px, 1vw, 8px) clamp(8px, 1.5vw, 12px)', 
                  border: '1px solid #ddd', 
                  borderRadius: '6px' 
                }}
              />
              <select style={{ 
                padding: 'clamp(6px, 1vw, 8px) clamp(8px, 1.5vw, 12px)', 
                border: '1px solid #ddd', 
                borderRadius: '6px' 
              }}>
                <option>Select service type</option>
                <option>Catering</option>
                <option>Photography</option>
                <option>Decoration</option>
                <option>Music</option>
                <option>Transportation</option>
              </select>
              <input
                type="date"
                placeholder="Service date"
                style={{ 
                  padding: 'clamp(6px, 1vw, 8px) clamp(8px, 1.5vw, 12px)', 
                  border: '1px solid #ddd', 
                  borderRadius: '6px' 
                }}
              />
              <textarea
                placeholder="Service description"
                rows="3"
                style={{ 
                  padding: 'clamp(6px, 1vw, 8px) clamp(8px, 1.5vw, 12px)', 
                  border: '1px solid #ddd', 
                  borderRadius: '6px', 
                  resize: 'vertical' 
                }}
              />
            </div>
            <div style={{ 
              display: 'flex', 
              gap: 'clamp(8px, 1.5vw, 12px)', 
              marginTop: 'clamp(16px, 2.5vw, 20px)', 
              justifyContent: 'flex-end',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setShowAddServiceModal(false)}
                style={{
                  padding: 'clamp(6px, 1vw, 8px) clamp(12px, 2vw, 16px)',
                  background: '#f8f9fa',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Service added successfully!');
                  setShowAddServiceModal(false);
                }}
                style={{
                  padding: 'clamp(6px, 1vw, 8px) clamp(12px, 2vw, 16px)',
                  background: '#AF8EBA',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Add Service
              </button>
            </div>
          </div>
        </div>
      )}

      {showInvitePlannerModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 'clamp(16px, 3vw, 24px)'
        }}>
          <div style={{
            background: 'white',
            padding: 'clamp(16px, 3vw, 24px)',
            borderRadius: '12px',
            minWidth: 'clamp(300px, 40vw, 400px)',
            maxWidth: 'clamp(400px, 50vw, 500px)',
            width: '100%'
          }}>
            <h3 style={{ 
              margin: '0 0 clamp(12px, 2vw, 16px) 0', 
              color: '#23213D',
              fontSize: 'clamp(16px, 2.5vw, 20px)'
            }}>
              Invite Event Planner
            </h3>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 'clamp(8px, 1.5vw, 12px)' 
            }}>
              <input
                type="email"
                placeholder="Planner's email address"
                style={{ 
                  padding: 'clamp(6px, 1vw, 8px) clamp(8px, 1.5vw, 12px)', 
                  border: '1px solid #ddd', 
                  borderRadius: '6px' 
                }}
              />
              <input
                type="text"
                placeholder="Planner's name"
                style={{ 
                  padding: 'clamp(6px, 1vw, 8px) clamp(8px, 1.5vw, 12px)', 
                  border: '1px solid #ddd', 
                  borderRadius: '6px' 
                }}
              />
              <select style={{ 
                padding: 'clamp(6px, 1vw, 8px) clamp(8px, 1.5vw, 12px)', 
                border: '1px solid #ddd', 
                borderRadius: '6px' 
              }}>
                <option>Select planner type</option>
                <option>Wedding Planner</option>
                <option>Event Coordinator</option>
                <option>Party Planner</option>
                <option>Corporate Event Planner</option>
              </select>
              <textarea
                placeholder="Message to planner (optional)"
                rows="3"
                style={{ 
                  padding: 'clamp(6px, 1vw, 8px) clamp(8px, 1.5vw, 12px)', 
                  border: '1px solid #ddd', 
                  borderRadius: '6px', 
                  resize: 'vertical' 
                }}
              />
            </div>
            <div style={{ 
              display: 'flex', 
              gap: 'clamp(8px, 1.5vw, 12px)', 
              marginTop: 'clamp(16px, 2.5vw, 20px)', 
              justifyContent: 'flex-end',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setShowInvitePlannerModal(false)}
                style={{
                  padding: 'clamp(6px, 1vw, 8px) clamp(12px, 2vw, 16px)',
                  background: '#f8f9fa',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Invitation sent successfully!');
                  setShowInvitePlannerModal(false);
                }}
                style={{
                  padding: 'clamp(6px, 1vw, 8px) clamp(12px, 2vw, 16px)',
                  background: '#AF8EBA',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Todos Modal */}
      {showAllTodosModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 'clamp(16px, 2vw, 24px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: 'clamp(12px, 1.5vw, 16px)',
            padding: 'clamp(20px, 2.5vw, 24px)',
            maxHeight: '80vh',
            overflow: 'auto',
            maxWidth: 'clamp(900px, 90vw, 1200px)',
            width: '100%'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 'clamp(16px, 2vw, 20px)'
            }}>
              <h3 style={{ 
                margin: 0, 
                color: '#23213D',
                fontSize: 'clamp(18px, 2.5vw, 22px)'
              }}>
                All To-Do Items
              </h3>
              <button
                onClick={() => setShowAllTodosModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 'clamp(20px, 2.5vw, 24px)',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>
            <table className={styles["dashboard-table"]} style={{ 
              width: '100%',
              minWidth: '100%',
              tableLayout: 'fixed'
            }}>
              <thead>
                <tr>
                  <th>Check Box</th>
                  <th>Event</th>
                  <th>Task Name</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Member</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {todos.map(todo => (
                  <tr key={todo.id}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={todo.checked} 
                        onChange={() => handleCheck(todo.id)} 
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>{todo.eventIcon}</span>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>{todo.eventTitle}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {editingTodo?.id === todo.id ? (
                          <input
                            type="text"
                            value={newTodo.name}
                            onChange={(e) => setNewTodo({...newTodo, name: e.target.value})}
                            style={{ 
                              border: '1px solid #AF8EBA', 
                              borderRadius: '4px', 
                              padding: 'clamp(1px, 0.3vw, 2px) clamp(2px, 0.5vw, 4px)' 
                            }}
                          />
                        ) : (
                          <span>{todo.name}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {editingTodo?.id === todo.id ? (
                        <input
                          type="date"
                          value={newTodo.start}
                          onChange={(e) => setNewTodo({...newTodo, start: e.target.value})}
                          style={{ 
                            border: '1px solid #AF8EBA', 
                            borderRadius: '4px', 
                            padding: 'clamp(1px, 0.3vw, 2px) clamp(2px, 0.5vw, 4px)' 
                          }}
                        />
                      ) : (
                        todo.start
                      )}
                    </td>
                    <td className={styles["dashboard-date-red"]}>
                      {editingTodo?.id === todo.id ? (
                        <input
                          type="date"
                          value={newTodo.end}
                          onChange={(e) => setNewTodo({...newTodo, end: e.target.value})}
                          style={{ 
                            border: '1px solid #AF8EBA', 
                            borderRadius: '4px', 
                            padding: 'clamp(1px, 0.3vw, 2px) clamp(2px, 0.5vw, 4px)' 
                          }}
                        />
                      ) : (
                        todo.end
                      )}
                    </td>
                    <td>
                      {editingTodo?.id === todo.id ? (
                        <input
                          type="text"
                          value={newTodo.members}
                          onChange={(e) => setNewTodo({...newTodo, members: e.target.value})}
                          style={{ 
                            border: '1px solid #AF8EBA', 
                            borderRadius: '4px', 
                            padding: 'clamp(1px, 0.3vw, 2px) clamp(2px, 0.5vw, 4px)', 
                            width: 'clamp(60px, 8vw, 80px)' 
                          }}
                        />
                      ) : (
                        todo.members
                      )}
                    </td>
                    <td>
                      <span className={`${styles["dashboard-status"]} ${styles["dashboard-status-pending"]}`}>
                        {todo.status}
                      </span>
                    </td>
                    <td>
                      {editingTodo?.id === todo.id ? (
                        <>
                          <button 
                            className={`${styles["dashboard-action-icon"]} ${styles["edit"]}`} 
                            onClick={handleSaveEdit}
                            title="Save"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                              <polyline points="17,21 17,13 7,13 7,21"/>
                              <polyline points="7,3 7,8 15,8"/>
                            </svg>
                          </button>
                          <button 
                            className={`${styles["dashboard-action-icon"]} ${styles["delete"]}`} 
                            onClick={handleCancelEdit}
                            title="Cancel"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            className={`${styles["dashboard-action-icon"]} ${styles["edit"]}`} 
                            onClick={() => handleEdit(todo.id)}
                            title="Edit"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button 
                            className={`${styles["dashboard-action-icon"]} ${styles["delete"]}`} 
                            onClick={() => handleDelete(todo.id)}
                            title="Delete"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3,6 5,6 21,6"/>
                              <path d="m19,6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              <line x1="10" y1="11" x2="10" y2="17"/>
                              <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Orders Modal */}
      {/* This modal is removed as per the edit hint */}
      </div>
    </GlobalNotificationProvider>
  );
};

export default DashboardContent; 