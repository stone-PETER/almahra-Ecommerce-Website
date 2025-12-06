import api from './api';

const appointmentService = {
  // Create a new appointment (supports both authenticated users and guests)
  createAppointment: async (appointmentData) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to create appointment' };
    }
  },

  // Get all appointments for the authenticated user
  getUserAppointments: async () => {
    try {
      const response = await api.get('/appointments');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch appointments' };
    }
  },

  // Get a specific appointment by ID
  getAppointment: async (id) => {
    try {
      const response = await api.get(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch appointment' };
    }
  },

  // Update an appointment
  updateAppointment: async (id, appointmentData) => {
    try {
      const response = await api.put(`/appointments/${id}`, appointmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update appointment' };
    }
  },

  // Cancel an appointment
  cancelAppointment: async (id) => {
    try {
      const response = await api.delete(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to cancel appointment' };
    }
  },

  // Admin: Get all appointments
  getAllAppointments: async () => {
    try {
      const response = await api.get('/appointments/admin/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch all appointments' };
    }
  },

  // Admin: Update appointment status
  updateAppointmentStatus: async (id, status) => {
    try {
      const response = await api.put(`/appointments/admin/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update appointment status' };
    }
  },
};

export default appointmentService;
