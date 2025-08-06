"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import styles from './ContactPage.module.css';
import apiService from '../utils/api';
import CustomerChatbot from '../components/CustomerChatbot/CustomerChatbot';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');

    try {
      const response = await apiService.submitContactForm({
        name: formData.name,
        email: formData.email,
        message: formData.message
      });
      
      if (response.status === 'success') {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
        setErrorMessage(response.message || 'Failed to submit form. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.contactPage}>
      <Navbar backgroundColor="transparent" />
      
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBgImage}>
          <Image 
            src="/hero_bg_blur.png" 
            alt="Contact Background" 
            fill 
            className={styles.heroBgImageImg}
          />
        </div>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroFrontFlower}>
          <Image 
            src="/hero_front_flower.png" 
            alt="Decorative Flower" 
            fill 
            className={styles.heroFrontFlowerImg}
          />
        </div>
        
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Get in Touch
          </h1>
          <p className={styles.heroSubtitle}>
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className={styles.contactSection}>
        <div className={styles.contactContainer}>
          <div className={styles.contactInfo}>
            <h2 className={styles.contactInfoTitle}>Let's Connect</h2>
            <p className={styles.contactInfoSubtitle}>
              Have questions about our services? Want to become a vendor? 
              We're here to help you create unforgettable events.
            </p>
            
            <div className={styles.contactMethods}>
              <div className={styles.contactMethod}>
                <div className={styles.contactIcon}>
                  <Image 
                    src="/chat_bubble_icon.png" 
                    alt="Email" 
                    width={24} 
                    height={24} 
                  />
                </div>
                <div className={styles.contactDetails}>
                  <h3>Email Us</h3>
                  <p>hello@mehfil.com</p>
                  <span>We'll respond within 24 hours</span>
                </div>
              </div>
              
              <div className={styles.contactMethod}>
                <div className={styles.contactIcon}>
                  <Image 
                    src="/location_icon.png" 
                    alt="Location" 
                    width={24} 
                    height={24} 
                  />
                </div>
                <div className={styles.contactDetails}>
                  <h3>Visit Us</h3>
                  <p>123 Event Street, City, State 12345</p>
                  <span>Mon-Fri: 9AM-6PM</span>
                </div>
              </div>
              
              <div className={styles.contactMethod}>
                <div className={styles.contactIcon}>
                  <Image 
                    src="/chat_bubble_icon.png" 
                    alt="Phone" 
                    width={24} 
                    height={24} 
                  />
                </div>
                <div className={styles.contactDetails}>
                  <h3>Call Us</h3>
                  <p>+1 (555) 123-4567</p>
                  <span>Available Mon-Fri, 9AM-6PM</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.contactForm}>
            <h2 className={styles.formTitle}>Send us a Message</h2>
            
            {/* Success/Error Messages */}
            {submitStatus === 'success' && (
              <div className={styles.successMessage}>
                Thank you for your message! We'll get back to you within 24 hours.
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className={styles.errorMessage}>
                {errorMessage}
              </div>
            )}
            
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Full Name *</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required 
                  className={styles.formInput}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address *</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  required 
                  className={styles.formInput}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="message">Message *</label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows="6" 
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us about your inquiry..."
                  required 
                  className={styles.formTextarea}
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className={`${styles.submitButton} ${isSubmitting ? styles.submitting : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <div className={styles.faqContainer}>
          <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3>How do I become a vendor?</h3>
              <p>
                Becoming a vendor is easy! Simply click on "Join as Vendor" in our navigation 
                and follow the registration process. We'll review your application and get back 
                to you within 2-3 business days.
              </p>
            </div>
            
            <div className={styles.faqItem}>
              <h3>What types of events do you support?</h3>
              <p>
                We support a wide range of events including weddings, corporate events, 
                birthday parties, anniversaries, and special celebrations. Our vendors 
                specialize in catering, decoration, photography, and more.
              </p>
            </div>
            
            <div className={styles.faqItem}>
              <h3>How do I book a vendor?</h3>
              <p>
                Browse our vendor listings, read reviews, and contact vendors directly 
                through our platform. You can also use our search filters to find vendors 
                that match your specific needs and budget.
              </p>
            </div>
            
            <div className={styles.faqItem}>
              <h3>Is there a fee for using Mehfil?</h3>
              <p>
                Mehfil is free for customers to browse and contact vendors. Vendors pay 
                a small commission on successful bookings. We believe in transparent pricing 
                with no hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <CustomerChatbot />
    </div>
  );
} 