import { io } from 'socket.io-client';

// Test if socket.io is properly imported
console.log('🔍 [SocketService] Socket.io client imported:', !!io);

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.messageHandlers = new Map();
    this.typingHandlers = new Map();
    this.readHandlers = new Map();
    this.notificationHandlers = new Map();
    this.connectionAttempts = 0;
    this.maxReconnectionAttempts = 5;
    this.reconnectionDelay = 1000;
    this.currentToken = null;
  }

  connect(token) {
    if (!token) {
      console.error('❌ [SocketService] No token provided for connection');
      return;
    }

    this.currentToken = token;

    // If already connected with the same token, don't reconnect
    if (this.socket && this.isConnected && this.currentToken === token) {
      console.log('🔌 [SocketService] Already connected with same token');
      return;
    }

    // Disconnect existing connection if any
    if (this.socket) {
      this.disconnect();
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      console.log('🔌 [SocketService] Connecting to server...', backendUrl);
      console.log('🔌 [SocketService] Token available:', !!token);
      console.log('🔌 [SocketService] Environment variables:', {
        NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
        NODE_ENV: process.env.NODE_ENV
      });
      
      this.socket = io(backendUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectionAttempts,
        reconnectionDelay: this.reconnectionDelay,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: this.maxReconnectionAttempts
      });

      this.setupEventHandlers();
      
      // Set a timeout to check if connection was successful
      setTimeout(() => {
        if (!this.isConnected) {
          console.warn('⚠️ [SocketService] Connection timeout, attempting reconnection...');
          this.attemptReconnection();
        }
      }, 5000);

    } catch (error) {
      console.error('❌ [SocketService] Error connecting:', error);
      this.attemptReconnection();
    }
  }

  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ [SocketService] Connected to server');
      console.log('✅ [SocketService] Socket ID:', this.socket.id);
      this.isConnected = true;
      this.connectionAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 [SocketService] Disconnected from server, reason:', reason);
      this.isConnected = false;
      
      // Attempt reconnection if it wasn't a manual disconnect
      if (reason !== 'io client disconnect') {
        this.attemptReconnection();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ [SocketService] Connection error:', error);
      console.error('❌ [SocketService] Error details:', {
        message: error.message,
        description: error.description,
        context: error.context
      });
      this.isConnected = false;
      this.attemptReconnection();
    });

    this.socket.on('error', (error) => {
      console.error('❌ [SocketService] Socket error:', error);
    });

    // Notification event listeners
    this.socket.on('new_notification', (data) => {
      console.log('🔔 [SocketService] Received new notification:', data);
      this.handleNewNotification(data);
    });

    this.socket.on('unread_count_update', (data) => {
      console.log('🔢 [SocketService] Received unread count update:', data);
      this.handleUnreadCountUpdate(data);
    });

    this.socket.on('notification_read_success', (data) => {
      console.log('✅ [SocketService] Notification marked as read:', data);
      this.handleNotificationReadSuccess(data);
    });

    this.socket.on('notification_error', (data) => {
      console.error('❌ [SocketService] Notification error:', data);
      this.handleNotificationError(data);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 [SocketService] Reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.connectionAttempts = 0;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 [SocketService] Reconnection attempt:', attemptNumber);
      this.connectionAttempts = attemptNumber;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ [SocketService] Reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ [SocketService] Reconnection failed after all attempts');
    });

    // Handle new messages
    this.socket.on('new_message', (data) => {
      console.log('📨 [SocketService] Received new message:', data);
      this.handleNewMessage(data);
    });

    // Handle message sent confirmation
    this.socket.on('message_sent', (data) => {
      console.log('✅ [SocketService] Message sent successfully:', data);
      this.handleMessageSent(data);
    });

    // Handle message errors
    this.socket.on('message_error', (data) => {
      console.error('❌ [SocketService] Message error:', data);
      this.handleMessageError(data);
    });

    // Handle typing events
    this.socket.on('user_typing', (data) => {
      console.log('⌨️ [SocketService] User typing:', data);
      this.handleUserTyping(data);
    });

    this.socket.on('user_stopped_typing', (data) => {
      console.log('⏹️ [SocketService] User stopped typing:', data);
      this.handleUserStoppedTyping(data);
    });

    // Handle read receipts
    this.socket.on('messages_read', (data) => {
      console.log('👁️ [SocketService] Messages read:', data);
      this.handleMessagesRead(data);
    });
  }

  attemptReconnection() {
    if (this.connectionAttempts >= this.maxReconnectionAttempts) {
      console.error('❌ [SocketService] Max reconnection attempts reached');
      return;
    }

    if (!this.currentToken) {
      console.error('❌ [SocketService] No token available for reconnection');
      return;
    }

    console.log('🔄 [SocketService] Attempting reconnection...', this.connectionAttempts + 1);
    
    setTimeout(() => {
      this.connect(this.currentToken);
    }, this.reconnectionDelay * (this.connectionAttempts + 1));
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 [SocketService] Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentToken = null;
    }
  }

  // Send a message
  sendMessage(messageData) {
    console.log('🔍 [SocketService] Checking connection status...');
    console.log('🔍 [SocketService] Socket exists:', !!this.socket);
    console.log('🔍 [SocketService] Is connected:', this.isConnected);
    console.log('🔍 [SocketService] Connection status:', this.getConnectionStatus());
    
    if (!this.socket || !this.isConnected) {
      console.error('❌ [SocketService] Not connected');
      console.error('❌ [SocketService] Socket:', this.socket);
      console.error('❌ [SocketService] IsConnected:', this.isConnected);
      
      // Try to reconnect if we have a token
      if (this.currentToken) {
        console.log('🔄 [SocketService] Attempting to reconnect before sending message...');
        this.connect(this.currentToken);
      }
      
      return false;
    }

    console.log('📤 [SocketService] Sending message:', messageData);
    this.socket.emit('send_message', messageData);
    return true;
  }

  // Start typing indicator
  startTyping(receiverId, eventId = null) {
    if (!this.socket || !this.isConnected) return false;

    console.log('⌨️ [SocketService] Starting typing indicator');
    this.socket.emit('typing_start', { receiverId, eventId });
    return true;
  }

  // Stop typing indicator
  stopTyping(receiverId, eventId = null) {
    if (!this.socket || !this.isConnected) return false;

    console.log('⏹️ [SocketService] Stopping typing indicator');
    this.socket.emit('typing_stop', { receiverId, eventId });
    return true;
  }

  // Mark messages as read
  markAsRead(conversationId) {
    if (!this.socket || !this.isConnected) return false;

    console.log('👁️ [SocketService] Marking messages as read');
    this.socket.emit('mark_read', { conversationId });
    return true;
  }

  // Event handlers
  onNewMessage(handler) {
    this.messageHandlers.set('new_message', handler);
  }

  offNewMessage() {
    this.messageHandlers.delete('new_message');
  }

  onMessageSent(handler) {
    this.messageHandlers.set('message_sent', handler);
  }

  offMessageSent() {
    this.messageHandlers.delete('message_sent');
  }

  onMessageError(handler) {
    this.messageHandlers.set('message_error', handler);
  }

  onUserTyping(handler) {
    this.typingHandlers.set('typing', handler);
  }

  onUserStoppedTyping(handler) {
    this.typingHandlers.set('stopped_typing', handler);
  }

  onMessagesRead(handler) {
    this.readHandlers.set('read', handler);
  }

  // Notification handlers
  onNotification(handler) {
    this.notificationHandlers.set('notification', handler);
  }

  offNotification() {
    this.notificationHandlers.delete('notification');
  }

  // Internal event handlers
  handleNewMessage(data) {
    const handler = this.messageHandlers.get('new_message');
    if (handler) {
      handler(data);
    }
  }

  handleMessageSent(data) {
    const handler = this.messageHandlers.get('message_sent');
    if (handler) {
      handler(data);
    }
  }

  handleMessageError(data) {
    const handler = this.messageHandlers.get('message_error');
    if (handler) {
      handler(data);
    }
  }

  handleUserTyping(data) {
    const handler = this.typingHandlers.get('typing');
    if (handler) {
      handler(data);
    }
  }

  handleUserStoppedTyping(data) {
    const handler = this.typingHandlers.get('stopped_typing');
    if (handler) {
      handler(data);
    }
  }

  handleMessagesRead(data) {
    const handler = this.readHandlers.get('read');
    if (handler) {
      handler(data);
    }
  }

  // Notification event handlers
  handleNewNotification(data) {
    console.log('🔔 [SocketService] Handling new notification:', data);
    this.notificationHandlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error('❌ [SocketService] Error in notification handler:', error);
      }
    });
  }

  handleUnreadCountUpdate(data) {
    console.log('🔢 [SocketService] Handling unread count update:', data);
    this.notificationHandlers.forEach(handler => {
      try {
        handler({ type: 'unread_count_update', data });
      } catch (error) {
        console.error('❌ [SocketService] Error in unread count handler:', error);
      }
    });
  }

  handleNotificationReadSuccess(data) {
    console.log('✅ [SocketService] Handling notification read success:', data);
    this.notificationHandlers.forEach(handler => {
      try {
        handler({ type: 'notification_read_success', data });
      } catch (error) {
        console.error('❌ [SocketService] Error in notification read handler:', error);
      }
    });
  }

  handleNotificationError(data) {
    console.error('❌ [SocketService] Handling notification error:', data);
    this.notificationHandlers.forEach(handler => {
      try {
        handler({ type: 'notification_error', data });
      } catch (error) {
        console.error('❌ [SocketService] Error in notification error handler:', error);
      }
    });
  }

  // Utility methods
  isConnected() {
    return this.isConnected;
  }

  getSocketId() {
    return this.socket ? this.socket.id : null;
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.getSocketId(),
      hasSocket: !!this.socket,
      connectionAttempts: this.connectionAttempts,
      hasToken: !!this.currentToken
    };
  }

  // Force reconnect
  reconnect(token) {
    console.log('🔄 [SocketService] Force reconnecting...');
    this.disconnect();
    setTimeout(() => {
      this.connect(token);
    }, 1000);
  }

  // Test connection
  testConnection() {
    if (!this.socket) {
      console.log('❌ [SocketService] No socket instance');
      return false;
    }

    if (!this.isConnected) {
      console.log('❌ [SocketService] Socket not connected');
      return false;
    }

    console.log('✅ [SocketService] Connection test passed');
    return true;
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;
