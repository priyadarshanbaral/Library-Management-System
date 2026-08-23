import React, { useState } from "react";
import "../CSS/AddStudent.css";
import axios from "axios";
import { toast } from "react-toastify";

function AddStudent() {
  const [student, setStudent] = useState({
    name: "",
    email: "",
    dob: "",
    mobile: "",
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
      const res = await axios.post(
        "http://localhost:2700/api/addstudents",
        student
      );

      toast.success(res.data.message);
      toast.info(`Default password: ${res.data.data.defaultPassword}`);

      setStudent({
        name: "",
        email: "",
        dob: "",
        mobile: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-page">
      <div className="student-card">
        <h2>Add New Student</h2>

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
              placeholder="Enter email"
              value={student.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={student.dob}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              placeholder="Enter mobile number"
              maxLength="10"
              value={student.mobile}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Student"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddStudent;

