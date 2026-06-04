const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    action: {
        type: String,
        required: true,
        enum: [
            "LOGIN",
            "LOGOUT",
            "CREATE_USER",
            "UPDATE_USER",
            "DELETE_USER",
            "RESET_PASSWORD",
            "CREATE_TICKET",
            "UPDATE_TICKET",
            "ASSIGN_TICKET",
            "FILE_UPLOAD",
        ],
    },
    details: {
        type: String,
        required: true,
    },
    ipAddress: {
        type: String, // Capture from req.ip
    },
    userAgent: {
        type: String, // Capture from req.headers['user-agent']
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
