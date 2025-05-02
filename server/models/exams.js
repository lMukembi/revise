const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      required: true,
    },

    school: {
      type: String,
      required: true,
    },

    programme: {
      type: String,
      required: true,
    },

    year: {
      type: String,
      required: true,
    },

    code: {
      type: String,
      required: true,
    },

    unit: {
      type: String,
      required: true,
    },

    file: {
      type: String,
      required: true,
    },

    downloads: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Exam = mongoose.model("Exam", examSchema);

module.exports = Exam;
