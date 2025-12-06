import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import emailService from '../services/emailService';
import appointmentService from '../services/appointmentService';

const AppointmentContext = createContext();

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within AppointmentProvider');
  }
  return context;
};

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load appointments from backend on mount (only for authenticated users)
  useEffect(() => {
    if (user) {
      loadUserAppointments();
    } else {
      setAppointments([]);
    }
  }, [user]);

  const loadUserAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getUserAppointments();
      // Backend returns {appointments: [...]} so extract the array
      const appointmentsArray = data.appointments || data || [];
      setAppointments(appointmentsArray);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAppointment = async (appointmentData) => {
    try {
      setLoading(true);
      
      // Prepare the data for the backend
      const appointmentPayload = {
        appointment_type: appointmentData.appointmentType,
        appointment_date: appointmentData.date,
        appointment_time: appointmentData.timeSlot,
        notes: appointmentData.notes || '',
      };

      // Add guest information if provided
      if (appointmentData.personalInfo) {
        appointmentPayload.guest_name = appointmentData.personalInfo.name;
        appointmentPayload.guest_email = appointmentData.personalInfo.email;
        appointmentPayload.guest_phone = appointmentData.personalInfo.phone;
      }

      console.log('Sending appointment payload:', appointmentPayload);

      const newAppointment = await appointmentService.createAppointment(appointmentPayload);
      
      // Reload appointments if user is authenticated
      if (user) {
        await loadUserAppointments();
      }
      
      return newAppointment;
    } catch (error) {
      console.error('Failed to create appointment:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserAppointments = (userEmail) => {
    // Return current appointments (already filtered by backend for authenticated users)
    return Array.isArray(appointments) ? appointments : [];
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      setLoading(true);
      const appointment = appointments.find(apt => apt.id === appointmentId);
      
      await appointmentService.cancelAppointment(appointmentId);
      
      // Send cancellation email if appointment exists
      if (appointment && appointment.guest_email) {
        await emailService.sendAppointmentCancellation(
          appointment,
          appointment.guest_email
        );
      }
      
      // Reload appointments
      if (user) {
        await loadUserAppointments();
      } else {
        // Update local state for guest
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, status: 'cancelled' }
              : apt
          )
        );
      }
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAllAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAllAppointments();
      return data;
    } catch (error) {
      console.error('Failed to load all appointments:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    appointments,
    loading,
    addAppointment,
    getUserAppointments,
    cancelAppointment,
    getAllAppointments
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};
