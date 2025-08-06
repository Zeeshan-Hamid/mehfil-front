import React, { useState, useEffect } from "react";
import styles from "./MyEventsContent.module.css";
import apiService from "../../utils/api.js";
import ChecklistView from "./ChecklistView.js";

const dummyEvents = [
  {
    id: 1,
    icon: "👰",
    title: "Sarah and John Wedding",
    date: "5 Jun 2021",
    location: "Lahore",
    guests: 127,
    tasksDone: 8,
    tasksTotal: 12,
    budget: 12200,
    status: "Active",
  },
  {
    id: 2,
    icon: "🎂",
    title: "Sarah and John Birthday",
    date: "5 Jun 2021",
    location: "Lahore",
    guests: 127,
    tasksDone: 8,
    tasksTotal: 12,
    budget: 12200,
    status: "Active",
  },
  {
    id: 3,
    icon: "🎓",
    title: "Sarah and John Graduation",
    date: "5 Jun 2021",
    location: "Lahore",
    guests: 127,
    tasksDone: 8,
    tasksTotal: 12,
    budget: 12200,
    status: "Active",
  },
];

const MyEventsContent = () => {
  const [events, setEvents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newEvent, setNewEvent] = useState({
    icon: "🎉",
    title: "",
    date: "",
    location: "",
    guests: 0,
    budget: 0,
    status: "Active",
    customEventType: "",
    isCustomEvent: false,
  });
  const [showMenu, setShowMenu] = useState(null); // event id for which menu is open
  const [editEvent, setEditEvent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showGuestListModal, setShowGuestListModal] = useState(false);
  const [selectedEventForGuests, setSelectedEventForGuests] = useState(null);
  const [guestLists, setGuestLists] = useState({});
  const [selectedGuestList, setSelectedGuestList] = useState(null);
  const [showGuestListTable, setShowGuestListTable] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest(`.${styles["events-card-menu"]}`)) {
        setShowMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUserEvents();
      if (response.data && response.data.userEvents) {
        setEvents(response.data.userEvents);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add Event
  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.location) {
      alert("Please fill in all required fields.");
      return;
    }
    if (newEvent.isCustomEvent && !newEvent.customEventType) {
      alert("Please enter a name for your custom event type.");
      return;
    }

    try {
      const eventData = {
        ...newEvent,
        date: new Date(newEvent.date).toISOString()
      };

      const response = await apiService.createUserEvent(eventData);
      if (response.data && response.data.userEvent) {
        setEvents([...events, response.data.userEvent]);
        setShowAddModal(false);
        setNewEvent({
          icon: "🎉",
          title: "",
          date: "",
          location: "",
          guests: 0,
          budget: 0,
          status: "Active",
          customEventType: "",
          isCustomEvent: false,
        });
      }
    } catch (err) {
      console.error('Error creating event:', err);
      alert('Failed to create event. Please try again.');
    }
  };

  // Event Card Menu
  const handleMenuAction = async (eventId, action) => {
    switch (action) {
      case "edit":
        setEditEvent(events.find(e => e._id === eventId));
        setShowEditModal(true);
        setShowMenu(null);
        break;
      case "delete":
        if (window.confirm("Are you sure you want to delete this event?")) {
          try {
            await apiService.deleteUserEvent(eventId);
            setEvents(events.filter(e => e._id !== eventId));
          } catch (err) {
            console.error('Error deleting event:', err);
            alert('Failed to delete event. Please try again.');
          }
        }
        setShowMenu(null);
        break;
      default:
        setShowMenu(null);
        break;
    }
  };

  // Event Actions
  const handleEventAction = (eventId, action) => {
    const event = events.find(e => e._id === eventId);
    switch (action) {
      case "guest-list":
        handleGuestListAction(eventId);
        break;
      case "checklist":
        setSelectedEvent(event);
        setShowChecklist(true);
        break;
      case "edit":
        setEditEvent(event);
        setShowEditModal(true);
        break;
      default:
        break;
    }
  };

  // Edit Event
  const handleEditSave = async () => {
    try {
      const eventData = {
        ...editEvent,
        date: new Date(editEvent.date).toISOString()
      };

      const response = await apiService.updateUserEvent(editEvent._id, eventData);
      if (response.data && response.data.userEvent) {
        setEvents(events.map(e => e._id === editEvent._id ? response.data.userEvent : e));
        setShowEditModal(false);
        setEditEvent(null);
      }
    } catch (err) {
      console.error('Error updating event:', err);
      alert('Failed to update event. Please try again.');
    }
  };

  // Guest List Functions
  const handleGuestListAction = (eventId) => {
    setSelectedEventForGuests(events.find(e => e._id === eventId));
    setShowGuestListModal(true);
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const data = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',').map(v => v.trim());
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });

        const guestList = {
          id: Date.now(),
          name: file.name,
          headers: headers,
          data: data,
          uploadedAt: new Date().toISOString()
        };

        setGuestLists(prev => ({
          ...prev,
          [selectedEventForGuests._id]: [...(prev[selectedEventForGuests._id] || []), guestList]
        }));
      };
      reader.readAsText(file);
    } else {
      alert('Please select a valid CSV file.');
    }
  };

  const handleViewGuestList = (guestList) => {
    setSelectedGuestList(guestList);
    setShowGuestListTable(true);
  };

  const handleDeleteGuestList = (eventId, guestListId) => {
    if (window.confirm('Are you sure you want to delete this guest list?')) {
      setGuestLists(prev => ({
        ...prev,
        [eventId]: prev[eventId].filter(list => list.id !== guestListId)
      }));
    }
  };

  return (
    <div className={styles["events-root"]}>
      <div className={styles["events-header-row"]}>
        <div>
          <h2 className={styles["events-title"]}>My Events</h2>
          <div className={styles["events-subtitle"]}>Manage your events, guest lists and planning checklists</div>
        </div>
        <button className={styles["events-add-btn"]} onClick={() => setShowAddModal(true)}>+</button>
      </div>
      <div className={styles["events-main-grid"]}>
        {/* Events List */}
        <div className={styles["events-list-section"]}>
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: 'clamp(2rem, 6vw, 4rem)', 
              color: '#666',
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              fontFamily: "'Outfit', sans-serif"
            }}>
              Loading events...
            </div>
          ) : error ? (
            <div style={{ 
              textAlign: 'center', 
              padding: 'clamp(2rem, 6vw, 4rem)', 
              color: '#F77B7B',
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              fontFamily: "'Outfit', sans-serif"
            }}>
              {error}
            </div>
          ) : events.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: 'clamp(2rem, 6vw, 4rem)', 
              color: '#666',
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              fontFamily: "'Outfit', sans-serif"
            }}>
              No events found. Create your first event!
            </div>
          ) : (
            events.map((event, i) => (
                            <div className={styles["events-card"]} key={event._id || i}>
                <div className={styles["events-card-header"]}>
                  <span className={styles["events-card-icon"]}>{event.icon}</span>
                  <div>
                    <div className={styles["events-card-title"]}>{event.title}</div>
                    <div className={styles["events-card-meta"]}>Date: {event.formattedDate || event.date} &nbsp; Location: {event.location}</div>
                  </div>
                  <span className={styles["events-card-status"]}>{event.status}</span>
                  <span 
                    className={styles["events-card-menu"]}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShowMenu(showMenu === event._id ? null : event._id)}
                  >
                    •••
                  </span>
                {/* Dropdown menu */}
                {showMenu === event._id && (
                  <div style={{
                    position: 'absolute',
                    right: 'clamp(8px, 2vw, 24px)',
                    top: 'clamp(40px, 6vw, 48px)',
                    background: '#fff',
                    border: '1px solid rgba(175, 142, 186, 0.2)',
                    borderRadius: 'clamp(8px, 1.5vw, 12px)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    zIndex: 10,
                    minWidth: 'clamp(100px, 15vw, 140px)',
                    maxWidth: 'clamp(120px, 20vw, 160px)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <button style={{
                      background: 'none',
                      border: 'none',
                      width: '100%',
                      padding: 'clamp(10px, 1.5vw, 14px) clamp(12px, 2vw, 16px)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: 'clamp(0.9rem, 1.2vw, 1rem)',
                      fontFamily: "'Outfit', sans-serif",
                      color: '#23213D',
                      transition: 'background 0.2s ease',
                      borderRadius: 'clamp(6px, 1vw, 8px)',
                      margin: 'clamp(2px, 0.5vw, 4px)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }} 
                    onMouseEnter={(e) => e.target.style.background = 'rgba(175, 142, 186, 0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                    onClick={() => handleMenuAction(event._id, 'edit')}>Edit</button>
                    <button style={{
                      background: 'none',
                      border: 'none',
                      width: '100%',
                      padding: 'clamp(10px, 1.5vw, 14px) clamp(12px, 2vw, 16px)',
                      textAlign: 'left',
                      color: '#F77B7B',
                      cursor: 'pointer',
                      fontSize: 'clamp(0.9rem, 1.2vw, 1rem)',
                      fontFamily: "'Outfit', sans-serif",
                      transition: 'background 0.2s ease',
                      borderRadius: 'clamp(6px, 1vw, 8px)',
                      margin: 'clamp(2px, 0.5vw, 4px)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }} 
                    onMouseEnter={(e) => e.target.style.background = 'rgba(247, 123, 123, 0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                    onClick={() => handleMenuAction(event._id, 'delete')}>Delete</button>
                  </div>
                )}
              </div>
                             <div className={styles["events-card-details"]}>
                 <div className={styles["events-card-detail"]}>
                   <div className={styles["events-card-detail-main"]}>
                     {event.guests || 0}
                   </div>
                   Guests
                 </div>
                 <div className={styles["events-card-detail"]}>
                   <div className={styles["events-card-detail-main"]}>
                     {(event.tasksDone || 0)}/{(event.tasksTotal || 0)}
                   </div>
                   Tasks Done
                 </div>
                 <div className={styles["events-card-detail"]}>
                   <div className={styles["events-card-detail-main"]}>
                     ${(event.budget || 0).toLocaleString()}
                   </div>
                   Budget Used
                 </div>
                 {event.isCustomEvent && event.customEventType && (
                   <div className={styles["events-card-detail"]}>
                     <div className={styles["events-card-detail-main"]} style={{ fontSize: 'clamp(0.8rem, 1vw, 0.9rem)', color: '#AF8EBA' }}>
                       {event.customEventType}
                     </div>
                     <div style={{ fontSize: 'clamp(0.7rem, 0.9vw, 0.8rem)', color: '#666' }}>Custom Type</div>
                   </div>
                 )}
               </div>
              <div className={styles["events-card-actions"]}>
                <button className={`${styles["events-action-btn"]} ${styles["guest-list"]}`} onClick={() => handleEventAction(event._id, 'guest-list')}><span role="img" aria-label="guests">👥</span> Guest List</button>
                <button className={`${styles["events-action-btn"]} ${styles["checklist"]}`} onClick={() => handleEventAction(event._id, 'checklist')}><span role="img" aria-label="checklist">📝</span> Checklist</button>
                <button className={`${styles["events-action-btn"]} ${styles["edit"]}`} onClick={() => handleEventAction(event._id, 'edit')}><span role="img" aria-label="edit">✏️</span> Edit</button>
              </div>
            </div>
          ))
        )}
        </div>
      </div>

             {/* Add Event Modal */}
       {showAddModal && (
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
           padding: 'clamp(8px, 2vw, 16px)'
         }}>
                      <div style={{
             background: 'white',
             padding: 'clamp(16px, 3vw, 24px)',
             borderRadius: 'clamp(8px, 1.5vw, 12px)',
             width: '100%',
             maxWidth: 'clamp(280px, 95vw, 500px)',
             maxHeight: '90vh',
             overflow: 'auto',
             display: 'flex',
             flexDirection: 'column'
           }}>
             <h3 style={{ margin: '0 0 clamp(12px, 2vw, 16px) 0', color: '#23213D', fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)', fontWeight: '600' }}>Add New Event</h3>
             <div style={{ 
               display: 'flex', 
               flexDirection: 'column', 
               gap: 'clamp(10px, 1.5vw, 14px)', 
               marginBottom: 'clamp(16px, 2.5vw, 20px)',
               flex: 1,
               overflow: 'auto'
             }}>
               <div>
                 <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#23213D', fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)' }}>Event Title *</label>
                 <input type="text" placeholder="Enter event title" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} style={{ padding: 'clamp(8px, 1.2vw, 10px)', border: '1px solid #ddd', borderRadius: 'clamp(6px, 1vw, 8px)', width: '100%', fontSize: 'clamp(0.9rem, 1.1vw, 1rem)', boxSizing: 'border-box' }} />
               </div>
               <div>
                 <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#23213D', fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)' }}>Event Date *</label>
                 <input type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} style={{ padding: 'clamp(8px, 1.2vw, 10px)', border: '1px solid #ddd', borderRadius: 'clamp(6px, 1vw, 8px)', width: '100%', fontSize: 'clamp(0.9rem, 1.1vw, 1rem)' }} />
               </div>
               <div>
                 <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#23213D', fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)' }}>Event Location *</label>
                 <input type="text" placeholder="Enter event location" value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} style={{ padding: 'clamp(8px, 1.2vw, 10px)', border: '1px solid #ddd', borderRadius: 'clamp(6px, 1vw, 8px)', width: '100%', fontSize: 'clamp(0.9rem, 1.1vw, 1rem)' }} />
               </div>
               <div>
                 <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#23213D', fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)' }}>Number of Guests</label>
                 <input type="number" placeholder="Enter expected guest count" value={newEvent.guests} onChange={e => setNewEvent({ ...newEvent, guests: parseInt(e.target.value) || 0 })} style={{ padding: 'clamp(8px, 1.2vw, 10px)', border: '1px solid #ddd', borderRadius: 'clamp(6px, 1vw, 8px)', width: '100%', fontSize: 'clamp(0.9rem, 1.1vw, 1rem)' }} />
               </div>

               <div>
                 <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#23213D', fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)' }}>Event Budget</label>
                 <input type="number" placeholder="Enter event budget amount" value={newEvent.budget} onChange={e => setNewEvent({ ...newEvent, budget: parseInt(e.target.value) || 0 })} style={{ padding: 'clamp(8px, 1.2vw, 10px)', border: '1px solid #ddd', borderRadius: 'clamp(6px, 1vw, 8px)', width: '100%', fontSize: 'clamp(0.9rem, 1.1vw, 1rem)' }} />
               </div>
               <div>
                 <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#23213D', fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)' }}>Event Type</label>
                 <select 
                   value={newEvent.isCustomEvent ? "custom" : newEvent.icon} 
                   onChange={e => {
                     if (e.target.value === "custom") {
                       setNewEvent({ ...newEvent, isCustomEvent: true, icon: "🎯" });
                     } else {
                       setNewEvent({ ...newEvent, isCustomEvent: false, icon: e.target.value, customEventType: "" });
                     }
                   }} 
                   style={{ padding: 'clamp(8px, 1.2vw, 10px)', border: '1px solid #ddd', borderRadius: 'clamp(6px, 1vw, 8px)', width: '100%', fontSize: 'clamp(0.9rem, 1.1vw, 1rem)' }}
                 >
                   <option value="🎉">🎉 Party</option>
                   <option value="👰">👰 Wedding</option>
                   <option value="🎂">🎂 Birthday</option>
                   <option value="🎓">🎓 Graduation</option>
                   <option value="🏢">🏢 Corporate</option>
                   <option value="custom">🎯 Custom Event Type</option>
                 </select>
               </div>
               {newEvent.isCustomEvent && (
                 <div>
                   <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#23213D', fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)' }}>Custom Event Type Name *</label>
                   <input 
                     type="text" 
                     placeholder="Enter your custom event type name" 
                     value={newEvent.customEventType} 
                     onChange={e => setNewEvent({ ...newEvent, customEventType: e.target.value })} 
                     style={{ padding: 'clamp(8px, 1.2vw, 10px)', border: '1px solid #ddd', borderRadius: 'clamp(6px, 1vw, 8px)', width: '100%', fontSize: 'clamp(0.9rem, 1.1vw, 1rem)' }} 
                   />
                 </div>
               )}
             </div>
             <div style={{ 
               display: 'flex', 
               gap: 'clamp(8px, 1.5vw, 12px)', 
               justifyContent: 'flex-end',
               marginTop: 'auto',
               paddingTop: 'clamp(12px, 2vw, 16px)'
             }}>
               <button onClick={() => setShowAddModal(false)} style={{ 
                 padding: 'clamp(8px, 1.2vw, 10px) clamp(16px, 2.5vw, 20px)', 
                 background: '#f8f9fa', 
                 border: '1px solid #ddd', 
                 borderRadius: 'clamp(6px, 1vw, 8px)', 
                 cursor: 'pointer', 
                 fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)',
                 fontWeight: '500'
               }}>Cancel</button>
               <button onClick={handleAddEvent} style={{ 
                 padding: 'clamp(8px, 1.2vw, 10px) clamp(16px, 2.5vw, 20px)', 
                 background: '#AF8EBA', 
                 color: 'white', 
                 border: 'none', 
                 borderRadius: 'clamp(6px, 1vw, 8px)', 
                 cursor: 'pointer', 
                 fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)',
                 fontWeight: '500'
               }}>Add Event</button>
             </div>
          </div>
        </div>
      )}

             {/* Edit Event Modal */}
       {showEditModal && editEvent && (
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
           padding: 'clamp(8px, 2vw, 16px)'
         }}>
                      <div style={{
             background: 'white',
             padding: 'clamp(16px, 3vw, 24px)',
             borderRadius: 'clamp(8px, 1.5vw, 12px)',
             width: '100%',
             maxWidth: 'clamp(280px, 95vw, 500px)',
             maxHeight: '90vh',
             overflow: 'auto',
             display: 'flex',
             flexDirection: 'column'
           }}>
             <h3 style={{ margin: '0 0 clamp(12px, 2vw, 16px) 0', color: '#23213D', fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)', fontWeight: '600' }}>Edit Event</h3>
             <div style={{ 
               display: 'flex', 
               flexDirection: 'column', 
               gap: 'clamp(10px, 1.5vw, 14px)', 
               marginBottom: 'clamp(16px, 2.5vw, 20px)',
               flex: 1,
               overflow: 'auto'
             }}>
               <div>
                 <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#23213D', fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)' }}>Event Title *</label>
                 <input type="text" placeholder="Enter event title" value={editEvent.title} onChange={e => setEditEvent({ ...editEvent, title: e.target.value })} style={{ padding: 'clamp(8px, 1.2vw, 10px)', border: '1px solid #ddd', borderRadius: 'clamp(6px, 1vw, 8px)', width: '100%', fontSize: 'clamp(0.9rem, 1.1vw, 1rem)' }} />
               </div>
               <div>
                 <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#23213D', fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)' }}>Event Date *</label>
                 <input type="date" value={editEvent.date} onChange={e => setEditEvent({ ...editEvent, date: e.target.value })} style={{ padding: 'clamp(8px, 1.2vw, 10px)', border: '1px solid #ddd', borderRadius: 'clamp(6px, 1vw, 8px)', width: '100%', fontSize: 'clamp(0.9rem, 1.1vw, 1rem)' }} />
               </div>
               <div>
                 <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#23213D', fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)' }}>Event Location *</label>
                 <input type="text" placeholder="Enter event location" value={editEvent.location} onChange={e => setEditEvent({ ...editEvent, location: e.target.value })} style={{ padding: 'clamp(8px, 1.2vw, 10px)', border: '1px solid #ddd', borderRadius: 'clamp(6px, 1vw, 8px)', width: '100%', fontSize: 'clamp(0.9rem, 1.1vw, 1rem)' }} />
               </div>
               <div>
                 <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#23213D', fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)' }}>Number of Guests</label>
                 <input type="number" placeholder="Enter expected guest count" value={editEvent.guests} onChange={e => setEditEvent({ ...editEvent, guests: parseInt(e.target.value) || 0 })} style={{ padding: 'clamp(8px, 1.2vw, 10px)', border: '1px solid #ddd', borderRadius: 'clamp(6px, 1vw, 8px)', width: '100%', fontSize: 'clamp(0.9rem, 1.1vw, 1rem)' }} />
               </div>

               <div>
                 <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#23213D', fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)' }}>Event Budget</label>
                 <input type="number" placeholder="Enter event budget amount" value={editEvent.budget} onChange={e => setEditEvent({ ...editEvent, budget: parseInt(e.target.value) || 0 })} style={{ padding: 'clamp(8px, 1.2vw, 10px)', border: '1px solid #ddd', borderRadius: 'clamp(6px, 1vw, 8px)', width: '100%', fontSize: 'clamp(0.9rem, 1.1vw, 1rem)' }} />
               </div>
               <div>
                 <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#23213D', fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)' }}>Event Type</label>
                 <select 
                   value={editEvent.isCustomEvent ? "custom" : editEvent.icon} 
                   onChange={e => {
                     if (e.target.value === "custom") {
                       setEditEvent({ ...editEvent, isCustomEvent: true, icon: "🎯" });
                     } else {
                       setEditEvent({ ...editEvent, isCustomEvent: false, icon: e.target.value, customEventType: "" });
                     }
                   }} 
                   style={{ padding: 'clamp(8px, 1.2vw, 10px)', border: '1px solid #ddd', borderRadius: 'clamp(6px, 1vw, 8px)', width: '100%', fontSize: 'clamp(0.9rem, 1.1vw, 1rem)' }}
                 >
                   <option value="🎉">🎉 Party</option>
                   <option value="👰">👰 Wedding</option>
                   <option value="🎂">🎂 Birthday</option>
                   <option value="🎓">🎓 Graduation</option>
                   <option value="🏢">🏢 Corporate</option>
                   <option value="custom">🎯 Custom Event Type</option>
                 </select>
               </div>
               {editEvent.isCustomEvent && (
                 <div>
                   <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#23213D', fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)' }}>Custom Event Type Name *</label>
                   <input 
                     type="text" 
                     placeholder="Enter your custom event type name" 
                     value={editEvent.customEventType || ""} 
                     onChange={e => setEditEvent({ ...editEvent, customEventType: e.target.value })} 
                     style={{ padding: 'clamp(8px, 1.2vw, 10px)', border: '1px solid #ddd', borderRadius: 'clamp(6px, 1vw, 8px)', width: '100%', fontSize: 'clamp(0.9rem, 1.1vw, 1rem)' }} 
                   />
                 </div>
               )}
             </div>
             <div style={{ 
               display: 'flex', 
               gap: 'clamp(8px, 1.5vw, 12px)', 
               justifyContent: 'flex-end',
               marginTop: 'auto',
               paddingTop: 'clamp(12px, 2vw, 16px)'
             }}>
               <button onClick={() => setShowEditModal(false)} style={{ 
                 padding: 'clamp(8px, 1.2vw, 10px) clamp(16px, 2.5vw, 20px)', 
                 background: '#f8f9fa', 
                 border: '1px solid #ddd', 
                 borderRadius: 'clamp(6px, 1vw, 8px)', 
                 cursor: 'pointer', 
                 fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)',
                 fontWeight: '500'
               }}>Cancel</button>
               <button onClick={handleEditSave} style={{ 
                 padding: 'clamp(8px, 1.2vw, 10px) clamp(16px, 2.5vw, 20px)', 
                 background: '#AF8EBA', 
                 color: 'white', 
                 border: 'none', 
                 borderRadius: 'clamp(6px, 1vw, 8px)', 
                 cursor: 'pointer', 
                 fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)',
                 fontWeight: '500'
               }}>Save Changes</button>
             </div>
          </div>
        </div>
      )}

      {/* Checklist View */}
      {showChecklist && selectedEvent && (
        <ChecklistView
          eventId={selectedEvent._id}
          eventTitle={selectedEvent.title}
          onClose={() => {
            setShowChecklist(false);
            setSelectedEvent(null);
            fetchEvents(); // Refresh events to update task counts
          }}
        />
      )}

      {/* Guest List Modal */}
      {showGuestListModal && selectedEventForGuests && (
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
          padding: 'clamp(8px, 2vw, 16px)'
        }}>
          <div style={{
            background: 'white',
            padding: 'clamp(20px, 4vw, 32px)',
            borderRadius: 'clamp(16px, 3vw, 24px)',
            width: '100%',
            maxWidth: 'clamp(350px, 95vw, 600px)',
            maxHeight: '90vh',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            border: '1px solid rgba(175, 142, 186, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'clamp(20px, 3vw, 28px)',
              borderBottom: '2px solid rgba(175, 142, 186, 0.2)',
              paddingBottom: 'clamp(12px, 2vw, 16px)'
            }}>
              <h3 style={{ 
                margin: 0, 
                color: '#23213D', 
                fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', 
                fontWeight: '700',
                fontFamily: "'Outfit', sans-serif"
              }}>
                Guest Lists - {selectedEventForGuests.title}
              </h3>
              <button 
                onClick={() => setShowGuestListModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                  cursor: 'pointer',
                  color: '#A3A3A3',
                  padding: 'clamp(4px, 1vw, 8px)',
                  borderRadius: '50%',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(175, 142, 186, 0.1)'}
                onMouseLeave={(e) => e.target.style.background = 'none'}
              >
                ×
              </button>
            </div>

            {/* Upload Section */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(175, 142, 186, 0.05), rgba(199, 178, 214, 0.05))',
              border: '2px dashed rgba(175, 142, 186, 0.3)',
              borderRadius: 'clamp(12px, 2vw, 16px)',
              padding: 'clamp(20px, 3vw, 28px)',
              marginBottom: 'clamp(20px, 3vw, 28px)',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.borderColor = 'rgba(175, 142, 186, 0.5)'}
            onMouseLeave={(e) => e.target.style.borderColor = 'rgba(175, 142, 186, 0.3)'}
            >
              <div style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                marginBottom: 'clamp(8px, 1.5vw, 12px)'
              }}>
                📄
              </div>
              <h4 style={{
                margin: '0 0 clamp(8px, 1.5vw, 12px) 0',
                color: '#23213D',
                fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
                fontWeight: '600',
                fontFamily: "'Outfit', sans-serif"
              }}>
                Upload Guest List CSV
              </h4>
              <p style={{
                margin: '0 0 clamp(16px, 2.5vw, 20px) 0',
                color: '#666',
                fontSize: 'clamp(0.9rem, 1.3vw, 1rem)',
                fontFamily: "'Outfit', sans-serif"
              }}>
                Upload a CSV file with your guest information
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                style={{
                  display: 'none'
                }}
                id="csv-upload"
              />
              <label htmlFor="csv-upload" style={{
                background: 'linear-gradient(135deg, #AF8EBA, #C7B2D6)',
                color: 'white',
                padding: 'clamp(10px, 1.5vw, 14px) clamp(20px, 3vw, 28px)',
                borderRadius: 'clamp(8px, 1.5vw, 12px)',
                cursor: 'pointer',
                fontSize: 'clamp(0.9rem, 1.3vw, 1rem)',
                fontWeight: '600',
                fontFamily: "'Outfit', sans-serif",
                display: 'inline-block',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(175, 142, 186, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(175, 142, 186, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(175, 142, 186, 0.3)';
              }}
              >
                Choose CSV File
              </label>
            </div>

            {/* Existing Guest Lists */}
            <div>
              <h4 style={{
                margin: '0 0 clamp(16px, 2.5vw, 20px) 0',
                color: '#23213D',
                fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
                fontWeight: '600',
                fontFamily: "'Outfit', sans-serif"
              }}>
                Existing Guest Lists
              </h4>
              {(!guestLists[selectedEventForGuests._id] || guestLists[selectedEventForGuests._id].length === 0) ? (
                <div style={{
                  textAlign: 'center',
                  padding: 'clamp(20px, 4vw, 32px)',
                  color: '#A3A3A3',
                  fontSize: 'clamp(0.9rem, 1.3vw, 1rem)',
                  fontFamily: "'Outfit', sans-serif",
                  background: 'rgba(175, 142, 186, 0.05)',
                  borderRadius: 'clamp(12px, 2vw, 16px)',
                  border: '1px dashed rgba(175, 142, 186, 0.2)'
                }}>
                  No guest lists uploaded yet. Upload your first CSV file above.
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(12px, 2vw, 16px)'
                }}>
                  {guestLists[selectedEventForGuests._id].map((guestList) => (
                    <div key={guestList.id} style={{
                      background: 'white',
                      border: '1px solid rgba(175, 142, 186, 0.2)',
                      borderRadius: 'clamp(12px, 2vw, 16px)',
                      padding: 'clamp(16px, 2.5vw, 20px)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                    }}
                    >
                      <div>
                        <div style={{
                          fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                          fontWeight: '600',
                          color: '#23213D',
                          marginBottom: 'clamp(4px, 0.8vw, 6px)',
                          fontFamily: "'Outfit', sans-serif"
                        }}>
                          {guestList.name}
                        </div>
                        <div style={{
                          fontSize: 'clamp(0.8rem, 1.2vw, 0.9rem)',
                          color: '#666',
                          fontFamily: "'Outfit', sans-serif"
                        }}>
                          {guestList.data.length} guests • Uploaded {new Date(guestList.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: 'clamp(8px, 1.2vw, 12px)'
                      }}>
                        <button
                          onClick={() => handleViewGuestList(guestList)}
                          style={{
                            background: 'linear-gradient(135deg, #AF8EBA, #C7B2D6)',
                            color: 'white',
                            border: 'none',
                            padding: 'clamp(6px, 1vw, 8px) clamp(12px, 2vw, 16px)',
                            borderRadius: 'clamp(6px, 1vw, 8px)',
                            cursor: 'pointer',
                            fontSize: 'clamp(0.8rem, 1.2vw, 0.9rem)',
                            fontWeight: '500',
                            fontFamily: "'Outfit', sans-serif",
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteGuestList(selectedEventForGuests._id, guestList.id)}
                          style={{
                            background: 'none',
                            color: '#F77B7B',
                            border: '1px solid #F77B7B',
                            padding: 'clamp(6px, 1vw, 8px) clamp(12px, 2vw, 16px)',
                            borderRadius: 'clamp(6px, 1vw, 8px)',
                            cursor: 'pointer',
                            fontSize: 'clamp(0.8rem, 1.2vw, 0.9rem)',
                            fontWeight: '500',
                            fontFamily: "'Outfit', sans-serif",
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#F77B7B';
                            e.target.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'none';
                            e.target.style.color = '#F77B7B';
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Guest List Table Modal */}
      {showGuestListTable && selectedGuestList && (
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
          zIndex: 1001,
          padding: 'clamp(8px, 2vw, 16px)'
        }}>
          <div style={{
            background: 'white',
            padding: 'clamp(20px, 4vw, 32px)',
            borderRadius: 'clamp(16px, 3vw, 24px)',
            width: '100%',
            maxWidth: 'clamp(350px, 98vw, 900px)',
            maxHeight: '90vh',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            border: '1px solid rgba(175, 142, 186, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'clamp(20px, 3vw, 28px)',
              borderBottom: '2px solid rgba(175, 142, 186, 0.2)',
              paddingBottom: 'clamp(12px, 2vw, 16px)'
            }}>
              <h3 style={{ 
                margin: 0, 
                color: '#23213D', 
                fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', 
                fontWeight: '700',
                fontFamily: "'Outfit', sans-serif"
              }}>
                {selectedGuestList.name}
              </h3>
              <button 
                onClick={() => setShowGuestListTable(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                  cursor: 'pointer',
                  color: '#A3A3A3',
                  padding: 'clamp(4px, 1vw, 8px)',
                  borderRadius: '50%',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(175, 142, 186, 0.1)'}
                onMouseLeave={(e) => e.target.style.background = 'none'}
              >
                ×
              </button>
            </div>

            <div style={{
              overflow: 'auto',
              borderRadius: 'clamp(8px, 1.5vw, 12px)',
              border: '1px solid rgba(175, 142, 186, 0.2)',
              background: 'rgba(175, 142, 186, 0.02)'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: "'Outfit', sans-serif"
              }}>
                <thead>
                  <tr style={{
                    background: 'linear-gradient(135deg, #AF8EBA, #C7B2D6)',
                    color: 'white'
                  }}>
                    {selectedGuestList.headers.map((header, index) => (
                      <th key={index} style={{
                        padding: 'clamp(12px, 2vw, 16px)',
                        textAlign: 'left',
                        fontSize: 'clamp(0.9rem, 1.3vw, 1rem)',
                        fontWeight: '600',
                        borderBottom: '2px solid rgba(175, 142, 186, 0.3)'
                      }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedGuestList.data.map((row, rowIndex) => (
                    <tr key={rowIndex} style={{
                      background: rowIndex % 2 === 0 ? 'white' : 'rgba(175, 142, 186, 0.05)',
                      transition: 'background 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(175, 142, 186, 0.1)'}
                    onMouseLeave={(e) => e.target.style.background = rowIndex % 2 === 0 ? 'white' : 'rgba(175, 142, 186, 0.05)'}
                    >
                      {selectedGuestList.headers.map((header, colIndex) => (
                        <td key={colIndex} style={{
                          padding: 'clamp(10px, 1.5vw, 14px)',
                          fontSize: 'clamp(0.85rem, 1.2vw, 0.95rem)',
                          borderBottom: '1px solid rgba(175, 142, 186, 0.1)',
                          color: '#23213D'
                        }}>
                          {row[header] || ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{
              marginTop: 'clamp(16px, 2.5vw, 20px)',
              textAlign: 'center',
              color: '#666',
              fontSize: 'clamp(0.8rem, 1.2vw, 0.9rem)',
              fontFamily: "'Outfit', sans-serif"
            }}>
              Total: {selectedGuestList.data.length} guests
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEventsContent; 