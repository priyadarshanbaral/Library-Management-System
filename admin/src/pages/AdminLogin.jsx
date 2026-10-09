import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import "../CSS/AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [adminData, setAdminData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleInput(e) {
    setAdminData({
      ...adminData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleForm(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/api/admin/login", {
        email: adminData.email,
        password: adminData.password,
      });

      if (res.data.success) {
        toast.success("Admin Login Success");
        localStorage.setItem("admin", JSON.stringify(res.data.data));
        navigate("/admindashboard");
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Invalid Email or Password";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      {/* Floating background particles */}
      <div className="floating-icons">
        <span className="fi fi1">📚</span>
        <span className="fi fi2">🛡️</span>
        <span className="fi fi3">📖</span>
        <span className="fi fi4">🗂️</span>
        <span className="fi fi5">📊</span>
        <span className="fi fi6">🔐</span>
      </div>

      <div className="login-wrapper">
        {/* ---------- Left Branding Panel ---------- */}
        <div className="login-brand">
          <div className="brand-content">
            <div className="brand-logo">🛡️</div>
            <h1>Library Admin Panel</h1>
            <p className="brand-tagline">
              Complete control over books, students, and library operations —
              all from one secure dashboard.
            </p>

            <div className="brand-features">
              <div className="brand-feature">
                <span>📚</span>
                <div>
                  <h4>Manage Books</h4>
                  <p>Add, update, and remove books easily</p>
                </div>
              </div>
              <div className="brand-feature">
                <span>🎓</span>
                <div>
                  <h4>Manage Students</h4>
                  <p>Register and maintain student records</p>
                </div>
              </div>
              <div className="brand-feature">
                <span>📤</span>
                <div>
                  <h4>Issue & Track</h4>
                  <p>Issue, submit, and monitor book circulation</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Right Login Form ---------- */}
        <div className="login-form-wrapper">
          <a href="/" className="back-home-link">
            ← Back to Home
          </a>

          <form className="login-form" onSubmit={handleForm}>
            <div className="form-logo">👨‍💼</div>
            <h2>Admin Login</h2>
            <p>Welcome Back! Please login to continue.</p>

          <div className="input-box">
            <span className="input-icon">📧</span>
            <input
              type="email"
              name="email"
              placeholder="Enter Email ID"
              value={adminData.email}
              onChange={handleInput}
              required
            />
          </div>

          <div className="input-box">
            <span className="input-icon">🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter Password"
              value={adminData.password}
              onChange={handleInput}
              required
            />
      
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="btn-spinner"></span> LOGGING IN...
              </span>
            ) : (
              "LOGIN →"
            )}
          </button>

          <p className="login-footer">
            <span>🔒</span> Secure administrator access only.
          </p>

          <div className="student-panel-link">
            <span>🎓</span>
            <a href="/studentlogin">
              Login to Student Panel
            </a>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;


