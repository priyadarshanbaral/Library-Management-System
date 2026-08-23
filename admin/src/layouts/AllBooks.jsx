import React, { useState, useEffect } from "react";
import "../CSS/AllBooks.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import API from "../api";
// import axios from "axios";

function AllBooks() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Modal state
  const [viewBook, setViewBook] = useState(null);
  const [detailBook, setDetailBook] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const fetchBooks = async () => {
    try {
      const res = await API.get("/allbooks");
      if (res.data.success) {
        setBooks(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const filteredBooks = books.filter(
    (book) =>
      book.name?.toLowerCase().includes(search.toLowerCase()) ||
      book.author?.toLowerCase().includes(search.toLowerCase())
  );

  // Open "View Book" modal - fetch single book details (page count)
  const handleViewBook = async (book) => {
    try {
      const res = await API.get(`/singlebook/${book._id}`);
      if (res.data.success) {
        const data = res.data.data;
        setViewBook(book);
        setPageCount(data.pageCount || 0);
        setCurrentPage(0);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error("Failed to load book pages:", err);
      toast.error("Failed to load book pages");
    }
  };

  const closeViewModal = () => {
    setViewBook(null);
    setPageCount(0);
    setCurrentPage(0);
  };

  const openDetails = (book) => {
    setDetailBook(book);
  };

  const closeDetails = () => {
    setDetailBook(null);
  };

  return (
    <div className="books-page">
      <div className="books-header">
        <h1>📚 Library Books</h1>

        <input
          type="text"
          placeholder="Search books by name or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-text">Loading books...</div>
      ) : filteredBooks.length === 0 ? (
        <div className="loading-text">No books found. Add some books!</div>
      ) : (
        <div className="book-grid">
          {filteredBooks.map((book) => (
            <div className="book-card" key={book._id}>
              <img
                src={`http://localhost:2700/api/bookphoto/${book._id}`}
                alt={book.name}
              />

              <div className="book-content">
                <h3>{book.name}</h3>
                <p>Author: {book.author}</p>
                <p>
                  Quantity: <strong>{book.quantity}</strong>
                </p>
                <p className={book.quantity > 0 ? "available" : "not-available"}>
                  {book.quantity > 0 ? "Available" : "Out of Stock"}
                </p>
                <div className="book-actions">
                  <button className="view-btn" onClick={() => handleViewBook(book)}>
                    📖 View Book
                  </button>
                  <button className="details-btn" onClick={() => openDetails(book)}>
                    ℹ️ Details
                  </button>
                </div>
                <button
                  className="issue-btn"
                  disabled={book.quantity <= 0}
                  onClick={() =>
                    navigate(
                      `/admindashboard/issuebook?bookName=${encodeURIComponent(
                        book.name
                      )}`
                    )
                  }
                >
                  {book.quantity > 0 ? "📤 Issue Book" : "Out of Stock"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========== VIEW BOOK MODAL (pages) ========== */}
      {viewBook && (
        <div className="modal-overlay" onClick={closeViewModal}>
          <div className="viewer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📖 {viewBook.name}</h2>
              <button className="modal-close" onClick={closeViewModal}>
                ✕
              </button>
            </div>

            <div className="page-viewer">
              {pageCount === 0 ? (
                <p className="no-pages-msg">
                  No pages available for this book yet.
                </p>
              ) : (
                <>
                  <img
                    src={`http://localhost:2700/api/bookpage/${viewBook._id}/${currentPage}`}
                    alt={`Page ${currentPage + 1} of ${viewBook.name}`}
                    className="page-image"
                  />

                  <div className="page-controls">
                    <button
                      className="page-nav-btn"
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      ‹ Prev
                    </button>
                    <span className="page-indicator">
                      Page {currentPage + 1} of {pageCount}
                    </span>
                    <button
                      className="page-nav-btn"
                      disabled={currentPage === pageCount - 1}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next ›
                    </button>
                  </div>

                  {/* All pages preview thumbnails */}
                  <div className="page-thumbnails">
                    {Array.from({ length: pageCount }).map((_, i) => (
                      <img
                        key={i}
                        src={`http://localhost:2700/api/bookpage/${viewBook._id}/${i}`}
                        alt={`Page ${i + 1}`}
                        className={i === currentPage ? "thumb active" : "thumb"}
                        onClick={() => setCurrentPage(i)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== DETAILS MODAL ========== */}
      {detailBook && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Book Details</h2>
              <button className="modal-close" onClick={closeDetails}>
                ✕
              </button>
            </div>

            <div className="details-body">
              <div className="details-cover">
                <img
                  src={`http://localhost:2700/api/bookphoto/${detailBook._id}`}
                  alt={detailBook.name}
                />
              </div>
              <div className="details-info">
                <h3>{detailBook.name}</h3>
                <p>
                  <strong>Author:</strong> {detailBook.author}
                </p>
                <p>
                  <strong>Quantity:</strong> {detailBook.quantity}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      detailBook.quantity > 0 ? "available" : "not-available"
                    }
                  >
                    {detailBook.quantity > 0 ? "Available" : "Out of Stock"}
                  </span>
                </p>
                <p className="details-description">
                  <strong>Description:</strong> {detailBook.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllBooks;

