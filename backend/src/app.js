const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const articleRoutes = require("./routes/articleRoutes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/articles", articleRoutes);

// Static uploads
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({ message: "IBM Helpdesk Backend Running" });
});

module.exports = app;
