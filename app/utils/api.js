const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mehfil-backend-tzep.onrender.com/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders(isFormData = false) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('MehfilToken') : null;
    const headers = {};
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    // If response is 204 No Content or 205 Reset Content, or has no content, don't try to parse JSON
    if (response.status === 204 || response.status === 205) {
      return { success: true, data: null };
    }
    
    // Some APIs may return empty body with 200, so check content-length or try/catch
    const text = await response.text();
    if (!text) {
      return { success: true, data: null };
    }
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON response:', text);
      throw new Error('Invalid JSON response');
    }
    
    if (!response.ok) {
      const errorMessage = data.message || data.error || 'Something went wrong';
      console.error('API Error:', errorMessage);
      throw new Error(errorMessage);
    }
    
    return data;
  }

  // Generic request method
  async request(endpoint, options = {}, isFormData = false) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(isFormData),
      ...options
    };

    console.log('Making API request:', { url, method: config.method || 'GET' });

    try {
      const response = await fetch(url, config);
      console.log('API response status:', response.status);
      
      // Handle blob responses (for downloads)
      if (options.responseType === 'blob') {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
      }
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async signupVendor(vendorData) {
    return this.request('/auth/signup/vendor', {
      method: 'POST',
      body: JSON.stringify(vendorData)
    });
  }

  async signupCustomer(customerData) {
    return this.request('/auth/signup/customer', {
      method: 'POST',
      body: JSON.stringify(customerData)
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async verifyResetToken(token) {
    return this.request(`/auth/reset-password/${token}`, {
      method: 'GET'
    });
  }

  async resetPassword(token, password, passwordConfirm) {
    return this.request(`/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password, passwordConfirm })
    });
  }

  async resendVerificationEmail(email) {
    return this.request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  // Change password endpoint
  async changePassword(currentPassword, newPassword, confirmPassword) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
    });
  }

  // Google OAuth endpoints
  async initiateGoogleAuth(role = 'customer') {
    const url = `${this.baseURL}/auth/google/${role}`;
    return url;
  }

  // User profile endpoints
  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // Customer profile endpoints
  async getCustomerProfile() {
    return this.request('/customer/profile');
  }

  async updateCustomerProfile(profileData, profileImage = null) {
    if (profileImage) {
      // Handle file upload with FormData
      const formData = new FormData();
      
      // Add text fields
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== null && profileData[key] !== undefined) {
          if (typeof profileData[key] === 'object') {
            formData.append(key, JSON.stringify(profileData[key]));
          } else {
            formData.append(key, profileData[key]);
          }
        }
      });
      
      // Add profile image
      formData.append('profileImage', profileImage);
      
      return this.request('/customer/profile', {
        method: 'PUT',
        body: formData
      }, true); // isFormData = true
    } else {
      // Handle regular JSON update
      return this.request('/customer/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
    }
  }

  // Vendor specific endpoints
  async getVendorProfile() {
    return this.request('/vendor/profile');
  }

  async updateVendorProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // Event/Listing endpoints
  async createEvent(eventData, images) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('MehfilToken') : null;
    
    if (!token) {
      throw new Error('Authentication token not found');
    }

    // Create FormData for multipart/form-data
    const formData = new FormData();
    
    // Add text fields
    formData.append('name', eventData.name);
    formData.append('eventType', eventData.eventType);
    formData.append('description', eventData.description);
    formData.append('services', JSON.stringify(eventData.services));
    formData.append('packages', JSON.stringify(eventData.packages || []));
    formData.append('location', JSON.stringify(eventData.location));
    formData.append('tags', JSON.stringify(eventData.tags || []));
    
    // Add images
    if (images && images.length > 0) {
      images.forEach((image, index) => {
        formData.append('images', image);
      });
    }

    const url = `${this.baseURL}/events`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Create event API request failed:', error);
      throw error;
    }
  }

  async updateEvent(eventId, eventData, images = []) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('MehfilToken') : null;
    
    if (!token) {
      throw new Error('Authentication token not found');
    }

    // Create FormData for multipart/form-data
    const formData = new FormData();
    
    // Add text fields
    formData.append('name', eventData.name);
    formData.append('eventType', eventData.eventType);
    formData.append('description', eventData.description);
    formData.append('services', JSON.stringify(eventData.services));
    formData.append('packages', JSON.stringify(eventData.packages || []));
    formData.append('location', JSON.stringify(eventData.location));
    formData.append('tags', JSON.stringify(eventData.tags || []));
    
    // Add new images if provided
    if (images && images.length > 0) {
      images.forEach((image, index) => {
        formData.append('images', image);
      });
    }

    const url = `${this.baseURL}/events/${eventId}`;
    
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Update event API request failed:', error);
      throw error;
    }
  }

  async getEvent(eventId) {
    return this.request(`/events/${eventId}`);
  }

  async getVendorEvents(page = 1, limit = 10) {
    return this.request(`/events/my-events?page=${page}&limit=${limit}`);
  }

  async getVendorBookings() {
    return this.request('/bookings/vendor-bookings');
  }

  async updateBookingStatus(bookingId, status) {
    try {
      console.log('Sending status update request:', { bookingId, status });
      
      const response = await this.request(`/bookings/${bookingId}/status`, {
        method: 'PATCH', // Back to PATCH
        body: JSON.stringify({ status })
      });
      
      // Log the response for debugging
      console.log('Booking status update response:', response);
      
      return response;
    } catch (error) {
      console.error('Booking status update failed:', error);
      throw error;
    }
  }

  async getBookingDetails(bookingId) {
    return this.request(`/bookings/${bookingId}`);
  }

  async getVendorReviews(page = 1, limit = 10, rating = null, sort = null) {
    let url = `/vendor/reviews?page=${page}&limit=${limit}`;
    if (rating) url += `&rating=${rating}`;
    if (sort) url += `&sort=${sort}`;
    return this.request(url);
  }

  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async deleteEvent(eventId) {
    return this.request(`/events/${eventId}`, {
      method: 'DELETE'
    });
  }

  async searchListings(params) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/search/listings?${query}`);
  }

  // Newsletter endpoints
  async subscribeNewsletter(email) {
    return this.request('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async unsubscribeNewsletter(token) {
    return this.request(`/newsletter/unsubscribe/${token}`, {
      method: 'GET'
    });
  }

  async updateNewsletterPreferences(preferences) {
    return this.request('/newsletter/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences)
    });
  }

  // Contact Us endpoints
  async submitContactForm(contactData) {
    return this.request('/contact-us/submit', {
      method: 'POST',
      body: JSON.stringify(contactData)
    });
  }

  async getContactSubmissions(page = 1, limit = 20, filters = {}) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    return this.request(`/contact-us/submissions?${queryParams}`);
  }

  async getContactSubmission(id) {
    return this.request(`/contact-us/submissions/${id}`);
  }

  async updateContactSubmissionStatus(id, statusData) {
    return this.request(`/contact-us/submissions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData)
    });
  }

  async respondToContactSubmission(id, responseMessage) {
    return this.request(`/contact-us/submissions/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ responseMessage })
    });
  }

  async deleteContactSubmission(id) {
    return this.request(`/contact-us/submissions/${id}`, {
      method: 'DELETE'
    });
  }

  async getContactStats() {
    return this.request('/contact-us/stats');
  }

  // Marketplace/Vendor Listings
  async getMarketplaceListings(params) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/events/marketplace?${query}`);
  }

  async getListingDetails(id) {
    return this.request(`/events/${id}`);
  }

  // Cart Management
  async getCart() {
    return this.request('/cart');
  }

  async addToCart(itemData) {
    return this.request('/cart', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async removeFromCart(cartItemId) {
    return this.request(`/cart/${cartItemId}`, {
      method: 'DELETE',
    });
  }

  async updateCartItem(cartItemId, updateData) {
    return this.request(`/cart/${cartItemId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  // Favorites endpoints
  async getFavorites() {
    return this.request('/favorites');
  }

  async addToFavorites(eventId) {
    return this.request(`/favorites/${eventId}`, {
      method: 'POST'
    });
  }

  async removeFromFavorites(eventId) {
    return this.request(`/favorites/${eventId}`, {
      method: 'DELETE'
    });
  }

  // Message endpoints
  async getConversations() {
    return this.request('/messages/conversations');
  }

  async getConversation(eventId, otherUserId) {
    return this.request(`/messages/conversation/${eventId}/${otherUserId}`);
  }

  async getVendorConversation(vendorId) {
    return this.request(`/messages/vendor/${vendorId}`);
  }

  async getCustomerConversation(customerId) {
    return this.request(`/messages/customer/${customerId}`);
  }

  // Review APIs
  async getEventReviews(eventId, page = 1, limit = 10) {
    return this.request(`/events/${eventId}/reviews?page=${page}&limit=${limit}`);
  }

  async addReview(eventId, reviewData) {
    return this.request(`/events/${eventId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }

  async deleteReview(eventId, reviewId) {
    return this.request(`/events/${eventId}/reviews/${reviewId}`, {
      method: 'DELETE'
    });
  }

  async sendMessage(messageData, isFormData = false) {
    const options = {
        method: 'POST',
        body: isFormData ? messageData : JSON.stringify(messageData)
    };
    return this.request('/messages/send', options, isFormData);
  }

  async markMessagesAsRead(conversationId) {
    return this.request(`/messages/read/${conversationId}`, {
      method: 'PATCH'
    });
  }

  async getUnreadCount() {
    return this.request('/messages/unread-count');
  }

  async deleteConversation(conversationId) {
    return this.request(`/messages/conversation/${conversationId}`, {
      method: 'DELETE'
    });
  }

  // Event endpoints
  async getEvent(eventId) {
    return this.request(`/events/${eventId}`);
  }

  // Booking endpoints
  async bookEvent(bookingData) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getCustomerBookings() {
    return this.request('/bookings/my-bookings');
  }

  // Notification endpoints
  async getNotifications(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    return this.request(`/notifications?${queryParams}`);
  }

  async getUnreadNotificationCount() {
    return this.request('/notifications/unread-count');
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PATCH'
    });
  }

  async markNotificationsAsRead(notificationIds = []) {
    return this.request('/notifications/mark-read', {
      method: 'PATCH',
      body: JSON.stringify({ notificationIds })
    });
  }

  async deleteNotification(notificationId) {
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE'
    });
  }

  // User Event APIs
  async getUserEvents(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    return this.request(`/user-events?${queryParams}`);
  }

  async getUserEvent(eventId) {
    return this.request(`/user-events/${eventId}`);
  }

  async createUserEvent(eventData) {
    return this.request('/user-events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  }

  async updateUserEvent(eventId, eventData) {
    return this.request(`/user-events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
  }

  async deleteUserEvent(eventId) {
    return this.request(`/user-events/${eventId}`, {
      method: 'DELETE'
    });
  }



  async getEventStats() {
    return this.request('/user-events/stats');
  }

  // Event Todo APIs
  async getEventTodos(eventId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    return this.request(`/user-events/${eventId}/todos?${queryParams}`);
  }

  async getEventTodo(eventId, todoId) {
    return this.request(`/user-events/${eventId}/todos/${todoId}`);
  }

  async createEventTodo(eventId, todoData) {
    return this.request(`/user-events/${eventId}/todos`, {
      method: 'POST',
      body: JSON.stringify(todoData)
    });
  }

  async updateEventTodo(eventId, todoId, todoData) {
    return this.request(`/user-events/${eventId}/todos/${todoId}`, {
      method: 'PUT',
      body: JSON.stringify(todoData)
    });
  }

  async deleteEventTodo(eventId, todoId) {
    return this.request(`/user-events/${eventId}/todos/${todoId}`, {
      method: 'DELETE'
    });
  }

  async toggleTodoCompletion(eventId, todoId) {
    return this.request(`/user-events/${eventId}/todos/${todoId}/toggle`, {
      method: 'PATCH'
    });
  }

  async getEventTodoStats(eventId) {
    return this.request(`/user-events/${eventId}/todos/stats`);
  }

  // Priority todos for dashboard
  async getPriorityTodos() {
    return this.request('/user-events/todos/priority');
  }

  // Get booked vendors for customer
  async getBookedVendors() {
    return this.request('/bookings/booked-vendors');
  }

  // Invoice endpoints
  async createInvoice(invoiceData) {
    return this.request('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData)
    });
  }

  async getInvoices(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/invoices?${queryString}`);
  }

  async getInvoice(invoiceId) {
    return this.request(`/invoices/${invoiceId}`);
  }

  async updateInvoice(invoiceId, invoiceData) {
    return this.request(`/invoices/${invoiceId}`, {
      method: 'PUT',
      body: JSON.stringify(invoiceData)
    });
  }

  async deleteInvoice(invoiceId) {
    return this.request(`/invoices/${invoiceId}`, {
      method: 'DELETE'
    });
  }

  async markInvoiceAsPaid(invoiceId) {
    return this.request(`/invoices/${invoiceId}/mark-paid`, {
      method: 'PATCH'
    });
  }

  async updateOverdueInvoices() {
    return this.request('/invoices/update-overdue', {
      method: 'PATCH'
    });
  }

  async updateInvoiceStatus(invoiceId, status) {
    return this.request(`/invoices/${invoiceId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async downloadInvoice(invoiceId) {
    return this.request(`/invoices/${invoiceId}/download`, {
      method: 'GET',
      responseType: 'blob'
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
