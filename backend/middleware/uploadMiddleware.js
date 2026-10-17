
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/resumes/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
      path.extname(file.originalname).toLowerCase();

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const isPdfExtension =
    path.extname(file.originalname).toLowerCase() === ".pdf";

  const isPdfMimeType = file.mimetype === "application/pdf";

  if (isPdfExtension && isPdfMimeType) {
    return cb(null, true);
  }

  cb(new Error("Only PDF resume files are allowed."));
};

const uploadResume = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

module.exports = uploadResume;
