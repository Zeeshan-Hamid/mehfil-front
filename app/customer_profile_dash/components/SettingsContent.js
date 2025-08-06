import React, { useState, useEffect, useRef } from "react";
import { useUserStore } from "../../state/userStore";
import apiService from "../../utils/api";
import { toast } from "react-toastify";
import Avatar from "../../components/Avatar/Avatar";
import styles from "./SettingsContent.module.css";

const dummyUserProfile = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  dateOfBirth: "1990-05-15",
  location: "New York, NY",
  profileImage: "/logo.png",
  notifications: {
    email: true,
    push: true,
    sms: false,
    marketing: true
  },
  preferences: {
    language: "English",
    currency: "USD",
    timezone: "EST",
    theme: "Light"
  }
};

export default function SettingsContent() {
  const { user } = useUserStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef(null);
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load customer profile on component mount
  useEffect(() => {
    loadCustomerProfile();
  }, []);

  const loadCustomerProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCustomerProfile();
      
      if (response.status === 'success') {
        const customerData = response.data.customer;
        
        // Transform customer data to match the form structure
        const transformedProfile = {
          fullName: customerData.customerProfile?.fullName || '',
          email: customerData.email || '',
          phone: customerData.phoneNumber || '',
          gender: customerData.customerProfile?.gender || '',
          location: {
            city: customerData.customerProfile?.location?.city || '',
            state: customerData.customerProfile?.location?.state || '',
            country: customerData.customerProfile?.location?.country || 'United States',
            zipCode: customerData.customerProfile?.location?.zipCode || ''
          },
          profileImage: customerData.customerProfile?.profileImage || '/logo.png',
          preferences: customerData.customerProfile?.preferences || {
            eventTypes: [],
            budgetRange: { min: 0, max: 0, currency: 'USD' },
            preferredLanguages: ['English']
          },
          notifications: {
            email: true,
            push: true,
            sms: false,
            marketing: true
          }
        };
        
        setProfile(transformedProfile);
        setFormData(transformedProfile);
      }
    } catch (error) {
      console.error('Error loading customer profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      // Prepare the data for API
      const updateData = {
        customerProfile: {
          fullName: formData.fullName,
          gender: formData.gender,
          location: formData.location,
          preferences: formData.preferences
        },
        phoneNumber: formData.phone
      };

      const response = await apiService.updateCustomerProfile(updateData);
      
      if (response.status === 'success') {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        
        // Update profile image if changed
        if (selectedImage) {
          const formDataImage = new FormData();
          formDataImage.append('profileImage', selectedImage);
          
          const imageResponse = await apiService.uploadProfileImage(formDataImage);
          if (imageResponse.status === 'success') {
            setProfile(prev => ({
              ...prev,
              profileImage: imageResponse.data.profileImage
            }));
            setSelectedImage(null);
            setImagePreview(null);
          }
        }
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData(profile);
    setIsEditing(false);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitPasswordChange = async () => {
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      setIsChangingPassword(true);
      
      const response = await apiService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.status === 'success') {
        toast.success('Password changed successfully!');
        handleClosePasswordModal();
      } else {
        toast.error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = () => {
    // Implement account deletion logic
    toast.info('Account deletion feature coming soon');
    setShowDeleteModal(false);
  };

  const renderProfileTab = () => (
    <div className={styles["settings-section"]}>
      <div className={styles["settings-header"]}>
        <h3>Profile Information</h3>
        <button 
          className={styles["settings-edit-btn"]}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>
      
      <div className={styles["profile-image-section"]}>
        {imagePreview ? (
          <img src={imagePreview} alt="Profile Preview" className={styles["profile-image"]} />
        ) : (
          <Avatar 
            user={{ 
              name: profile?.fullName || 'User', 
              profileImage: profile?.profileImage 
            }} 
            size="profile"
            className={styles["profile-avatar"]}
          />
        )}
        {isEditing && (
          <div className={styles["image-upload-section"]}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button 
              className={styles["change-photo-btn"]}
              onClick={() => fileInputRef.current?.click()}
            >
              {profile?.profileImage || imagePreview ? 'Change Photo' : 'Upload Photo'}
            </button>
            {(profile?.profileImage || imagePreview) && (
              <button 
                className={styles["remove-photo-btn"]}
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                  setFormData(prev => ({ ...prev, profileImage: null }));
                }}
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>

      <div className={styles["form-grid"]}>
        <div className={styles["form-group"]}>
          <label>Full Name</label>
          <input
            type="text"
            value={formData.fullName || ''}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            disabled={!isEditing}
            className={styles["form-input"]}
          />
        </div>
        
        <div className={styles["form-group"]}>
          <label>Email</label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleInputChange("email", e.target.value)}
            disabled={true} // Email should not be editable
            className={styles["form-input"]}
          />
        </div>
        
        <div className={styles["form-group"]}>
          <label>Phone Number</label>
          <input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            disabled={!isEditing}
            className={styles["form-input"]}
          />
        </div>
        
        <div className={styles["form-group"]}>
          <label>Gender</label>
          <select
            value={formData.gender || ''}
            onChange={(e) => handleInputChange("gender", e.target.value)}
            disabled={!isEditing}
            className={styles["form-input"]}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>
        
        <div className={styles["form-group"]}>
          <label>City</label>
          <input
            type="text"
            value={formData.location?.city || ''}
            onChange={(e) => handleInputChange("location", {
              ...formData.location,
              city: e.target.value
            })}
            disabled={!isEditing}
            className={styles["form-input"]}
          />
        </div>
        
        <div className={styles["form-group"]}>
          <label>State</label>
          <input
            type="text"
            value={formData.location?.state || ''}
            onChange={(e) => handleInputChange("location", {
              ...formData.location,
              state: e.target.value
            })}
            disabled={!isEditing}
            className={styles["form-input"]}
          />
        </div>
        
        <div className={styles["form-group"]}>
          <label>Country</label>
          <input
            type="text"
            value={formData.location?.country || ''}
            onChange={(e) => handleInputChange("location", {
              ...formData.location,
              country: e.target.value
            })}
            disabled={!isEditing}
            className={styles["form-input"]}
          />
        </div>
        
        <div className={styles["form-group"]}>
          <label>ZIP Code</label>
          <input
            type="text"
            value={formData.location?.zipCode || ''}
            onChange={(e) => handleInputChange("location", {
              ...formData.location,
              zipCode: e.target.value
            })}
            disabled={!isEditing}
            className={styles["form-input"]}
          />
        </div>
      </div>

      {isEditing && (
        <div className={styles["form-actions"]}>
          <button 
            className={styles["save-btn"]}
            onClick={handleSaveProfile}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button 
            className={styles["cancel-btn"]}
            onClick={handleCancelEdit}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );

  const renderSecurityTab = () => (
    <div className={styles["settings-section"]}>
      <h3>Security Settings</h3>
      
      <div className={styles["security-options"]}>
        <div className={styles["security-item"]}>
          <div className={styles["security-info"]}>
            <h4>Change Password</h4>
            <p>Update your account password to keep your account secure</p>
          </div>
          <button 
            className={styles["security-btn"]}
            onClick={handleChangePassword}
          >
            Change Password
          </button>
        </div>
        
        <div className={styles["security-item"]}>
          <div className={styles["security-info"]}>
            <h4>Two-Factor Authentication</h4>
            <p>Add an extra layer of security to your account</p>
          </div>
          <button 
            className={`${styles["security-btn"]} ${styles["disabled"]}`}
            disabled
          >
            Coming Soon
          </button>
        </div>
      </div>
      
      <div className={styles["account-options"]}>
        <h3>Account Management</h3>
        
        <div className={styles["account-item"]}>
          <div className={styles["account-info"]}>
            <h4>Delete Account</h4>
            <p>Permanently delete your account and all associated data</p>
          </div>
          <button 
            className={styles["delete-account-btn"]}
            onClick={handleDeleteAccount}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { 
      id: "profile", 
      label: "Profile", 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    },
    { 
      id: "security", 
      label: "Security", 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      )
    }
  ];

  return (
    <div className={styles["settings-root"]}>
      <h1 className={styles["settings-title"]}>Settings</h1>
      <p className={styles["settings-subtitle"]}>Manage your account preferences and settings</p>

      {loading ? (
        <div className={styles["loading-container"]}>
          <div className={styles["loading-spinner"]}></div>
          <p>Loading profile data...</p>
        </div>
      ) : (
        <div className={styles["settings-container"]}>
          {/* Tabs */}
          <div className={styles["settings-tabs"]}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`${styles["settings-tab"]} ${activeTab === tab.id ? styles["active"] : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className={styles["tab-icon"]}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className={styles["settings-content"]}>
            {activeTab === "profile" && renderProfileTab()}
            {activeTab === "security" && renderSecurityTab()}
          
          </div>
        </div>
      )}

      {/* Modals */}
      

      {showPasswordModal && (
        <div className={styles["modal-overlay"]}>
          <div className={styles["modal"]}>
            <h3>Change Password</h3>
            <div className={styles["password-form"]}>
              <div className={styles["form-group"]}>
                <label>Current Password</label>
                <input 
                  type="password" 
                  className={`${styles["form-input"]} ${passwordErrors.currentPassword ? styles["error"] : ""}`}
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordInputChange("currentPassword", e.target.value)}
                  disabled={isChangingPassword}
                />
                {passwordErrors.currentPassword && (
                  <span className={styles["error-message"]}>{passwordErrors.currentPassword}</span>
                )}
              </div>
              <div className={styles["form-group"]}>
                <label>New Password</label>
                <input 
                  type="password" 
                  className={`${styles["form-input"]} ${passwordErrors.newPassword ? styles["error"] : ""}`}
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordInputChange("newPassword", e.target.value)}
                  disabled={isChangingPassword}
                />
                {passwordErrors.newPassword && (
                  <span className={styles["error-message"]}>{passwordErrors.newPassword}</span>
                )}
              </div>
              <div className={styles["form-group"]}>
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  className={`${styles["form-input"]} ${passwordErrors.confirmPassword ? styles["error"] : ""}`}
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordInputChange("confirmPassword", e.target.value)}
                  disabled={isChangingPassword}
                />
                {passwordErrors.confirmPassword && (
                  <span className={styles["error-message"]}>{passwordErrors.confirmPassword}</span>
                )}
              </div>
            </div>
            <div className={styles["modal-actions"]}>
              <button 
                className={styles["modal-cancel-btn"]}
                onClick={handleClosePasswordModal}
                disabled={isChangingPassword}
              >
                Cancel
              </button>
              <button 
                className={styles["modal-confirm-btn"]}
                onClick={handleSubmitPasswordChange}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Changing Password...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 