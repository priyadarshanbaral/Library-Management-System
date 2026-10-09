import React, { useState, useEffect } from "react";
import "../CSS/RequestBook.css";
import { toast } from "react-toastify";
import axios from "axios";

function RequestBook() {
  const studentData = JSON.parse(localStorage.getItem("student") || "{}");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get("/api/allbooks");
        if (res.data.success) {
          setBooks(res.data.data);
        }
      } catch (err) {
        toast.error("Failed to load books");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const requestBook = async (bookName) => {
    if (!studentData.email) {
      toast.error("Please login first.");
      return;
    }

    setRequesting(bookName);

    try {
      const res = await axios.post("/api/issuebook", {
        studentEmail: studentData.email,
        bookName,
      });

      toast.success(res.data.message);
      toast.info(`Due date: ${res.data.data.dueDate}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request book");
    } finally {
      setRequesting(null);
    }
  };

  return (
    <div className="request-page">
      <h1>🔄 Request a Book</h1>
      <p className="subtitle">
        Select an available book to request it for borrowing.
      </p>

      {loading ? (
        <p className="empty-text">Loading...</p>
      ) : books.length === 0 ? (
        <div className="empty-card">
          <p>No books available in the library right now.</p>
        </div>
      ) : (
        <div className="request-list">
          {books.map((book) => (
            <div className="request-card" key={book._id}>
              <img
                src={`/api/bookphoto/${book._id}`}
                alt={book.name}
              />
              <div className="request-info">
                <h3>{book.name}</h3>
                <p>Author: {book.author}</p>
                <p>
                  <span className={book.quantity > 0 ? "in-stock" : "out-stock"}>
                    {book.quantity > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </p>
              </div>
              <button
                className="request-btn"
                disabled={book.quantity <= 0 || requesting === book.name}
                onClick={() => requestBook(book.name)}
              >
                {requesting === book.name
                  ? "Requesting..."
                  : book.quantity > 0
                    ? "Request Book"
                    : "Unavailable"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RequestBook;

