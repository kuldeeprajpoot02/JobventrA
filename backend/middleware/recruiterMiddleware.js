
const User = require("../models/User");

const recruiterMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    // Verify the user's current role from the database
    const user = await User.findById(req.user.userId).select("role");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found",
      });
    }

    if (user.role !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Recruiter access only",
      });
    }

    next();
  } catch (error) {
    console.error("Recruiter authorization error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while checking recruiter access",
    });
  }
};

module.exports = recruiterMiddleware;
