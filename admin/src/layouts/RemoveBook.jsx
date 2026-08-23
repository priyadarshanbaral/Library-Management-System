import React, { useState } from "react";
import "../CSS/RemoveBook.css";
import axios from "axios";
import { toast } from "react-toastify";

function RemoveBook() {
  const [book, setBook] = useState({
    name: "",
    author: "",
    quantity: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setBook({
      ...book,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.delete(
        `http://localhost:2700/api/deletebook?name=${book.name}`
      );

      toast.success(res.data.message);

      setBook({
        name: "",
        author: "",
        quantity: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="remove-book-page">
      <div className="remove-book-card">
        <h2>Remove Book</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Book Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter Book Name"
              value={book.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Author Name</label>
            <input
              type="text"
              name="author"
              placeholder="Enter Author Name"
              value={book.author}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Quantity</label>
            <input
              type="number"
              name="quantity"
              placeholder="Enter Quantity"
              min="1"
              value={book.quantity}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="remove-btn" disabled={loading}>
            {loading ? "Removing..." : "Remove Book"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RemoveBook;

