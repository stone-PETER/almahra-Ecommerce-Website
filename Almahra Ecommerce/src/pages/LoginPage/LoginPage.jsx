import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import PhoneInput from "../../components/common/PhoneInput/PhoneInput";
import { validatePhoneNumber } from "../../utils/phoneValidation";
import "./LoginPage.css";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [phoneValidation, setPhoneValidation] = useState({ isValid: false });

  const { login, register } = useAuth();
  const navigate = useNavigate();

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

  const validateForm = () => {
    const newErrors = {};

    if (isLogin) {
      // Login validation - email or phone
      if (!formData.emailOrPhone) {
        newErrors.emailOrPhone = "Email or phone number is required";
      } else {
        // Check if it's email or phone
        const isEmail = formData.emailOrPhone.includes("@");
        const isPhone = /^\+?[\d\s\-()]+$/.test(
          formData.emailOrPhone.replace(/\s/g, "")
        );

        if (!isEmail && !isPhone) {
          newErrors.emailOrPhone =
            "Please enter a valid email address or phone number";
        } else if (
          isEmail &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailOrPhone)
        ) {
          newErrors.emailOrPhone = "Please enter a valid email address";
        } else if (
          isPhone &&
          formData.emailOrPhone.replace(/[\s\-()]/g, "").length < 10
        ) {
          newErrors.emailOrPhone = "Please enter a valid phone number";
        }
      }
    } else {
      // Registration validation
      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }

      if (!formData.phone) {
        newErrors.phone = "Phone number is required";
      } else if (!phoneValidation.isValid) {
        newErrors.phone =
          phoneValidation.error || "Please enter a valid phone number";
      }

      if (!formData.firstName) {
        newErrors.firstName = "First name is required";
      }
      if (!formData.lastName) {
        newErrors.lastName = "Last name is required";
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    // Password validation (common for both)
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one special character (!@#$%^&*...)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      let result;

      if (isLogin) {
        result = await login(formData.emailOrPhone, formData.password);
      } else {
        result = await register(formData);
      }

      if (result.success) {
        navigate("/profile");
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      setErrors({ submit: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      emailOrPhone: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      confirmPassword: "",
    });
    setErrors({});
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <Link to="/" className="logo-link">
            <h2 className="logo">Almahra Opticals</h2>
          </Link>
          <h1 className="login-title">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="login-subtitle">
            {isLogin
              ? "Sign in to your account to continue"
              : "Join us and discover premium eyewear"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`form-input ${errors.firstName ? "form-input--error" : ""}`}
                  placeholder="Enter your first name"
                />
                {errors.firstName && (
                  <span className="form-error">{errors.firstName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`form-input ${errors.lastName ? "form-input--error" : ""}`}
                  placeholder="Enter your last name"
                />
                {errors.lastName && (
                  <span className="form-error">{errors.lastName}</span>
                )}
              </div>
            </div>
          )}

          {isLogin ? (
            <div className="form-group">
              <label htmlFor="emailOrPhone" className="form-label">
                Email or Phone Number
              </label>
              <input
                type="text"
                id="emailOrPhone"
                name="emailOrPhone"
                value={formData.emailOrPhone}
                onChange={handleInputChange}
                className={`form-input ${errors.emailOrPhone ? "form-input--error" : ""}`}
                placeholder="Enter your email address or phone number"
              />
              {errors.emailOrPhone && (
                <span className="form-error">{errors.emailOrPhone}</span>
              )}
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`form-input ${errors.email ? "form-input--error" : ""}`}
                placeholder="Enter your email address"
              />
              {errors.email && (
                <span className="form-error">{errors.email}</span>
              )}
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <PhoneInput
                value={formData.phone}
                onChange={(phone) =>
                  setFormData((prev) => ({ ...prev, phone }))
                }
                onValidationChange={setPhoneValidation}
                error={errors.phone}
                placeholder="Enter your phone number"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`form-input ${errors.password ? "form-input--error" : ""}`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <span className="form-error">{errors.password}</span>
            )}
            {!isLogin && !errors.password && (
              <div
                className="form-hint"
                style={{
                  fontSize: "0.875rem",
                  color: "#666",
                  marginTop: "0.25rem",
                }}
              >
                Must be 8+ characters with uppercase, lowercase, number, and
                special character
              </div>
            )}
            {isLogin && (
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot Password?
              </Link>
            )}
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`form-input ${errors.confirmPassword ? "form-input--error" : ""}`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <span className="form-error">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          {errors.submit && (
            <div className="form-error form-error--submit">{errors.submit}</div>
          )}

          <button
            type="submit"
            className={`login-btn ${isLoading ? "login-btn--loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="btn-spinner"></div>
                {isLogin ? "Signing In..." : "Creating Account..."}
              </>
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="toggle-text">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={toggleMode} className="toggle-btn">
              {isLogin ? "Create one" : "Sign in"}
            </button>
          </p>

          {isLogin && (
            <p className="admin-login-text">
              Are you an admin?{" "}
              <Link to="/admin/login" className="admin-login-link">
                Sign in here
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
