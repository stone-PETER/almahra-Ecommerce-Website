import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "./ForgotPasswordPage.css";

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Enter email, 2: Check email message
  const [formData, setFormData] = useState({
    email: "",
    token: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
    if (message) setMessage("");
  };

  // Step 1: Send password reset email
  const handleSendCode = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage("");

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      setErrors({ email: "Email is required" });
      return;
    }
    if (!emailRegex.test(formData.email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/auth/forgot-password", { email: formData.email });
      setMessage(
        "If your email is registered, you will receive a password reset link shortly."
      );
      setStep(2);
    } catch (error) {
      console.error("Forgot password error:", error);
      // Show generic success message for security
      setMessage(
        "If your email is registered, you will receive a password reset link shortly."
      );
      setStep(2);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="forgot-password-header">
            <h1>Reset Password</h1>
            <p>
              {step === 1 &&
                "Enter your email to receive a password reset link"}
              {step === 2 && "Check your email for the reset link"}
            </p>
          </div>

          {message && <div className="message success">{message}</div>}

          {errors.general && (
            <div className="message error">{errors.general}</div>
          )}

          {/* Step 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleSendCode} className="forgot-password-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your registered email"
                  className={errors.email ? "input-error" : ""}
                  autoFocus
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>

              <div className="form-footer">
                <Link to="/login" className="back-link">
                  ← Back to Login
                </Link>
              </div>
            </form>
          )}

          {/* Step 2: Success Message */}
          {step === 2 && (
            <div className="success-container">
              <div className="success-icon">✉️</div>
              <p className="success-text">
                Please check your email inbox for a password reset link. Click
                the link in the email to reset your password.
              </p>
              <div className="form-footer">
                <Link to="/login" className="btn btn-secondary">
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
