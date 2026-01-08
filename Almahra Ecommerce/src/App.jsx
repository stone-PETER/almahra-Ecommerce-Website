import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AppointmentProvider } from "./context/AppointmentContext.jsx";
import Header from "./components/layout/Header/Header.jsx";
import HomePage from "./pages/HomePage/HomePage.jsx";
import ProductsPage from "./pages/ProductsPage/ProductsPage.jsx";
import CartPage from "./pages/CartPage/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage/CheckoutPage.jsx";
import AdminPage from "./pages/AdminPage/AdminPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage/AdminLoginPage.jsx";
import UserProfilePage from "./pages/UserProfilePage/UserProfilePage.jsx";
import LoginPage from "./pages/LoginPage/LoginPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage/ResetPasswordPage.jsx";
import AppointmentPage from "./pages/AppointmentPage/AppointmentPage.jsx";
import ContactPage from "./pages/ContactPage/ContactPage.jsx";
import AboutPage from "./pages/AboutPage/AboutPage.jsx";
import "./styles/variables.css";
import "./styles/global.css";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <AppointmentProvider>
        <CartProvider>
          <Router>
        <div className="app">
          <Routes>
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/*" element={<AdminPage />} />
            <Route path="*" element={
              <>
                <Header />
                <main className="main">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:category" element={<ProductsPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/profile" element={<UserProfilePage />} />
                    <Route path="/appointment" element={<AppointmentPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/about" element={<AboutPage />} />
                  </Routes>
                </main>
              </>
            } />
          </Routes>
        </div>
        </Router>
      </CartProvider>
      </AppointmentProvider>
    </AuthProvider>
  );
}

export default App;
