import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import "../CSS/AdminDashboard.css";

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="dashboard">
      {/* Mobile hamburger toggle */}
      <button
        className={`hamburger-btn ${sidebarOpen ? "active" : ""}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Mobile backdrop overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="logo">
          <h2>📚 Library Admin</h2>
        </div>

        <nav>
          <NavLink to="" end onClick={closeSidebar}>
            <span className="nav-icon">📊</span> Dashboard
          </NavLink>
          <NavLink to="allbooks" onClick={closeSidebar}>
            <span className="nav-icon">📚</span> All Books
          </NavLink>
          <NavLink to="addstudent" onClick={closeSidebar}>
            <span className="nav-icon">👨‍🎓</span> Add Student
          </NavLink>
          <NavLink to="removestudent" onClick={closeSidebar}>
            <span className="nav-icon">🗑️</span> Remove Student
          </NavLink>
          <NavLink to="addbook" onClick={closeSidebar}>
            <span className="nav-icon">➕</span> Add Book
          </NavLink>
          <NavLink to="removebook" onClick={closeSidebar}>
            <span className="nav-icon">❌</span> Remove Book
          </NavLink>
          <NavLink to="issuebook" onClick={closeSidebar}>
            <span className="nav-icon">📤</span> Issue Book
          </NavLink>
          <NavLink to="submitbook" onClick={closeSidebar}>
            <span className="nav-icon">📥</span> Submit Book
          </NavLink>
        </nav>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("admin");
            window.location.href = "/admin/";
          }}
        >
          🚪 Logout
        </button>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminDashboard;


