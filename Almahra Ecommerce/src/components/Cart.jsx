import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatCurrency } from "../utils/helpers.js";
import Button from "./common/Button/Button.jsx";
import "./Cart.css";

const Cart = () => {
  const { items, total, updateQuantity, removeFromCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-header">
          <h1 className="cart-title">Your Shopping Cart</h1>
        </div>
        <div className="cart-empty">
          <div className="cart-empty__icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path>
              <path d="M20 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <h3 className="cart-empty__title">Your cart is empty</h3>
          <p className="cart-empty__message">Looks like you haven't added any items to your cart yet.</p>
          <Link to="/products" className="cart-empty__cta">
            <Button size="large">Start Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1 className="cart-title">Your Shopping Cart</h1>
        <p className="cart-subtitle">{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>
      </div>

      <div className="cart-layout">
        {/* Cart Items */}
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              {/* Product Image */}
              <div className="cart-item__image">
                <img
                  src={item.product.images?.[0] || "/images/placeholder.svg"}
                  alt={item.product.name}
                />
              </div>

              {/* Product Details */}
              <div className="cart-item__details">
                <div className="cart-item__info">
                  <h3 className="cart-item__name">{item.product.name}</h3>
                  <p className="cart-item__brand">{item.product.brand?.name || item.product.brand}</p>

                  {/* Variant Display */}
                  {item.variant && (
                    <div className="cart-item__variant">
                      <span className="variant-label">Color:</span>
                      <div className="variant-display">
                        <div
                          className="variant-color"
                          style={{ backgroundColor: item.variant.colorCode }}
                        ></div>
                        <span className="variant-name">{item.variant.color}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="cart-item__actions">
                  {/* Quantity Controls */}
                  <div className="quantity-controls">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="quantity-btn quantity-btn--decrease"
                      disabled={item.quantity <= 1}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="quantity-btn quantity-btn--increase"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                  </div>

                  {/* Price and Remove */}
                  <div className="cart-item__price-section">
                    <div className="cart-item__price">
                      <span className="price-per-item">
                        ₹{item.variant?.price || item.product?.price || 0}
                      </span>
                      {item.quantity > 1 && (
                        <span className="price-total">
                          ₹{((item.variant?.price || item.product?.price || 0) * item.quantity).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        console.log('Removing item with ID:', item.id);
                        removeFromCart(item.id);
                      }}
                      className="remove-btn"
                      title="Remove item"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="cart-summary">
          <div className="cart-summary__content">
            <h3 className="cart-summary__title">Order Summary</h3>

            <div className="cart-summary__details">
              <div className="summary-row">
                <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="free-shipping">Free</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span className="tax-note">Calculated at checkout</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="cart-summary__actions">
              <Link to="/checkout" className="checkout-btn">
                <Button size="large" className="btn-full">
                  Proceed to Checkout
                </Button>
              </Link>
              <Link to="/products" className="continue-shopping">
                <Button variant="outline" size="medium" className="btn-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>

            {/* Security Badge */}
            <div className="security-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span>Secure checkout guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
