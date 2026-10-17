
const User = require("../models/User");
const path = require("path");
const fs = require("fs");

// Get logged-in user's profile
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};

// Update logged-in user's profile
const updateMyProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      headline,
      skills,
      education,
      experience,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
    } = req.body;

    const updates = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }
      updates.name = name.trim();
    }

    if (phone !== undefined) updates.phone = phone;
    if (headline !== undefined) updates.headline = headline;
    if (education !== undefined) updates.education = education;
    if (experience !== undefined) updates.experience = experience;
    if (linkedinUrl !== undefined) updates.linkedinUrl = linkedinUrl;
    if (githubUrl !== undefined) updates.githubUrl = githubUrl;
    if (portfolioUrl !== undefined) updates.portfolioUrl = portfolioUrl;

    if (skills !== undefined) {
      if (
        !Array.isArray(skills) ||
        !skills.every((skill) => typeof skill === "string")
      ) {
        return res.status(400).json({
          success: false,
          message: "Skills must be an array of strings",
        });
      }

      updates.skills = skills.map((skill) => skill.trim()).filter(Boolean);
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};

// Upload resume for the logged-in user
const uploadMyResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a PDF resume to upload",
      });
    }

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { resumeUrl } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resumeUrl: user.resumeUrl,
    });
  } catch (error) {
    console.error("Resume upload error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while uploading resume",
    });
  }
};

// Securely view or download the logged-in user's own resume
const downloadMyResume = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("resumeUrl");

    if (!user || !user.resumeUrl) {
      return res.status(404).json({
        success: false,
        message: "No resume found. Please upload your PDF resume first.",
      });
    }

    const filename = path.basename(user.resumeUrl);

    // Only allow generated PDF filenames
    if (!/^\d+-\d+\.pdf$/i.test(filename)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resume file reference",
      });
    }

    const resumePath = path.resolve(
      process.cwd(),
      "uploads",
      "resumes",
      filename
    );

    const resumesDirectory = path.resolve(process.cwd(), "uploads", "resumes");

    if (path.dirname(resumePath) !== resumesDirectory) {
      return res.status(400).json({
        success: false,
        message: "Invalid resume path",
      });
    }

    if (!fs.existsSync(resumePath)) {
      return res.status(404).json({
        success: false,
        message: "Resume file not found on server",
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("X-Content-Type-Options", "nosniff");

    return res.download(resumePath, "my-resume.pdf");
  } catch (error) {
    console.error("Resume download error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while accessing resume",
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadMyResume,
  downloadMyResume,
};
