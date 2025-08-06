"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import styles from "./CheckoutPage.module.css";
import apiService from '../utils/api';
import { toast } from 'react-toastify';

function CheckoutContent() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchCart = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getCart();
      if (response.success) {
        setCart(response.data.cart);
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

  const shipping = 0; // Free shipping
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setFormData(prev => ({
      ...prev,
      cardNumber: value
    }));
  };

  const handleCardExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setFormData(prev => ({
      ...prev,
      cardExpiry: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Create bookings sequentially to avoid version conflicts
      const results = [];
      for (const item of cart) {
        const bookingData = {
          eventId: item.event._id,
          packageId: item.package._id,
          packageType: item.packageType,
          eventDate: item.eventDate,
          attendees: item.attendees,
          totalPrice: item.totalPrice
        };
        
        const result = await apiService.bookEvent(bookingData);
        results.push(result);
      }
      
      toast.success("Bookings created successfully!");
      // Redirect to order confirmation page
      router.push('/order-confirmation');
    } catch (error) {
      console.error('Booking error:', error);
      const errorMessage = error.message || "Failed to create bookings. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid = () => {
    return formData.firstName && formData.lastName && formData.email && 
           formData.phone && formData.cardNumber && formData.cardExpiry && 
           formData.cardCvc && formData.cardName;
  };
  
  if (isLoading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (cart.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <h2>Your cart is empty</h2>
        <p>Add some items to your cart before checkout.</p>
        <button onClick={() => router.push('/')} className={styles.continueShoppingBtn}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <>
      <h1 className={styles["checkout-title"]}>Checkout</h1>
      <div className={styles["checkout-main-grid"]}>
        {/* Checkout Form */}
        <div className={styles["checkout-form-section"]}>
          <form onSubmit={handleSubmit} className={styles["checkout-form"]}>
            {/* Contact Information */}
            <div className={styles["form-section"]}>
              <h2 className={styles["form-section-title"]}>Contact Information</h2>
              <div className={styles["form-row"]}>
                <div className={styles["form-group"]}>
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className={styles["form-input"]}
                  />
                </div>
                <div className={styles["form-group"]}>
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className={styles["form-input"]}
                  />
                </div>
              </div>
              <div className={styles["form-row"]}>
                <div className={styles["form-group"]}>
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={styles["form-input"]}
                  />
                </div>
                <div className={styles["form-group"]}>
                  <label htmlFor="phone">Phone *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className={styles["form-input"]}
                  />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className={styles["form-section"]}>
              <h2 className={styles["form-section-title"]}>Payment Information</h2>
              <div className={styles["form-group"]}>
                <label htmlFor="cardName">Cardholder Name *</label>
                <input
                  type="text"
                  id="cardName"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  required
                  className={styles["form-input"]}
                />
              </div>
              <div className={styles["form-group"]}>
                <label htmlFor="cardNumber">Card Number *</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  required
                  className={styles["form-input"]}
                />
              </div>
              <div className={styles["form-row"]}>
                <div className={styles["form-group"]}>
                  <label htmlFor="cardExpiry">Expiry Date *</label>
                  <input
                    type="text"
                    id="cardExpiry"
                    name="cardExpiry"
                    value={formData.cardExpiry}
                    onChange={handleCardExpiryChange}
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                    className={styles["form-input"]}
                  />
                </div>
                <div className={styles["form-group"]}>
                  <label htmlFor="cardCvc">CVC *</label>
                  <input
                    type="text"
                    id="cardCvc"
                    name="cardCvc"
                    value={formData.cardCvc}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength="4"
                    required
                    className={styles["form-input"]}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className={styles["checkout-summary-section"]}>
          <div className={styles["checkout-summary-card"]}>
                         <h2 className={styles["checkout-summary-title"]}>Booking Summary</h2>
            
            {/* Order Items */}
            <div className={styles["order-items"]}>
              {cart.map(item => (
                <div key={item._id} className={styles["order-item"]}>
                  <img src={item.event.imageUrl} alt={item.event.name} className={styles["order-item-img"]} />
                  <div className={styles["order-item-info"]}>
                    <div className={styles["order-item-name"]}>{item.event.name}</div>
                    <div className={styles["order-item-desc"]}>{item.package.name}</div>
                    <div className={styles["order-item-meta"]}>
                      <span>Date: {new Date(item.eventDate).toLocaleDateString()}</span>
                      <span>Qty: {item.attendees}</span>
                    </div>
                  </div>
                  <div className={styles["order-item-price"]}>$ {item.totalPrice}</div>
                </div>
              ))}
            </div>

                         {/* Booking Totals */}
             <div className={styles["order-totals"]}>
               <div className={styles["order-total-row"]}>
                 <span>Subtotal</span>
                 <span>$ {subtotal.toFixed(2)}</span>
               </div>
               <div className={styles["order-total-row"]}>
                 <span>Tax</span>
                 <span>$ {tax.toFixed(2)}</span>
               </div>
               <div className={styles["order-total-row-total"]}>
                 <span>Total</span>
                 <span>$ {total.toFixed(2)}</span>
               </div>
             </div>

                         {/* Create Bookings Button */}
             <button 
               type="submit"
               onClick={handleSubmit}
               disabled={!isFormValid() || isProcessing}
               className={styles["place-order-btn"]}
             >
               {isProcessing ? (
                 <>
                   <span className={styles["spinner"]}></span>
                   Creating Bookings...
                 </>
               ) : (
                 <>
                   Create Bookings
                   <span className={styles["place-order-arrow"]}>→</span>
                 </>
               )}
             </button>

            <button 
              onClick={() => router.push('/cart')}
              className={styles["back-to-cart-btn"]}
            >
              ← Back to Cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <>
      <Navbar backgroundColor="#AF8EBA" customHeight="25px 20px"/>
      <div className={styles["checkout-container"]}>
        <CheckoutContent />
      </div>
      <Footer />
    </>
  );
} 