import React, { useState, useEffect } from "react";
import "../CSS/History.css";
import API from "../api";

function History() {
  const studentData = JSON.parse(localStorage.getItem("student") || "{}");
  const [submitHistory, setSubmitHistory] = useState([]);
  const [issueHistory, setIssueHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/students");
        if (res.data.success) {
          const current = res.data.data.find(
            (s) => s.email.toLowerCase() === studentData.email?.toLowerCase()
          );

          if (current) {
            setIssueHistory(current.issue || []);
            setSubmitHistory(current.submit || []);
          }
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="history-page">
      <h1>📜 History</h1>

      <div className="history-section">
        <h2>Currently Issued Books</h2>

        {loading ? (
          <p className="empty-text">Loading...</p>
        ) : issueHistory.length === 0 ? (
          <p className="empty-text">No books currently issued.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {issueHistory.map((item, index) => (
                <tr key={index}>
                  <td>{item.bookName}</td>
                  <td>{item.issueDate}</td>
                  <td>{item.dueDate}</td>
                  <td>
                    <span className="status-issued">{item.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="history-section">
        <h2>Returned / Submitted Books</h2>

        {loading ? (
          <p className="empty-text">Loading...</p>
        ) : submitHistory.length === 0 ? (
          <p className="empty-text">No returned books yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Issue Date</th>
                <th>Return Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {submitHistory.map((item, index) => (
                <tr key={index}>
                  <td>{item.bookName}</td>
                  <td>{item.issueDate}</td>
                  <td>{item.submitDate}</td>
                  <td>
                    <span className="status-submitted">{item.status}</span>
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

export default History;

