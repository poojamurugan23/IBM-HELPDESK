const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  createTicket,
  getTickets,
  updateTicketStatus,
  assignTicket,
} = require("../controllers/ticketController");

router.post(
  "/",
  protect,
  authorizeRoles("CUSTOMER"),
  upload.array("attachments", 5),
  createTicket,
);

router.get(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "AGENT", "MANAGER", "CUSTOMER"),
  getTickets,
);

router.put(
  "/:id/status",
  protect,
  authorizeRoles("AGENT", "ADMIN", "MANAGER"),
  updateTicketStatus,
);

router.put(
  "/:id/assign",
  protect,
  authorizeRoles("ADMIN", "MANAGER"),
  assignTicket,
);

module.exports = router;
