
const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Jobseeker: Apply for a job
const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.body || {};

    if (!jobId || !/^[0-9a-fA-F]{24}$/.test(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid job ID",
      });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const applicantId = req.user.userId;

    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: applicantId,
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    const application = await Application.create({
      job: jobId,
      applicant: applicantId,
    });

    // Notify the recruiter about the new application.
    try {
      const applicant = await User.findById(applicantId).select("name");

      await Notification.create({
        recipient: job.recruiter,
        sender: applicantId,
        type: "NEW_APPLICATION",
        message: `${applicant?.name || "A jobseeker"} applied for your job "${job.title}".`,
        job: job._id,
        application: application._id,
      });
    } catch (notificationError) {
      console.error(
        "New application notification error:",
        notificationError.message
      );
    }

    return res.status(201).json({
      success: true,
      message: "Job application submitted successfully",
      application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    console.error("Apply for job error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while applying for job",
    });
  }
};

// Jobseeker: Get their own applications
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      applicant: req.user.userId,
    })
      .populate("job", "title company location jobType salary description")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get my applications error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching your applications",
    });
  }
};

// Recruiter: Get applications for jobs posted by this recruiter
const getApplicationsForRecruiter = async (req, res) => {
  try {
    const recruiterJobs = await Job.find({
      recruiter: req.user.userId,
    }).select("_id");

    const jobIds = recruiterJobs.map((job) => job._id);

    const applications = await Application.find({
      job: { $in: jobIds },
    })
      .populate("job", "title company location")
      .populate("applicant", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get recruiter applications error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching applications",
    });
  }
};

// Recruiter: Update status only for applications to their own jobs
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body || {};

    const allowedStatuses = [
      "Applied",
      "Under Review",
      "Shortlisted",
      "Rejected",
    ];

    if (!/^[0-9a-fA-F]{24}$/.test(applicationId || "")) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid application ID",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    const application = await Application.findById(applicationId).populate(
      "job",
      "recruiter title"
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (
      !application.job ||
      application.job.recruiter.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update applications for your own jobs",
      });
    }

    const previousStatus = application.status;
    const statusChanged = previousStatus !== status;

    application.status = status;
    await application.save();

    // Notify the jobseeker only when the status actually changes.
    if (statusChanged) {
      try {
        await Notification.create({
          recipient: application.applicant,
          sender: req.user.userId,
          type: "APPLICATION_STATUS",
          message: `Your application for "${application.job.title}" is now "${status}".`,
          job: application.job._id,
          application: application._id,
        });
      } catch (notificationError) {
        console.error(
          "Application status notification error:",
          notificationError.message
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    console.error("Update application status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while updating application status",
    });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getApplicationsForRecruiter,
  updateApplicationStatus,
};
