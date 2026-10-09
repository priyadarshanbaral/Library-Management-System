import { useState } from "react";
import { Link } from "react-router-dom";
import "../CSS/StudentLogin.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

function StudentLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  let [student, setStudent] = useState({
    email: "",
    password: "",
  });

  let navigate = useNavigate();

  function handleInput(e) {
    setStudent({
      ...student,
      [e.target.name]: e.target.value.trim(),
    });
  }

  async function handleForm(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/api/student/login", {
        email: student.email,
        password: student.password,
      });

      if (res.data.success) {
        toast.success("Student Login Success");
        localStorage.setItem("student", JSON.stringify(res.data.data));
        navigate("/dashboardhome");
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
    <div className="login-container">
      {/* Floating background particles */}
      <div className="floating-books">
        <span className="fb fb1">📕</span>
        <span className="fb fb2">📗</span>
        <span className="fb fb3">📘</span>
        <span className="fb fb4">📙</span>
        <span className="fb fb5">📚</span>
        <span className="fb fb6">📖</span>
      </div>

      <div className="login-wrapper">
        {/* ---------- Left Branding Panel ---------- */}
        <div className="login-brand">
          <div className="brand-content">
            <div className="brand-logo">📚</div>
            <h1>Central Library</h1>
            <p className="brand-tagline">
              Your gateway to thousands of books, journals, and digital
              resources.
            </p>

            <div className="brand-features">
              <div className="brand-feature">
                <span>🔍</span>
                <div>
                  <h4>Browse Catalog</h4>
                  <p>Search thousands of books easily</p>
                </div>
              </div>
              <div className="brand-feature">
                <span>📤</span>
                <div>
                  <h4>Online Issuing</h4>
                  <p>Issue books without queues</p>
                </div>
              </div>
              <div className="brand-feature">
                <span>📜</span>
                <div>
                  <h4>Track History</h4>
                  <p>Keep a record of every book</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Right Login Form ---------- */}
        <div className="login-card">
          <Link to="/" className="back-home-link">
            ← Back to Home
          </Link>

          <div className="logo">🎓</div>

          <h2>Welcome Back!</h2>
          <p className="subtitle">Login to access your Library Dashboard</p>

          <form onSubmit={handleForm}>
            <div className="input-group">
              <label>Email Address</label>
              <div className="input-box">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  placeholder="Enter your email"
                  name="email"
                  onChange={handleInput}
                  value={student.email}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-box">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  name="password"
                  onChange={handleInput}
                  value={student.password}
                />
                <button
                  type="button"
                  className="show-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈 Hide" : "👁️ Show"}
                </button>
              </div>
            </div>

            <div className="login-options">
              <span style={{ fontSize: "13px", color: "#64748b" }}>
                Default password: DOB (DDMMYYYY)
              </span>
            </div>

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="btn-spinner"></span> LOGGING IN...
                </span>
              ) : (
                "Login →"
              )}
            </button>
          </form>

          <p className="login-footer">
            New student? <Link to="/">Contact the library</Link> to get your
            account created.
          </p>
        </div>
      </div>
    </div>
  );
}

export default StudentLogin;

