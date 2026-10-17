
const Job = require("../models/Job");

// Create a new job
const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      jobType,
      salary,
      description,
      skills,
    } = req.body || {};

    if (
      typeof title !== "string" ||
      typeof company !== "string" ||
      typeof location !== "string" ||
      typeof description !== "string" ||
      !title.trim() ||
      !company.trim() ||
      !location.trim() ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, company, location and description are required",
      });
    }

    const job = await Job.create({
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      jobType,
      salary,
      description: description.trim(),
      skills: Array.isArray(skills) ? skills : [],
      recruiter: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Job posted successfully",
      job,
    });
  } catch (error) {
    console.error("Create job error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while posting job",
    });
  }
};

// Get all jobs
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Get all jobs error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching jobs",
    });
  }
};

module.exports = {
  createJob,
  getAllJobs,
};
