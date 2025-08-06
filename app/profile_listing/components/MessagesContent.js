'use client';

import { useState, useEffect, useCallback } from 'react';
import MessageSidebar from '../../components/Messages/MessageSidebar';
import ChatArea from '../../components/Messages/ChatArea';
import apiService from '../../utils/api';
import socketService from '../../utils/socketService';
import { toast } from 'react-toastify';
import { useUserStore } from '../../state/userStore';

export default function MessagesContent() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useUserStore();

    const handleNewMessage = useCallback((data) => {
        console.log('📨 [VendorMessagesContent] Real-time new message:', data);
        const { message, conversationId } = data;

        setSelectedConversation(prev => {
            if (prev && prev.conversationId === conversationId) {
                const newMessage = {
                    id: message._id,
                    text: message.content,
                    content: message.content, // Keep the original content for proper parsing
                    sender: 'contact',
                    timestamp: new Date(message.createdAt).toLocaleTimeString(),
                    isRead: true,
                    messageType: message.messageType,
                    originalFileName: message.originalFileName
                };
                socketService.markAsRead(conversationId);
                return {
                    ...prev,
                    messages: [...prev.messages, newMessage],
                };
            }
            return prev;
        });

        setConversations(prev => {
            let conversationExists = false;
            const updatedConversations = prev.map(conv => {
                if (conv.conversationId === conversationId) {
                    conversationExists = true;
                    return {
                        ...conv,
                        lastMessage: message.messageType === 'image' ? 
                          (message.content && message.content.startsWith('[') ? '📷 Multiple Images' : '📷 Image') : 
                          (message.messageType === 'document' ? 
                            (message.originalFileName || '📄 Document') : 
                            message.content),
                        lastMessageTime: new Date(message.createdAt).toLocaleTimeString(),
                        unreadCount: selectedConversation?.conversationId === conversationId ? 0 : (conv.unreadCount || 0) + 1,
                    };
                }
                return conv;
            });

            if (!conversationExists) {
                console.log('📝 [VendorMessagesContent] New conversation detected, creating conversation object...');
                const newMessage = {
                    id: message._id,
                    text: message.content,
                    content: message.content,
                    sender: 'contact',
                    timestamp: new Date(message.createdAt).toLocaleTimeString(),
                    isRead: true,
                    messageType: message.messageType,
                    originalFileName: message.originalFileName
                };
                
                const newConversation = {
                    id: conversationId,
                    conversationId,
                    name: message.sender?.customerProfile?.fullName || 'Unknown Customer',
                    type: 'Customer',
                    avatar: message.sender?.customerProfile?.profileImage || '/logo.png',
                    isOnline: true,
                    lastMessage: message.messageType === 'image' ? 
                      (message.content && message.content.startsWith('[') ? '📷 Multiple Images' : '📷 Image') : 
                      (message.messageType === 'document' ? 
                        (message.originalFileName || '📄 Document') : 
                        message.content),
                    lastMessageTime: new Date(message.createdAt).toLocaleTimeString(),
                    unreadCount: 1,
                    isTyping: false,
                    messages: [newMessage], // Include the current message
                    eventId: message.eventId,
                    otherUser: message.sender,
                };
                return [newConversation, ...prev];
            }
            return updatedConversations;
        });
    }, [selectedConversation]);

    const handleMessageSent = useCallback((data) => {
        console.log('✅ [VendorMessagesContent] Real-time message sent:', data);
        const { message, conversationId } = data;

        setSelectedConversation(prev => {
            if (prev && prev.conversationId === conversationId) {
                const newMessage = {
                    id: message._id,
                    text: message.content,
                    content: message.content, // Keep the original content for proper parsing
                    sender: 'user',
                    timestamp: new Date(message.createdAt).toLocaleTimeString(),
                    isRead: false,
                    messageType: message.messageType,
                    originalFileName: message.originalFileName
                };
                const messageExists = prev.messages.some(msg => msg.id === message._id);
                if (!messageExists) {
                    return {
                        ...prev,
                        messages: [...prev.messages, newMessage],
                    };
                }
            }
            return prev;
        });

        setConversations(prev =>
            prev.map(conv => {
                if (conv.conversationId === conversationId) {
                    return {
                        ...conv,
                        lastMessage: message.messageType === 'image' ? 
                          (message.content && message.content.startsWith('[') ? '📷 Multiple Images' : '📷 Image') : 
                          (message.messageType === 'document' ? 
                            (message.originalFileName || '📄 Document') : 
                            message.content),
                        lastMessageTime: new Date(message.createdAt).toLocaleTimeString(),
                        unreadCount: 0,
                        isSending: false // Clear sending status
                    };
                }
                return conv;
            })
        );

        // Show success toast for socket messages (only for images/docs)
        if (message.messageType !== 'text') {
          toast.success('Message sent!');
        }
    }, []);

    useEffect(() => {
        if (token) {
            console.log('🔌 [VendorMessagesContent] Setting up socket listeners');
            socketService.onNewMessage(handleNewMessage);
            socketService.onMessageSent(handleMessageSent);
    
            return () => {
                console.log('🔌 [VendorMessagesContent] Cleaning up socket listeners');
                socketService.offNewMessage();
                socketService.offMessageSent();
            };
        }
    }, [token, handleNewMessage, handleMessageSent]);

  // Connect to socket and fetch conversations on component mount
  useEffect(() => {
    // Fetch conversations only once
    fetchConversations();
    
    // Setup socket connection
    if (token) {
      console.log('🔌 [VendorMessagesContent] Connecting to socket with token:', !!token);
      
      // Test backend connectivity first
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/health`)
        .then(response => {
          console.log('✅ [VendorMessagesContent] Backend is reachable:', response.status);
        })
        .catch(error => {
          console.error('❌ [VendorMessagesContent] Backend not reachable:', error);
        });
      
      // Connect to socket with retry logic
      const connectSocket = () => {
        socketService.connect(token);
        
        // Check connection status after a delay
        setTimeout(() => {
          const status = socketService.getConnectionStatus();
          console.log('🔌 [VendorMessagesContent] Socket connection status:', status);
          
          // If not connected, try again
          if (!status.connected && status.hasToken) {
            console.log('🔄 [VendorMessagesContent] Socket not connected, retrying...');
            setTimeout(() => {
              socketService.connect(token);
            }, 2000);
          }
        }, 3000);
      };
      
      connectSocket();
      
      // Set up real-time message handlers
      socketService.onMessageError(handleMessageError);
      socketService.onUserTyping(handleUserTyping);
      socketService.onUserStoppedTyping(handleUserStoppedTyping);
      socketService.onMessagesRead(handleMessagesRead);
    } else {
      console.log('❌ [VendorMessagesContent] No user token available for socket connection');
    }
    
    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [token]);

  const fetchConversations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getConversations();
      console.log('📋 [VendorMessagesContent] API response:', response);
      if (response.status === 'success') {
        // Transform the API response to match the expected format
        const transformedConversations = response.data.conversations.map(conv => ({
          id: conv._id || conv.conversationId,
          conversationId: conv.conversationId,
          name: conv.otherUser?.name || 'Unknown Customer',
          type: conv.otherUser?.role === 'customer' ? 'Customer' : 'Contact',
          avatar: conv.event?.imageUrls?.[0] || '/logo.png',
          isOnline: false,
          lastMessage: conv.lastMessage?.content || 'No messages yet',
          lastMessageTime: conv.lastMessage?.createdAt ? 
            new Date(conv.lastMessage.createdAt).toLocaleTimeString() : 'Now',
          unreadCount: conv.unreadCount || 0,
          isTyping: false,
          messages: [], // We'll load messages when conversation is selected
          eventId: conv.eventId,
          otherUser: conv.otherUser
        }));
        
        console.log('📋 [VendorMessagesContent] Transformed conversations:', transformedConversations);
        setConversations(transformedConversations);
      } else {
        setError(response.message || 'Failed to fetch conversations');
      }
    } catch (err) {
      console.error('❌ [VendorMessagesContent] Error fetching conversations:', err);
      setError(err.message || 'An error occurred while fetching conversations');
    } finally {
      setIsLoading(false);
    }
  };

  // Add new conversation to the list
  const addConversationToList = (conversation) => {
    console.log('📝 [VendorMessagesContent] Adding new conversation to list:', conversation);
    setConversations(prev => {
      // Check if conversation already exists
      const exists = prev.find(conv => conv.conversationId === conversation.conversationId);
      if (!exists) {
        console.log('✅ [VendorMessagesContent] Adding new conversation to list');
        return [conversation, ...prev];
      } else {
        console.log('📝 [VendorMessagesContent] Conversation already exists in list, updating...');
        // Update existing conversation
        return prev.map(conv => 
          conv.conversationId === conversation.conversationId 
            ? { ...conv, ...conversation }
            : conv
        );
      }
    });
  };

  const handleConversationSelect = async (conversation) => {
    try {
      console.log('🔍 [VendorMessagesContent] Selecting conversation:', conversation);
      
      // If conversation already has messages, use them
      if (conversation.messages && conversation.messages.length > 0) {
        console.log('✅ [VendorMessagesContent] Conversation already has messages, using existing');
        setSelectedConversation(conversation);
        return;
      }
      
      // Load messages for this conversation
      if (conversation.eventId && conversation.otherUser?._id) {
        console.log('🔍 [VendorMessagesContent] Loading messages via event-based API');
        const response = await apiService.getConversation(conversation.eventId, conversation.otherUser._id);
        if (response.status === 'success') {
          const conversationWithMessages = {
            ...conversation,
            messages: response.data.messages.map(msg => ({
              id: msg._id,
              text: msg.content,
              content: msg.content, // Keep the original content for proper parsing
              sender: msg.sender._id === conversation.otherUser._id || msg.sender === conversation.otherUser._id ? 'contact' : 'user',
              timestamp: new Date(msg.createdAt).toLocaleTimeString(),
              isRead: msg.isRead,
              messageType: msg.messageType,
              originalFileName: msg.originalFileName
            }))
          };
          setSelectedConversation(conversationWithMessages);
        } else {
          setSelectedConversation(conversation);
        }
      } else if (conversation.otherUser?._id) {
        // From vendor's perspective, otherUser is the customer
        const customerId = conversation.otherUser._id;
        if (!customerId || typeof customerId !== 'string' || customerId.length !== 24) {
          console.error('❌ [VendorMessagesContent] Invalid customer ID:', customerId);
          setSelectedConversation(conversation);
          return;
        }

        // Use customer conversation API (vendor talking to customer)
        console.log('🔍 [VendorMessagesContent] Loading messages via customer conversation API for customer:', customerId);
        try {
          const response = await apiService.getCustomerConversation(customerId);
          if (response.status === 'success') {
            const conversationWithMessages = {
              ...conversation,
              messages: response.data.messages.map(msg => ({
                id: msg._id,
                text: msg.content,
                content: msg.content,
                sender: msg.sender._id === customerId || msg.sender === customerId ? 'contact' : 'user',
                timestamp: new Date(msg.createdAt).toLocaleTimeString(),
                isRead: msg.isRead,
                messageType: msg.messageType,
                originalFileName: msg.originalFileName
              }))
            };
            setSelectedConversation(conversationWithMessages);
          } else {
            console.warn('⚠️ [VendorMessagesContent] Customer conversation not successful:', response);
            setSelectedConversation(conversation);
          }
        } catch (error) {
          console.error('❌ [VendorMessagesContent] Error loading customer conversation:', error);
          
          // If customer not found, remove this conversation from the list
          if (error.message && (error.message.includes('Customer not found') || error.message.includes('User is not a customer'))) {
            console.log('🗑️ [VendorMessagesContent] Removing invalid conversation with deleted customer');
            setConversations(prev => prev.filter(conv => 
              conv.conversationId !== conversation.conversationId
            ));
            setSelectedConversation(null);
            toast.error('This conversation is no longer available. The customer may have been removed.');
          } else {
            setSelectedConversation(conversation);
          }
        }
      } else {
        console.log('⚠️ [VendorMessagesContent] No eventId or otherUser, using conversation as-is');
        setSelectedConversation(conversation);
      }
    } catch (error) {
      console.error('❌ [VendorMessagesContent] Error loading conversation messages:', error);
      setSelectedConversation(conversation);
    }
  };

  const handleSendMessage = async (messageText, imageFiles = null) => {
    if (!selectedConversation) return;

    try {
        console.log('📤 [VendorMessagesContent] Sending message. Text:', messageText, 'Images:', imageFiles);
        console.log('📤 [VendorMessagesContent] Selected conversation:', selectedConversation);

        if (selectedConversation.eventId && selectedConversation.otherUser?._id) {
            socketService.stopTyping(selectedConversation.otherUser._id, selectedConversation.eventId);
        }

        const receiverId = selectedConversation.otherUser?._id;
        const eventId = selectedConversation.eventId; // This can be null for vendor-only conversations

        let messageData;
        let isSocketMessage = false;

        if (imageFiles) {
            messageData = new FormData();
            messageData.append('receiverId', receiverId);
            if (eventId) {
                messageData.append('eventId', eventId);
            }
            
            // Handle multiple files
            if (Array.isArray(imageFiles)) {
              imageFiles.forEach((file, index) => {
                messageData.append('images', file);
              });
            } else {
              messageData.append('images', imageFiles);
            }
            
            console.log('📤 [VendorMessagesContent] Sending images via API');
        } else {
            messageData = {
                receiverId,
                content: messageText
            };
            // Add eventId only if it exists (for backward compatibility)
            if (eventId) {
                messageData.eventId = eventId;
            }
            isSocketMessage = true;
            console.log('📤 [VendorMessagesContent] Sending text via Socket.IO');
        }

        const socketStatus = socketService.getConnectionStatus();
        console.log('🔍 [VendorMessagesContent] Socket status before sending:', socketStatus);

        let sent = false;

        if (isSocketMessage && socketStatus.connected) {
            sent = socketService.sendMessage(messageData);
            console.log('📤 [VendorMessagesContent] Socket send result:', sent);
        }

        if (sent) {
            // For socket messages, don't add optimistically - wait for confirmation
            // Only update the conversation list to show "sending" state temporarily
            setConversations(prev =>
                prev.map(conv =>
                    conv.conversationId === selectedConversation.conversationId
                        ? { ...conv, lastMessage: messageText, lastMessageTime: 'Sending...', unreadCount: 0, isSending: true }
                        : conv
                )
            );
            
            // Don't show toast for socket messages - wait for confirmation
            console.log('📤 [VendorMessagesContent] Socket message sent, waiting for confirmation');
        } else {
            console.log('📤 [VendorMessagesContent] Using API to send message');

            const response = await apiService.sendMessage(messageData, !!imageFiles);

            if (response.status === 'success') {
                // Immediately update conversation to clear sending status
                setConversations(prev => 
                    prev.map(conv => 
                        conv.conversationId === selectedConversation.conversationId 
                            ? { 
                                ...conv, 
                                lastMessage: imageFiles ? (Array.isArray(imageFiles) ? '📷 Multiple Images' : '📷 Image') : messageText,
                                lastMessageTime: new Date().toLocaleTimeString(),
                                unreadCount: 0,
                                isSending: false
                            }
                            : conv
                    )
                );
                // Only show toast for images/docs
                if (imageFiles) {
                    toast.success('Message sent!');
                }
            } else {
                // Clear sending status on error
                setConversations(prev => 
                    prev.map(conv => 
                        conv.conversationId === selectedConversation.conversationId 
                            ? { ...conv, isSending: false }
                            : conv
                    )
                );
                toast.error(response.message || 'Failed to send message');
            }
        }
    } catch (error) {
        console.error('Error sending message:', error);
        // Clear sending status on error
        setConversations(prev => 
            prev.map(conv => 
                conv.conversationId === selectedConversation?.conversationId 
                    ? { ...conv, isSending: false }
                    : conv
            )
        );
        toast.error('Failed to send message');
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    if (!conversationId) return;

    try {
      console.log('🗑️ [VendorMessagesContent] Deleting conversation:', conversationId);
      
      const response = await apiService.deleteConversation(conversationId);
      
      if (response.status === 'success') {
        // Remove conversation from list
        setConversations(prev => prev.filter(conv => conv.conversationId !== conversationId));
        
        // Clear selected conversation if it's the one being deleted
        if (selectedConversation?.conversationId === conversationId) {
          setSelectedConversation(null);
        }
        
        toast.success('Conversation deleted successfully!');
      } else {
        toast.error(response.message || 'Failed to delete conversation');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  // Real-time message handlers
  const handleMessageError = (data) => {
    console.error('❌ [VendorMessagesContent] Real-time message error:', data);
    toast.error(data.message || 'Failed to send message');
  };

  const handleUserTyping = (data) => {
    console.log('⌨️ [VendorMessagesContent] User typing:', data);
    
    // Only show typing indicator if it's not the current user
    if (data.userId !== user?._id && data.userId !== user?.id) {
      // Update selected conversation to show typing indicator
      setSelectedConversation(prev => {
        if (prev && prev.eventId === data.eventId) {
          return {
            ...prev,
            isTyping: true,
            typingUser: data.userId
          };
        }
        return prev;
      });
    }
  };

  const handleUserStoppedTyping = (data) => {
    console.log('⏹️ [VendorMessagesContent] User stopped typing:', data);
    
    // Only hide typing indicator if it's not the current user
    if (data.userId !== user?._id && data.userId !== user?.id) {
      // Update selected conversation to hide typing indicator
      setSelectedConversation(prev => {
        if (prev && prev.eventId === data.eventId) {
          return {
            ...prev,
            isTyping: false,
            typingUser: null
          };
        }
        return prev;
      });
    }
  };

  const handleMessagesRead = (data) => {
    console.log('👁️ [VendorMessagesContent] Messages read:', data);
    
    // Update messages to show as read
    setSelectedConversation(prev => {
      if (prev && prev.conversationId === data.conversationId) {
        return {
          ...prev,
          messages: prev.messages.map(msg => ({
            ...msg,
            isRead: true
          }))
        };
      }
      return prev;
    });
  };

  // Handle typing start
  const handleTypingStart = (eventId, receiverId) => {
    console.log('⌨️ [VendorMessagesContent] Starting typing indicator for:', receiverId);
    socketService.startTyping(receiverId, eventId);
  };

  // Handle typing stop
  const handleTypingStop = (eventId, receiverId) => {
    console.log('⏹️ [VendorMessagesContent] Stopping typing indicator for:', receiverId);
    socketService.stopTyping(receiverId, eventId);
  };



  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        height: 'calc(100vh - 120px)',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        margin: '20px',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        color: '#666'
      }}>
        Loading conversations...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 120px)',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        margin: '20px',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px'
      }}>
        <div style={{ fontSize: '16px', color: '#d32f2f' }}>
          Error: {error}
        </div>
        <button 
          onClick={fetchConversations}
          style={{
            padding: '8px 16px',
            background: '#AF8EBA',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 120px)', // Adjust for top bar and padding
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      overflow: 'hidden',
      margin: '20px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}>
      <MessageSidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        onConversationSelect={handleConversationSelect}
      />
      <ChatArea
        conversation={selectedConversation}
        onSendMessage={handleSendMessage}
        onDeleteConversation={handleDeleteConversation}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
      />
    </div>
  );
}
