'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import MessageSidebar from '../../components/Messages/MessageSidebar';
import ChatArea from '../../components/Messages/ChatArea';
import styles from './MessagesContent.module.css';
import apiService from '../../utils/api';
import socketService from '../../utils/socketService';
import { toast } from 'react-toastify';
import { useUserStore } from '../../state/userStore';

export default function MessagesContent() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const searchParams = useSearchParams();
  const { user, token } = useUserStore();
  
  // Check for URL parameters to initialize specific conversation
  const eventId = searchParams.get('eventId');
  const vendorId = searchParams.get('vendorId');

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile navigation handlers
  const handleMobileChatSelect = (conversation) => {
    if (isMobileView) {
      // For mobile, we need to load messages first, then show the chat
      handleConversationSelect(conversation).then(() => {
        setShowChatList(false);
      });
    } else {
      handleConversationSelect(conversation);
    }
  };

  const handleMobileBackToChats = () => {
    setShowChatList(true);
    setSelectedConversation(null);
  };

    const handleNewMessage = useCallback((data) => {
        console.log('📨 [MessagesContent] Real-time new message:', data);
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
                console.log('📝 [MessagesContent] New conversation detected, creating conversation object...');
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
                    name: message.sender?.vendorProfile?.businessName || 'Unknown Vendor',
                    type: 'Company',
                    avatar: message.sender?.vendorProfile?.profileImage || '/logo.png',
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
        console.log('✅ [MessagesContent] Real-time message sent:', data);
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
            console.log('🔌 [MessagesContent] Setting up socket listeners');
            socketService.onNewMessage(handleNewMessage);
            socketService.onMessageSent(handleMessageSent);
            // ... other listeners are assumed to be simple and not need useCallback
    
            return () => {
                console.log('🔌 [MessagesContent] Cleaning up socket listeners');
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
      console.log('🔌 [MessagesContent] Connecting to socket with token:', !!token);
      
      // Test backend connectivity first
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/health`)
        .then(response => {
          console.log('✅ [MessagesContent] Backend is reachable:', response.status);
        })
        .catch(error => {
          console.error('❌ [MessagesContent] Backend not reachable:', error);
        });
      
      // Connect to socket with retry logic
      const connectSocket = () => {
        socketService.connect(token);
        
        // Check connection status after a delay
        setTimeout(() => {
          const status = socketService.getConnectionStatus();
          console.log('🔌 [MessagesContent] Socket connection status:', status);
          
          // If not connected, try again
          if (!status.connected && status.hasToken) {
            console.log('🔄 [MessagesContent] Socket not connected, retrying...');
            setTimeout(() => {
              socketService.connect(token);
            }, 2000);
          }
        }, 3000);
      };
      
      connectSocket();
      
      // Set up real-time message handlers that don't depend on component state
      socketService.onMessageError(handleMessageError);
      socketService.onUserTyping(handleUserTyping);
      socketService.onUserStoppedTyping(handleUserStoppedTyping);
      socketService.onMessagesRead(handleMessagesRead);
    } else {
      console.log('❌ [MessagesContent] No user token available for socket connection');
    }
    
    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [token]);

  // Initialize specific conversation if URL parameters are provided
  useEffect(() => {
    console.log('🔍 [MessagesContent] URL params:', { eventId, vendorId, isLoading });
    if (vendorId && !isLoading) {
      console.log('🚀 [MessagesContent] Initializing conversation with:', { eventId, vendorId });
      initializeSpecificConversation();
    }
  }, [eventId, vendorId, isLoading]);

  const fetchConversations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getConversations();
      console.log('📋 [MessagesContent] API response:', response);
      if (response.status === 'success') {
        // Transform the API response to match the expected format
        const transformedConversations = response.data.conversations.map(conv => ({
          id: conv._id || conv.conversationId,
          conversationId: conv.conversationId,
          name: conv.otherUser?.name || 'Unknown Vendor',
          type: conv.otherUser?.role === 'vendor' ? 'Company' : 'Contact',
          avatar: conv.event?.imageUrls?.[0] || '/logo.png',
          isOnline: false,
          lastMessage: conv.lastMessage?.content || 'No messages yet',
          lastMessageTime: conv.lastMessage?.createdAt ? 
            new Date(conv.lastMessage.createdAt).toLocaleTimeString() : 'Now',
          unreadCount: conv.unreadCount || 0,
          isTyping: false,
          messages: [], // We'll load messages when conversation is selected
          eventId: conv.eventId,
          otherUser: {
            ...conv.otherUser,
            profileImage: conv.otherUser?.profileImage
          }
        }));
        
        console.log('📋 [MessagesContent] Transformed conversations:', transformedConversations);
        setConversations(transformedConversations || []);
      } else {
        setError(response.message || 'Failed to fetch conversations');
      }
    } catch (err) {
      console.error('❌ [MessagesContent] Error fetching conversations:', err);
      setError(err.message || 'An error occurred while fetching conversations');
    } finally {
      setIsLoading(false);
    }
  };

  // Add new conversation to the list
  const addConversationToList = (conversation) => {
    console.log('📝 [MessagesContent] Adding new conversation to list:', conversation);
    setConversations(prev => {
      // Check if conversation already exists
      const exists = prev.find(conv => conv.conversationId === conversation.conversationId);
      if (!exists) {
        console.log('✅ [MessagesContent] Adding new conversation to list');
        return [conversation, ...prev];
      } else {
        console.log('📝 [MessagesContent] Conversation already exists in list, updating...');
        // Update existing conversation
        return prev.map(conv => 
          conv.conversationId === conversation.conversationId 
            ? { ...conv, ...conversation }
            : conv
        );
      }
    });
  };

  const initializeSpecificConversation = async () => {
    try {
      console.log('🔍 [MessagesContent] Starting conversation initialization');
      
      // Check if we have both eventId and vendorId
      if (!vendorId) {
        console.log('❌ [MessagesContent] Missing vendorId:', { eventId, vendorId });
        toast.error('Missing required parameters for conversation');
        return;
      }
      
      // First, try to get existing conversation with this vendor
      let response;
      let existingConversation = null;
      
      // Check if there's already a conversation with this vendor in the conversations list
      const existingConv = conversations.find(conv => 
        conv.otherUser?._id === vendorId || conv.vendorId === vendorId
      );
      
      if (existingConv) {
        console.log('✅ [MessagesContent] Found existing conversation with vendor:', existingConv);
        existingConversation = existingConv;
      } else {
        // Try to get conversation from API
        try {
          console.log('🔍 [MessagesContent] Trying to get existing conversation from API');
          if (eventId) {
            response = await apiService.getConversation(eventId, vendorId);
          } else {
            response = await apiService.getVendorConversation(vendorId);
          }
          console.log('✅ [MessagesContent] Existing conversation found:', response);
        } catch (error) {
          // If conversation doesn't exist, we'll create a new one
          console.log('📝 [MessagesContent] No existing conversation found, creating new one');
          response = null;
        }
      }

      // Get vendor and event details
      let vendorName = 'Vendor';
      let eventName = 'Event';
      let eventImage = '/logo.png';
      let vendorProfileImage = null;

      // If we found an existing conversation, use its details
      if (existingConversation) {
        vendorName = existingConversation.name;
        eventName = existingConversation.eventName || 'Event';
        eventImage = existingConversation.avatar || '/logo.png';
        console.log('✅ [MessagesContent] Using existing conversation details');
      } else if (response && response.status === 'success') {
        // Use details from API response
        vendorName = response.data.otherUser.name;
        eventName = response.data.event?.name || 'General Conversation';
        eventImage = response.data.event?.imageUrls?.[0] || '/logo.png';
        vendorProfileImage = response.data.otherUser.profileImage;
      } else {
        // If no existing conversation, try to get vendor details directly
        try {
          const vendorResponse = await apiService.getVendorConversation(vendorId);
          if (vendorResponse.status === 'success') {
            vendorName = vendorResponse.data.otherUser.name;
            eventName = 'General Conversation'; // No specific event for vendor-only conversations
            eventImage = '/logo.png';
            vendorProfileImage = vendorResponse.data.otherUser.profileImage;
          }
        } catch (vendorError) {
          console.error('Error fetching vendor details:', vendorError);
          vendorName = 'Vendor';
          eventName = 'General Conversation';
          eventImage = '/logo.png';
          vendorProfileImage = null;
        }
      }

      // Generate proper conversation ID (vendor-only format)
      const generateConversationId = (user1Id, user2Id, eventId = null) => {
        const sortedIds = [user1Id.toString(), user2Id.toString()].sort();
        if (eventId) {
          return `${sortedIds[0]}_${sortedIds[1]}_${eventId.toString()}`;
        }
        return `${sortedIds[0]}_${sortedIds[1]}`;
      };

      // Get current user ID from user store
      const currentUserId = user?._id || user?.id;
      
      if (!currentUserId) {
        console.error('❌ [MessagesContent] No current user ID available');
        toast.error('User information not available');
        return;
      }
      
      // Use existing conversation or create a new one
      let conversation;
      
      if (existingConversation) {
        // Use the existing conversation but load fresh messages
        conversation = existingConversation;
        console.log('✅ [MessagesContent] Using existing conversation:', conversation);
        
        // Load fresh messages for the existing conversation
        try {
          const messagesResponse = await apiService.getVendorConversation(vendorId);
          if (messagesResponse.status === 'success') {
            conversation = {
              ...conversation,
              messages: messagesResponse.data.messages.map(msg => ({
                id: msg._id,
                text: msg.content,
                content: msg.content,
                sender: msg.sender._id === vendorId || msg.sender === vendorId ? 'contact' : 'user',
                timestamp: new Date(msg.createdAt).toLocaleTimeString(),
                isRead: msg.isRead,
                messageType: msg.messageType,
                originalFileName: msg.originalFileName
              }))
            };
            console.log('✅ [MessagesContent] Loaded fresh messages for existing conversation');
            
            // Update the conversation in the list with fresh messages
            const updatedConversations = conversations.map(conv => 
              conv.id === conversation.id ? conversation : conv
            );
            setConversations(updatedConversations);
          }
        } catch (messagesError) {
          console.error('Error loading messages for existing conversation:', messagesError);
        }
      } else {
        // Create a new conversation object for vendor-only conversation
        conversation = {
          id: generateConversationId(currentUserId, vendorId),
          conversationId: generateConversationId(currentUserId, vendorId),
          name: vendorName,
          type: 'Company',
          avatar: eventImage,
          isOnline: false,
          lastMessage: response && response.data.messages.length > 0 
            ? response.data.messages[response.data.messages.length - 1].content 
            : 'Start a conversation',
          lastMessageTime: response && response.data.messages.length > 0 
            ? new Date(response.data.messages[response.data.messages.length - 1].createdAt).toLocaleTimeString()
            : 'Now',
          unreadCount: 0,
          isTyping: false,
          messages: response && response.data.messages ? response.data.messages.map(msg => ({
            id: msg._id,
            text: msg.content,
            content: msg.content,
            sender: msg.sender._id === vendorId || msg.sender === vendorId ? 'contact' : 'user',
            timestamp: new Date(msg.createdAt).toLocaleTimeString(),
            isRead: msg.isRead,
            messageType: msg.messageType
          })) : [],
          eventId: null, // No specific event for vendor-only conversations
          vendorId: vendorId,
          eventName: eventName,
          otherUser: {
            _id: vendorId,
            name: vendorName,
            role: 'vendor',
            profileImage: vendorProfileImage
          }
        };
      }
      
      console.log('✅ [MessagesContent] Created conversation object:', conversation);
      
      // Add this conversation to the conversations list if it's new
      if (!existingConversation) {
        addConversationToList(conversation);
      }
      
      setSelectedConversation(conversation);
      console.log('✅ [MessagesContent] Conversation initialized and selected');
    } catch (error) {
      console.error('Error initializing conversation:', error);
      toast.error('Failed to initialize conversation');
    }
  };

  const handleConversationSelect = async (conversation) => {
    try {
      console.log('🔍 [MessagesContent] Selecting conversation:', conversation);
      setLoadingMessages(true);
      
      // If conversation already has messages, use them
      if (conversation.messages && conversation.messages.length > 0) {
        console.log('✅ [MessagesContent] Conversation already has messages, using existing');
        setSelectedConversation(conversation);
        setLoadingMessages(false);
        return conversation;
      }
      
      // Load messages for this conversation
      if (conversation.eventId && conversation.otherUser?._id) {
        console.log('🔍 [MessagesContent] Loading messages via event-based API');
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
          return conversationWithMessages;
        } else {
          setSelectedConversation(conversation);
          return conversation;
        }
      } else if (conversation.otherUser?._id) {
        // Try vendor-only conversation API
        console.log('🔍 [MessagesContent] Loading messages via vendor-only API');
        try {
          const response = await apiService.getVendorConversation(conversation.otherUser._id);
          if (response.status === 'success') {
            const conversationWithMessages = {
              ...conversation,
              messages: response.data.messages.map(msg => ({
                id: msg._id,
                text: msg.content,
                content: msg.content,
                sender: msg.sender._id === conversation.otherUser._id || msg.sender === conversation.otherUser._id ? 'contact' : 'user',
                timestamp: new Date(msg.createdAt).toLocaleTimeString(),
                isRead: msg.isRead,
                messageType: msg.messageType,
                originalFileName: msg.originalFileName
              }))
            };
            setSelectedConversation(conversationWithMessages);
            return conversationWithMessages;
          } else {
            setSelectedConversation(conversation);
            return conversation;
          }
        } catch (error) {
          console.error('❌ [MessagesContent] Error loading vendor conversation:', error);
          setSelectedConversation(conversation);
        }
      } else {
        console.log('⚠️ [MessagesContent] No eventId or otherUser, using conversation as-is');
        setSelectedConversation(conversation);
        return conversation;
      }
    } catch (error) {
      console.error('❌ [MessagesContent] Error loading conversation messages:', error);
      setSelectedConversation(conversation);
      return conversation;
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (messageText, imageFiles = null) => {
    if (!selectedConversation) return;

    try {
      console.log('📤 [MessagesContent] Sending message. Text:', messageText, 'Images:', imageFiles);
      console.log('📤 [MessagesContent] Selected conversation:', selectedConversation);
      
      // Stop typing indicator when sending message (eventId now optional)
      if (selectedConversation.otherUser?._id) {
        socketService.stopTyping(selectedConversation.otherUser._id, selectedConversation.eventId);
      }
      
      const receiverId = selectedConversation.otherUser?._id || selectedConversation.vendorId;
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
        
        console.log('📤 [MessagesContent] Sending images via API');
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
        console.log('📤 [MessagesContent] Sending text via Socket.IO');
      }
      
      // Check socket connection status first
      const socketStatus = socketService.getConnectionStatus();
      console.log('🔍 [MessagesContent] Socket status before sending:', socketStatus);

      let sent = false;
      
      if (isSocketMessage && socketStatus.connected) {
        sent = socketService.sendMessage(messageData);
        console.log('📤 [MessagesContent] Socket send result:', sent);
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
        console.log('📤 [MessagesContent] Socket message sent, waiting for confirmation');
      } else {
        console.log('📤 [MessagesContent] Using API to send message');
        
        // Fallback to API if socket is not connected or for image uploads
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
      console.log('🗑️ [MessagesContent] Deleting conversation:', conversationId);
      
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

  // Real-time message handlers that don't depend on changing state
  const handleMessageError = (data) => {
    console.error('❌ [MessagesContent] Real-time message error:', data);
    toast.error(data.message || 'Failed to send message');
  };

  const handleUserTyping = (data) => {
    console.log('⌨️ [MessagesContent] User typing:', data);
    if (data.userId !== user?._id && data.userId !== user?.id) {
      setSelectedConversation(prev => {
        if (prev && prev.eventId === data.eventId) {
          return { ...prev, isTyping: true, typingUser: data.userId };
        }
        return prev;
      });
    }
  };

  const handleUserStoppedTyping = (data) => {
    console.log('⏹️ [MessagesContent] User stopped typing:', data);
    if (data.userId !== user?._id && data.userId !== user?.id) {
      setSelectedConversation(prev => {
        if (prev && prev.eventId === data.eventId) {
          return { ...prev, isTyping: false, typingUser: null };
        }
        return prev;
      });
    }
  };

  const handleMessagesRead = (data) => {
    console.log('👁️ [MessagesContent] Messages read:', data);
    setSelectedConversation(prev => {
      if (prev && prev.conversationId === data.conversationId) {
        return {
          ...prev,
          messages: prev.messages.map(msg => ({ ...msg, isRead: true }))
        };
      }
      return prev;
    });
  };

  // Handle typing start
  const handleTypingStart = (eventId, receiverId) => {
    console.log('⌨️ [MessagesContent] Starting typing indicator for:', receiverId);
    socketService.startTyping(receiverId, eventId);
  };

  // Handle typing stop
  const handleTypingStop = (eventId, receiverId) => {
    console.log('⏹️ [MessagesContent] Stopping typing indicator for:', receiverId);
    socketService.stopTyping(receiverId, eventId);
  };



  if (isLoading) {
    return (
      <div className={styles.messagesContainer}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          fontSize: 'clamp(14px, 2.5vw, 18px)',
          color: '#666'
        }}>
          Loading conversations...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.messagesContainer}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          gap: '16px'
        }}>
          <div style={{ fontSize: 'clamp(14px, 2.5vw, 18px)', color: '#d32f2f' }}>
            Error: {error}
          </div>
          <button 
            onClick={fetchConversations}
            style={{
              padding: 'clamp(6px, 1.5vw, 10px) clamp(12px, 2.5vw, 18px)',
              background: '#AF8EBA',
              color: 'white',
              border: 'none',
              borderRadius: 'clamp(4px, 1vw, 6px)',
              cursor: 'pointer',
              fontSize: 'clamp(12px, 2vw, 14px)'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Mobile view - show chat list or individual chat
  if (isMobileView) {
    if (showChatList) {
      return (
        <div className={styles.messagesContainer}>
          <MessageSidebar
            conversations={conversations}
            selectedConversation={selectedConversation}
            onConversationSelect={handleMobileChatSelect}
            isMobileView={true}
          />
        </div>
      );
    } else {
      return (
        <div style={{ 
          height: '100vh', 
          width: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          background: '#fff'
        }}>
          <ChatArea
            conversation={selectedConversation}
            onSendMessage={handleSendMessage}
            onDeleteConversation={handleDeleteConversation}
            onTypingStart={handleTypingStart}
            onTypingStop={handleTypingStop}
            onBackToChats={handleMobileBackToChats}
            isMobileView={true}
            loadingMessages={loadingMessages}
          />
        </div>
      );
    }
  }

  // Desktop view - show both sidebar and chat area
  return (
    <div className={styles.messagesContainer}>
      <MessageSidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        onConversationSelect={handleConversationSelect}
        isMobileView={false}
      />
      <ChatArea
        conversation={selectedConversation}
        onSendMessage={handleSendMessage}
        onDeleteConversation={handleDeleteConversation}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        isMobileView={false}
        loadingMessages={loadingMessages}
      />
    </div>
  );
}
