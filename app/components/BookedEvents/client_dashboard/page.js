"use client";

import React from "react";
import Navbar from "../../Navbar/Navbar";
import Footer from "../../Footer/Footer";
import { TodoList } from "../../TodoList/TodoList";
import { BookedVendors } from "../../BookedVendors/BookedVendors";
import { Calendar } from "../../Calendar/Calender";
import styles from "./ClientDashboardPage.module.css";

export default function ClientDashboardPage() {
  return (
    <div className={styles.dashboardContainer}>
      <Navbar />
      
      <main className={styles.mainContent}>
        <div className={styles.dashboardHeader}>
          <h1 className={styles.dashboardTitle}>Client Dashboard</h1>
          <p className={styles.dashboardSubtitle}>Manage your events and bookings</p>
        </div>

        {/* TodoList Section - Top */}
        <section className={styles.todoSection}>
          <TodoList />
        </section>

        {/* Bottom Section with BookedVendors and Calendar */}
        <section className={styles.bottomSection}>
          <div className={styles.bottomGrid}>
            {/* BookedVendors - Left */}
            <div className={styles.vendorsSection}>
              <BookedVendors />
            </div>

            {/* Calendar - Right */}
            <div className={styles.calendarSection}>
              <Calendar />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 