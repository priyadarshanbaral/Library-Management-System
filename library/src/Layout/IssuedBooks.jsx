import React, { useState, useEffect } from "react";
import "../CSS/IssuedBooks.css";
import API from "../api";

function IssuedBooks() {
  const studentData = JSON.parse(localStorage.getItem("student") || "{}");
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/students");
        if (res.data.success) {
          const current = res.data.data.find(
            (s) => s.email.toLowerCase() === studentData.email?.toLowerCase()
          );
          setIssuedBooks(current?.issue || []);
        }
      } catch (err) {
        console.error("Failed to fetch issued books:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="issued-page">
      <h1>📖 My Issued Books</h1>

      {loading ? (
        <p className="empty-text">Loading...</p>
      ) : issuedBooks.length === 0 ? (
        <div className="empty-card">
          <p>You have no books issued right now.</p>
          <p>Browse the library and request books to read!</p>
        </div>
      ) : (
        <div className="issued-grid">
          {issuedBooks.map((book, index) => (
            <div className="issued-card" key={index}>
              <div className="issued-head">
                <h3>{book.bookName}</h3>
                <span
                  className={
                    isOverdue(book.dueDate) ? "badge overdue" : "badge issued"
                  }
                >
                  {isOverdue(book.dueDate) ? "Overdue" : book.status}
                </span>
              </div>

              <p>
                <strong>Issue Date:</strong> {book.issueDate}
              </p>
              <p>
                <strong>Due Date:</strong> {book.dueDate}
              </p>

              {isOverdue(book.dueDate) && (
                <p className="overdue-warning">
                  ⚠️ Please return this book as soon as possible.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default IssuedBooks;

