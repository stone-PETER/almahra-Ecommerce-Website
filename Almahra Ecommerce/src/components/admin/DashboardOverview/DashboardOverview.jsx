import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService.js';
import './DashboardOverview.css';

const DashboardOverview = ({ setActiveTab }) => {
  const [stats, setStats] = useState({
    totalSales: 0,
    orders: 0,
    products: 0,
    customers: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await adminService.getDashboard();
        
        // Map backend metrics to frontend stats
        if (response.metrics) {
          setStats({
            totalSales: response.metrics.total_revenue || 0,
            orders: response.metrics.total_orders || 0,
            products: response.metrics.total_products || 0,
            customers: response.metrics.total_customers || 0
          });
        }
        
        setRecentOrders(response.recent_orders || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsDisplay = [
    {
      title: 'Total Sales',
      value: `₹${stats.totalSales.toLocaleString()}`,
      change: null,
      trend: 'up',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      )
    },
    {
      title: 'Orders',
      value: stats.orders.toString(),
      change: null,
      trend: 'up',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
        </svg>
      )
    },
    {
      title: 'Products',
      value: stats.products.toString(),
      change: null,
      trend: 'up',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="m7.5 4.27 9 5.15"></path>
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
          <path d="m3.3 7 8.7 5 8.7-5"></path>
          <path d="M12 22V12"></path>
        </svg>
      )
    },
    {
      title: 'Customers',
      value: stats.customers.toString(),
      change: null,
      trend: 'up',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    }
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status--success';
      case 'processing':
        return 'status--warning';
      case 'pending':
        return 'status--pending';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-overview">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-overview">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard Overview</h1>
        <p className="dashboard-subtitle">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statsDisplay.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-card__header">
              <div className="stat-card__icon">
                {stat.icon}
              </div>
              {stat.change && (
                <div className={`stat-card__change ${stat.trend === 'up' ? 'stat-card__change--positive' : 'stat-card__change--negative'}`}>
                  {stat.change}
                </div>
              )}
            </div>
            <div className="stat-card__content">
              <h3 className="stat-card__value">{stat.value}</h3>
              <p className="stat-card__title">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="dashboard-content-grid">
        {/* Recent Orders */}
        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <h2 className="dashboard-card__title">Recent Orders</h2>
            <button className="dashboard-card__action">View All</button>
          </div>
          <div className="dashboard-card__content">
            <div className="orders-table">
              <div className="orders-table__header">
                <div className="orders-table__cell">Order ID</div>
                <div className="orders-table__cell">Customer</div>
                <div className="orders-table__cell">Product</div>
                <div className="orders-table__cell">Amount</div>
                <div className="orders-table__cell">Status</div>
              </div>
              {recentOrders.map((order) => (
                <div key={order.id} className="orders-table__row">
                  <div className="orders-table__cell orders-table__cell--id">{order.id}</div>
                  <div className="orders-table__cell">{order.customer}</div>
                  <div className="orders-table__cell">{order.product}</div>
                  <div className="orders-table__cell orders-table__cell--amount">{order.amount}</div>
                  <div className="orders-table__cell">
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <h2 className="dashboard-card__title">Quick Actions</h2>
          </div>
          <div className="dashboard-card__content">
            <div className="quick-actions">
              <button className="quick-action" onClick={() => setActiveTab('products')}>
                <div className="quick-action__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                </div>
                <span>Add Product</span>
              </button>
              <button className="quick-action" onClick={() => setActiveTab('users')}>
                <div className="quick-action__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <span>View Customers</span>
              </button>
              <button className="quick-action" onClick={() => setActiveTab('analytics')}>
                <div className="quick-action__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"></polyline>
                  </svg>
                </div>
                <span>View Analytics</span>
              </button>
              <button className="quick-action" onClick={() => setActiveTab('products')}>
                <div className="quick-action__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                    <circle cx="12" cy="13" r="3"></circle>
                  </svg>
                </div>
                <span>Manage Inventory</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
