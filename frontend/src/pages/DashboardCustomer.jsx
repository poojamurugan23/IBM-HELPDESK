// src/pages/DashboardCustomer.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import ChatBox from "../components/ChatBox";
import "./DashboardCustomer.css";
import Navbar from "../components/Navbar";

function DashboardCustomer() {
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "LOW",
    attachments: [],
  });

  const [tickets, setTickets] = useState([]);
  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, attachments: e.target.files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("subject", formData.subject);
    data.append("description", formData.description);
    data.append("priority", formData.priority.toUpperCase());
    data.append("department", "General");

    if (formData.attachments) {
      for (let i = 0; i < formData.attachments.length; i++) {
        data.append("attachments", formData.attachments[i]);
      }
    }

    try {
      const res = await axios.post("http://localhost:5000/api/tickets", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Ticket created!");

      setFormData({
        subject: "",
        description: "",
        priority: "LOW",
        attachments: [],
      });

      // Add new ticket to UI
      setTickets((prev) => [...prev, res.data.ticket]);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create ticket");
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTickets(res.data.tickets || []);
    } catch (err) {
      console.error("Failed to load your tickets", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="dashboard-scroll-container">
        <div className="customer-dashboard-timeline">
          <h2 className="dashboard-heading">Welcome, Customer 👋</h2>

          <form className="ticket-form" onSubmit={handleSubmit}>
            <h3>Create a Ticket</h3>

            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />

            <textarea
              name="description"
              placeholder="Describe your issue"
              value={formData.description}
              onChange={handleChange}
              required
            />

            <div className="form-group">
              <label style={{ display: "block", marginBottom: "5px" }}>Priority:</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                style={{ width: "100%", marginBottom: "10px" }}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Attachments:</label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                style={{ color: "white" }}
              />
            </div>

            <button type="submit">Submit Ticket</button>
          </form>

          <div className="timeline-container">
            <h3>My Tickets</h3>

            <div className="timeline">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h4>{ticket.subject}</h4>
                    <p>{ticket.description}</p>

                    <p>
                      <strong>Priority:</strong> {ticket.priority}
                    </p>

                    <span className={`status-badge ${ticket.status}`}>
                      {ticket.status}
                    </span>

                    <ChatBox ticketId={ticket._id} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardCustomer;
