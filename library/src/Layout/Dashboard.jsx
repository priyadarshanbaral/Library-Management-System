import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../CSS/Dashboard.css";
import API from "../api";

function Dashboard() {
  const studentData = JSON.parse(localStorage.getItem("student") || "{}");
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        if (!studentData.email) {
          setLoading(false);
          return;
        }

        const res = await API.get(`/students`);
        if (res.data.success) {
          const current = res.data.data.find(
            (s) => s.email.toLowerCase() === studentData.email.toLowerCase()
          );

          if (current) {
            setIssuedBooks(current.issue || []);
            localStorage.setItem(
              "student",
              JSON.stringify({
                ...studentData,
                regd_no: current.regd_no,
                mobile: current.mobile,
                dob: current.dob,
              })
            );
          }
        }
      } catch (err) {
        console.error("Error fetching student data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  const availableCount = issuedBooks.filter(
    (b) => b.status === "Issued"
  ).length;

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

  const firstName = (studentData.name || "Student").split(" ")[0];

  const getDueOverdue = () => {
    const today = new Date().setHours(0, 0, 0, 0);
    return issuedBooks.filter((b) => {
      if (b.status !== "Issued") return false;
      const due = new Date(b.dueDate).setHours(0, 0, 0, 0);
      return due < today;
    }).length;
  };
  const overdueCount = getDueOverdue();

  return (
    <div className="dashboard">
      {/* ---------- Welcome Banner ---------- */}
      <div className="welcome-card">
        <div className="welcome-overlay"></div>
        <div className="welcome-content">
          <div className="welcome-avatar">
            {firstName.charAt(0).toUpperCase()}
          </div>
          <div className="welcome-text">
            <span className="welcome-greeting">{greeting} 👋</span>
            <h2>{studentData.name || "Student"}</h2>
            <p>
              Welcome to your library dashboard. Explore books, track issues,
              and manage your reading journey.
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

      {/* ---------- Stats ---------- */}
      <div className="stats">
        <div className="card blue">
          <div className="card-icon">📚</div>
          <div className="card-info">
            <h2>{issuedBooks.length}</h2>
            <p>Total Issued</p>
          </div>
          <div className="card-trend">+ Books borrowed</div>
        </div>

        <div className="card green">
          <div className="card-icon">📖</div>
          <div className="card-info">
            <h2>{availableCount}</h2>
            <p>Currently Issued</p>
          </div>
          <div className="card-trend">In your hands</div>
        </div>

        <div className="card orange">
          <div className="card-icon">⏰</div>
          <div className="card-info">
            <h2>{overdueCount}</h2>
            <p>Due / Overdue</p>
          </div>
          <div className="card-trend">Return on time</div>
        </div>

        <div className="card purple">
          <div className="card-icon">🆔</div>
          <div className="card-info">
            <h2 className="regd-number">{studentData.regd_no || "N/A"}</h2>
            <p>Reg Number</p>
          </div>
          <div className="card-trend">Student ID</div>
        </div>
      </div>

      {/* ---------- Quick Actions ---------- */}
      <div className="quick-actions">
        <Link to="all-books" className="quick-action">
          <span className="qa-icon">🔍</span>
          <div>
            <h4>Browse Books</h4>
            <p>Search the library catalog</p>
          </div>
          <span className="qa-arrow">→</span>
        </Link>
        <Link to="request-book" className="quick-action">
          <span className="qa-icon">🔄</span>
          <div>
            <h4>Request a Book</h4>
            <p>Suggest new additions</p>
          </div>
          <span className="qa-arrow">→</span>
        </Link>
        <Link to="history" className="quick-action">
          <span className="qa-icon">📜</span>
          <div>
            <h4>View History</h4>
            <p>Your borrowing records</p>
          </div>
          <span className="qa-arrow">→</span>
        </Link>
      </div>

      {/* ---------- Profile + Notices ---------- */}
      <div className="dashboard-grid">
        <div className="profile-card">
          <div className="profile-cover"></div>
          <img src="https://i.pravatar.cc/150?img=15" alt="" />
          <div className="profile-badge">🎓 Student</div>
          <h3>{studentData.name || "Student"}</h3>
          <p className="profile-sub">Library Member</p>
          <hr />
          <div className="profile-detail">
            <span>🆔</span>
            <p>
              <strong>Student ID:</strong> {studentData.regd_no || "N/A"}
            </p>
          </div>
          <div className="profile-detail">
            <span>📧</span>
            <p>
              <strong>Email:</strong> {studentData.email || "N/A"}
            </p>
          </div>
          <div className="profile-detail">
            <span>📱</span>
            <p>
              <strong>Mobile:</strong> {studentData.mobile || "N/A"}
            </p>
          </div>
          <Link to="profile" className="profile-link">
            View Full Profile →
          </Link>
        </div>

        <div className="notice-card">
          <div className="notice-header">
            <h3>📢 Latest Notices</h3>
            <span className="notice-badge">4 New</span>
          </div>
          <ul>
            <li>
              <span className="notice-dot orange-dot"></span>
              📢 Library will remain closed on Sunday.
            </li>
            <li>
              <span className="notice-dot blue-dot"></span>
              📚 New MERN Stack books added.
            </li>
            <li>
              <span className="notice-dot red-dot"></span>
              📝 Return books before due date.
            </li>
            <li>
              <span className="notice-dot green-dot"></span>
              🎓 Digital Library available now.
            </li>
          </ul>
        </div>
      </div>

      {/* ---------- Table ---------- */}
      <div className="table-card">
        <div className="table-header">
          <h2>📖 Currently Issued Books</h2>
          {issuedBooks.length > 0 && (
            <span className="table-count">{issuedBooks.length} Books</span>
          )}
        </div>

        {loading ? (
          <div className="table-loading">
            <span className="spinner"></span>
            <p>Loading your books...</p>
          </div>
        ) : issuedBooks.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>No Books Issued Yet</h3>
            <p>
              Visit "All Books" to browse the library and issue your first book.
            </p>
            <Link to="all-books" className="empty-btn">
              Browse Books
            </Link>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Book</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {issuedBooks.map((book, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className="book-name">
                    <span className="book-icon">📘</span>
                    {book.bookName}
                  </td>
                  <td>{book.issueDate}</td>
                  <td>{book.dueDate}</td>
                  <td>
                    <span
                      className={
                        book.status === "Issued"
                          ? "status issued"
                          : "status returned"
                      }
                    >
                      {book.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

