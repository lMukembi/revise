const Exams = require("../models/exams");

exports.addExam = async (req, res) => {
  const { code, unit, id, school, programme } = req.body;

  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  try {
    const newExam = await Exams.create({
      code,
      school,
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
