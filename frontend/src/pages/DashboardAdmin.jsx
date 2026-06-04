// src/pages/DashboardAdmin.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./DashboardAdmin.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { motion } from "framer-motion";

function DashboardAdmin() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [assignments, setAssignments] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchTickets();
    fetchAnalytics();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(res.data.tickets || []);
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    }
  };

  const handleAssign = async (ticketId) => {
    const agentId = assignments[ticketId];
    if (!agentId) return alert("Please enter an Agent ID");

    try {
      await axios.put(
        `http://localhost:5000/api/tickets/${ticketId}/assign`,
        { agentId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Ticket assigned!");
      fetchTickets();
      fetchAnalytics(); // Refresh stats
    } catch (err) {
      alert(err.response?.data?.message || "Assignment failed");
    }
  };

  // Prepare Chart Data
  const statusData = stats?.statusDistribution?.map((item) => ({
    name: item._id,
    value: item.count,
  })) || [];

  const priorityData = stats?.priorityDistribution?.map((item) => ({
    name: item._id,
    value: item.count,
  })) || [];

  const ticketsOverTimeData = stats?.ticketsOverTime?.map((item) => ({
    date: item._id,
    tickets: item.count,
  })) || [];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <div className="admin-container">
      <Navbar />
      <div className="admin-content">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-title"
        >
          Admin Overview & Analytics 📊
        </motion.h2>

        {/* STATS CARDS */}
        {stats && (
          <div className="stats-grid">
            <motion.div
              className="stat-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h3>Total Tickets</h3>
              <p>{stats.totalTickets}</p>
            </motion.div>
            <motion.div
              className="stat-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3>Open</h3>
              <p className="text-red">{stats.openCount}</p>
            </motion.div>
            <motion.div
              className="stat-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h3>Resolved</h3>
              <p className="text-green">{stats.resolvedCount}</p>
            </motion.div>
            <motion.div
              className="stat-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h3>Closed</h3>
              <p className="text-gray">{stats.closedCount}</p>
            </motion.div>
          </div>
        )}

        {/* CHARTS SECTION */}
        <div className="charts-section">
          <div className="chart-card">
            <h3>Tickets Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Incoming Tickets (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ticketsOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="tickets"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card wide">
            <h3>Ticket Priority Breakdown (Histogram)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{ fill: "transparent" }} />
                <Legend />
                <Bar dataKey="value" name="Tickets" fill="#f5c219" barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card wide">
            <h3>Detailed Ticket Management</h3>
            {/* TICKET LIST */}
            <div className="ticket-list-container">
              <table className="ticket-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket._id}>
                      <td>{ticket.subject}</td>
                      <td>
                        <span
                          className={`badge priority-${ticket.priority.toLowerCase()}`}
                        >
                          {ticket.priority}
                        </span>
                        {ticket.isSlaBreached && (
                          <span title="SLA Breached" style={{ marginLeft: "5px", fontSize: "1.2rem" }}>
                            ⚠️
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`badge status-${ticket.status}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td>
                        {ticket.assignedTo ? (
                          <span className="agent-name">
                            {ticket.assignedTo.name}
                          </span>
                        ) : (
                          <span className="unassigned">Unassigned</span>
                        )}
                      </td>
                      <td>
                        <div className="assign-row">
                          <input
                            type="text"
                            placeholder="Agent ID"
                            value={assignments[ticket._id] || ""}
                            onChange={(e) =>
                              setAssignments({
                                ...assignments,
                                [ticket._id]: e.target.value,
                              })
                            }
                            className="assign-input"
                          />
                          <button
                            onClick={() => handleAssign(ticket._id)}
                            className="assign-btn"
                          >
                            Assign
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin;
