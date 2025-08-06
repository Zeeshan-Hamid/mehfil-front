import React from "react";
import styles from "./BookedVendors.module.css";

export const BookedVendors = () => {
  const bookedVendors = [
    {
      name: "Elegant Catering Co.",
      description: "Full-service catering with custom menu",
      price: "$ 30",
      status: "Confirmed",
    },
    {
      name: "Elegant Catering Co.",
      description: "Full-service catering with custom menu",
      price: "$ 30",
      status: "Confirmed",
    },
  ];

  return (
    <div className={styles['vendors-card']}>
      <div className={styles['vendors-header']}>
        <h3 className={styles['vendors-title']}>Booked Vendors</h3>
        <span className={styles['view-all']}>View All</span>
      </div>
      <div className={styles['vendors-content']}>
        {bookedVendors.map((vendor, index) => (
          <div key={index} className={styles['vendor-item']}>
            <span className={styles['vendor-status']}>{vendor.status}</span>
            <div className={styles['vendor-name']}>{vendor.name}</div>
            <div className={styles['vendor-description']}>{vendor.description}</div>
            <div className={styles['vendor-price']}>{vendor.price}</div>
            <img
              className={styles['vendor-image']}
              alt="Vendor image"
              src="/image-3.png"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
