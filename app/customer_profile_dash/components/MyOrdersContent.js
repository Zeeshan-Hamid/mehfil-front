import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./MyOrdersContent.module.css";
import apiService from "../../utils/api";
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';

const dummyOrders = [
  {
    id: "WED-34444-2023-01",
    title: "Wedding photography package",
    date: "5 Jun 2021",
    location: "Lahore",
    total: 3200000,
    paid: true,
    status: "Confirmed",
    vendors: [
      { id: 1, name: "Elite Photography", type: "Photography", price: 230, status: "Confirmed", img: "/logo.png" },
      { id: 2, name: "Elite Photography", type: "Photography", price: 230, status: "Confirmed", img: "/logo.png" },
      { id: 3, name: "Elite Photography", type: "Photography", price: 230, status: "Confirmed", img: "/logo.png" },
    ],
    actions: ["View Full Details", "Download Invoices", "Request Cancellation"],
  },
  {
    id: "WED-34444-2023-02",
    title: "Wedding photography package",
    date: "5 Jun 2021",
    location: "Lahore",
    total: 3200000,
    paid: true,
    status: "Completed",
    vendors: [
      { id: 1, name: "Elite Photography", type: "Photography", price: 230, status: "Completed", img: "/logo.png" },
      { id: 2, name: "Elite Photography", type: "Photography", price: 230, status: "Completed", img: "/logo.png" },
      { id: 3, name: "Elite Photography", type: "Photography", price: 230, status: "Completed", img: "/logo.png" },
    ],
    actions: ["Book Again", "Download Invoices", "Rate Experience"],
  },
  {
    id: "WED-34444-2023-03",
    title: "Corporate event planning",
    date: "15 Jul 2021",
    location: "Karachi",
    total: 1800000,
    paid: false,
    status: "Pending",
    vendors: [
      { id: 4, name: "Corporate Events Pro", type: "Event Planning", price: 150, status: "Pending", img: "/logo.png" },
      { id: 5, name: "Catering Plus", type: "Catering", price: 120, status: "Confirmed", img: "/logo.png" },
    ],
    actions: ["View Full Details", "Download Invoices", "Request Cancellation"],
  },
];

