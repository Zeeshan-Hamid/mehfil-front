'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ChatArea.module.css';
import { optimizeImageForChat, validateImageForChat, createImagePreview, cleanupImagePreview } from '../../utils/imageOptimizer';
import FileTypeDropdown from './FileTypeDropdown';
import { toast } from 'react-toastify';

export default function ChatArea({ conversation, onSendMessage, onDeleteConversation, onTypingStart, onTypingStop, onBackToChats, isMobileView = false, loadingMessages = false }) {
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedImageUrls, setSelectedImageUrls] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingStartTimeoutRef = useRef(null);
  const imageInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const attachButtonRef = useRef(null);

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
    
    // Add keyboard event listener for image navigation
    const handleKeyDownEvent = (e) => {
      if (selectedImage) {
        handleKeyDown(e);
      }
    };
    
    document.addEventListener('keydown', handleKeyDownEvent);
    
    return () => {
      setIsMounted(false);
      // Clean up any image previews to prevent memory leaks
      if (sendingMessage?.content && sendingMessage.content.startsWith('blob:')) {
        cleanupImagePreview(sendingMessage.content);
      }
      document.removeEventListener('keydown', handleKeyDownEvent);
    };
  }, [sendingMessage, selectedImage, selectedImageIndex, selectedImageUrls]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current && isMounted) {
      try {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          if (messagesContainerRef.current) {
            if (messagesContainerRef.current.scrollTo) {
              messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: 'smooth'
              });
            } else {
              // Fallback for older browsers
              messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
          }
        }, 100);
      } catch (error) {
        console.warn('Scroll to bottom failed:', error);
      }
    }
  };

  useEffect(() => {
    if (isMounted) {
      scrollToBottom();
    }
  }, [conversation?.messages, isMounted]);

  // Clear sending indicator when the real message appears
  useEffect(() => {
    if (sendingMessage && conversation?.messages) {
      const realMessageExists = conversation.messages.some(msg => 
        (msg.text === sendingMessage.text || msg.content === sendingMessage.content) &&
        msg.sender === 'user' && 
        msg.timestamp !== 'Sending...'
      );
      
      if (realMessageExists) {
        setSendingMessage(null);
      }
    }
  }, [conversation?.messages, sendingMessage]);

  // Scroll to bottom when typing indicator appears
  useEffect(() => {
    if ((conversation?.isTyping || isTyping) && isMounted) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [conversation?.isTyping, isTyping, isMounted]);

  // Send typing start event
  const sendTypingStart = () => {
    if (onTypingStart && conversation?.eventId && conversation?.otherUser?._id) {
      onTypingStart(conversation.eventId, conversation.otherUser._id);
    }
  };

  // Send typing stop event
  const sendTypingStop = () => {
    if (onTypingStop && conversation?.eventId && conversation?.otherUser?._id) {
      onTypingStop(conversation.eventId, conversation.otherUser._id);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageText.trim() && onSendMessage) {
      console.log('📤 [ChatArea] Sending text message:', messageText.trim());
      // Show sending indicator
      const tempMessage = {
        id: `sending_${Date.now()}`,
        text: messageText.trim(),
        sender: 'user',
        timestamp: 'Sending...',
        isSending: true
      };
      setSendingMessage(tempMessage);
      
      onSendMessage(messageText.trim());
      setMessageText('');
      
      // Scroll to bottom to show sending indicator
      setTimeout(() => {
        if (isMounted) {
          scrollToBottom();
        }
      }, 50);
      
      // Clear sending indicator after a delay (in case socket confirmation doesn't come)
      setTimeout(() => {
        setSendingMessage(null);
      }, 5000);
    }
  };

  const handleImageSend = (file) => {
    if (file && onSendMessage) {
        console.log('📤 [ChatArea] Sending image file:', file.name);
        
        // Create preview URL for the sending indicator
        const previewUrl = createImagePreview(file);
        
        const tempMessage = {
            id: `sending_${Date.now()}`,
            content: previewUrl,
            type: 'image',
            sender: 'user',
            timestamp: 'Sending...',
            isSending: true
        };
        setSendingMessage(tempMessage);

        onSendMessage(null, file); // Pass null for text, and the file object

        setTimeout(() => {
            if (isMounted) {
                scrollToBottom();
            }
        }, 50);

        setTimeout(() => {
            setSendingMessage(null);
            // Clean up the preview URL
            cleanupImagePreview(previewUrl);
        }, 10000); // Longer timeout for image uploads
    }
  };

  const handleDocumentSend = (file) => {
    if (file && onSendMessage) {
        console.log('📤 [ChatArea] Sending document file:', file.name);
        const tempMessage = {
            id: `sending_${Date.now()}`,
            content: file.name,
            type: 'document',
            sender: 'user',
            timestamp: 'Sending...',
            isSending: true
        };
        setSendingMessage(tempMessage);

        onSendMessage(null, file); // Pass null for text, and the file object

        setTimeout(() => {
            if (isMounted) {
                scrollToBottom();
            }
        }, 50);

        setTimeout(() => {
            setSendingMessage(null);
        }, 10000); // Longer timeout for document uploads
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        try {
          const validation = validateImageForChat(file);
          if (!validation.isValid) {
            console.error('❌ [ChatArea] Image validation failed:', validation.message);
            return;
          }
          console.log('🔄 [ChatArea] Optimizing image before upload...');
          const optimizedFile = await optimizeImageForChat(file);
          handleImageSend(optimizedFile);
        } catch (error) {
          console.error('❌ [ChatArea] Error processing image:', error);
        }
      } else {
        handleDocumentSend(file);
      }
    }
  };

  const handleImageFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Check if more than 4 images are selected
      if (files.length > 4) {
        console.error('❌ [ChatArea] Too many images selected. Maximum allowed is 4.');
        toast.error(`You selected ${files.length} images. You can only select up to 4 images at a time.`);
        // Clear the input so user can try again
        e.target.value = '';
        return;
      }

      try {
        // Process each image file
        const processedFiles = [];
        for (const file of files) {
          const validation = validateImageForChat(file);
          if (!validation.isValid) {
            console.error('❌ [ChatArea] Image validation failed:', validation.message);
            toast.error(`Invalid file: ${file.name}. ${validation.message}`);
            continue; // Skip invalid files
          }
          console.log('🔄 [ChatArea] Optimizing image before upload...');
          const optimizedFile = await optimizeImageForChat(file);
          processedFiles.push(optimizedFile);
        }
        
        if (processedFiles.length > 0) {
          handleMultipleImageSend(processedFiles);
        } else {
          toast.error('No valid images were selected. Please try again.');
        }
      } catch (error) {
        console.error('❌ [ChatArea] Error processing images:', error);
        toast.error('Error processing images. Please try again.');
      }
    }
  };

  const handleMultipleImageSend = (files) => {
    if (files.length > 0 && onSendMessage) {
      console.log('📤 [ChatArea] Sending multiple image files:', files.length);
      
      // Create preview URLs for the sending indicator
      const previewUrls = files.map(file => createImagePreview(file));
      
      const tempMessage = {
        id: `sending_${Date.now()}`,
        content: JSON.stringify(previewUrls),
        type: 'multiple-images',
        sender: 'user',
        timestamp: 'Sending...',
        isSending: true
      };
      setSendingMessage(tempMessage);

      onSendMessage(null, files); // Pass null for text, and the files array

      // Show success message
      toast.success(`Uploading ${files.length} image${files.length > 1 ? 's' : ''}...`);

      setTimeout(() => {
        if (isMounted) {
          scrollToBottom();
        }
      }, 50);

      setTimeout(() => {
        setSendingMessage(null);
        // Clean up the preview URLs
        previewUrls.forEach(url => cleanupImagePreview(url));
      }, 15000); // Longer timeout for multiple image uploads
    }
  };

  const handleDocumentFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleDocumentSend(file);
    }
  };

  const handleFileTypeSelect = (type) => {
    if (type === 'image') {
      imageInputRef.current?.click();
    } else if (type === 'document') {
      documentInputRef.current?.click();
    }
  };

  const handleAttachClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleImageClick = (imageUrl, allImages = null, imageIndex = 0) => {
    if (allImages && Array.isArray(allImages)) {
      // Multiple images - set up slider
      setSelectedImageUrls(allImages);
      setSelectedImageIndex(imageIndex);
      setSelectedImage(allImages[imageIndex]);
    } else {
      // Single image
      setSelectedImageUrls([imageUrl]);
      setSelectedImageIndex(0);
      setSelectedImage(imageUrl);
    }
  };

  const downloadImage = (imageUrl, fileName = 'image') => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openImageInNewTab = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setSelectedImageIndex(0);
    setSelectedImageUrls([]);
  };

  const goToNextImage = () => {
    if (selectedImageIndex < selectedImageUrls.length - 1) {
      const newIndex = selectedImageIndex + 1;
      setSelectedImageIndex(newIndex);
      setSelectedImage(selectedImageUrls[newIndex]);
    }
  };

  const goToPreviousImage = () => {
    if (selectedImageIndex > 0) {
      const newIndex = selectedImageIndex - 1;
      setSelectedImageIndex(newIndex);
      setSelectedImage(selectedImageUrls[newIndex]);
    }
  };

  const handleKeyDown = (e) => {
    if (!selectedImage) return;
    
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      goToNextImage();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      goToPreviousImage();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeImageModal();
    }
  };

  const handleDocumentClick = (documentUrl, fileName) => {
    console.log('📄 [ChatArea] Document clicked:', { documentUrl, fileName });
    
    // For PDFs, download directly
    if (documentUrl.endsWith('.pdf') || documentUrl.includes('application/pdf')) {
      console.log('📥 [ChatArea] Downloading PDF directly:', documentUrl);
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = fileName || 'document.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For non-PDF documents, open in new tab
      window.open(documentUrl, '_blank');
    }
  };

  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Clear existing typing start timeout
    if (typingStartTimeoutRef.current) {
      clearTimeout(typingStartTimeoutRef.current);
    }
    
    // Send typing start event after a short delay
    if (!isTyping) {
      typingStartTimeoutRef.current = setTimeout(() => {
        sendTypingStart();
        setIsTyping(true);
      }, 500); // Send typing start after 500ms of typing
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStop();
      setIsTyping(false);
    }, 1000); // Stop typing indicator after 1 second of no typing
  };

  if (!conversation) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyContent}>
          <div className={styles.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#AF8EBA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className={styles.emptyTitle}>Select a conversation</h3>
          <p className={styles.emptySubtitle}>Choose a conversation from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatArea}>
      {/* Chat Header */}
      <div className={styles.chatHeader}>
        {isMobileView && onBackToChats && (
          <button 
            className={styles.backButton}
            onClick={onBackToChats}
            title="Back to chats"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        
        <div className={styles.contactInfo}>
          <div className={styles.avatarContainer}>
            <div className={styles.avatar}>
              <img 
                src={conversation.avatar || '/logo.png'} 
                alt={conversation.name}
                onError={(e) => {
                  e.target.src = '/logo.png';
                }}
              />
              {conversation.isOnline && <div className={styles.onlineIndicator}></div>}
            </div>
          </div>
          <div className={styles.contactDetails}>
            <h3 className={styles.contactName}>{conversation.name}</h3>
            <span className={styles.contactType}>{conversation.type}</span>
          </div>
        </div>
        
        {/* Delete Conversation Button */}
        <button 
          className={styles.deleteButton}
          onClick={() => {
            if (onDeleteConversation && conversation.conversationId) {
              onDeleteConversation(conversation.conversationId);
            }
          }}
          title="Delete conversation"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 3.03914 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className={styles.messagesArea} ref={messagesContainerRef}>
        <div className={styles.messagesContainer}>
          {/* Loading Messages */}
          {loadingMessages && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '20px',
              color: '#666'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #f3f3f3',
                  borderTop: '2px solid #AF8EBA',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Loading messages...
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loadingMessages && (!conversation.messages || conversation.messages.length === 0) && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '40px 20px',
              textAlign: 'center',
              color: '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#333' }}>
                No messages yet
              </h3>
              <p style={{ fontSize: '14px', lineHeight: '1.4' }}>
                Start a conversation by sending a message
              </p>

            </div>
          )}

          {/* Messages */}
          {!loadingMessages && conversation.messages && conversation.messages.length > 0 && (
            <>
              {/* Date Separator */}
              <div className={styles.dateSeparator}>
                <span className={styles.dateText}>Today</span>
              </div>

              {conversation.messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.messageItem} ${
                message.sender === 'user' ? styles.sentMessage : styles.receivedMessage
              }`}
            >
              <div className={styles.messageBubble}>
                {message.messageType === 'image' || message.type === 'image' ? (
                  // Check if it's a JSON array (multiple images) or single image
                  (() => {
                    try {
                      // Try to parse as JSON first - only if it looks like JSON
                      if (message.content && typeof message.content === 'string') {
                        // Check if it starts with '[' which indicates JSON array
                        if (message.content.trim().startsWith('[')) {
                          const parsed = JSON.parse(message.content);
                          if (Array.isArray(parsed)) {
                            // Multiple images
                            return (
                              <div className={styles.multipleImagesContainer}>
                                {parsed.map((imageUrl, index) => (
                                  <img 
                                    key={index}
                                    src={imageUrl} 
                                    alt={`Sent image ${index + 1}`} 
                                    className={styles.messageImage}
                                    onClick={() => handleImageClick(imageUrl, parsed, index)}
                                  />
                                ))}
                              </div>
                            );
                          }
                        }
                      }
                      // Single image (direct URL)
                      return (
                        <img 
                          src={message.content || message.text} 
                          alt="Sent image" 
                          className={styles.messageImage}
                          onClick={() => handleImageClick(message.content || message.text)}
                        />
                      );
                    } catch (error) {
                      console.error('❌ [ChatArea] Error parsing image content:', error);
                      // Fallback to single image
                      return (
                        <img 
                          src={message.content || message.text} 
                          alt="Sent image" 
                          className={styles.messageImage}
                          onClick={() => handleImageClick(message.content || message.text)}
                        />
                      );
                    }
                  })()
                ) : message.messageType === 'document' || message.type === 'document' ? (
                  (() => {
                    try {
                      // Check if it's a JSON array (multiple documents) or single document
                      if (message.content && typeof message.content === 'string') {
                        // Check if it starts with '[' which indicates JSON array
                        if (message.content.trim().startsWith('[')) {
                          const parsed = JSON.parse(message.content);
                          if (Array.isArray(parsed) && parsed.length > 0) {
                            // For now, we'll show the first document
                            // In the future, we could implement multiple document display
                            const firstDoc = parsed[0];
                            return (
                              <div 
                                className={styles.documentLink}
                                onClick={() => handleDocumentClick(firstDoc.url, firstDoc.originalFileName)}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className={styles.documentInfo}>
                                  <span className={styles.documentName}>{firstDoc.originalFileName}</span>
                                  <span className={styles.documentMeta}>Click to view</span>
                                </div>
                              </div>
                            );
                          }
                        }
                      }
                      // Single document (direct URL)
                      return (
                        <div 
                          className={styles.documentLink}
                          onClick={() => handleDocumentClick(message.content, message.originalFileName)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className={styles.documentInfo}>
                            <span className={styles.documentName}>{message.originalFileName || message.content}</span>
                            <span className={styles.documentMeta}>Click to view</span>
                          </div>
                        </div>
                      );
                    } catch (error) {
                      console.error('❌ [ChatArea] Error parsing document content:', error);
                      // Fallback to single document
                      return (
                        <div 
                          className={styles.documentLink}
                          onClick={() => handleDocumentClick(message.content, message.originalFileName)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className={styles.documentInfo}>
                            <span className={styles.documentName}>{message.originalFileName || message.content}</span>
                            <span className={styles.documentMeta}>Click to view</span>
                          </div>
                        </div>
                      );
                    }
                  })()
                ) : (
                  <p className={styles.messageText}>{message.text || message.content}</p>
                )}
              </div>
              <div className={styles.messageMeta}>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.readIndicator}
                >
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className={styles.messageTime}>{message.timestamp}</span>
              </div>
            </div>
          ))}
            </>
          )}
          
          {/* Sending indicator */}
          {sendingMessage && (
            <div
              className={`${styles.messageItem} ${styles.sentMessage} ${styles.sendingMessage}`}
            >
              <div className={styles.messageBubble}>
                {sendingMessage.type === 'image' ? (
                    <img 
                      src={sendingMessage.content} 
                      alt="Sending image" 
                      className={styles.messageImage}
                      onClick={() => handleImageClick(sendingMessage.content)}
                    />
                ) : sendingMessage.type === 'multiple-images' ? (
                    <div className={`${styles.multipleImagesContainer} ${styles.sendingMultipleImages}`}>
                      {JSON.parse(sendingMessage.content).map((imageUrl, index) => (
                        <img 
                          key={index}
                          src={imageUrl} 
                          alt={`Sending image ${index + 1}`} 
                          className={styles.messageImage}
                          onClick={() => handleImageClick(imageUrl, JSON.parse(sendingMessage.content), index)}
                        />
                      ))}
                    </div>
                ) : sendingMessage.type === 'document' ? (
                  (() => {
                    try {
                      // Check if it's a JSON array (multiple documents) or single document
                      if (sendingMessage.content && typeof sendingMessage.content === 'string') {
                        // Check if it starts with '[' which indicates JSON array
                        if (sendingMessage.content.trim().startsWith('[')) {
                          const parsed = JSON.parse(sendingMessage.content);
                          if (Array.isArray(parsed) && parsed.length > 0) {
                            // For now, we'll show the first document
                            const firstDoc = parsed[0];
                            return (
                              <div className={styles.documentLink}>
                                <div className={styles.documentInfo}>
                                  <span className={styles.documentName}>{firstDoc.originalFileName}</span>
                                  <span className={styles.documentMeta}>Sending...</span>
                                </div>
                              </div>
                            );
                          }
                        }
                      }
                      // Single document (direct URL)
                      return (
                        <div className={styles.documentLink}>
                          <div className={styles.documentInfo}>
                            <span className={styles.documentName}>{sendingMessage.content}</span>
                            <span className={styles.documentMeta}>Sending...</span>
                          </div>
                        </div>
                      );
                    } catch (error) {
                      console.error('❌ [ChatArea] Error parsing sending document content:', error);
                      // Fallback to single document
                      return (
                        <div className={styles.documentLink}>
                          <div className={styles.documentInfo}>
                            <span className={styles.documentName}>{sendingMessage.content}</span>
                            <span className={styles.documentMeta}>Sending...</span>
                          </div>
                        </div>
                      );
                    }
                  })()
                ) : (
                <p className={styles.messageText}>{sendingMessage.text}</p>
                )}
              </div>
              <div className={styles.messageMeta}>
                <div className={styles.sendingIndicator}>
                  <div className={styles.sendingDot}></div>
                  <div className={styles.sendingDot}></div>
                  <div className={styles.sendingDot}></div>
                </div>
                <span className={styles.messageTime}>{sendingMessage.timestamp}</span>
              </div>
            </div>
          )}
          
          {/* Typing indicator */}
          {conversation.isTyping && (
            <div className={`${styles.messageItem} ${styles.receivedMessage}`}>
              <div className={styles.typingBubble}>
                <div className={styles.typingDots}>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className={styles.messageInput}>
        <form onSubmit={handleSendMessage} className={styles.inputForm}>
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleImageFileSelect}
            style={{ display: 'none' }}
            accept="image/*"
            multiple
            data-max-files="4"
          />
          <input
            type="file"
            ref={documentInputRef}
            onChange={handleDocumentFileSelect}
            style={{ display: 'none' }}
            accept="application/pdf,.doc,.docx"
          />
          <div className={styles.attachButtonContainer}>
            <button 
              type="button" 
              className={styles.attachButton} 
              onClick={handleAttachClick}
              ref={attachButtonRef}
            >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59717 21.9983 8.005 21.9983C6.41283 21.9983 4.88579 21.3658 3.76 20.24C2.63421 19.1142 2.00171 17.5872 2.00171 15.995C2.00171 14.4028 2.63421 12.8758 3.76 11.75L12.95 2.56C13.7006 1.80943 14.7167 1.3877 15.78 1.3877C16.8433 1.3877 17.8594 1.80943 18.61 2.56C19.3606 3.31057 19.7823 4.32667 19.7823 5.39C19.7823 6.45333 19.3606 7.46943 18.61 8.22L9.41 17.41C9.03472 17.7853 8.52672 18.0001 8 18.0001C7.47328 18.0001 6.96528 17.7853 6.59 17.41C6.21472 17.0347 5.99989 16.5267 5.99989 16C5.99989 15.4733 6.21472 14.9653 6.59 14.59L15.07 6.11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
            <FileTypeDropdown
              isOpen={isDropdownOpen}
              onClose={() => setIsDropdownOpen(false)}
              onFileTypeSelect={handleFileTypeSelect}
            />
          </div>
          <input
            type="text"
            value={messageText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter your message"
            className={styles.messageField}
          />
          <button type="submit" className={styles.sendButton} disabled={!messageText.trim()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className={styles.imageModal}
          onClick={closeImageModal}
        >
          <div className={styles.imageModalContent}>
            {/* Navigation buttons */}
            {selectedImageUrls.length > 1 && (
              <>
                <button 
                  className={`${styles.navButton} ${styles.prevButton} ${selectedImageIndex === 0 ? styles.disabled : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPreviousImage();
                  }}
                  disabled={selectedImageIndex === 0}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                <button 
                  className={`${styles.navButton} ${styles.nextButton} ${selectedImageIndex === selectedImageUrls.length - 1 ? styles.disabled : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextImage();
                  }}
                  disabled={selectedImageIndex === selectedImageUrls.length - 1}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </>
            )}
            
            {/* Image counter */}
            {selectedImageUrls.length > 1 && (
              <div className={styles.imageCounter}>
                {selectedImageIndex + 1} / {selectedImageUrls.length}
              </div>
            )}
            
            {/* Action buttons */}
            <div className={styles.imageModalActions}>
              <button 
                className={styles.imageActionButton}
                onClick={(e) => {
                  e.stopPropagation();
                  downloadImage(selectedImage, `image-${selectedImageIndex + 1}.webp`);
                }}
                title="Download image"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button 
                className={styles.imageActionButton}
                onClick={(e) => {
                  e.stopPropagation();
                  openImageInNewTab(selectedImage);
                }}
                title="Open in new tab"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 13V19A2 2 0 0 1 16 21H5A2 2 0 0 1 3 19V8A2 2 0 0 1 5 6H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="15,3 21,3 21,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <img 
              src={selectedImage} 
              alt="Full size image" 
              className={styles.modalImage}
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              className={styles.closeModalButton}
              onClick={closeImageModal}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
