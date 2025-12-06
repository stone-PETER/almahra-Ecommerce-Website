import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../common/Button/Button.jsx';
import './OrderHistory.css';

const OrderHistory = ({ orders }) => {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'delivered':
        return 'order-status--delivered';
      case 'processing':
        return 'order-status--processing';
      case 'shipped':
        return 'order-status--shipped';
      case 'cancelled':
        return 'order-status--cancelled';
      default:
        return 'order-status--pending';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const handleTrackOrder = (order) => {
    // Implementation for order tracking
    console.log('Tracking order:', order.trackingNumber);
  };

  return (
    <div className="order-history">
      <div className="order-history__header">
        <h2 className="order-history__title">Order History</h2>
        <p className="order-history__subtitle">
          Track and manage your orders
        </p>
      </div>

      {orders && orders.length > 0 ? (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card__header">
                <div className="order-card__info">
                  <h3 className="order-card__id">{order.order_number}</h3>
                  <p className="order-card__date">Ordered on {formatDate(order.created_at)}</p>
                </div>
                <div className="order-card__status">
                  <span className={`order-status ${getStatusBadgeClass(order.status?.toLowerCase())}`}>
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>

              <div className="order-card__content">
                <div className="order-items">
                  {order.items && order.items.length > 0 ? order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="order-item__details">
                        <h4 className="order-item__name">{item.product_name}</h4>
                        <p className="order-item__quantity">Qty: {item.quantity}</p>
                        <p className="order-item__price">{formatPrice(item.unit_price)}</p>
                      </div>
                      <div className="order-item__price">
                        {formatPrice(item.total_price)}
                      </div>
                    </div>
                  )) : (
                    <p className="order-items__empty">{order.item_count || 0} item(s)</p>
                  )}
                </div>

                <div className="order-card__total">
                  <span className="order-total__label">Total: </span>
                  <span className="order-total__amount">{formatPrice(order.total_amount)}</span>
                </div>
              </div>

              <div className="order-card__actions">
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => handleViewOrder(order)}
                >
                  View Details
                </Button>
                
                {(order.status?.toLowerCase() === 'processing' || order.status?.toLowerCase() === 'shipped') && (
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handleTrackOrder(order)}
                  >
                    Track Order
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state__icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
            </svg>
          </div>
          <h3 className="empty-state__title">No Orders Yet</h3>
          <p className="empty-state__message">
            You haven't placed any orders yet. Start shopping to see your order history here.
          </p>
          <Button variant="primary" size="medium" onClick={() => navigate('/products')}>
            Start Shopping
          </Button>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="order-modal">
          <div className="order-modal__backdrop" onClick={handleCloseModal}></div>
          <div className="order-modal__content">
            <div className="order-modal__header">
              <h3 className="order-modal__title">Order Details - {selectedOrder.id}</h3>
              <button 
                className="order-modal__close"
                onClick={handleCloseModal}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <div className="order-modal__body">
              <div className="order-detail-section">
                <h4>Order Information</h4>
                <div className="order-detail-grid">
                  <div className="order-detail-item">
                    <span className="detail-label">Order ID:</span>
                    <span className="detail-value">{selectedOrder.id}</span>
                  </div>
                  <div className="order-detail-item">
                    <span className="detail-label">Order Date:</span>
                    <span className="detail-value">{formatDate(selectedOrder.date)}</span>
                  </div>
                  <div className="order-detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`order-status ${getStatusBadgeClass(selectedOrder.status)}`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </div>
                  <div className="order-detail-item">
                    <span className="detail-label">Total:</span>
                    <span className="detail-value">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              <div className="order-detail-section">
                <h4>Shipping Address</h4>
                <div className="shipping-address">
                  <p>{selectedOrder.shippingAddress.addressLine1}</p>
                  {selectedOrder.shippingAddress.addressLine2 && (
                    <p>{selectedOrder.shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                  </p>
                </div>
              </div>

              {selectedOrder.trackingNumber && (
                <div className="order-detail-section">
                  <h4>Tracking Information</h4>
                  <p className="tracking-number">
                    Tracking Number: <strong>{selectedOrder.trackingNumber}</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;