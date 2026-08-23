import React from "react";
import "../CSS/Profile.css";

function Profile() {
  const studentData = JSON.parse(localStorage.getItem("student") || "{}");

  const formatDate = (dob) => {
    if (!dob) return "N/A";
    const d = new Date(dob);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="profile-page">
      <h1>👤 My Profile</h1>

      <div className="profile-container">
        <div className="profile-avatar">
          <img src="https://i.pravatar.cc/150?img=15" alt="Student" />
          <h2>{studentData.name || "Student"}</h2>
          <p>{studentData.email || "N/A"}</p>
        </div>

        <div className="profile-details">
          <div className="detail-row">
            <span>Registration No</span>
            <strong>{studentData.regd_no || "N/A"}</strong>
          </div>

          <div className="detail-row">
            <span>Date of Birth</span>
            <strong>{formatDate(studentData.dob)}</strong>
          </div>

          <div className="detail-row">
            <span>Mobile</span>
            <strong>{studentData.mobile || "N/A"}</strong>
          </div>

          <div className="detail-row">
            <span>Student ID</span>
            <strong>{studentData.regd_no || "N/A"}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

