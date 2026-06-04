// src/pages/DashboardAgent.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import ChatBox from "../components/ChatBox";
import Navbar from "../components/Navbar";
import "./DashboardAgent.css";

function DashboardAgent() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // ✅ Fetch tickets (backend already filters for AGENT)
  const fetchAssignedTickets = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTickets(res.data.tickets || []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Correct way to update STATUS (matches your backend route)
  const handleStatusUpdate = async (ticketId, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/tickets/${ticketId}/status`,
        { status: status.toUpperCase() },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      fetchAssignedTickets();
    } catch (err) {
      alert("Failed to update ticket status");
    }
  };

  useEffect(() => {
    fetchAssignedTickets();
  }, []);

  return (
    <div>
      <Navbar />
      <div
        className="agent-dashboard"
        style={{ maxHeight: "100vh", overflowY: "auto" }}
      >
        <h2 className="dashboard-heading">Welcome, Agent 🧑‍💻</h2>

        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : tickets.length === 0 ? (
          <p className="no-ticket-msg">No tickets assigned to you.</p>
        ) : (
          <div className="ticket-grid">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="ticket-card">
                <h3 className="ticket-subject">{ticket.subject}</h3>

                {/* ✅ FIX: backend uses description, NOT message */}
                <p className="ticket-message">{ticket.description}</p>

                <div className="ticket-meta">
                  <div className="meta-row">
                    <label>Status:</label>
                    <span className={`status-badge ${ticket.status}`}>
                      {ticket.status}
                    </span>
                  </div>

                  <div className="meta-row">
                    <label>Priority:</label>
                    <span
                      className={`priority-badge ${ticket.priority.toLowerCase()}`}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                </div>

                <div className="divider" />

                <div className="controls">
                  <div className="meta-row">
                    <label>Status:</label>
                    <select
                      value={ticket.status}
                      onChange={(e) =>
                        handleStatusUpdate(ticket._id, e.target.value)
                      }
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="WAITING_FOR_CUSTOMER">
                        Waiting for Customer
                      </option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="divider" />

                <ChatBox ticketId={ticket._id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardAgent;
