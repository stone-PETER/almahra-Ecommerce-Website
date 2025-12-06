import React, { useState, useEffect } from 'react';
import appointmentService from '../../../services/appointmentService';
import './AppointmentManagement.css';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAllAppointments();
      // Backend returns {appointments: [...]} so extract the array
      const appointmentsArray = data.appointments || data || [];
      setAppointments(appointmentsArray);
    } catch (error) {
      console.error('Failed to load appointments:', error);
      alert('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      // Reload appointments
      await loadAppointments();
      alert('Appointment status updated successfully');
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update appointment status');
    }
  };

  const getFilteredAppointments = () => {
    let filtered = appointments;

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(apt => apt.status.toLowerCase() === filter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(apt => 
        apt.customer_name?.toLowerCase().includes(term) ||
        apt.customer_email?.toLowerCase().includes(term) ||
        apt.customer_phone?.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusBadgeClass = (status) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return 'badge badge--warning';
      case 'confirmed':
        return 'badge badge--info';
      case 'completed':
        return 'badge badge--success';
      case 'cancelled':
        return 'badge badge--danger';
      default:
        return 'badge';
    }
  };

  const filteredAppointments = getFilteredAppointments();

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status.toLowerCase() === 'pending').length,
    confirmed: appointments.filter(a => a.status.toLowerCase() === 'confirmed').length,
    completed: appointments.filter(a => a.status.toLowerCase() === 'completed').length,
    cancelled: appointments.filter(a => a.status.toLowerCase() === 'cancelled').length,
  };

  if (loading) {
    return <div className="loading">Loading appointments...</div>;
  }

  return (
    <div className="appointment-management">
      <div className="appointment-management__header">
        <h2>Appointment Management</h2>
        <button className="btn btn--primary" onClick={loadAppointments}>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="appointment-stats">
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--blue">📅</div>
          <div className="stat-card__content">
            <h3>{stats.total}</h3>
            <p>Total Appointments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--yellow">⏳</div>
          <div className="stat-card__content">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--info">✓</div>
          <div className="stat-card__content">
            <h3>{stats.confirmed}</h3>
            <p>Confirmed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--green">✓✓</div>
          <div className="stat-card__content">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--red">✕</div>
          <div className="stat-card__content">
            <h3>{stats.cancelled}</h3>
            <p>Cancelled</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="appointment-filters">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'filter-tab--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({stats.total})
          </button>
          <button 
            className={`filter-tab ${filter === 'pending' ? 'filter-tab--active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({stats.pending})
          </button>
          <button 
            className={`filter-tab ${filter === 'confirmed' ? 'filter-tab--active' : ''}`}
            onClick={() => setFilter('confirmed')}
          >
            Confirmed ({stats.confirmed})
          </button>
          <button 
            className={`filter-tab ${filter === 'completed' ? 'filter-tab--active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({stats.completed})
          </button>
          <button 
            className={`filter-tab ${filter === 'cancelled' ? 'filter-tab--active' : ''}`}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled ({stats.cancelled})
          </button>
        </div>
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Appointments Table */}
      <div className="appointments-table-container">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Contact</th>
              <th>Type</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">No appointments found</td>
              </tr>
            ) : (
              filteredAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>#{appointment.id}</td>
                  <td>
                    <div className="customer-info">
                      <strong>{appointment.customer_name}</strong>
                      {appointment.user_id && <span className="badge badge--sm badge--primary">User</span>}
                      {!appointment.user_id && <span className="badge badge--sm badge--secondary">Guest</span>}
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div>{appointment.customer_email}</div>
                      <div className="text-muted">{appointment.customer_phone || '-'}</div>
                    </div>
                  </td>
                  <td>
                    <span className="appointment-type">
                      {appointment.appointment_type?.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="datetime-info">
                      <div>{formatDate(appointment.appointment_date)}</div>
                      <div className="text-muted">{appointment.appointment_time}</div>
                    </div>
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(appointment.status)}>
                      {appointment.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {appointment.status.toLowerCase() === 'pending' && (
                        <>
                          <button 
                            className="btn btn--sm btn--success"
                            onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                          >
                            Confirm
                          </button>
                          <button 
                            className="btn btn--sm btn--danger"
                            onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {appointment.status.toLowerCase() === 'confirmed' && (
                        <>
                          <button 
                            className="btn btn--sm btn--success"
                            onClick={() => handleStatusChange(appointment.id, 'completed')}
                          >
                            Complete
                          </button>
                          <button 
                            className="btn btn--sm btn--danger"
                            onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {(appointment.status.toLowerCase() === 'completed' || 
                        appointment.status.toLowerCase() === 'cancelled') && (
                        <span className="text-muted">No actions</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentManagement;
