const express = require("express");
const router = express.Router();
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files allowed"), false);
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 },
});

const { addExam, getExams } = require("../controllers/exams");

router.post("/:id/addexam", upload.single("file"), async (req, res, next) => {
  try {
    await addExam(req, res);

    const scriptPath = path.join(__dirname, "../scripts/generatePages.js");

    exec(`node ${scriptPath}`, (error, stdout, stderr) => {
      if (error) console.error("Script error:", error);
      if (stderr) console.error(stderr);
      if (stdout) console.log(stdout);
    });
  } catch (err) {
    next(err);
  }
});

router.get("/all-exams", getExams);
// router.get("/downloads", downloads);

module.exports = router;
