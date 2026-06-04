const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "LOW",
    },
    status: {
      type: String,
      enum: [
        "OPEN",
        "IN_PROGRESS",
        "WAITING_FOR_CUSTOMER",
        "RESOLVED",
        "CLOSED",
      ],
      default: "OPEN",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    slaDeadline: {
      type: Date,
    },
    isSlaBreached: {
      type: Boolean,
      default: false,
    },
    department: {
      type: String,
      default: "General",
      trim: true,
    },
    attachments: [
      {
        url: { type: String, required: true },
        filename: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["PUBLIC", "INTERNAL"],
          default: "PUBLIC",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Ticket", ticketSchema);
