const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  addMessage,
  getMessages,
} = require("../controllers/conversationController");

router.route("/:ticketId").post(protect, addMessage).get(protect, getMessages);

module.exports = router;
