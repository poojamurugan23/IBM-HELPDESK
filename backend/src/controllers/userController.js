const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json({ success: true, count: users.length, users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { name, email, department, isActive, role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Only Admin can update role/status
        if (role && req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
            return res.status(403).json({ message: "Not authorized to update role" });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.department = department || user.department;
        if (typeof isActive !== "undefined") user.isActive = isActive;
        if (role) user.role = role;

        await user.save();

        await AuditLog.create({
            user: req.user._id,
            action: "UPDATE_USER",
            details: `Updated user ${user.email} (Role: ${user.role}, Active: ${user.isActive})`,
        });

        res.json({ success: true, message: "User updated", user: user.toObject({ versionKey: false }) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await user.deleteOne();

        await AuditLog.create({
            user: req.user._id,
            action: "DELETE_USER",
            details: `Deleted user ${user.email}`,
        });

        res.json({ success: true, message: "User deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
