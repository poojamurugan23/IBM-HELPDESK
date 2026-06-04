const Conversation = require("../models/Conversation");
const Ticket = require("../models/Ticket");

exports.addMessage = async (req, res) => {
  try {
    const { message, isInternal = false } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (isInternal && req.user.role === "CUSTOMER") {
      return res.status(403).json({ message: "Not allowed" });
    }

    const conversation = await Conversation.create({
      ticket: ticket._id,
      message,
      sender: req.user._id,
      isInternal,
    });

    const populatedConversation = await conversation.populate(
      "sender",
      "name email role",
    );

    res.status(201).json({
      message: "Message added",
      conversation: populatedConversation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      ticket: req.params.ticketId,
    })
      .populate("sender", "name email role")
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