const MyOrdersContent = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "All Orders",
    dateRange: "All Time",
    eventType: "Any"
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showCancellationSuccess, setShowCancellationSuccess] = useState(false);

  // Fetch customer bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.getCustomerBookings();
        console.log('Raw API response:', response);
        console.log('Bookings data structure:', response.data?.bookings);
        if (response.success) {
          // Handle different possible response structures
          const bookings = response.data?.bookings || response.data || [];
          console.log('Processed bookings array:', bookings);
          
          // Transform booking data to match the expected format
          const transformedBookings = bookings.map(booking => {
            console.log('Processing booking:', booking);
            console.log('Booking vendors array:', booking.vendors);
            
            // Handle the new structure where vendors is an array
            if (booking.vendors && Array.isArray(booking.vendors) && booking.vendors.length > 0) {
              // Create individual orders for each vendor in the booking
              return booking.vendors.map(vendor => {
                console.log('Processing vendor from vendors array:', vendor);
                console.log('All vendor object keys:', Object.keys(vendor));
                console.log('Vendor object values:', Object.values(vendor));
                
                // Extract vendor name - this should be the actual vendor business name
                let vendorName = 'Unknown Vendor';
                let serviceName = 'Unknown Service';
                
                // Log the vendor object structure to understand what fields are available
                console.log('Vendor object structure:', vendor);
                console.log('Vendor object keys:', Object.keys(vendor));
                
                // Try to extract vendor name from various possible fields
                console.log('Checking vendor name fields...');
                console.log('vendor.vendorName:', vendor.vendorName);
                console.log('vendor.businessName:', vendor.businessName);
                console.log('vendor.vendorBusinessName:', vendor.vendorBusinessName);
                console.log('vendor.vendor:', vendor.vendor);
                console.log('vendor.name:', vendor.name);
                
                if (vendor.vendorName) {
                  vendorName = vendor.vendorName;
                  console.log('Found vendor name in vendorName field:', vendorName);
                } else if (vendor.businessName) {
                  vendorName = vendor.businessName;
                  console.log('Found vendor name in businessName field:', vendorName);
                } else if (vendor.vendorBusinessName) {
                  vendorName = vendor.vendorBusinessName;
                  console.log('Found vendor name in vendorBusinessName field:', vendorName);
                } else if (vendor.vendor && typeof vendor.vendor === 'object') {
                  vendorName = vendor.vendor.businessName || vendor.vendor.name || 'Unknown Vendor';
                  console.log('Found vendor name in nested vendor object:', vendorName);
                } else if (vendor.name && vendor.name !== 'Unknown Service') {
                  vendorName = vendor.name;
                  console.log('Found vendor name in name field:', vendorName);
                }
                
                // Try to extract service name from various possible fields
                console.log('Checking service name fields...');
                console.log('vendor.serviceName:', vendor.serviceName);
                console.log('vendor.serviceType:', vendor.serviceType);
                console.log('vendor.packageName:', vendor.packageName);
                console.log('vendor.desc:', vendor.desc);
                console.log('vendor.name:', vendor.name);
                
                if (vendor.serviceName) {
                  serviceName = vendor.serviceName;
                  console.log('Found service name in serviceName field:', serviceName);
                } else if (vendor.serviceType) {
                  serviceName = vendor.serviceType;
                  console.log('Found service name in serviceType field:', serviceName);
                } else if (vendor.packageName) {
                  serviceName = vendor.packageName;
                  console.log('Found service name in packageName field:', serviceName);
                } else if (vendor.desc && vendor.desc !== '') {
                  serviceName = vendor.desc;
                  console.log('Found service name in desc field:', serviceName);
                } else if (vendor.name && vendor.name !== 'Unknown Service') {
                  serviceName = vendor.name;
                  console.log('Found service name in name field:', serviceName);
                }
                
                // If still unknown service, try to get it from the event
                if (serviceName === 'Unknown Service' && booking.event) {
                  serviceName = booking.event.name || booking.event.title || 'Event Service';
                }
                
                // If still unknown service, try to get it from the booking title
                if (serviceName === 'Unknown Service' && booking.title) {
                  serviceName = booking.title;
                }
                
                // If still unknown service, try to get it from the booking event name
                if (serviceName === 'Unknown Service' && booking.eventName) {
                  serviceName = booking.eventName;
                }
                
                // If vendor name is still unknown, try to get it from the vendor object structure
                if (vendorName === 'Unknown Vendor' && vendor.vendor) {
                  if (typeof vendor.vendor === 'object') {
                    vendorName = vendor.vendor.businessName || vendor.vendor.name || 'Unknown Vendor';
                  }
                }
                
                // If vendor name is still unknown, try to get it from the booking
                if (vendorName === 'Unknown Vendor' && booking.vendorName) {
                  vendorName = booking.vendorName;
                  console.log('Found vendor name in booking.vendorName:', vendorName);
                } else if (vendorName === 'Unknown Vendor' && booking.vendorBusinessName) {
                  vendorName = booking.vendorBusinessName;
                  console.log('Found vendor name in booking.vendorBusinessName:', vendorName);
                }
                
                // If still unknown vendor, try to use vendor ID as fallback
                if (vendorName === 'Unknown Vendor' && vendor.id) {
                  vendorName = `Vendor #${vendor.id}`;
                  console.log('Using vendor ID as fallback name:', vendorName);
                }
                
                console.log('Extracted vendor name:', vendorName);
                console.log('Extracted service name:', serviceName);
                
                return {
                  id: vendor.id || vendor.bookingId || booking._id,
                  title: booking.event?.name || booking.event?.title || vendor.name || 'Event',
                  date: new Date(booking.eventDate || vendor.eventDate).toLocaleDateString(),
                  location: booking.event?.location?.city || booking.event?.location || 'Location',
                  total: vendor.price || booking.totalPrice,
                  paid: true, // Assuming all bookings are paid
                  status: vendor.status || booking.status || 'Pending',
                  vendor: {
                    id: vendor.id || vendor.bookingId,
                    name: vendorName,
                    type: serviceName,
                    price: vendor.price || 0,
                    status: vendor.status || 'Pending',
                    img: booking.event?.imageUrls?.[0] || booking.event?.imageUrl || booking.event?.images?.[0] || "/logo.png",
                    eventId: booking.event?._id || booking.event
                  },
                  actions: getActionsForStatus(vendor.status || booking.status)
                };
              });
            } else {
              // Fallback to old structure
              console.log('Using fallback structure');
              
                             // Extract vendor name with better fallback logic
               let vendorName = 'Unknown Vendor';
               console.log('Booking object keys:', Object.keys(booking));
               console.log('Booking vendor field:', booking.vendor);
               console.log('Booking event field:', booking.event);
               console.log('Booking package field:', booking.package);
               
               if (booking.vendor) {
                 if (typeof booking.vendor === 'object') {
                   console.log('Vendor object structure:', booking.vendor);
                   vendorName = booking.vendor.vendorProfile?.businessName || 
                              booking.vendor.businessName || 
                              booking.vendor.name || 
                              'Unknown Vendor';
                   console.log('Found vendor name from vendor object:', vendorName);
                 } else {
                   vendorName = 'Vendor ID: ' + booking.vendor;
                   console.log('Using vendor ID as name:', vendorName);
                 }
               } else {
                 console.log('No vendor object found, using fallback logic');
               }
              
                             // If still unknown vendor, try to extract from other fields
               if (vendorName === 'Unknown Vendor') {
                 console.log('Trying fallback logic for vendor name...');
                 if (booking.vendorName) {
                   vendorName = booking.vendorName;
                   console.log('Found vendor name in booking.vendorName:', vendorName);
                 } else if (booking.vendorBusinessName) {
                   vendorName = booking.vendorBusinessName;
                   console.log('Found vendor name in booking.vendorBusinessName:', vendorName);
                 } else if (booking.event && booking.event.vendor) {
                   // Try to get vendor name from event object
                   if (typeof booking.event.vendor === 'object') {
                     vendorName = booking.event.vendor.businessName || 
                                booking.event.vendor.name || 
                                booking.event.vendor.vendorName ||
                                'Unknown Vendor';
                     console.log('Found vendor name in event.vendor object:', vendorName);
                   } else {
                     vendorName = 'Vendor ID: ' + booking.event.vendor;
                     console.log('Using event vendor ID as name:', vendorName);
                   }
                 } else if (booking.event && booking.event.vendorName) {
                   vendorName = booking.event.vendorName;
                   console.log('Found vendor name in event.vendorName:', vendorName);
                 } else if (booking.event && booking.event.vendorBusinessName) {
                   vendorName = booking.event.vendorBusinessName;
                   console.log('Found vendor name in event.vendorBusinessName:', vendorName);
                 } else if (booking.event && booking.event.name) {
                   // Use event name as vendor name if no vendor name found
                   vendorName = booking.event.name;
                   console.log('Using event name as vendor name:', vendorName);
                 } else if (booking.package && booking.package.name) {
                   // Use package name as vendor name if no vendor name found
                   vendorName = booking.package.name;
                   console.log('Using package name as vendor name:', vendorName);
                 }
               }
              
              // Extract package/service name with better fallback logic
              let serviceName = 'Unknown Service';
              console.log('Extracting service name...');
              console.log('Booking package field:', booking.package);
              console.log('Booking event field:', booking.event);
              
              if (booking.package) {
                if (typeof booking.package === 'object') {
                  console.log('Package object structure:', booking.package);
                  console.log('Package name:', booking.package.name);
                  console.log('Package serviceName:', booking.package.serviceName);
                  console.log('Package title:', booking.package.title);
                  console.log('Package serviceType:', booking.package.serviceType);
                  
                  serviceName = booking.package.name || 
                              booking.package.serviceName || 
                              booking.package.title || 
                              booking.package.serviceType ||
                              'Unknown Service';
                  console.log('Selected service name from package:', serviceName);
                } else {
                  serviceName = booking.package;
                  console.log('Using package as string:', serviceName);
                }
              } else if (booking.event) {
                console.log('Event object structure:', booking.event);
                serviceName = booking.event.name || 
                            booking.event.title || 
                            booking.event.serviceType ||
                            'Event Service';
                console.log('Selected service name from event:', serviceName);
              }
              
              // If still unknown service, try to extract from other fields
              if (serviceName === 'Unknown Service') {
                console.log('Service name is still Unknown Service, trying fallback...');
                if (booking.serviceType) {
                  serviceName = booking.serviceType;
                  console.log('Found service name in booking.serviceType:', serviceName);
                } else if (booking.serviceName) {
                  serviceName = booking.serviceName;
                  console.log('Found service name in booking.serviceName:', serviceName);
                } else if (booking.title) {
                  serviceName = booking.title;
                  console.log('Found service name in booking.title:', serviceName);
                } else {
                  console.log('No fallback service name found');
                }
              }
              
              console.log('Extracted vendor name:', vendorName);
              console.log('Extracted service name:', serviceName);
              
              return {
            id: booking._id,
                title: booking.event?.name || booking.event?.title || 'Event',
            date: new Date(booking.eventDate).toLocaleDateString(),
                location: booking.event?.location?.city || booking.event?.location || 'Location',
            total: booking.totalPrice,
            paid: true, // Assuming all bookings are paid
            status: booking.status || 'Pending',
            vendor: {
              id: booking.vendor?._id || booking.vendor,
                  name: vendorName,
                  type: serviceName,
              price: booking.totalPrice,
              status: booking.status || 'Pending',
                  img: booking.event?.imageUrls?.[0] || booking.event?.imageUrl || booking.event?.images?.[0] || "/logo.png",
              eventId: booking.event?._id || booking.event
            },
            actions: getActionsForStatus(booking.status)
              };
            }
          });
          
          // Create individual order cards for each booking
          if (transformedBookings.length > 0) {
            // Flatten the array since transformedBookings now contains arrays of orders
            const flattenedOrders = transformedBookings.flat();
            
            const individualOrders = flattenedOrders.map(booking => ({
              id: booking.id,
              title: booking.title,
              date: booking.date,
              location: booking.location,
              total: booking.total,
              paid: booking.paid,
              status: booking.status,
              vendor: booking.vendor, // Single vendor per booking
              actions: booking.actions
            }));
            
            console.log('Individual orders created:', individualOrders);
            setOrders(individualOrders);
          } else {
            setOrders([]);
          }
        } else {
          console.error('API response indicates failure:', response);
          toast.error(response.message || "Failed to fetch bookings");
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error("Failed to load bookings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Helper function to determine overall status
  const getOverallStatus = (statuses) => {
    if (statuses.includes('Completed')) return 'Completed';
    if (statuses.includes('Confirmed')) return 'Confirmed';
    if (statuses.includes('Pending')) return 'Pending';
    return 'Pending';
  };

  // Helper function to get actions based on booking status
  const getActionsForStatus = (status) => {
    switch (status) {
      case 'Confirmed':
        return ["View Full Details", "Download Invoices", "Request Cancellation"];
      case 'Completed':
        return ["Book Again", "Download Invoices", "Rate Experience"];
      case 'Pending':
        return ["View Full Details", "Download Invoices", "Request Cancellation"];
      default:
        return ["View Full Details", "Download Invoices"];
    }
  };

  // Filter handlers
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  // Order action handlers
  const handleOrderAction = async (orderId, action) => {
    switch (action) {
      case "View Full Details":
        setSelectedOrder(orders.find(o => o.id === orderId));
        setShowOrderDetails(true);
        break;
      case "Download Invoices":
        const order = orders.find(o => o.id === orderId);
        if (order) {
          await generateOrderPDF(order);
        } else {
          toast.error("Order not found");
        }
        break;

              case "Request Cancellation":
          handleCancellationRequest(orderId);
          break;
      case "Book Again":
        alert(`Redirecting to booking page for similar services...`);
        break;
      case "Rate Experience":
        alert(`Opening rating form for order ${orderId}...`);
        break;
      default:
        break;
    }
      };

    // Handle cancellation request with comprehensive message to vendor
    const handleCancellationRequest = async (orderId) => {
      try {
        // Find the order details
        const order = orders.find(o => o.id === orderId);
        if (!order) {
          toast.error("Order not found");
          return;
        }

        // Get current user details
        const userResponse = await apiService.getCurrentUser();
        if (!userResponse.success) {
          toast.error("Failed to get user details");
          return;
        }

        const customer = userResponse.data.user;
        
        // Create cancellation preview message
        const cancellationPreview = `🚨 CANCELLATION REQUEST

Order Details:
• Order ID: ${order.id}
• Event: ${order.title}
• Date: ${order.date}
• Location: ${order.location}
• Total Amount: Rs. ${order.total.toLocaleString()}
• Current Status: ${order.status}

Customer Details:
• Name: ${customer.customerProfile?.firstName || 'N/A'} ${customer.customerProfile?.lastName || ''}
• Email: ${customer.email}
• Phone: ${customer.phoneNumber || 'N/A'}

Cancellation Request:
I would like to request cancellation of this booking. Please review the details above and let me know if you can accommodate this request.

Reason for Cancellation: [Customer can specify reason in follow-up messages]

Please respond with your decision and any applicable cancellation policies or fees.

Thank you for your understanding.`;

        // Show confirmation popup with cancellation details
        const confirmed = window.confirm(
          `Are you sure you want to send this cancellation request to the vendor?\n\n${cancellationPreview}\n\nClick OK to send the cancellation request.`
        );
        
        if (!confirmed) {
          return;
        }
        
        // Use the same message for sending
        const cancellationMessage = cancellationPreview;

        // Send message to vendor
        const messageData = {
          eventId: order.vendor?.eventId,
          receiverId: order.vendor?.id,
          content: cancellationMessage,
          messageType: 'text'
        };

        const messageResponse = await apiService.sendMessage(messageData);
        
        console.log('Message response:', messageResponse);
        
        // Check for success in different possible response formats
        if (messageResponse.success || messageResponse.status === 'success' || messageResponse.data) {
          // Update order status locally
          setOrders(prev => prev.map(o => 
            o.id === orderId ? { ...o, status: "Cancellation Requested" } : o
          ));
          
          // Show custom success popup
          setShowCancellationSuccess(true);
          
          // Redirect to the correct conversation, checking for existing ones first.
          // This is a non-critical operation, so we handle errors silently
          try {
            const conversationsResponse = await apiService.getConversations();
            let existingEventId = null;

            if (conversationsResponse.success) {
              const existingConversation = conversationsResponse.data.conversations.find(conv => 
                (conv.otherUser?._id === order.vendor?.id) || (conv.participants.some(p => p.user?._id === order.vendor?.id))
              );
              
              if (existingConversation) {
                // If a conversation exists, use its eventId to ensure we open the existing thread.
                existingEventId = existingConversation.eventId;
              }
            }
            
            // If we found an existing conversation, use its eventId. Otherwise, use the current order's eventId.
            const eventIdForRedirect = existingEventId || order.vendor?.eventId;
            router.push(`/customer_profile_dash?tab=Messages&vendorId=${order.vendor?.id}&eventId=${eventIdForRedirect}`);

          } catch (redirectError) {
            // Silently handle redirect error - this is not critical to the cancellation success
            console.log('Redirect error (non-critical):', redirectError);
            // Fallback to current event if there's an error.
            router.push(`/customer_profile_dash?tab=Messages&vendorId=${order.vendor?.id}&eventId=${order.vendor?.eventId}`);
          }
        } else {
          console.log('Message response indicates failure:', messageResponse);
          // Only show error if we're sure it failed
          if (messageResponse.error || messageResponse.message) {
            toast.error(messageResponse.message || "Failed to send cancellation request");
          }
        }
      } catch (error) {
        console.error('Error sending cancellation request:', error);
        toast.error("Failed to send cancellation request. Please try again.");
      }
    };
  
    // Vendor action handlers
  const handleVendorAction = (vendorId, action, eventId) => {
    switch (action) {
      case "message":
        // Redirect to Messages tab with vendor and event parameters to start conversation
        router.push(`/customer_profile_dash?tab=Messages&vendorId=${vendorId}&eventId=${eventId}`);
        break;
      case "view":
        alert(`Viewing details for vendor ${vendorId}...`);
        break;
      default:
        break;
    }
  };

  // Quick action handlers
  const handleQuickAction = (action) => {
    switch (action) {
      case "download":
        alert("Downloading all invoices...");
        break;
      case "export":
        alert("Exporting calendar data...");
        break;
      case "support":
        alert("Opening customer support chat...");
        break;
      default:
        break;
    }
  };

  // Generate PDF for order details
  const generateOrderPDF = async (order) => {
    const doc = new jsPDF();
    
    // Load logo image
    let logoImage = null;
    try {
      const response = await fetch('/logo.png');
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      logoImage = new Uint8Array(arrayBuffer);
    } catch (error) {
      console.log('Could not load logo image, using text fallback');
    }
    
    // Set document properties
    doc.setProperties({
      title: `Order Details - ${order.id}`,
      subject: 'Mehfil Order Details',
      author: 'Mehfil',
      creator: 'Mehfil Platform'
    });

    // Add MEHFIL text on the left
    doc.setFontSize(24);
    doc.setTextColor(175, 142, 186); // Mehfil purple color
    doc.text('MEHFIL', 20, 30);
    
    // Add purple circle on the right
    doc.setFillColor(175, 142, 186); // Mehfil purple
    doc.circle(180, 25, 15, 'F'); // Circle at top right
    
    // Add Mehfil logo inside the circle
    if (logoImage) {
      try {
        // Add the logo image inside the circle (centered)
        doc.addImage(logoImage, 'PNG', 170, 15, 20, 20); // Position inside circle
      } catch (error) {
        // Fallback to text if image fails to load
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255); // White text
        doc.text('M', 175, 30); // Centered in circle
      }
    } else {
      // Fallback to text if image couldn't be loaded
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255); // White text
      doc.text('M', 175, 30); // Centered in circle
    }
    
    // Add super translucent watermark
    doc.setTextColor(240, 240, 240); // Very light gray, almost white
    doc.setFontSize(60);
    doc.text('MEHFIL', 50, 150, { angle: 45 });
    doc.setTextColor(0, 0, 0);
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(35, 33, 61); // Dark color
    doc.text('Order Details', 20, 50);
    
    // Order information
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    let yPosition = 70;
    
    // Order ID
    doc.setFontSize(10);
    doc.setTextColor(108, 117, 125); // Gray color
    doc.text('Order ID:', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    doc.text(order.id, 60, yPosition);
    yPosition += 10;
    
    // Event Title
    doc.setTextColor(108, 117, 125);
    doc.text('Event:', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    doc.text(order.title, 20, yPosition);
    yPosition += 10;
    
    // Date
    doc.setTextColor(108, 117, 125);
    doc.text('Date:', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    doc.text(order.date, 60, yPosition);
    yPosition += 10;
    
    // Location
    doc.setTextColor(108, 117, 125);
    doc.text('Location:', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    doc.text(order.location, 60, yPosition);
    yPosition += 10;
    
    // Status
    doc.setTextColor(108, 117, 125);
    doc.text('Status:', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    doc.text(order.status, 60, yPosition);
    yPosition += 15;
    
    // Vendor details
    doc.setFontSize(14);
    doc.setTextColor(35, 33, 61);
    doc.text('Vendor Details', 20, yPosition);
    yPosition += 10;
    
    if (order.vendors && order.vendors.length > 0) {
      order.vendors.forEach((vendor, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 30;
        }
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}. ${vendor.name}`, 25, yPosition);
        yPosition += 6;
        
        doc.setFontSize(8);
        doc.setTextColor(108, 117, 125);
        doc.text(`   Type: ${vendor.type}`, 30, yPosition);
        yPosition += 5;
        doc.text(`   Status: ${vendor.status}`, 30, yPosition);
        yPosition += 5;
        doc.text(`   Price: $${vendor.price}`, 30, yPosition);
        yPosition += 8;
      });
    } else if (order.vendor) {
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`1. ${order.vendor.name}`, 25, yPosition);
      yPosition += 6;
      
      doc.setFontSize(8);
      doc.setTextColor(108, 117, 125);
      doc.text(`   Type: ${order.vendor.type}`, 30, yPosition);
      yPosition += 5;
      doc.text(`   Status: ${order.vendor.status}`, 30, yPosition);
      yPosition += 5;
      doc.text(`   Price: Rs. ${order.vendor.price?.toLocaleString() || order.vendor.price}`, 30, yPosition);
      yPosition += 8;
    }
    
    // Total amount
    yPosition += 10;
    doc.setFontSize(14);
    doc.setTextColor(35, 33, 61);
    doc.text('Total Amount:', 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(16);
    doc.setTextColor(175, 142, 186); // Mehfil purple
    doc.text(`Rs. ${order.total.toLocaleString()}`, 20, yPosition);
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(108, 117, 125);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, doc.internal.pageSize.height - 20);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 20);
    }
    
    // Save the PDF
    doc.save(`Mehfil_Order_${order.id}.pdf`);
  };

  // Filter orders based on current filters
  const filteredOrders = orders.filter(order => {
    if (filters.type !== "All Orders" && order.status !== filters.type) return false;
    if (filters.eventType !== "Any" && !order.title.toLowerCase().includes(filters.eventType.toLowerCase())) return false;
    return true;
  });

  // Since we're showing all bookings in one card, no pagination needed
  const paginatedOrders = filteredOrders;

  if (isLoading) {
    return (
      <div className={styles["orders-root"]}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          fontSize: '1.1rem',
          color: '#23213D'
        }}>
          Loading your bookings...
        </div>
      </div>
    );
  }

  return (
    <div className={styles["orders-root"]}>
      <div className={styles["orders-header-row"]}>
        <div className={styles["orders-header-title"]}>
          <h2 className={styles["orders-title"]}>My Orders</h2>
          <div className={styles["orders-subtitle"]}>Manage your bookings</div>
        </div>
      </div>
      <div className={styles["orders-main-grid"]}>
        {/* Sidebar */}
        <div className={styles["orders-sidebar"]}>
          <div className={styles["orders-filter-card"]}>
            <div className={styles["orders-filter-title"]}>Filter Orders</div>
            <div className={styles["orders-filter-group"]}>
              <label>Type</label>
              <select 
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option>All Orders</option>
                <option>Confirmed</option>
                <option>Completed</option>
                <option>Pending</option>
                <option>Cancellation Requested</option>
              </select>
            </div>
            <div className={styles["orders-filter-group"]}>
              <label>Date Range</label>
              <select 
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <option>All Time</option>
                <option>Last 30 Days</option>
                <option>Last 3 Months</option>
                <option>Last 6 Months</option>
                <option>Last Year</option>
              </select>
            </div>
            <div className={styles["orders-filter-group"]}>
              <label>Event Type</label>
              <select 
                value={filters.eventType}
                onChange={(e) => handleFilterChange('eventType', e.target.value)}
              >
                <option>Any</option>
                <option>Wedding</option>
                <option>Corporate</option>
                <option>Birthday</option>
                <option>Photography</option>
              </select>
            </div>
          </div>

        </div>
        {/* Orders List */}
        <div className={styles["orders-list-section"]}>
          {paginatedOrders.length > 0 ? (
            paginatedOrders.map((order, i) => (
              <div className={styles["orders-card"]} key={i}>
                <div className={styles["orders-card-header"]}>
                  <div>
                    <div className={styles["orders-card-id"]}>Order #{order.id}</div>
                    <div className={styles["orders-card-title"]}>{order.title}</div>
                    <div className={styles["orders-card-meta"]}>Date: {order.date} &nbsp; Location: {order.location}</div>
                  </div>
                  <div className={styles["orders-card-total"]}>
                    <div className={styles["orders-card-amount"]}>Rs. {order.total.toLocaleString()}</div>
                    <div className={styles["orders-card-paid"]}>
                      {order.paid ? <><span className={styles["paid-dot"]} />Paid</> : "Unpaid"}
                    </div>
                  </div>
                </div>
                <div className={styles["orders-vendor-row"]}>
                  {order.vendor ? (
                    <div className={styles["orders-vendor-card"]}>
                      <img src={order.vendor.img || "/logo.png"} alt={order.vendor.name || 'Vendor'} className={styles["orders-vendor-img"]} />
                      <div className={styles["orders-vendor-info"]}>
                        <div className={styles["orders-vendor-name"]}>{order.vendor.name || 'Vendor'}</div>
                        <div className={styles["orders-vendor-type"]}>{order.vendor.type || 'Package'}</div>
                        <div className={`${styles["orders-vendor-status"]} ${styles[(order.vendor.status || 'pending').toLowerCase()]}`}>
                          {order.vendor.status || 'Pending'}
                        </div>
                      </div>
                      <div className={styles["orders-vendor-price"]}>Rs. {(order.vendor.price || 0).toLocaleString()}</div>
                      <button 
                        className={styles["orders-vendor-msg"]}
                        onClick={() => handleVendorAction(order.vendor.id, 'message', order.vendor.eventId)}
                      >
                        <span role="img" aria-label="msg">💬</span> Message Vendor
                      </button>
                    </div>
                  ) : (
                    <div className={styles["orders-vendor-card"]}>
                      <img src="/logo.png" alt="Vendor" className={styles["orders-vendor-img"]} />
                      <div className={styles["orders-vendor-info"]}>
                        <div className={styles["orders-vendor-name"]}>Vendor</div>
                        <div className={styles["orders-vendor-type"]}>Package</div>
                        <div className={`${styles["orders-vendor-status"]} ${styles['pending']}`}>
                          Pending
                        </div>
                      </div>
                      <div className={styles["orders-vendor-price"]}>Rs. 0</div>
                      <button 
                        className={styles["orders-vendor-msg"]}
                        disabled
                      >
                        <span role="img" aria-label="msg">💬</span> Message Vendor
                      </button>
                    </div>
                  )}
                </div>
                <div className={styles["orders-card-actions"]}>
                  {order.actions.map((action, k) => (
                    <button 
                      className={`${styles["orders-action-btn"]} ${styles[action.replace(/\s+/g, '-').toLowerCase()]}`} 
                      key={k}
                      onClick={() => handleOrderAction(order.id, action)}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div style={{
              background: '#fff',
              borderRadius: 'clamp(12px, 2vw, 16px)',
              padding: 'clamp(24px, 4vw, 48px)',
              textAlign: 'center',
              color: '#A3A3A3',
              fontSize: 'clamp(1rem, 1.5vw, 1.2rem)'
            }}>
              No orders found matching your filters.
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 'clamp(16px, 3vw, 24px)'
        }}>
          <div style={{
            background: 'white',
            padding: 'clamp(20px, 3vw, 32px)',
            borderRadius: 'clamp(12px, 2vw, 16px)',
            minWidth: 'clamp(320px, 55vw, 650px)',
            maxWidth: 'clamp(450px, 75vw, 850px)',
            width: '100%',
            maxHeight: '85vh',
            overflow: 'auto',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.1)',
            position: 'relative'
          }}>
            {/* Subtle top accent */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: '#AF8EBA',
              borderRadius: 'clamp(12px, 2vw, 16px) clamp(12px, 2vw, 16px) 0 0'
            }} />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'clamp(16px, 2.5vw, 24px)',
              paddingTop: 'clamp(4px, 0.8vw, 8px)'
            }}>
              <div>
              <h3 style={{ 
                margin: 0, 
                color: '#23213D',
                  fontSize: 'clamp(1.2rem, 2vw, 1.5rem)',
                  fontWeight: '600'
              }}>
                Order Details
              </h3>
                <div style={{
                  width: '30px',
                  height: '2px',
                  background: '#AF8EBA',
                  borderRadius: '1px',
                  marginTop: 'clamp(4px, 0.8vw, 8px)'
                }} />
              </div>
              <button
                onClick={() => setShowOrderDetails(false)}
                style={{
                  background: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '50%',
                  width: 'clamp(28px, 3.5vw, 36px)',
                  height: 'clamp(28px, 3.5vw, 36px)',
                  fontSize: 'clamp(1rem, 1.8vw, 1.3rem)',
                  cursor: 'pointer',
                  color: '#6c757d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#e9ecef';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#f8f9fa';
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ 
              marginBottom: 'clamp(16px, 2.5vw, 24px)',
              background: '#f8f9fa',
              padding: 'clamp(12px, 2vw, 20px)',
              borderRadius: 'clamp(8px, 1.5vw, 12px)',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ 
                margin: '0 0 clamp(8px, 1.5vw, 12px) 0',
                color: '#23213D',
                fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                fontWeight: '600'
              }}>
                {selectedOrder.title}
              </h4>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 'clamp(6px, 1.2vw, 10px)',
                marginBottom: 'clamp(8px, 1.5vw, 12px)'
              }}>
                <div style={{
                  background: 'white',
                  padding: 'clamp(6px, 1vw, 10px)',
                  borderRadius: 'clamp(4px, 0.8vw, 6px)',
                  border: '1px solid #dee2e6'
                }}>
                  <div style={{ color: '#6c757d', fontSize: 'clamp(0.75rem, 1vw, 0.85rem)', marginBottom: '2px' }}>Order ID</div>
                  <div style={{ color: '#23213D', fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)', fontWeight: '500' }}>{selectedOrder.id}</div>
                </div>
                
                <div style={{
                  background: 'white',
                  padding: 'clamp(6px, 1vw, 10px)',
                  borderRadius: 'clamp(4px, 0.8vw, 6px)',
                  border: '1px solid #dee2e6'
                }}>
                  <div style={{ color: '#6c757d', fontSize: 'clamp(0.75rem, 1vw, 0.85rem)', marginBottom: '2px' }}>Date</div>
                  <div style={{ color: '#23213D', fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)', fontWeight: '500' }}>{selectedOrder.date}</div>
                </div>
                
                <div style={{
                  background: 'white',
                  padding: 'clamp(6px, 1vw, 10px)',
                  borderRadius: 'clamp(4px, 0.8vw, 6px)',
                  border: '1px solid #dee2e6'
                }}>
                  <div style={{ color: '#6c757d', fontSize: 'clamp(0.75rem, 1vw, 0.85rem)', marginBottom: '2px' }}>Location</div>
                  <div style={{ color: '#23213D', fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)', fontWeight: '500' }}>{selectedOrder.location}</div>
                </div>
            </div>

              <div style={{
                background: '#AF8EBA',
                padding: 'clamp(8px, 1.5vw, 12px)',
                borderRadius: 'clamp(6px, 1vw, 8px)',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)', marginBottom: '2px' }}>Total Amount</div>
                <div style={{ fontSize: 'clamp(1.1rem, 1.5vw, 1.3rem)', fontWeight: '600' }}>
                  Rs. {selectedOrder.total.toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{ 
              marginBottom: 'clamp(16px, 2.5vw, 24px)',
              background: '#f8f9fa',
              padding: 'clamp(12px, 2vw, 20px)',
              borderRadius: 'clamp(8px, 1.5vw, 12px)',
              border: '1px solid #e9ecef'
            }}>
              <h5 style={{ 
                margin: '0 0 clamp(8px, 1.5vw, 12px) 0',
                color: '#23213D',
                fontSize: 'clamp(0.95rem, 1.3vw, 1.1rem)',
                fontWeight: '600'
              }}>
                {selectedOrder.vendors ? `Vendors (${selectedOrder.vendors.length})` : 'Vendor Details'}
              </h5>
                              {selectedOrder.vendors ? (
                  // Handle multiple vendors (dummy data structure)
                  selectedOrder.vendors.map((vendor, index) => (
                <div key={index} style={{
                    background: 'white',
                  padding: 'clamp(8px, 1.5vw, 12px)',
                  borderRadius: 'clamp(6px, 1vw, 8px)',
                  marginBottom: 'clamp(6px, 1vw, 8px)',
                  display: 'flex',
                  justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid #dee2e6'
                }}>
                  <div>
                    <div style={{ 
                      fontWeight: '600',
                        fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)',
                        color: '#23213D'
                    }}>
                      {vendor.name}
                    </div>
                    <div style={{ 
                        color: '#6c757d',
                        fontSize: 'clamp(0.75rem, 1vw, 0.85rem)'
                    }}>
                      {vendor.type} - {vendor.status}
                    </div>
                  </div>
                  <div style={{ 
                    fontWeight: '600',
                      fontSize: 'clamp(0.9rem, 1.2vw, 1rem)',
                      color: '#AF8EBA'
                  }}>
                    ${vendor.price}
                  </div>
                </div>
                ))
                              ) : selectedOrder.vendor ? (
                  // Handle single vendor (real data structure)
                  <div style={{
                    background: 'white',
                    padding: 'clamp(8px, 1.5vw, 12px)',
                    borderRadius: 'clamp(6px, 1vw, 8px)',
                    marginBottom: 'clamp(6px, 1vw, 8px)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid #dee2e6'
                  }}>
                    <div>
                      <div style={{ 
                        fontWeight: '600',
                        fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)',
                        color: '#23213D'
                      }}>
                        {selectedOrder.vendor.name}
                      </div>
                      <div style={{ 
                        color: '#6c757d',
                        fontSize: 'clamp(0.75rem, 1vw, 0.85rem)'
                      }}>
                        {selectedOrder.vendor.type} - {selectedOrder.vendor.status}
                      </div>
                    </div>
                    <div style={{ 
                      fontWeight: '600',
                      fontSize: 'clamp(0.9rem, 1.2vw, 1rem)',
                      color: '#AF8EBA'
                    }}>
                      Rs. {selectedOrder.vendor.price?.toLocaleString() || selectedOrder.vendor.price}
                    </div>
                  </div>
                              ) : (
                  <div style={{
                    background: 'white',
                    padding: 'clamp(8px, 1.5vw, 12px)',
                    borderRadius: 'clamp(6px, 1vw, 8px)',
                    color: '#6c757d',
                    fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)',
                    textAlign: 'center',
                    border: '1px dashed #dee2e6'
                  }}>
                    No vendor details available
                  </div>
                )}
            </div>

            <div style={{
              display: 'flex',
              gap: 'clamp(6px, 1.2vw, 10px)',
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
              paddingTop: 'clamp(6px, 1.2vw, 10px)',
              borderTop: '1px solid #e9ecef'
            }}>
              <button
                onClick={() => setShowOrderDetails(false)}
                style={{
                  padding: 'clamp(6px, 1vw, 8px) clamp(12px, 2vw, 16px)',
                  background: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: 'clamp(6px, 1vw, 8px)',
                  cursor: 'pointer',
                  fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)',
                  color: '#6c757d',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#e9ecef';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#f8f9fa';
                }}
              >
                Close
              </button>
              <button
                onClick={async () => {
                  await generateOrderPDF(selectedOrder);
                  setShowOrderDetails(false);
                }}
                style={{
                  padding: 'clamp(6px, 1vw, 8px) clamp(12px, 2vw, 16px)',
                  background: '#AF8EBA',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'clamp(6px, 1vw, 8px)',
                  cursor: 'pointer',
                  fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#9B6B9A';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#AF8EBA';
                }}
              >
                Download Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Cancellation Success Popup */}
      {showCancellationSuccess && (
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
            padding: 'clamp(24px, 4vw, 32px)',
            borderRadius: 'clamp(12px, 2vw, 16px)',
            maxWidth: 'clamp(400px, 50vw, 500px)',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              fontSize: 'clamp(48px, 6vw, 64px)',
              marginBottom: 'clamp(16px, 2.5vw, 24px)'
            }}>
              ✅
            </div>
            <h3 style={{
              margin: '0 0 clamp(12px, 2vw, 16px) 0',
              color: '#23213D',
              fontSize: 'clamp(1.3rem, 2vw, 1.6rem)',
              fontWeight: 'bold'
            }}>
              Cancellation Request Sent!
            </h3>
            <p style={{
              margin: '0 0 clamp(20px, 3vw, 28px) 0',
              color: '#666',
              fontSize: 'clamp(1rem, 1.3vw, 1.1rem)',
              lineHeight: '1.5'
            }}>
              Your cancellation request has been sent to the vendor successfully. You will be redirected to the messages tab to view the conversation.
            </p>
            <button
              onClick={() => setShowCancellationSuccess(false)}
              style={{
                padding: 'clamp(10px, 1.5vw, 12px) clamp(20px, 3vw, 24px)',
                background: '#AF8EBA',
                color: 'white',
                border: 'none',
                borderRadius: 'clamp(8px, 1.2vw, 10px)',
                cursor: 'pointer',
                fontSize: 'clamp(1rem, 1.2vw, 1.1rem)',
                fontWeight: '600',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#9A7BA5'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#AF8EBA'}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrdersContent; 