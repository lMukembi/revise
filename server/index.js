const express = require("express");
const cors = require("cors");
const path = require("path");
const connectionDB = require("./connection.js");
// const http = require("http");
// const { Server } = require("socket.io");

require("dotenv").config();
const app = express();
const port = 8000;
const MONGO_URI = "mongodb://revise:1919@127.0.0.1:27017/reviseapp";
//  const MONGO_URI =  "mongodb+srv://apexadverts:1919@apexadverts.e1ng8.mongodb.net/?retryWrites=true&w=majority&appName=ApexAdverts"

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: [
//       "https://revise.co.ke",
//       "https://www.revise.co.ke",
//       "https://app.revise.co.ke",
//     ],
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// global.io = io;

// io.on("connection", (socket) => {
//   console.log("Socket connected:", socket.id);
// });

const corsOptions = {
  origin: [
    "https://app.revise.co.ke",
    "https://revise.co.ke",
    "https://www.revise.co.ke",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  exposedHeaders: ["Authorization"],
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "../client/build")));

app.use("/api/user", require("./routes/user"));
app.use("/api/exams", require("./routes/exams"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/pages", express.static(path.join(__dirname, "public", "pages")));
app.use(
  "/sitemap.xml",
  express.static(path.join(__dirname, "public", "sitemap.xml"))
);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

const DBConnection = async () => {
  try {
    await connectionDB(MONGO_URI);

    app.listen(port, "0.0.0.0", () => {
      console.log(`server is running on port ${port}`);
    });
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};

DBConnection();
