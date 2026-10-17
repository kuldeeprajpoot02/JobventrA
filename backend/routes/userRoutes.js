
const express = require("express");

const {
  getMyProfile,
  updateMyProfile,
  uploadMyResume,
  downloadMyResume,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const uploadResume = require("../middleware/uploadMiddleware");

const router = express.Router();

// Get logged-in user's profile
router.get("/profile", authMiddleware, getMyProfile);

// Update logged-in user's profile
router.put("/profile", authMiddleware, updateMyProfile);

// Securely download the logged-in user's own resume
router.get("/profile/resume", authMiddleware, downloadMyResume);

// Upload PDF resume
router.post(
  "/profile/resume",
  authMiddleware,
  (req, res, next) => {
    uploadResume.single("resume")(req, res, (err) => {
      if (err) {
        const statusCode =
          err.code === "LIMIT_FILE_SIZE" ? 413 : 400;

        return res.status(statusCode).json({
          success: false,
          message: err.message || "Resume upload failed",
        });
      }

      next();
    });
  },
  uploadMyResume
);

module.exports = router;
