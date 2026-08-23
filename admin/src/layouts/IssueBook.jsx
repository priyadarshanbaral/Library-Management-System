import React, { useState, useEffect } from "react";
import "../CSS/IssueBook.css";
import { toast } from "react-toastify";
import axios from "axios";
import API from "../api";

const MAX_ISSUE_LIMIT = 30;

function IssueBook() {
  const [data, setData] = useState({
    studentEmail: "",
    dueDate: "",
  });

  const [books, setBooks] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [booksLoading, setBooksLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  // Fetch all books to show them as selectable cards
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await API.get("/allbooks");
        if (res.data.success) {
          setBooks(res.data.data);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to fetch books");
      } finally {
        setBooksLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  // Toggle a book in/out of the selection list (max 30)
  const toggleBook = (bookName) => {
    setSelectedBooks((prev) => {
      const exists = prev.includes(bookName);
      if (exists) {
        return prev.filter((name) => name !== bookName);
      }

      if (prev.length >= MAX_ISSUE_LIMIT) {
        toast.warn(
          `You can select a maximum of ${MAX_ISSUE_LIMIT} books per student.`
        );
        return prev;
      }

      return [...prev, bookName];
    });
  };

  const filteredBooks = books.filter(
    (book) =>
      book.name?.toLowerCase().includes(search.toLowerCase()) ||
      book.author?.toLowerCase().includes(search.toLowerCase())
  );

  const issueBooks = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:2700/api/issuebook", {
        studentEmail: data.studentEmail,
        books: selectedBooks,
        dueDate: data.dueDate,
      });

      toast.success(res.data.message);
      if (res.data.data?.dueDate) {
        toast.info(`Due Date: ${res.data.data.dueDate}`);
      }

      setData({
        studentEmail: "",
        dueDate: "",
      });
      setSelectedBooks([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to issue books");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="issue-page">
      <div className="issue-form">
        <h2>Issue Book</h2>

        <form onSubmit={issueBooks}>
          <input
            type="email"
            name="studentEmail"
            placeholder="Student Email"
            value={data.studentEmail}
            onChange={handleChange}
            required
          />

          <input
            type="date"
            name="dueDate"
            title="Due Date (optional, defaults to 15 days)"
            value={data.dueDate}
            onChange={handleChange}
          />

          <button type="submit" disabled={loading || selectedBooks.length === 0}>
            {loading
              ? "Issuing..."
              : `Issue Selected Books (${selectedBooks.length})`}
          </button>
        </form>

        <div className="selection-info">
          <p>
            Selected: <strong>{selectedBooks.length}</strong> / {MAX_ISSUE_LIMIT}{" "}
            books
          </p>
        </div>
      </div>

      <div className="books-section">
        <div className="books-section-header">
          <h2>📚 All Books</h2>
          <input
            type="text"
            placeholder="Search books by name or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {booksLoading ? (
          <div className="loading-text">Loading books...</div>
        ) : filteredBooks.length === 0 ? (
          <div className="loading-text">
            No books found. Add some books first!
          </div>
        ) : (
          <div className="book-grid">
            {filteredBooks.map((book) => {
              const isSelected = selectedBooks.includes(book.name);
              const outOfStock = book.quantity <= 0;

              return (
                <div
                  key={book._id}
                  className={`book-card ${isSelected ? "selected" : ""} ${outOfStock ? "out-of-stock" : ""
                    }`}
                  onClick={() => !outOfStock && toggleBook(book.name)}
                >
                  <img
                    src={`http://localhost:2700/api/bookphoto/${book._id}`}
                    alt={book.name}
                  />

                  <div className="book-content">
                    <div className="book-check">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={outOfStock}
                        onChange={() => !outOfStock && toggleBook(book.name)}
                      />
                      <span>{isSelected ? "Selected" : "Select"}</span>
                    </div>

                    <h3>{book.name}</h3>
                    <p>Author: {book.author}</p>
                    <p>
                      Quantity: <strong>{book.quantity}</strong>
                    </p>
                    <p
                      className={
                        outOfStock ? "not-available" : "available"
                      }
                    >
                      {outOfStock ? "Out of Stock" : "Available"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="history">
        <h2>How to Issue Books</h2>
        <ol style={{ paddingLeft: "20px", lineHeight: 2, color: "#555" }}>
          <li>Enter the student's registered email address.</li>
          <li>
            Select up to <strong>{MAX_ISSUE_LIMIT} books</strong> from the list
            below (click a card or check its box).
          </li>
          <li>
            Optionally pick a due date (defaults to 15 days from today).
          </li>
          <li>
            Click "Issue Selected Books" to issue all selected books at once.
          </li>
        </ol>
      </div>
    </div>
  );
}

export default IssueBook;

