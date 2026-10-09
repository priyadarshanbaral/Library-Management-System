import React from "react";
import { Link } from "react-router-dom";
import "../CSS/LibraryHome.css";

function LibraryHome() {
  return (
    <div className="library-home">
      {/* ---------- Navbar ---------- */}
      <header className="home-navbar">
        <div className="home-logo">
          📚 <span>Library Management System</span>
        </div>
        <nav className="home-nav-links">
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#login">Login</a>
        </nav>
      </header>

      {/* ---------- Hero Section ---------- */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to the Central Library 📖</h1>
          <p>
            A digital gateway to thousands of books, journals, and resources.
            Browse the collection, issue books, track your reading history, and
            explore the world of knowledge — all from one place.
          </p>
          <div className="hero-buttons">
            <a href="#login" className="btn btn-primary">
              Get Started
            </a>
            <a href="#about" className="btn btn-outline">
              Learn More
            </a>
          </div>
        </div>
        <div className="hero-illustration">📚</div>
      </section>

      {/* ---------- About Section ---------- */}
      <section className="about" id="about">
        <div className="about-blob blob-1"></div>
        <div className="about-blob blob-2"></div>

        <span className="section-tag">About Us</span>
        <h2>About Our Library</h2>
        <p className="about-text">
          Our Library Management System is built to make learning easy and
          accessible for every student. We maintain a rich and ever-growing
          collection of academic textbooks, reference books, novels, and
          digital resources across all departments.
        </p>
        <p className="about-text">
          The library is open to all students and staff. Members can search the
          catalog, issue books online, request new books, and track their
          borrowing history — all through a simple and secure digital platform.
        </p>

        <div className="about-info">
          <div className="info-box">
            <span className="info-icon">📕</span>
            <h3>10,000+</h3>
            <p>Books in Collection</p>
          </div>
          <div className="info-box">
            <span className="info-icon">🎓</span>
            <h3>2,500+</h3>
            <p>Active Students</p>
          </div>
          <div className="info-box">
            <span className="info-icon">🕘</span>
            <h3>8 AM – 8 PM</h3>
            <p>Library Hours</p>
          </div>
        </div>

        <div className="mission-vision">
          <div className="mv-card mission">
            <span className="mv-icon">🎯</span>
            <h3>Our Mission</h3>
            <p>
              To empower every student with free, easy access to knowledge by
              providing a modern, well-organized library experience both on
              campus and online.
            </p>
          </div>
          <div className="mv-card vision">
            <span className="mv-icon">🌟</span>
            <h3>Our Vision</h3>
            <p>
              To become the heart of learning on campus — a digital-first
              library where every student can discover, borrow, and grow.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Features Section ---------- */}
      <section className="features" id="features">
        <h2>Why Choose Our Library?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Easy Book Search</h3>
            <p>Find any book quickly with a smart search and browse by category.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📤</div>
            <h3>Online Book Issuing</h3>
            <p>Issue books digitally without standing in long queues.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📜</div>
            <h3>Borrowing History</h3>
            <p>Track every book you have borrowed and returned.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Request a Book</h3>
            <p>Request new books and the library will add them for you.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👨‍💼</div>
            <h3>Admin Management</h3>
            <p>Admins can add books, manage students, and handle issuing.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Secure Login</h3>
            <p>Separate, secure logins for students and library admins.</p>
          </div>
        </div>
      </section>

      {/* ---------- Login Selection ---------- */}
      <section className="login-section" id="login">
        <h2>Choose Your Login</h2>
        <p className="login-subtitle">
          Login as a Student to manage your library account, or as an Admin to
          manage the library.
        </p>

        <div className="login-cards">
          <div className="login-card admin-card">
            <div className="login-icon">👨‍💼</div>
            <h3>Admin Login</h3>
            <p>
              Manage books, add/remove students, issue books, and view library
              statistics.
            </p>
            <a href="/admin/" className="btn btn-admin">
              Login as Admin
            </a>
          </div>

          <div className="login-card student-card">
            <div className="login-icon">🎓</div>
            <h3>Student Login</h3>
            <p>
              Browse all books, issue books, request new ones, and check your
              borrowing history.
            </p>
            <Link to="/studentlogin" className="btn btn-student">
              Login as Student
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="home-footer">
        <p>
          © {new Date().getFullYear()} Library Management System. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}

export default LibraryHome;

