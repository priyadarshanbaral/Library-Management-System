import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import "../CSS/DashboardHome.css";

function DashboardHome() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="dashboard-container">
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
        <div className="logos">
          📚 <span>Student Panel</span>
        </div>

        <nav>
          <NavLink to="" end className={({ isActive }) => (isActive ? "menu active" : "menu")} onClick={closeSidebar}>
            📊 Dashboard
          </NavLink>

          <NavLink to="all-books" className={({ isActive }) => (isActive ? "menu active" : "menu")} onClick={closeSidebar}>
            📚 All Books
          </NavLink>

          <NavLink to="issued-books" className={({ isActive }) => (isActive ? "menu active" : "menu")} onClick={closeSidebar}>
            📖 Issued Books
          </NavLink>

          <NavLink to="request-book" className={({ isActive }) => (isActive ? "menu active" : "menu")} onClick={closeSidebar}>
            🔄 Request Book
          </NavLink>

          <NavLink to="history" className={({ isActive }) => (isActive ? "menu active" : "menu")} onClick={closeSidebar}>
            📜 History
          </NavLink>

          <NavLink to="profile" className={({ isActive }) => (isActive ? "menu active" : "menu")} onClick={closeSidebar}>
            👤 My Profile
          </NavLink>
        </nav>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("student");
            window.location.href = "/";
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

export default DashboardHome;

