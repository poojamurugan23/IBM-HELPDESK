const Ticket = require("../models/Ticket");
const User = require("../models/User");

exports.createTicket = async (req, res) => {
  try {
    const { subject, description, priority, department } = req.body;

    if (!subject || !description) {
      return res
        .status(400)
        .json({ message: "Subject and description are required" });
    }

    // Handle file uploads
    let attachments = [];

    if (req.files && req.files.length > 0) {
      attachments = req.files.map((file) => ({
        url: "/uploads/" + file.filename,
        filename: file.originalname,
      }));
    }

    // SLA Calculation
    const slaHours = {
      LOW: 72,
      MEDIUM: 48,
      HIGH: 24,
      URGENT: 4,
    };

    const deadline = new Date();
    deadline.setHours(deadline.getHours() + (slaHours[priority] || 72));

    const ticket = await Ticket.create({
      subject,
      description,
      priority,
      department,
      createdBy: req.user._id,
      status: "OPEN",
      attachments,
      slaDeadline: deadline,
    });

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role");

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticket: populatedTicket,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTickets = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "CUSTOMER") {
      query.createdBy = req.user._id;
    }

    if (req.user.role === "AGENT") {
      query.$or = [{ assignedTo: req.user._id }, { assignedTo: null }];
    }

    const tickets = await Ticket.find(query)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tickets,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "OPEN",
      "IN_PROGRESS",
      "WAITING_FOR_CUSTOMER",
      "RESOLVED",
      "CLOSED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid ticket status" });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.status = status;
    await ticket.save();

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role");

    res.json({
      success: true,
      message: "Ticket status updated",
      ticket: populatedTicket,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.assignTicket = async (req, res) => {
  try {
    const agentId = req.body?.agentId;

    if (!agentId) {
      return res.status(400).json({ message: "agentId is required" });
    }

    const agent = await User.findById(agentId);
    if (!agent || agent.role !== "AGENT") {
      return res.status(400).json({ message: "Invalid agent ID" });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.assignedTo = agentId;
    ticket.status = "IN_PROGRESS";
    await ticket.save();

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role");

    res.json({
      success: true,
      message: "Ticket assigned successfully",
      ticket: populatedTicket,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
