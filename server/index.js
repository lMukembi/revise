const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const connectionDB = require("./connection.js");

require("dotenv").config();
const app = express();
const port = 8000;

app.use(express.json());
app.use(
  cors({
    origin: [
      "https://api.revise.co.ke",
      "https://revise.co.ke",
      "https://www.revise.co.ke",
      // "http://localhost:3000",
    ],
    credentials: true,
    exposedHeaders: ["ip"],
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "client", "build")));

app.use("/api/user", require("./routes/user"));
app.use("/api/exams", require("./routes/exams"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "/frontend/public/index.html"));
});

const DBConnection = async () => {
  try {
    await connectionDB(process.env.MONGO_URI);

    app.listen(port, () => {
      console.log(`server is running on port, ${port}`);
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

DBConnection();
