import React, { useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar/AdminSidebar.jsx';
import DashboardOverview from '../../components/admin/DashboardOverview/DashboardOverview.jsx';
import ProductManagement from '../../components/admin/ProductManagement/ProductManagement.jsx';
import OrderManagement from '../../components/admin/OrderManagement/OrderManagement.jsx';
import UserManagement from '../../components/admin/UserManagement/UserManagement.jsx';
import AnalyticsDashboard from '../../components/admin/AnalyticsDashboard/AnalyticsDashboard.jsx';
import EmailLog from '../../components/admin/EmailLog/EmailLog.jsx';
import ContactManagement from '../../components/admin/ContactManagement/ContactManagement.jsx';
import AppointmentManagement from '../../components/admin/AppointmentManagement/AppointmentManagement.jsx';
import './AdminPage.css';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview setActiveTab={setActiveTab} />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'users':
        return <UserManagement />;
      case 'appointments':
        return <AppointmentManagement />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'emails':
        return <EmailLog />;
      case 'contact':
        return <ContactManagement />;
      default:
        return <DashboardOverview setActiveTab={setActiveTab} />;
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-page">
      {/* Mobile Header */}
      <div className="admin-header">
        <button 
          className="admin-header__menu-btn"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1 className="admin-header__title">Admin Dashboard</h1>
        <div className="admin-header__user">
          <span className="admin-header__user-name">Admin User</span>
          <div className="admin-header__user-avatar">A</div>
        </div>
      </div>

      <div className="admin-layout">
        {/* Sidebar */}
        <AdminSidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="admin-main">
          <div className="admin-content">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="admin-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminPage;
