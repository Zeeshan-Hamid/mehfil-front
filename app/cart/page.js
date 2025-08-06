"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import styles from "./CartPage.module.css";
import apiService from '../utils/api';
import { toast } from 'react-toastify';

function CartContent() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promo, setPromo] = useState("");
  const [updatedQuantities, setUpdatedQuantities] = useState({});

  const fetchCart = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getCart();
      if (response.success) {
        setCart(response.data.cart);
        setUpdatedQuantities({}); // Reset local changes on fetch
      } else {
        setError("Failed to fetch cart items.");
      }
    } catch (err) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const subtotal = cart.reduce((sum, item) => {
    return sum + item.totalPrice;
  }, 0);

  const total = subtotal;

  const handleLocalQtyChange = (cartItemId, currentQty, delta) => {
    const newQty = Math.max(1, currentQty + delta);
    setUpdatedQuantities(prev => ({
        ...prev,
        [cartItemId]: newQty
    }));
  };

  const handleUpdateItem = async (cartItemId) => {
    const newQty = updatedQuantities[cartItemId];
    if (!newQty) return;

    const itemToUpdate = cart.find(item => item._id === cartItemId);
    const pricePerAttendee = itemToUpdate.totalPrice / itemToUpdate.attendees;
    const updatedPrice = pricePerAttendee * newQty;
    
    try {
      const response = await apiService.updateCartItem(cartItemId, { attendees: newQty, totalPrice: updatedPrice });
      if (response.success) {
        fetchCart();
        toast.success("Cart updated.");
      } else {
        toast.error(response.message || "Failed to update cart.");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred.");
    }
  };

  const handleDelete = async (cartItemId) => {
    try {
      const response = await apiService.removeFromCart(cartItemId);
      if (response.success) {
        setCart(cart.filter(item => item._id !== cartItemId));
        toast.success("Item removed from cart.");
      } else {
        toast.error(response.message || "Failed to remove item.");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred.");
    }
  };
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles["cart-root"]}>
      <h1 className={styles["cart-title"]}>Your cart</h1>
      <div className={styles["cart-items-label"]}>Cart Items ({cart.length})</div>
      <div className={styles["cart-main-grid"]}>
        {/* Cart Items */}
        <div className={styles["cart-items-section"]}>
          {cart.map(item => {
            const displayQty = updatedQuantities[item._id] || item.attendees;
            const needsUpdate = updatedQuantities[item._id] && updatedQuantities[item._id] !== item.attendees;
            return (
              <div className={styles["cart-item-card"]} key={item._id}>
                <div className={styles["cart-item-row"]}>
                  <img src={item.event.imageUrl} alt={item.event.name} className={styles["cart-item-img"]} />
                  <div className={styles["cart-item-info"]}>
                    <div className={styles["cart-item-name"]}>{item.event.name}</div>
                    <div className={styles["cart-item-desc"]}>{item.package.name}</div>
                    <div className={styles["cart-item-meta"]}>
                      <span>Date: {new Date(item.eventDate).toLocaleDateString()}</span>
                      <span>Location: {item.event.location.city}</span>
                    </div>
                    <div className={styles["cart-item-price"]}>$ {item.totalPrice}</div>
                  </div>
                  <button className={styles["cart-item-delete"]} onClick={() => handleDelete(item._id)} title="Remove">
                    <span role="img" aria-label="delete">🗑️</span>
                  </button>
                </div>
                <div className={styles["cart-item-controls-row"]}>
                  <div className={styles["cart-item-qty-controls"]}>
                    <button onClick={() => handleLocalQtyChange(item._id, displayQty, -1)} className={styles["cart-qty-btn"]}>-</button>
                    <span className={styles["cart-qty-num"]}>{displayQty}</span>
                    <button onClick={() => handleLocalQtyChange(item._id, displayQty, 1)} className={styles["cart-qty-btn"]}>+</button>
                  </div>
                  {needsUpdate && (
                    <button onClick={() => handleUpdateItem(item._id)} className={styles["cart-update-btn"]}>Update</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        {/* Order Summary */}
        <div className={styles["cart-summary-section"]}>
          <div className={styles["cart-summary-card"]}>
            <div className={styles["cart-summary-title"]}>Order Summary</div>
            <div className={styles["cart-summary-row"]}><span>Subtotal</span><span>$ {subtotal}</span></div>
            <div className={styles["cart-summary-total-row"]}><span>Total</span><span>$ {total}</span></div>
            <div className={styles["cart-summary-promo-row"]}>
              <input className={styles["cart-summary-promo-input"]} placeholder="Add promo code" value={promo} onChange={e => setPromo(e.target.value)} />
              <button className={styles["cart-summary-promo-btn"]}>Apply</button>
            </div>
            <button 
              onClick={() => router.push('/checkout')}
              className={styles["cart-summary-checkout-btn"]}
            >
              Go to Checkout <span className={styles["cart-summary-arrow"]}>→</span>
            </button>
            <button 
              onClick={() => router.push('/')}
              className={styles["cart-summary-continue-btn"]}
            >
              Continue Shopping <span className={styles["cart-summary-arrow"]}>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <>
      <Navbar backgroundColor="#AF8EBA" customHeight="25px 20px"/>
      <CartContent />
      <Footer />
    </>
  );
} 