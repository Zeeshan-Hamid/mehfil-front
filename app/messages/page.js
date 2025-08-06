'use client';

import { useState } from 'react';
import styles from './MessagesPage.module.css';
import MessageSidebar from '../components/Messages/MessageSidebar';
import ChatArea from '../components/Messages/ChatArea';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: 'Bloom Decorations',
      type: 'Company',
      avatar: '/vendor_avatar_1.png',
      isOnline: true,
      lastMessage: 'Thank you ✨',
      lastMessageTime: '5min ago',
      unreadCount: 1,
      isTyping: true,
      messages: [
        {
          id: 1,
          text: 'hello',
          sender: 'user',
          timestamp: '5min ago',
          isRead: true
        },
        {
          id: 2,
          text: 'hello',
          sender: 'contact',
          timestamp: '5min ago',
          isRead: true
        },
        {
          id: 3,
          text: 'Can you send the file of Rayyan?',
          sender: 'contact',
          timestamp: '5min ago',
          isRead: true
        },
        {
          id: 4,
          text: 'Thank you ✨',
          sender: 'contact',
          timestamp: '5min ago',
          isRead: true
        }
      ]
    },
    {
      id: 2,
      name: 'Elegant Events',
      type: 'Company',
      avatar: '/vendor_avatar_2.png',
      isOnline: false,
      lastMessage: 'We can discuss the pricing',
      lastMessageTime: '1hr ago',
      unreadCount: 0,
      isTyping: false,
      messages: []
    },
    {
      id: 3,
      name: 'Royal Catering',
      type: 'Company',
      avatar: '/vendor_avatar_3.png',
      isOnline: true,
      lastMessage: 'Perfect! Looking forward to it',
      lastMessageTime: '2hr ago',
      unreadCount: 2,
      isTyping: false,
      messages: []
    },
    {
      id: 4,
      name: 'Dream Photography',
      type: 'Company',
      avatar: '/vendor_avatar_4.png',
      isOnline: false,
      lastMessage: 'The photos are ready',
      lastMessageTime: '1 day ago',
      unreadCount: 0,
      isTyping: false,
      messages: []
    }
  ]);

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleSendMessage = (messageText) => {
    if (!selectedConversation) return;

    const newMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: 'Just now',
      isRead: false
    };

    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: messageText,
          lastMessageTime: 'Just now',
          unreadCount: 0
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessage],
      lastMessage: messageText,
      lastMessageTime: 'Just now',
      unreadCount: 0
    });
  };

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <div className={styles.messagesContainer}>
        <MessageSidebar
          conversations={conversations}
          selectedConversation={selectedConversation}
          onConversationSelect={handleConversationSelect}
        />
        <ChatArea
          conversation={selectedConversation}
          onSendMessage={handleSendMessage}
        />
      </div>
      <Footer />
    </div>
  );
} 