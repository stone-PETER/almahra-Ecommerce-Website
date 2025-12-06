import React, { useState } from "react";
import { useCart } from "../../context/CartContext.jsx";
import { formatCurrency, validators } from "../../utils/helpers.js";
import Button from "../../components/common/Button/Button.jsx";
import PhoneInput from "../../components/common/PhoneInput/PhoneInput.jsx";
import orderService from "../../services/orderService.js";
import emailService from "../../services/emailService.js";
import "./CheckoutPage.css";

const CheckoutPage = () => {
  const { items, total, clearCart } = useCart();
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Confirmation
  const [formData, setFormData] = useState({
    // Shipping Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    // Payment Information
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    // Order Notes
    orderNotes: "",
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneValidation, setPhoneValidation] = useState({ isValid: false });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      // Validate shipping information
      if (!validators.required(formData.firstName))
        newErrors.firstName = "First name is required";
      if (!validators.required(formData.lastName))
        newErrors.lastName = "Last name is required";
      if (!validators.required(formData.email))
        newErrors.email = "Email is required";
      else if (!validators.email(formData.email))
        newErrors.email = "Please enter a valid email";
      if (!validators.required(formData.phone))
        newErrors.phone = "Phone number is required";
      else if (!phoneValidation.isValid)
        newErrors.phone = phoneValidation.error || "Please enter a valid phone number";
      if (!validators.required(formData.address))
        newErrors.address = "Address is required";
      if (!validators.required(formData.city))
        newErrors.city = "City is required";
      if (!validators.required(formData.state))
        newErrors.state = "State is required";
      if (!validators.required(formData.zipCode))
        newErrors.zipCode = "ZIP code is required";
    }

    if (stepNumber === 2) {
      // Payment information is optional (for cash on delivery)
      // No validation required
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handleSubmitOrder = async () => {
    if (!validateStep(2)) return;

    setIsProcessing(true);

    try {
      // Create order via API
      const orderPayload = {
        shipping_address: {
          address_line1: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.zipCode,
          country: formData.country || 'India',
        },
        payment_method: formData.cardNumber ? 'card' : 'cash_on_delivery',
        notes: `Customer: ${formData.firstName} ${formData.lastName}, Email: ${formData.email}, Phone: ${formData.phone || 'N/A'}`,
        items: items.map(item => ({
          id: item.product?.id || item.id,
          product_id: item.product?.id || item.id,
          name: item.product?.name || item.name,
          sku: item.product?.sku || item.sku || '',
          price: item.price || item.product?.price || 0,
          quantity: item.quantity || 1,
          variant_id: item.variant?.id || null,
        })),
      };

      // If card details provided, include them
      if (formData.cardNumber) {
        orderPayload.payment_details = {
          card_number: formData.cardNumber,
          expiry_date: formData.expiryDate,
          cardholder_name: formData.cardholderName,
        };
      }

      console.log('Creating order:', orderPayload);
      const response = await orderService.createOrder(orderPayload);
      console.log('Order created successfully:', response);

      // Send confirmation email (optional - may fail if email service not configured)
      try {
        await emailService.sendOrderConfirmation({
          id: response.order?.id || 'N/A',
          customerName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          items: items.map(item => ({
            name: item.product?.name || item.name,
            quantity: item.quantity,
            price: item.price || item.product?.price,
          })),
          total: total,
        }, formData.email);
      } catch (emailError) {
        console.warn('Email notification failed:', emailError);
        // Continue even if email fails
      }

      // Clear cart and move to confirmation
      clearCart();
      setIsProcessing(false);
      setStep(3);
    } catch (error) {
      console.error('Order creation failed:', error);
      setIsProcessing(false);
      alert(`Failed to create order: ${error.response?.data?.error || error.message || 'Unknown error'}. Please try again.`);
    }
  };

  if (items.length === 0 && step !== 3) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Add some items to your cart before checking out.
            </p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          {/* Progress Steps */}
          <div className="checkout-progress">
            <div
              className={`progress-step ${step >= 1 ? "active" : ""} ${
                step > 1 ? "completed" : ""
              }`}
            >
              <div className="step-number">1</div>
              <span>Shipping</span>
            </div>
            <div
              className={`progress-step ${step >= 2 ? "active" : ""} ${
                step > 2 ? "completed" : ""
              }`}
            >
              <div className="step-number">2</div>
              <span>Payment</span>
            </div>
            <div className={`progress-step ${step >= 3 ? "active" : ""}`}>
              <div className="step-number">3</div>
              <span>Confirmation</span>
            </div>
          </div>
        </div>

        <div className="checkout-content">
          <div className="checkout-form">
            {step === 1 && (
              <div className="checkout-step">
                <h2 className="text-2xl font-semibold mb-6">
                  Shipping Information
                </h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={errors.firstName ? "error" : ""}
                    />
                    {errors.firstName && (
                      <span className="error-message">{errors.firstName}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Last Name *</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={errors.lastName ? "error" : ""}
                    />
                    {errors.lastName && (
                      <span className="error-message">{errors.lastName}</span>
                    )}
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? "error" : ""}
                    />
                    {errors.email && (
                      <span className="error-message">{errors.email}</span>
                    )}
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="phone">Phone Number *</label>
                    <PhoneInput
                      value={formData.phone}
                      onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                      onValidationChange={setPhoneValidation}
                      error={errors.phone}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="address">Street Address *</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={errors.address ? "error" : ""}
                    />
                    {errors.address && (
                      <span className="error-message">{errors.address}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={errors.city ? "error" : ""}
                    />
                    {errors.city && (
                      <span className="error-message">{errors.city}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="state">State *</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={errors.state ? "error" : ""}
                    />
                    {errors.state && (
                      <span className="error-message">{errors.state}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="zipCode">ZIP Code *</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className={errors.zipCode ? "error" : ""}
                    />
                    {errors.zipCode && (
                      <span className="error-message">{errors.zipCode}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <Button onClick={handleNextStep}>Continue to Payment</Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="checkout-step">
                <h2 className="text-2xl font-semibold mb-6">
                  Payment Information
                </h2>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label htmlFor="cardNumber">Card Number (Optional - for online payment)</label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      className={errors.cardNumber ? "error" : ""}
                    />
                    {errors.cardNumber && (
                      <span className="error-message">{errors.cardNumber}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="expiryDate">Expiry Date</label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      className={errors.expiryDate ? "error" : ""}
                    />
                    {errors.expiryDate && (
                      <span className="error-message">{errors.expiryDate}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="cvv">CVV</label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      className={errors.cvv ? "error" : ""}
                    />
                    {errors.cvv && (
                      <span className="error-message">{errors.cvv}</span>
                    )}
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="cardholderName">Cardholder Name</label>
                    <input
                      type="text"
                      id="cardholderName"
                      name="cardholderName"
                      value={formData.cardholderName}
                      onChange={handleInputChange}
                      className={errors.cardholderName ? "error" : ""}
                    />
                    {errors.cardholderName && (
                      <span className="error-message">
                        {errors.cardholderName}
                      </span>
                    )}
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="orderNotes">Order Notes (Optional)</label>
                    <textarea
                      id="orderNotes"
                      name="orderNotes"
                      value={formData.orderNotes}
                      onChange={handleInputChange}
                      placeholder="Special instructions for your order..."
                      rows="3"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <Button variant="outline" onClick={handlePreviousStep}>
                    Back
                  </Button>
                  <Button onClick={handleSubmitOrder} disabled={isProcessing}>
                    {isProcessing
                      ? "Processing..."
                      : `Place Order - ${formatCurrency(total)}`}
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="checkout-step checkout-success">
                <div className="success-icon">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="text-green-600"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22,4 12,14.01 9,11.01"></polyline>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-green-600 mb-4">
                  Order Confirmed!
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Thank you for your order. You will receive a confirmation
                  email shortly.
                </p>
                <div className="success-actions">
                  <Button onClick={() => (window.location.href = "/")}>
                    Continue Shopping
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {step !== 3 && (
            <div className="order-summary">
              <h3 className="text-xl font-semibold mb-4">Order Summary</h3>

              <div className="order-items">
                {items.map((item) => (
                  <div key={item.id} className="order-item">
                    <img
                      src={
                        item.product.images?.[0] || "/images/placeholder.svg"
                      }
                      alt={item.product.name}
                      className="item-image"
                    />
                    <div className="item-details">
                      <h4 className="item-name">{item.product.name}</h4>
                      {item.variant && (
                        <p className="item-variant">
                          Color: {item.variant.color}
                        </p>
                      )}
                      <p className="item-quantity">Qty: {item.quantity}</p>
                    </div>
                    <div className="item-price">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-totals">
                <div className="total-line">
                  <span>Subtotal</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="total-line">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="total-line">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="total-line total-final">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
