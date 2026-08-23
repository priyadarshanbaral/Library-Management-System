import React, { useState } from "react";
import "../CSS/RemoveStudent.css";
import { toast } from "react-toastify";
import axios from "axios";

function RemoveStudent() {
  const [student, setStudent] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setStudent({
      ...student,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.delete(
        `http://localhost:2700/api/deletestudent?name=${student.name}&email=${student.email}`
      );

      toast.success(res.data.message);

      setStudent({
        name: "",
        email: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="remove-page">
      <div className="remove-card">
        <h2>Remove Student</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Student Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter student name"
              value={student.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter student email"
              value={student.email}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="delete-btn" disabled={loading}>
            {loading ? "Removing..." : "Remove Student"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RemoveStudent;

