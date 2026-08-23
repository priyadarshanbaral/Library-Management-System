import React, { useState } from "react";
import "../CSS/SubmitBook.css";
import { toast } from "react-toastify";
import axios from "axios";

function SubmitBook() {
  const [data, setData] = useState({
    studentEmail: "",
    bookName: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const submitBook = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:2700/api/submitbook",
        data
      );

      toast.success(res.data.message);

      setData({
        studentEmail: "",
        bookName: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submit-page">
      <div className="submit-form">
        <h2>Submit Book</h2>

        <form onSubmit={submitBook}>
          <input
            type="email"
            name="studentEmail"
            placeholder="Student Email"
            value={data.studentEmail}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="bookName"
            placeholder="Book Name"
            value={data.bookName}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Book"}
          </button>
        </form>
      </div>

      <div className="history">
        <h2>How to Submit a Book</h2>
        <ol style={{ paddingLeft: "20px", lineHeight: 2, color: "#555" }}>
          <li>Enter the student's registered email address.</li>
          <li>Enter the exact book name that was issued.</li>
          <li>Click "Submit Book" to mark the book as returned.</li>
          <li>The book quantity will be increased back automatically.</li>
        </ol>
      </div>
    </div>
  );
}

export default SubmitBook;

