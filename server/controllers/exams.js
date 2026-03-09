const Exams = require("../models/exams");
const uploadPDFToR2 = require("../utils/r2");

exports.addExam = async (req, res) => {
  const { code, unit, id, school, programme, year } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  try {
    const filename = `${Date.now()}-${file.originalname}`;

    const pdfUrl = await uploadPDFToR2(file.buffer, filename);

    const newExam = await Exams.create({
      code,
      school,
      year,
      programme,
      unit,
      file: pdfUrl,
      userID: id,
    });

    return res.status(200).json({
      success: true,
      data: newExam,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
};

exports.getExams = async (req, res) => {
  const { id } = req.params;

  try {
    const exams = await Exams.find({ userID: id }).sort({ createdAt: -1 });

    return res.status(200).json(exams);
  } catch (error) {
    res.status(404).json({ message: "No exams!" });
  }
};
