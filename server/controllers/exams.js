const Exam = require("../models/exams");
const Exams = require("../models/exams");

exports.addExam = async (req, res) => {
  const { code, unit, id, school, programme, year } = req.body;

  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  try {
    const newExam = await Exams.create({
      code,
      school,
      year,
      programme,
      unit,
      file: file.filename,
      fileName: file.originalname,
      userID: id,
    });

    await newExam.save();

    return res.status(200).json({ success: true, data: newExam });
  } catch (error) {
    res.status(400).json({ message: "Something went wrong!" });
  }
};

exports.getExams = async (req, res) => {
  try {
    const exams = await Exams.find().sort({ createdAt: -1 });

    return res.status(200).json(exams);
  } catch (error) {
    res.status(404).json({ message: "No exams!" });
  }
};

exports.downloads = async (req, res) => {
  const examID = req.params.id;

  try {
    await Exam.findByIdAndUpdate(examID, { $inc: { downloads: 1 } });

    const result = await Exam.aggregate([
      { $group: { _id: null, total: { $sum: "$downloads" } } },
    ]);

    if (io) {
      io.emit("totalDownloads", result[0]?.total || 0);
    }

    return res.status(200);
  } catch (error) {
    console.error(error.message);
  }
};
