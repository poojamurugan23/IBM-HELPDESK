const AuditLog = require("../models/AuditLog");

exports.logActivity = async (req, action, details) => {
    try {
        if (!req.user) return; // Only log authenticated user actions

        await AuditLog.create({
            user: req.user._id,
            action: action,
            details: details,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
    } catch (error) {
        console.error("Failed to log activity", error);
    }
};
