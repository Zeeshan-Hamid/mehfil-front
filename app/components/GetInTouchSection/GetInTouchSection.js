"use client";

import { useState } from 'react';
import styles from './GetInTouchSection.module.css';
import apiService from '../../utils/api';

export default function GetInTouchSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    acceptTerms: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.acceptTerms) {
      setSubmitStatus('error');
      setSubmitMessage('Please accept the Terms and Conditions to continue.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage('');

    try {
      const response = await apiService.submitContactForm({
        name: formData.name,
        email: formData.email,
        message: formData.message
      });

      if (response.status === 'success') {
        setSubmitStatus('success');
        setSubmitMessage(response.message || 'Thank you for your message! We will get back to you soon.');
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          message: '',
          acceptTerms: false
        });
      } else {
        setSubmitStatus('error');
        setSubmitMessage(response.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitStatus('error');
      setSubmitMessage(error.message || 'Failed to submit form. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearStatus = () => {
    setSubmitStatus(null);
    setSubmitMessage('');
  };

  return (
    <section className={styles.getInTouchSection}>
      {/* Status Messages - Fixed overlay */}
      {submitStatus && (
        <div 
          className={`${styles.statusMessage} ${
            submitStatus === 'success' ? styles.success : styles.error
          }`}
        >
          <span>{submitMessage}</span>
          <button 
            onClick={clearStatus}
            className={styles.closeStatus}
            type="button"
          >
            ×
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className={styles.header}>
        <h2 className={styles.title}>Get In Touch</h2>
        <p className={styles.subtitle}>
          Reach out to Mehfil for your perfect event planning experience
        </p>
      </div>

      {/* Contact Form */}
      <div className={styles.formContainer}>
        <div className={styles.formBackground}>
          <form className={styles.contactForm} onSubmit={handleSubmit}>
            {/* Name and Email Row */}
            <div className={styles.inputRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="name" className={styles.label}>Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className={styles.input}
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  className={styles.input}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Message Field */}
            <div className={styles.messageGroup}>
              <label htmlFor="message" className={styles.label}>Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Enter your message"
                className={styles.textarea}
                rows={6}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Terms and Conditions */}
            <div className={styles.termsGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                  required
                  disabled={isSubmitting}
                />
                <span className={styles.checkboxText}>
                  I accept the Terms and Conditions
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className={`${styles.submitButton} ${isSubmitting ? styles.submitting : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
} 