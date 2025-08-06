"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import styles from "./OrderConfirmation.module.css";

export default function OrderConfirmationPage() {
  const router = useRouter();

  return (
    <>
      <Navbar backgroundColor="#AF8EBA" customHeight="25px 20px"/>
      <div className={styles["confirmation-root"]}>
        <div className={styles["confirmation-card"]}>
          <div className={styles["success-icon"]}>✓</div>
          <h1 className={styles["confirmation-title"]}>Order Confirmed!</h1>
          <p className={styles["confirmation-message"]}>
            Thank you for your order. We've received your booking and will send you a confirmation email shortly.
          </p>
          <div className={styles["confirmation-details"]}>
            <div className={styles["detail-row"]}>
              <span>Order Number:</span>
              <span>#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            </div>
            <div className={styles["detail-row"]}>
              <span>Date:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
          <div className={styles["confirmation-actions"]}>
            <button 
              onClick={() => router.push('/vendor_listings')}
              className={styles["continue-shopping-btn"]}
            >
              Continue Shopping
            </button>
            <button 
              onClick={() => router.push('/customer_profile_dash?tab=My Orders')}
              className={styles["view-orders-btn"]}
            >
              View My Orders
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 