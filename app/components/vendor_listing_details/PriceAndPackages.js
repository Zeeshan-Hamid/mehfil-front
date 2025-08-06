import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import CalendarSelector from './CalendarSelector';
import { toast } from 'react-toastify';
import apiService from '../../utils/api';
import { useParams, useRouter } from 'next/navigation';

export default function PriceAndPackages({ packages = [], isPreview = false }) {
  const [selected, setSelected] = useState(0);
  const [count, setCount] = useState(1); // Default to 1 person
  const [date, setDate] = useState(new Date());
  const [isEditingCount, setIsEditingCount] = useState(false);
  const [tempCount, setTempCount] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const params = useParams();
  const eventId = params.id;
  const router = useRouter();

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Handle case where packages array is empty
  if (packages.length === 0) {
    return (
      <div style={{ 
        fontFamily: 'Outfit, sans-serif', 
        fontWeight: 400, 
        fontSize: 'clamp(18px, 3.5vw, 24px)', 
        lineHeight: 'clamp(22px, 4vw, 30px)', 
        color: '#000', 
        margin: 'clamp(32px, 6vw, 48px) 0 clamp(16px, 3vw, 24px) 0', 
        textAlign: 'center' 
      }}>
        No packages available
      </div>
    );
  }
  
  const pkg = packages[selected];
  
  // Calculate pricing based on package price
  const getPerHeadPrice = () => {
    if (!pkg) return 0;
    
    // Extract price from price string if it contains dollar sign and commas
    if (pkg.price && typeof pkg.price === 'string') {
      const priceMatch = pkg.price.match(/\$?([\d,]+)/);
      if (priceMatch) {
        return parseInt(priceMatch[1].replace(/,/g, ''));
      }
    }
    
    // Fallback to numeric price fields
    return pkg.price || pkg.minPrice || pkg.maxPrice || pkg.total || 0;
  };
  
  // Handle count editing
  const handleCountClick = () => {
    setTempCount(count.toString());
    setIsEditingCount(true);
  };
  
  const handleCountSave = () => {
    const newCount = parseInt(tempCount) || 0;
    setCount(Math.max(0, newCount));
    setIsEditingCount(false);
  };
  
  const handleCountCancel = () => {
    setTempCount(count.toString());
    setIsEditingCount(false);
  };
  
  const handleTempCountChange = (e) => {
    const value = e.target.value;
    // Only allow digits
    if (/^\d*$/.test(value)) {
      setTempCount(value);
    }
  };

  const handleAddToCart = async () => {
    if (isPreview) return;
    
    const selectedPackage = packages[selected];
    if (!selectedPackage) {
      toast.error("Please select a package.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const itemData = {
        eventId,
        packageId: selectedPackage._id,
        packageType: 'regular',
        eventDate: date,
        attendees: count,
        totalPrice: getPerHeadPrice() * count,
      };

      const response = await apiService.addToCart(itemData);
      if (response.success) {
        toast.success("Added to cart successfully!");
        router.push('/cart'); // Redirect to cart page
      } else {
        toast.error(response.message || "Failed to add to cart.");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const perHeadPrice = getPerHeadPrice();
  const totalPrice = perHeadPrice * count;
  
  return (
    <>
      <div style={{ 
        fontFamily: 'Outfit, sans-serif', 
        fontWeight: 400, 
        fontSize: 'clamp(18px, 3.5vw, 24px)', 
        lineHeight: 'clamp(22px, 4vw, 30px)', 
        color: '#000', 
        margin: 'clamp(32px, 6vw, 48px) 0 clamp(16px, 3vw, 24px) 0', 
        textAlign: 'left' 
      }}>
        Pricing and Packages
      </div>
      <section style={{ width: '100%', padding: 0 }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', 
          gap: 'clamp(20px, 4vw, 32px)', 
          alignItems: 'flex-start', 
          flexWrap: 'wrap' 
        }}>
          {/* Left: Packages Container */}
          <div style={{ 
            flex: 1, 
            minWidth: isMobile ? '100%' : 320, 
            maxWidth: isMobile ? '100%' : 520, 
            padding: 'clamp(16px, 3vw, 24px)', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 'clamp(12px, 2vw, 16px)', 
            marginLeft: 0 
          }}>
            {packages.map((pkg, i) => (
              <button
                key={`package-${i}-${pkg.name}`}
                onClick={isPreview ? undefined : () => setSelected(i)}
                disabled={isPreview}
                style={{
                  background: i === selected ? '#AF8EBA' : '#fff',
                  border: i === selected ? 'none' : '2px solid #AF8EBA',
                  borderRadius: 'clamp(12px, 2.5vw, 16px)',
                  height: 'clamp(60px, 10vw, 77px)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: `0 clamp(20px, 4vw, 32px)`,
                  position: 'relative',
                  boxSizing: 'border-box',
                  cursor: isPreview ? 'default' : 'pointer',
                  outline: i === selected ? '2px solid #AF8EBA' : 'none',
                  transition: 'background 0.2s, border 0.2s',
                  opacity: isPreview ? 0.6 : 1
                }}
              >
                <span style={{ 
                  fontFamily: 'Outfit, sans-serif', 
                  fontWeight: 400, 
                  fontSize: 'clamp(16px, 3vw, 20px)', 
                  color: i === selected ? '#fff' : '#AF8EBA', 
                  flex: 1 
                }}>
                  {pkg.name}
                </span>
                <span style={{ 
                  fontFamily: 'Outfit, sans-serif', 
                  fontWeight: 500, 
                  fontSize: 'clamp(16px, 3vw, 20px)', 
                  color: i === selected ? '#fff' : '#AF8EBA', 
                  flex: 1 
                }}>
                  {pkg.price}
                </span>
                {/* More Than icon placeholder */}
                <span style={{ 
                  width: 'clamp(12px, 2vw, 16px)', 
                  height: 'clamp(12px, 2vw, 16px)', 
                  marginLeft: 'clamp(12px, 2vw, 16px)', 
                  display: 'inline-block', 
                  background: i === selected ? '#fff' : '#AF8EBA', 
                  borderRadius: 'clamp(6px, 1.2vw, 8px)' 
                }} />
              </button>
            ))}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row', 
              gap: 'clamp(8px, 1.5vw, 12px)', 
              marginTop: 'clamp(16px, 3vw, 24px)', 
              justifyContent: 'center' 
            }}>
              <button disabled={isPreview} style={{
                width: 'clamp(120px, 25vw, 164px)',
                height: 'clamp(40px, 8vw, 52px)',
                minWidth: 0,
                flex: 1,
                background: '#AF8EBA',
                color: '#fff',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(12px, 2.5vw, 16px)',
                border: 'none',
                borderRadius: 'clamp(80px, 15vw, 118px)',
                boxShadow: '0px 3.93px 3.93px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isPreview ? 'default' : 'pointer',
                boxSizing: 'border-box',
                outline: 'none',
                padding: 0,
                opacity: isPreview ? 0.6 : 1
              }}>Request a Quote</button>
              <button disabled={isPreview} style={{
                width: 'clamp(120px, 25vw, 164px)',
                height: 'clamp(40px, 8vw, 52px)',
                minWidth: 0,
                flex: 1,
                border: '1px solid #AF8EBA',
                background: '#fff',
                color: '#AF8EBA',
                borderRadius: 'clamp(60px, 12vw, 90px)',
                filter: 'drop-shadow(0px 3px 3px rgba(0, 0, 0, 0.25))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isPreview ? 'default' : 'pointer',
                boxSizing: 'border-box',
                outline: 'none',
                padding: 0,
                opacity: isPreview ? 0.6 : 1
              }}>
                <img src="/chat_bubble_icon.svg" alt="Chat" style={{ 
                  width: 'clamp(32px, 6vw, 44px)', 
                  height: 'clamp(32px, 6vw, 44px)', 
                  display: 'block' 
                }} />
              </button>
            </div>
          </div>
          {/* Right: Details+Calendar Container */}
          <div style={{
            flex: isMobile ? 'none' : 3,
            minWidth: isMobile ? '100%' : 400,
            width: '100%',
            minHeight: isMobile ? 'auto' : 440,
            background: '#FDFDFD',
            borderRadius: 'clamp(12px, 2.5vw, 16px)',
            boxShadow: '2px 2px 14.6px rgba(0,0,0,0.12)',
            padding: 'clamp(20px, 4vw, 40px)',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 'clamp(20px, 4vw, 40px)',
            alignItems: 'stretch',
            flexWrap: 'nowrap',
            justifyContent: 'space-between',
            marginRight: 0
          }}>
            {/* Details Box */}
            <div style={{ 
              flex: isMobile ? 'none' : 2, 
              minWidth: isMobile ? '100%' : 200, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 'clamp(12px, 2vw, 16px)', 
              height: isMobile ? 'auto' : '100%' 
            }}>
              {/* Includes Section */}
              <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row', 
                gap: 'clamp(24px, 5vw, 48px)', 
                flexShrink: 0 
              }}>
                {pkg.services.map((service, idx) => (
                  <div key={`service-${idx}-${service.title}`} style={{ 
                    minWidth: isMobile ? '100%' : 120 
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'clamp(6px, 1.2vw, 8px)', 
                      fontWeight: 600, 
                      fontSize: 'clamp(16px, 3vw, 20px)', 
                      fontFamily: 'Outfit, sans-serif', 
                      color: '#000' 
                    }}>
                      <Image 
                        src={service.icon} 
                        alt={service.title} 
                        width={24} 
                        height={24} 
                        style={{
                          minWidth: 'clamp(20px, 3.5vw, 24px)',
                          minHeight: 'clamp(20px, 3.5vw, 24px)',
                          maxWidth: 'clamp(20px, 3.5vw, 24px)',
                          maxHeight: 'clamp(20px, 3.5vw, 24px)'
                        }}
                      />
                      {service.title}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Content Containers - Flex container to share space */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 'clamp(12px, 2vw, 16px)', 
                flex: '1 1 auto', 
                minHeight: 0 
              }}>
                {/* Description Container */}
                {pkg.description && (
                  <div style={{ 
                    background: '#F8F9FA', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: 'clamp(6px, 1.2vw, 8px)', 
                    padding: 'clamp(8px, 1.5vw, 12px)',
                    minHeight: 'clamp(40px, 8vw, 60px)',
                    maxHeight: 'clamp(80px, 15vw, 120px)',
                    flex: '1 1 auto',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}>
                    <div style={{ 
                      fontFamily: 'Outfit, sans-serif', 
                      fontWeight: 500, 
                      fontSize: 'clamp(12px, 2.2vw, 14px)', 
                      color: '#374151', 
                      marginBottom: 'clamp(2px, 0.5vw, 4px)' 
                    }}>
                      Description
                    </div>
                    <div style={{ 
                      fontFamily: 'Outfit, sans-serif', 
                      fontWeight: 300, 
                      fontSize: 'clamp(12px, 2.2vw, 14px)', 
                      color: '#6B7280', 
                      lineHeight: '1.4',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      maxWidth: '100%'
                    }}>
                      {pkg.description}
                    </div>
                  </div>
                )}

                {/* Features Container */}
                {pkg.features && pkg.features.length > 0 && (
                  <div style={{ 
                    background: '#F8F9FA', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: 'clamp(6px, 1.2vw, 8px)', 
                    padding: 'clamp(8px, 1.5vw, 12px)',
                    minHeight: 'clamp(40px, 8vw, 60px)',
                    maxHeight: 'clamp(100px, 18vw, 140px)',
                    flex: '1 1 auto',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}>
                    <div style={{ 
                      fontFamily: 'Outfit, sans-serif', 
                      fontWeight: 500, 
                      fontSize: 'clamp(12px, 2.2vw, 14px)', 
                      color: '#374151', 
                      marginBottom: 'clamp(4px, 1vw, 8px)' 
                    }}>
                      Features
                    </div>
                    <ul style={{ 
                      margin: 0, 
                      padding: '0 0 0 clamp(12px, 2.5vw, 16px)', 
                      listStyle: 'disc', 
                      fontFamily: 'Outfit, sans-serif', 
                      fontWeight: 300, 
                      fontSize: 'clamp(12px, 2.2vw, 14px)', 
                      color: '#6B7280',
                      lineHeight: '1.4',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word'
                    }}>
                      {pkg.features.map((feature, i) => (
                        <li key={i} style={{ 
                          marginBottom: 'clamp(1px, 0.3vw, 2px)',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          maxWidth: '100%'
                        }}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Counter and Price Section */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 'clamp(20px, 4vw, 32px)', 
                flexShrink: 0, 
                marginTop: 'auto' 
              }}>
                {/* People Counter */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: 'clamp(4px, 1vw, 6px)' 
                }}>
                  <span style={{ 
                    color: '#888', 
                    fontSize: 'clamp(12px, 2.2vw, 14px)', 
                    fontWeight: 400, 
                    fontFamily: 'Outfit, sans-serif' 
                  }}>
                    Number of People
                  </span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                    width: 'clamp(100px, 18vw, 118px)',
                    height: 'clamp(32px, 6vw, 37px)',
                    border: '1px solid #AF8EBA',
                    borderRadius: 'clamp(4px, 0.8vw, 6px)',
                    background: '#fff',
                    fontSize: 'clamp(18px, 3.5vw, 22px)',
                    fontWeight: 500,
                    overflow: 'hidden',
                  }}>
                    <div style={{ width: '33.33%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <button onClick={isPreview ? undefined : () => setCount((c) => Math.max(0, c - 1))} disabled={isPreview} style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#AF8EBA', 
                        fontSize: 'clamp(18px, 3.5vw, 22px)', 
                        cursor: isPreview ? 'default' : 'pointer', 
                        fontWeight: 500, 
                        padding: 0, 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        opacity: isPreview ? 0.6 : 1 
                      }}>-</button>
                    </div>
                    <div style={{ width: '33.33%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isEditingCount ? (
                        <input
                          type="text"
                          value={tempCount}
                          onChange={isPreview ? undefined : handleTempCountChange}
                          onBlur={isPreview ? undefined : handleCountSave}
                          onKeyDown={isPreview ? undefined : (e) => {
                            if (e.key === 'Enter') handleCountSave();
                            if (e.key === 'Escape') handleCountCancel();
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#AF8EBA',
                            fontWeight: 500,
                            fontSize: 'clamp(18px, 3.5vw, 22px)',
                            textAlign: 'center',
                            width: '100%',
                            height: '100%',
                            outline: 'none',
                            fontFamily: 'inherit'
                          }}
                          autoFocus
                          disabled={isPreview}
                        />
                      ) : (
                        <span 
                          onClick={isPreview ? undefined : handleCountClick}
                          style={{ 
                            color: '#AF8EBA', 
                            fontWeight: 500, 
                            fontSize: 'clamp(18px, 3.5vw, 22px)', 
                            textAlign: 'center', 
                            cursor: isPreview ? 'default' : 'pointer',
                            userSelect: 'none',
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: isPreview ? 0.6 : 1
                          }}
                        >
                          {count}
                        </span>
                      )}
                    </div>
                    <div style={{ width: '33.33%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <button onClick={isPreview ? undefined : () => setCount((c) => c + 1)} disabled={isPreview} style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#AF8EBA', 
                        fontSize: 'clamp(18px, 3.5vw, 22px)', 
                        cursor: isPreview ? 'default' : 'pointer', 
                        fontWeight: 500, 
                        padding: 0, 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        opacity: isPreview ? 0.6 : 1 
                      }}>+</button>
                    </div>
                  </div>
                </div>
                {/* Price Display and Total */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-start', 
                  gap: 'clamp(6px, 1.2vw, 8px)' 
                }}>
                  
                  {/* People Count Label */}
                  <span style={{ 
                    color: '#888', 
                    fontSize: 'clamp(12px, 2.2vw, 14px)', 
                    fontWeight: 400 
                  }}>
                    {count} {count === 1 ? 'person' : 'people'} @ ${perHeadPrice.toLocaleString()}/head
                  </span>
                  
                  {/* Total Price */}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'flex-start' 
                  }}>
                    <span style={{ 
                      color: '#888', 
                      fontSize: 'clamp(14px, 2.5vw, 16px)', 
                      fontWeight: 400, 
                      marginBottom: 'clamp(1px, 0.3vw, 2px)' 
                    }}>
                      Total
                    </span>
                    <span style={{ 
                      fontWeight: 600, 
                      fontSize: 'clamp(22px, 4.5vw, 28px)', 
                      color: '#222' 
                    }}>
                      ${totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Calendar and Add to Cart Section - Now below total on mobile */}
            <div style={{
              flex: isMobile ? 'none' : 1,
              minWidth: isMobile ? '100%' : 293,
              maxWidth: isMobile ? '100%' : 340,
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(16px, 3vw, 22px)',
              alignItems: 'center',
              justifyContent: isMobile ? 'flex-start' : 'center',
              height: isMobile ? 'auto' : '100%',
              marginTop: isMobile ? 'clamp(20px, 4vw, 24px)' : 0,
            }}>
              <CalendarSelector value={date} onChange={setDate} />
              <button 
                onClick={handleAddToCart}
                disabled={isPreview || isSubmitting} 
                style={{
                  marginTop: isMobile ? 0 : 24,
                  width: 'clamp(250px, 50vw, 293px)',
                  height: 'clamp(36px, 7vw, 40px)',
                  background: '#AF8EBA',
                  boxShadow: '0px 3px 3px rgba(0, 0, 0, 0.25)',
                  borderRadius: 'clamp(60px, 12vw, 90px)',
                  border: 'none',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'clamp(4px, 1vw, 6px)',
                  color: '#fff',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 700,
                  fontSize: 'clamp(13px, 2.5vw, 15px)',
                  cursor: isPreview ? 'default' : 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  padding: 0,
                  opacity: isPreview ? 0.6 : 1
                }}>
                <Image 
                  src="/white_cart_icon.png" 
                  alt="Cart" 
                  width={18} 
                  height={18} 
                  style={{ 
                    objectFit: 'cover',
                    minWidth: 'clamp(16px, 3vw, 18px)',
                    minHeight: 'clamp(16px, 3vw, 18px)',
                    maxWidth: 'clamp(16px, 3vw, 18px)',
                    maxHeight: 'clamp(16px, 3vw, 18px)'
                  }} 
                />
                <span style={{ 
                  fontFamily: 'Outfit, sans-serif', 
                  fontWeight: 700, 
                  fontSize: 'clamp(13px, 2.5vw, 15px)', 
                  color: '#fff' 
                }}>
                  {isSubmitting ? 'Adding...' : 'Add to Cart'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 