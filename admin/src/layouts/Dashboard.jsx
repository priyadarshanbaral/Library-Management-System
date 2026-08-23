import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../CSS/Dashboard.css";
import API from "../api";

function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalBooks: 0,
    booksIssued: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/stats");
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Stats error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const booksReturned =
    stats.totalBooks - stats.booksIssued >= 0
      ? stats.totalBooks - stats.booksIssued
      : 0;

  const adminData = JSON.parse(localStorage.getItem("admin") || "{}");

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 17
        ? "Good Afternoon"
        : hour < 21
          ? "Good Evening"
          : "Good Night";

  const firstName = (adminData.name || "Admin").split(" ")[0];

  return (
    <div className="dashboard-home">
      {/* ---------- Welcome Banner ---------- */}
      <div className="welcome-card">
        <div className="welcome-overlay"></div>
        <div className="welcome-content">
          <div className="welcome-avatar">
            {firstName.charAt(0).toUpperCase()}
          </div>
          <div className="welcome-text">
            <span className="welcome-greeting">{greeting} 👋</span>
            <h2>{adminData.name || "Library Administrator"}</h2>
            <p>
              Manage books, students, and track all library operations from
              this central control panel.
            </p>
          </div>
          <div className="welcome-date">
            <span className="date-icon">🗓️</span>
            <span>
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* ---------- Stats Cards ---------- */}
      <div className="cards">
        <div className="card blue">
          <div className="card-icon">🎓</div>
          <div className="card-info">
            <h2>{loading ? "..." : stats.totalStudents}</h2>
            <p>Total Students</p>
          </div>
          <div className="card-trend">Registered</div>
        </div>

        <div className="card green">
          <div className="card-icon">📚</div>
          <div className="card-info">
            <h2>{loading ? "..." : stats.totalBooks}</h2>
            <p>Total Books</p>
          </div>
          <div className="card-trend">In Library</div>
        </div>

        <div className="card orange">
          <div className="card-icon">📖</div>
          <div className="card-info">
            <h2>{loading ? "..." : stats.booksIssued}</h2>
            <p>Books Issued</p>
          </div>
          <div className="card-trend">Circulating</div>
        </div>

        <div className="card purple">
          <div className="card-icon">✅</div>
          <div className="card-info">
            <h2>{loading ? "..." : booksReturned}</h2>
            <p>Books Available</p>
          </div>
          <div className="card-trend">On Shelves</div>
        </div>
      </div>

      {/* ---------- Quick Actions ---------- */}
      <div className="quick-actions">
        <Link to="addbook" className="quick-action">
          <span className="qa-icon">➕</span>
          <div>
            <h4>Add Book</h4>
            <p>Add a new book to the library</p>
          </div>
          <span className="qa-arrow">→</span>
        </Link>
        <Link to="addstudent" className="quick-action">
          <span className="qa-icon">👨‍🎓</span>
          <div>
            <h4>Add Student</h4>
            <p>Register a new student</p>
          </div>
          <span className="qa-arrow">→</span>
        </Link>
        <Link to="issuebook" className="quick-action">
          <span className="qa-icon">📤</span>
          <div>
            <h4>Issue Book</h4>
            <p>Issue a book to a student</p>
          </div>
          <span className="qa-arrow">→</span>
        </Link>
        <Link to="allbooks" className="quick-action">
          <span className="qa-icon">🗂️</span>
          <div>
            <h4>All Books</h4>
            <p>View the complete catalog</p>
          </div>
          <span className="qa-arrow">→</span>
        </Link>
      </div>

      {/* ---------- About / Info Panel ---------- */}
      <div className="about-panel">
        <div className="about-header">
          <span className="section-tag">About</span>
          <h2>Library Management System</h2>
          <p>
            Welcome to the Library Management System dashboard. Use the sidebar
            to manage books, students, and track book issuance.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-card">
            <span className="about-icon">🎯</span>
            <h3>Our Mission</h3>
            <p>
              To provide a seamless digital experience for managing library
              resources — from book cataloging to student book issuance.
            </p>
          </div>
          <div className="about-card">
            <span className="about-icon">⚡</span>
            <h3>Quick Management</h3>
            <p>
              Effortlessly add or remove books and students, and track every
              issue and return in real time.
            </p>
          </div>
          <div className="about-card">
            <span className="about-icon">🔐</span>
            <h3>Secure & Reliable</h3>
            <p>
              A protected admin panel ensures only authorized staff can manage
              the library system.
            </p>
          </div>
          <div className="about-card">
            <span className="about-icon">📊</span>
            <h3>Real-Time Stats</h3>
            <p>
              Monitor total students, books, issued items, and availability —
              all updated live from the database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;


