
const express = require("express");

const {
  createJob,
  getAllJobs,
} = require("../controllers/jobController");

const authMiddleware = require("../middleware/authMiddleware");
const recruiterMiddleware = require("../middleware/recruiterMiddleware");

const router = express.Router();

// Public route: Anyone can view all jobs
router.get("/", getAllJobs);

// Protected route: Only recruiters can create jobs
router.post(
  "/",
  authMiddleware,
  recruiterMiddleware,
  createJob
);

module.exports = router;
