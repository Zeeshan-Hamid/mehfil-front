'use client';

import { useState } from 'react';
import Avatar from '../Avatar/Avatar';
import styles from './MessageSidebar.module.css';

export default function MessageSidebar({ conversations = [], selectedConversation, onConversationSelect, isMobileView = false }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Ensure conversations is an array
  const safeConversations = Array.isArray(conversations) ? conversations : [];

  const filteredConversations = safeConversations.filter(conversation => {
    // Handle cases where conversation or conversation.name might be undefined
    const conversationName = conversation?.name || 'Unknown';
    const matchesSearch = conversationName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || 
      (activeFilter === 'unread' && (conversation?.unreadCount || 0) > 0);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className={`${styles.sidebar} ${isMobileView ? styles.mobileSidebar : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Messages</h2>
        {!isMobileView && (
          <button className={styles.composeButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <button 
          className={`${styles.filterButton} ${activeFilter === 'all' ? styles.active : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        <button 
          className={`${styles.filterButton} ${activeFilter === 'unread' ? styles.active : ''}`}
          onClick={() => setActiveFilter('unread')}
        >
          Unread
        </button>
      </div>

      {/* Search */}
      <div className={styles.searchContainer}>
        <div className={styles.searchInput}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchField}
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className={styles.conversationList}>
        {filteredConversations.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#AF8EBA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>No conversations</h3>
            <p className={styles.emptySubtitle}>Start a conversation to see messages here</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation?.id || Math.random()}
              className={`${styles.conversationItem} ${
                selectedConversation?.id === conversation?.id ? styles.selected : ''
              }`}
              onClick={() => onConversationSelect(conversation)}
            >
              <div className={styles.avatarContainer}>
                <Avatar 
                  user={{
                    name: conversation?.name || 'Unknown',
                    profileImage: conversation?.otherUser?.profileImage || conversation?.avatar
                  }}
                  size="medium"
                  showOnlineIndicator={true}
                  isOnline={conversation?.isOnline || false}
                />
              </div>
              
              <div className={styles.conversationInfo}>
                <div className={styles.conversationHeader}>
                  <div className={styles.nameAndType}>
                    <h3 className={styles.conversationName}>{conversation?.name || 'Unknown'}</h3>
                    <span className={styles.conversationType}>{conversation?.type || 'Contact'}</span>
                  </div>
                  <div className={styles.timeAndBadge}>
                    <span className={`${styles.lastMessageTime} ${conversation?.isSending ? styles.sending : ''}`}>
                      {conversation?.lastMessageTime || 'Now'}
                    </span>
                    {(conversation?.unreadCount || 0) > 0 && (
                      <div className={styles.unreadBadge}>
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={styles.conversationPreview}>
                  {conversation?.isTyping ? (
                    <span className={styles.typingIndicator}>Typing...</span>
                  ) : (
                    <span className={styles.lastMessage}>{conversation?.lastMessage || 'No messages yet'}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 