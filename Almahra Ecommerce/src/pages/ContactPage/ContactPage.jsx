import React, { useState } from "react";
import PhoneInput from "../../components/common/PhoneInput/PhoneInput";
import api from "../../services/api";
import "./ContactPage.css";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [phoneValidation, setPhoneValidation] = useState({ isValid: false });

  const handleChange = (e) => {
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneValidation.isValid) {
      newErrors.phone =
        phoneValidation.error || "Please enter a valid phone number";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Send to backend API
      await api.post("/contact", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });

      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });

      // Scroll to success message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Get in touch with us!</p>
        </div>
      </div>

      <div className="container">
        <div className="contact-content">
          {/* Contact Information */}
          <div className="contact-info-section">
            <div className="contact-info-card">
              <div className="info-icon">✉️</div>
              <h3>Email Us</h3>
              <p>Send us your queries anytime</p>
              <a
                href="mailto:support@almahra-opticals.com"
                className="contact-link"
              >
                support@almahra-opticals.com
              </a>
            </div>

            <div className="contact-info-card">
              <div className="info-icon">🕒</div>
              <h3>Working Hours</h3>
              <p>
                <strong>Sat - Thu:</strong> 9:30 AM - 11:00 PM
              </p>
              <p>
                <strong>Friday:</strong> 3:00 PM - 11:00 PM
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-section">
            <div className="contact-form-card">
              <h2>Send Us a Message</h2>
              <p className="form-subtitle">
                Fill out the form below and we'll get back to you as soon as
                possible
              </p>

              {submitStatus === "success" && (
                <div className="alert alert-success">
                  <strong>✓ Message sent successfully!</strong>
                  <p>
                    Thank you for contacting us. We'll get back to you within 24
                    hours.
                  </p>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="alert alert-error">
                  <strong>✗ Error sending message</strong>
                  <p>
                    Please try again or contact us directly via phone or email.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className={errors.name ? "input-error" : ""}
                    />
                    {errors.name && (
                      <span className="error-message">{errors.name}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className={errors.email ? "input-error" : ""}
                    />
                    {errors.email && (
                      <span className="error-message">{errors.email}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <PhoneInput
                      value={formData.phone}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, phone: value }))
                      }
                      onValidationChange={setPhoneValidation}
                      error={errors.phone}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={errors.subject ? "input-error" : ""}
                    >
                      <option value="">Select a subject</option>
                      <option value="Product Inquiry">Product Inquiry</option>
                      <option value="Order Status">Order Status</option>
                      <option value="Appointment">Appointment Query</option>
                      <option value="Eye Test">Eye Test Information</option>
                      <option value="Prescription">Prescription Related</option>
                      <option value="Feedback">Feedback</option>
                      <option value="Complaint">Complaint</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.subject && (
                      <span className="error-message">{errors.subject}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your query..."
                    rows="6"
                    className={errors.message ? "input-error" : ""}
                  />
                  {errors.message && (
                    <span className="error-message">{errors.message}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="btn-spinner"></div>
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
