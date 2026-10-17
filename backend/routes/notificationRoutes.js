
const express = require("express");

const {
  getMyNotifications,
  markNotificationAsRead,
} = require("../controllers/notificationController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in user's notifications
router.get("/", authMiddleware, getMyNotifications);

// Mark a notification as read
router.patch("/:id/read", authMiddleware, markNotificationAsRead);

module.exports = router;
