const express = require("express");
const router = express.Router();
const { getAnalytics } = require("../controllers/analyticsController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Only Admins and Managers should see analytics
router.get(
    "/",
    protect,
    authorizeRoles("ADMIN", "MANAGER", "SUPER_ADMIN"),
    getAnalytics,
);

module.exports = router;
