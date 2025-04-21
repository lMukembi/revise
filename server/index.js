const express = require("express");
const cors = require("cors");
const path = require("path");
const connectionDB = require("./connection.js");

require("dotenv").config();
const app = express();
const port = 8000;

app.use(express.json());

const corsOptions = {
  origin: [
    "https://revise.co.ke",
    "https://www.revise.co.ke",
    "https://api.revise.co.ke",
    // "http://localhost:3000",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type, Authorization"],
  credentials: true,
  exposedHeaders: ["Authorization"],
};

app.use(cors(corsOptions));

app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "../client/build")));

app.use("/api/user", require("./routes/user"));
app.use("/api/exams", require("./routes/exams"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

const DBConnection = async () => {
  try {
    await connectionDB(process.env.MONGO_URI);

    app.listen(port, "0.0.0.0", () => {
      console.log(`server is running on port, ${port}`);
    });
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};

DBConnection();
