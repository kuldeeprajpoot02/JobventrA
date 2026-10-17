
const express = require("express");

const {
  applyForJob,
  getMyApplications,
  getApplicationsForRecruiter,
  updateApplicationStatus,
} = require("../controllers/applicationController");

const authMiddleware = require("../middleware/authMiddleware");
const recruiterMiddleware = require("../middleware/recruiterMiddleware");

const router = express.Router();

// Jobseeker: Apply for a job
router.post("/", authMiddleware, applyForJob);

// Jobseeker: View their own applications
router.get("/my", authMiddleware, getMyApplications);

// Recruiter: View applications for their jobs
router.get(
  "/recruiter",
  authMiddleware,
  recruiterMiddleware,
  getApplicationsForRecruiter
);

// Recruiter: Update an application's status
router.patch(
  "/:applicationId/status",
  authMiddleware,
  recruiterMiddleware,
  updateApplicationStatus
);

module.exports = router;
