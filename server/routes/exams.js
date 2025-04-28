const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { exec } = require("child_process");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed."), false);
  }
};

const upload = multer({ storage, fileFilter });

const { addExam, getExams } = require("../controllers/exams");

router
  .route("/:id/addexam")
  .post(upload.single("file"), async (req, res, next) => {
    try {
      await addExam(req, res);

      const scriptPath = path.join(__dirname, "../scripts/generatePages.js");

      exec(`node ${scriptPath}`, (err, stdout, stderr) => {
        if (err) {
          console.error("No pages generated:", stderr);
          return;
        }
        console.log("Pages generated:", stdout);
      });
    } catch (err) {
      console.error(err.message);
      next(err);
    }
  });

router.route("/all-exams").get(getExams);

module.exports = router;
