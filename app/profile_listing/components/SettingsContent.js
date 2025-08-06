import React, { useState, useRef } from 'react';
import { FaRegImage, FaCamera } from 'react-icons/fa';
import { useVendorStore } from '../../state/userStore';
import styles from './SettingsContent.module.css';

export default function SettingsContent() {
  const { vendorData, setVendorData } = useVendorStore();
  
  // Fallbacks for missing fields
  const initial = {
    businessName: vendorData?.businessName || '',
    email: vendorData?.email || '',
    phone: vendorData?.phone || '',
    ownerName: vendorData?.ownerName || '',
    street: vendorData?.location?.address || '',
    city: vendorData?.location?.city || '',
    state: vendorData?.location?.state || '',
    country: vendorData?.location?.country || '',
    zipCode: vendorData?.location?.zipCode || '',
    facebook: vendorData?.facebook || '',
    instagram: vendorData?.instagram || '',
    website: vendorData?.website || '',
    halalCert: vendorData?.halalCert || null,
  };
  
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [halalCertName, setHalalCertName] = useState(initial.halalCert ? (initial.halalCert.name || 'Uploaded') : '');
  const [displayPicture, setDisplayPicture] = useState(vendorData?.profilePhoto || null);
  const [displayPicturePreview, setDisplayPicturePreview] = useState(vendorData?.profilePhoto || null);
  
  const halalInputRef = useRef();
  const displayPictureInputRef = useRef();

  // Validation
  const validate = () => {
    const errs = {};
    if (!form.businessName.trim()) errs.businessName = 'Business name is required.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Invalid email format.';
    if (!form.phone.trim()) errs.phone = 'Phone number is required.';
    if (!form.ownerName.trim()) errs.ownerName = 'Owner name is required.';
    if (!form.street.trim()) errs.street = 'Street is required.';
    if (!form.city.trim()) errs.city = 'City is required.';
    if (!form.state.trim()) errs.state = 'State is required.';
    if (!form.country.trim()) errs.country = 'Country is required.';
    return errs;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(e => ({ ...e, [name]: undefined }));
    setSuccess(false);
  };

  // Handle display picture upload
  const handleDisplayPictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB.');
        return;
      }
      
      setDisplayPicture(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setDisplayPicturePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setSuccess(false);
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(f => ({ ...f, halalCert: file }));
      setHalalCertName(file.name);
      setSuccess(false);
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setSuccess(false);
      return;
    }
    
    // Update vendorData in Zustand (simulate backend save)
    setVendorData({
      ...vendorData,
      businessName: form.businessName,
      email: form.email,
      phone: form.phone,
      ownerName: form.ownerName,
      profilePhoto: displayPicturePreview, // Save the display picture
      location: {
        address: form.street,
        city: form.city,
        state: form.state,
        country: form.country,
        zipCode: form.zipCode,
      },
      facebook: form.facebook,
      instagram: form.instagram,
      website: form.website,
      halalCert: form.halalCert,
    });
    setSuccess(true);
  };

  return (
    <div className={styles.settingsContainer} style={{
      boxSizing: 'border-box',
      position: 'relative',
      width: '100%',
      maxWidth: '1200px',
      minWidth: '320px',
      margin: '16px auto',
      padding: '32px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px'
    }}>
      {/* Display Picture Upload Section */}
      <div className={styles.settingsSection} style={{
        border: '1px solid #F2F2F2',
        borderRadius: '12px',
        padding: '32px 24px 24px 24px',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        boxShadow: '0 4px 24px 0 rgba(80,40,120,0.10)'
      }}>
        <div className={styles.displayPictureSection} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          marginBottom: '24px',
          padding: '24px',
          background: 'linear-gradient(135deg, #f8f5ff 0%, #f0ebff 100%)',
          borderRadius: '12px',
          border: '1px solid #E5D6F0'
        }}>
          <div className={styles.displayPictureUpload} 
            style={{
              position: 'relative',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: '#E5D6F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '3px solid #AF8EBA'
            }}
          >
            {displayPicturePreview ? (
              <img 
                src={displayPicturePreview} 
                alt="Profile" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  display: 'block'
                }}
              />
            ) : (
              <img 
                src="/default_dp.jpg" 
                alt="Default Profile" 
                onLoad={() => console.log('Default profile image loaded successfully')}
                onError={(e) => {
                  console.error('Failed to load default profile image');
                  e.target.style.display = 'none';
                  // Show fallback text if image fails to load
                  const fallback = document.createElement('div');
                  fallback.style.cssText = `
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #9A7DA6;
                    font-size: 48px;
                    font-weight: 700;
                    font-family: 'Outfit, sans-serif';
                    text-transform: uppercase;
                    letter-spacing: 1px;
                  `;
                  fallback.textContent = form.businessName ? form.businessName.charAt(0).toUpperCase() : '?';
                  e.target.parentNode.appendChild(fallback);
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  display: 'block'
                }}
              />
            )}
            <input 
              ref={displayPictureInputRef}
              type="file" 
              accept="image/*"
              onChange={handleDisplayPictureChange}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
                top: 0,
                left: 0
              }}
            />
          </div>
          
          <div className={styles.displayPictureInfo} style={{ flex: 1 }}>
            <h3 className={styles.displayPictureTitle} style={{
              fontSize: '18px',
              fontWeight: 700,
              fontFamily: 'Outfit, sans-serif',
              color: '#1a1a1a',
              marginBottom: '8px'
            }}>Profile Picture</h3>
            <p className={styles.displayPictureDescription} style={{
              fontSize: '14px',
              color: '#666',
              lineHeight: 1.5,
              marginBottom: '12px'
            }}>
              Upload a professional photo to represent your business. 
              This will be displayed on your profile and listings.
            </p>
            <button 
              type="button"
              className={styles.displayPictureButton}
              onClick={() => displayPictureInputRef.current?.click()}
              style={{
                background: '#AF8EBA',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Choose Photo
            </button>
          </div>
        </div>
      </div>

      {/* General Section */}
      <form className={styles.settingsSection} onSubmit={handleSubmit} autoComplete="off" style={{
        border: '1px solid #F2F2F2',
        borderRadius: '12px',
        padding: '32px 24px 24px 24px',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        boxShadow: '0 4px 24px 0 rgba(80,40,120,0.10)'
      }}>
        <div className={styles.settingsSectionTitle} style={{
          fontSize: '18px',
          fontWeight: 700,
          fontFamily: 'Outfit, sans-serif',
          marginBottom: '24px',
          color: '#1a1a1a'
        }}>General</div>
        <div className={styles.settingsFieldGroup} style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '18px'
        }}>
          <label style={{
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'Outfit, sans-serif',
            marginBottom: '8px',
            color: '#333'
          }}>Business Name *</label>
          <input 
            name="businessName" 
            type="text" 
            value={form.businessName} 
            onChange={handleChange}
            style={{
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '15px',
              fontFamily: 'Outfit, sans-serif',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
            }}
          />
          {errors.businessName && <span className={styles.errorMessage} style={{
            color: '#dc3545',
            fontSize: '13px',
            marginTop: '4px',
            fontFamily: 'Outfit, sans-serif'
          }}>{errors.businessName}</span>}
        </div>
        <div className={styles.settingsFieldGroup} style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '18px'
        }}>
          <label style={{
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'Outfit, sans-serif',
            marginBottom: '8px',
            color: '#333'
          }}>Email *</label>
          <input 
            name="email" 
            type="email" 
            value={form.email} 
            onChange={handleChange}
            style={{
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '15px',
              fontFamily: 'Outfit, sans-serif',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
            }}
          />
          {errors.email && <span className={styles.errorMessage} style={{
            color: '#dc3545',
            fontSize: '13px',
            marginTop: '4px',
            fontFamily: 'Outfit, sans-serif'
          }}>{errors.email}</span>}
        </div>
        <div className={styles.settingsFieldGroup} style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '18px'
        }}>
          <label style={{
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'Outfit, sans-serif',
            marginBottom: '8px',
            color: '#333'
          }}>Phone Number *</label>
          <input 
            name="phone" 
            type="text" 
            value={form.phone} 
            onChange={handleChange}
            style={{
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '15px',
              fontFamily: 'Outfit, sans-serif',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
            }}
          />
          {errors.phone && <span className={styles.errorMessage} style={{
            color: '#dc3545',
            fontSize: '13px',
            marginTop: '4px',
            fontFamily: 'Outfit, sans-serif'
          }}>{errors.phone}</span>}
        </div>
        <div className={styles.settingsFieldGroup} style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '18px'
        }}>
          <label style={{
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'Outfit, sans-serif',
            marginBottom: '8px',
            color: '#333'
          }}>Owner Name *</label>
          <input 
            name="ownerName" 
            type="text" 
            value={form.ownerName} 
            onChange={handleChange} 
            placeholder="Owner name goes here"
            style={{
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '15px',
              fontFamily: 'Outfit, sans-serif',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
            }}
          />
          {errors.ownerName && <span className={styles.errorMessage} style={{
            color: '#dc3545',
            fontSize: '13px',
            marginTop: '4px',
            fontFamily: 'Outfit, sans-serif'
          }}>{errors.ownerName}</span>}
        </div>
        <div className={styles.settingsFieldGroup} style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '18px'
        }}>
          <label style={{
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'Outfit, sans-serif',
            marginBottom: '8px',
            color: '#333'
          }}>Street *</label>
          <input 
            name="street" 
            type="text" 
            value={form.street} 
            onChange={handleChange} 
            placeholder="Street address goes here"
            style={{
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '15px',
              fontFamily: 'Outfit, sans-serif',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
            }}
          />
          {errors.street && <span className={styles.errorMessage} style={{
            color: '#dc3545',
            fontSize: '13px',
            marginTop: '4px',
            fontFamily: 'Outfit, sans-serif'
          }}>{errors.street}</span>}
        </div>
        <div className={styles.settingsFieldGroup} style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '18px'
        }}>
          <label style={{
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'Outfit, sans-serif',
            marginBottom: '8px',
            color: '#333'
          }}>City *</label>
          <input 
            name="city" 
            type="text" 
            value={form.city} 
            onChange={handleChange} 
            placeholder="City goes here"
            style={{
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '15px',
              fontFamily: 'Outfit, sans-serif',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
            }}
          />
          {errors.city && <span className={styles.errorMessage} style={{
            color: '#dc3545',
            fontSize: '13px',
            marginTop: '4px',
            fontFamily: 'Outfit, sans-serif'
          }}>{errors.city}</span>}
        </div>
        <div className={styles.settingsFieldGroup} style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '18px'
        }}>
          <label style={{
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'Outfit, sans-serif',
            marginBottom: '8px',
            color: '#333'
          }}>State *</label>
          <input 
            name="state" 
            type="text" 
            value={form.state} 
            onChange={handleChange} 
            placeholder="State goes here"
            style={{
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '15px',
              fontFamily: 'Outfit, sans-serif',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
            }}
          />
          {errors.state && <span className={styles.errorMessage} style={{
            color: '#dc3545',
            fontSize: '13px',
            marginTop: '4px',
            fontFamily: 'Outfit, sans-serif'
          }}>{errors.state}</span>}
        </div>
        <div className={styles.settingsFieldGroup} style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '18px'
        }}>
          <label style={{
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'Outfit, sans-serif',
            marginBottom: '8px',
            color: '#333'
          }}>Country *</label>
          <input 
            name="country" 
            type="text" 
            value={form.country} 
            onChange={handleChange} 
            placeholder="Country goes here"
            style={{
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '15px',
              fontFamily: 'Outfit, sans-serif',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
            }}
          />
          {errors.country && <span className={styles.errorMessage} style={{
            color: '#dc3545',
            fontSize: '13px',
            marginTop: '4px',
            fontFamily: 'Outfit, sans-serif'
          }}>{errors.country}</span>}
        </div>
        <div className={styles.settingsFieldGroup} style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '18px'
        }}>
          <label style={{
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'Outfit, sans-serif',
            marginBottom: '8px',
            color: '#333'
          }}>Zip Code</label>
          <input 
            name="zipCode" 
            type="text" 
            value={form.zipCode} 
            onChange={handleChange} 
            placeholder="Zip code goes here"
            style={{
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '15px',
              fontFamily: 'Outfit, sans-serif',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
            }}
          />
        </div>
        
        {/* Halal Certification Upload */}
        <div className={styles.settingsFieldGroup} style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '18px'
        }}>
          <label style={{marginBottom: 12, fontSize: '14px', fontWeight: 600, fontFamily: 'Outfit, sans-serif', color: '#333'}}>Verify your Halal Certification (Optional)</label>
          <label htmlFor="halal-cert-upload" className={styles.halalUploadLabel} style={{display: 'block', width: '100%'}}>
            <div className={styles.halalUploadBox} onClick={() => halalInputRef.current?.click()} style={{
              width: '100%',
              minHeight: '120px',
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#faf9fb',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              {form.halalCert ? (
                <span style={{ color: '#9CAD89', fontWeight: 600 }}>{halalCertName}</span>
              ) : (
                <FaRegImage size={40} style={{color: '#C4AAD9'}} />
              )}
            </div>
            <input id="halal-cert-upload" ref={halalInputRef} type="file" onChange={handleFileChange} style={{display: 'none'}} />
          </label>
        </div>
        
        <button type="submit" className={styles.settingsSaveBtn} style={{
          alignSelf: 'flex-end',
          background: '#AF8EBA',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '15px',
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 600,
          marginTop: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 8px rgba(80,40,120,0.15)'
        }}>Save Changes</button>
        {success && <span className={styles.successMessage} style={{
          color: '#28a745',
          fontSize: '15px',
          marginTop: '12px',
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 600
        }}>Settings saved!</span>}
      </form>

      {/* Privacy Section */}
      <form className={styles.settingsSection} onSubmit={e => e.preventDefault()} autoComplete="off" style={{
        border: '1px solid #F2F2F2',
        borderRadius: '12px',
        padding: '32px 24px 24px 24px',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        boxShadow: '0 4px 24px 0 rgba(80,40,120,0.10)'
      }}>
        <div className={styles.settingsSectionTitle} style={{
          fontSize: '18px',
          fontWeight: 700,
          fontFamily: 'Outfit, sans-serif',
          marginBottom: '24px',
          color: '#1a1a1a'
        }}>Privacy</div>
        <div className={styles.settingsFieldGroup} style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '18px'
        }}>
          <label style={{
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'Outfit, sans-serif',
            marginBottom: '8px',
            color: '#333'
          }}>Current Password</label>
          <input type="password" style={{
            border: '1px solid #E5E5E5',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '15px',
            fontFamily: 'Outfit, sans-serif',
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
          }} />
        </div>
        <div className={styles.settingsFieldGroup} style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '18px'
        }}>
          <label style={{
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'Outfit, sans-serif',
            marginBottom: '8px',
            color: '#333'
          }}>New Password</label>
          <input type="password" style={{
            border: '1px solid #E5E5E5',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '15px',
            fontFamily: 'Outfit, sans-serif',
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
          }} />
        </div>
        <div className={styles.settingsFieldGroup} style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '18px'
        }}>
          <label style={{
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'Outfit, sans-serif',
            marginBottom: '8px',
            color: '#333'
          }}>Verify New Password</label>
          <input type="password" style={{
            border: '1px solid #E5E5E5',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '15px',
            fontFamily: 'Outfit, sans-serif',
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
          }} />
        </div>
        <button type="submit" className={styles.settingsSaveBtn} style={{
          alignSelf: 'flex-end',
          background: '#AF8EBA',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '15px',
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 600,
          marginTop: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 8px rgba(80,40,120,0.15)'
        }}>Save Changes</button>
      </form>

      {/* Social Media Links Section */}
      <form className={styles.settingsSection} onSubmit={handleSubmit} autoComplete="off" style={{
        border: '1px solid #F2F2F2',
        borderRadius: '12px',
        padding: '32px 24px 24px 24px',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        boxShadow: '0 4px 24px 0 rgba(80,40,120,0.10)'
      }}>
        <div className={styles.settingsSectionTitle} style={{
          fontSize: '18px',
          fontWeight: 700,
          fontFamily: 'Outfit, sans-serif',
          marginBottom: '24px',
          color: '#1a1a1a'
        }}>Social Media Links</div>
        <div className={styles.settingsFieldGroup} style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '18px'
        }}>
          <label style={{
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'Outfit, sans-serif',
            marginBottom: '8px',
            color: '#333'
          }}>Facebook *</label>
          <input 
            name="facebook" 
            type="text" 
            value={form.facebook} 
            onChange={handleChange} 
            placeholder="Facebook link goes here"
            style={{
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '15px',
              fontFamily: 'Outfit, sans-serif',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
            }}
          />
        </div>
        <div className={styles.settingsFieldGroup} style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '18px'
        }}>
          <label style={{
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'Outfit, sans-serif',
            marginBottom: '8px',
            color: '#333'
          }}>Instagram *</label>
          <input 
            name="instagram" 
            type="text" 
            value={form.instagram} 
            onChange={handleChange} 
            placeholder="Instagram link goes here"
            style={{
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '15px',
              fontFamily: 'Outfit, sans-serif',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
            }}
          />
        </div>
        <div className={styles.settingsFieldGroup} style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '18px'
        }}>
          <label style={{
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'Outfit, sans-serif',
            marginBottom: '8px',
            color: '#333'
          }}>Personal Website</label>
          <input 
            name="website" 
            type="text" 
            value={form.website} 
            onChange={handleChange} 
            placeholder="Website link goes here"
            style={{
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '15px',
              fontFamily: 'Outfit, sans-serif',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
            }}
          />
        </div>
        <button type="submit" className={styles.settingsSaveBtn} style={{
          alignSelf: 'flex-end',
          background: '#AF8EBA',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '15px',
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 600,
          marginTop: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 8px rgba(80,40,120,0.15)'
        }}>Save Changes</button>
        {success && <span className={styles.successMessage} style={{
          color: '#28a745',
          fontSize: '15px',
          marginTop: '12px',
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 600
        }}>Settings saved!</span>}
      </form>
    </div>
  );
} 