"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import styles from './AboutPage.module.css';
import CustomerChatbot from '../components/CustomerChatbot/CustomerChatbot';

export default function AboutPage() {
  return (
    <div className={styles.aboutPage}>
      <Navbar backgroundColor="transparent" />
      
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBgImage}>
          <Image 
            src="/hero_bg_blur.png" 
            alt="About Background" 
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
            About Mehfil
          </h1>
          <p className={styles.heroSubtitle}>
            Connecting people through unforgettable events. We're passionate about making every celebration special.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className={styles.storySection}>
        <div className={styles.storyContainer}>
          <div className={styles.storyContent}>
            <h2 className={styles.sectionTitle}>Our Story</h2>
            <p className={styles.storyText}>
              Founded in 2020, Mehfil was born from a simple yet powerful vision: to make event planning 
              accessible, transparent, and enjoyable for everyone. What started as a small team of passionate 
              event enthusiasts has grown into a thriving community of vendors and customers who share our 
              commitment to creating magical moments.
            </p>
            <p className={styles.storyText}>
              We believe that every event, whether it's an intimate gathering or a grand celebration, 
              deserves to be extraordinary. Our platform bridges the gap between talented vendors and 
              customers seeking the perfect services for their special occasions.
            </p>
          </div>
          <div className={styles.storyImage}>
            <Image 
              src="/hero_bg_blur.png" 
              alt="Our Story" 
              width={500} 
              height={400} 
              className={styles.storyImg}
            />
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className={styles.missionSection}>
        <div className={styles.missionContainer}>
          <div className={styles.missionCard}>
            <div className={styles.missionIcon}>
              <Image 
                src="/star.png" 
                alt="Mission" 
                width={48} 
                height={48} 
              />
            </div>
            <h3 className={styles.missionTitle}>Our Mission</h3>
            <p className={styles.missionText}>
              To democratize event planning by connecting customers with verified, talented vendors 
              through a seamless, transparent platform that makes every celebration unforgettable.
            </p>
          </div>
          
          <div className={styles.missionCard}>
            <div className={styles.missionIcon}>
              <Image 
                src="/star1.png" 
                alt="Vision" 
                width={48} 
                height={48} 
              />
            </div>
            <h3 className={styles.missionTitle}>Our Vision</h3>
            <p className={styles.missionText}>
              To become the world's most trusted platform for event services, where every vendor 
              thrives and every customer finds their perfect match for creating magical moments.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={styles.valuesSection}>
        <div className={styles.valuesContainer}>
          <h2 className={styles.sectionTitle}>Our Values</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <Image 
                  src="/chat_bubble_icon.png" 
                  alt="Trust" 
                  width={32} 
                  height={32} 
                />
              </div>
              <h3 className={styles.valueTitle}>Trust & Transparency</h3>
              <p className={styles.valueText}>
                We believe in building lasting relationships through honest communication, 
                verified vendors, and transparent pricing.
              </p>
            </div>
            
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <Image 
                  src="/like_icon.png" 
                  alt="Quality" 
                  width={32} 
                  height={32} 
                />
              </div>
              <h3 className={styles.valueTitle}>Quality Excellence</h3>
              <p className={styles.valueText}>
                Every vendor on our platform is carefully vetted to ensure they meet our 
                high standards for quality and professionalism.
              </p>
            </div>
            
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <Image 
                  src="/share_icon.png" 
                  alt="Community" 
                  width={32} 
                  height={32} 
                />
              </div>
              <h3 className={styles.valueTitle}>Community First</h3>
              <p className={styles.valueText}>
                We foster a supportive community where vendors grow their businesses and 
                customers find trusted partners for their events.
              </p>
            </div>
            
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <Image 
                  src="/search_icon.png" 
                  alt="Innovation" 
                  width={32} 
                  height={32} 
                />
              </div>
              <h3 className={styles.valueTitle}>Innovation</h3>
              <p className={styles.valueText}>
                We continuously evolve our platform to provide the best user experience 
                and cutting-edge tools for event planning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className={styles.statsSection}>
        <div className={styles.statsContainer}>
          <h2 className={styles.sectionTitle}>Our Impact</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>500+</div>
              <div className={styles.statLabel}>Verified Vendors</div>
              <p className={styles.statDescription}>
                Talented professionals across catering, decoration, photography, and more
              </p>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statNumber}>10,000+</div>
              <div className={styles.statLabel}>Happy Customers</div>
              <p className={styles.statDescription}>
                Satisfied customers who found their perfect vendors through Mehfil
              </p>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statNumber}>5,000+</div>
              <div className={styles.statLabel}>Events Planned</div>
              <p className={styles.statDescription}>
                Successful events ranging from intimate gatherings to grand celebrations
              </p>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statNumber}>98%</div>
              <div className={styles.statLabel}>Satisfaction Rate</div>
              <p className={styles.statDescription}>
                Customer satisfaction rate based on reviews and feedback
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.teamSection}>
        <div className={styles.teamContainer}>
          <h2 className={styles.sectionTitle}>Meet Our Team</h2>
          <p className={styles.teamSubtitle}>
            The passionate individuals behind Mehfil who work tirelessly to make your events extraordinary.
          </p>
          <div className={styles.teamGrid}>
            <div className={styles.teamCard}>
              <div className={styles.teamImage}>
                <Image 
                  src="/sarah.png" 
                  alt="Sarah Johnson" 
                  width={200} 
                  height={200} 
                  className={styles.teamImg}
                />
              </div>
              <h3 className={styles.teamName}>Sarah Johnson</h3>
              <p className={styles.teamRole}>Founder & CEO</p>
              <p className={styles.teamBio}>
                A former event planner with 15+ years of experience, Sarah founded Mehfil 
                to solve the challenges she faced in the industry.
              </p>
            </div>
            
            <div className={styles.teamCard}>
              <div className={styles.teamImage}>
                <Image 
                  src="/default_dp.jpg" 
                  alt="Michael Chen" 
                  width={200} 
                  height={200} 
                  className={styles.teamImg}
                />
              </div>
              <h3 className={styles.teamName}>Michael Chen</h3>
              <p className={styles.teamRole}>CTO</p>
              <p className={styles.teamBio}>
                Technology expert with a passion for creating seamless user experiences 
                and innovative solutions for the event industry.
              </p>
            </div>
            
            <div className={styles.teamCard}>
              <div className={styles.teamImage}>
                <Image 
                  src="/default_dp.jpg" 
                  alt="Emily Rodriguez" 
                  width={200} 
                  height={200} 
                  className={styles.teamImg}
                />
              </div>
              <h3 className={styles.teamName}>Emily Rodriguez</h3>
              <p className={styles.teamRole}>Head of Operations</p>
              <p className={styles.teamBio}>
                Operations specialist who ensures every vendor meets our quality standards 
                and every customer receives exceptional service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>Ready to Start Your Journey?</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of customers who trust Mehfil for their special events, 
            or become a vendor and grow your business with us.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/vendor_listings" className={styles.ctaButton}>
              Browse Vendors
            </Link>
            <Link href="/vendor_signup" className={`${styles.ctaButton} ${styles.ctaButtonSecondary}`}>
              Become a Vendor
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <CustomerChatbot />
    </div>
  );
} 