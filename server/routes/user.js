const express = require("express");
const router = express.Router();

const { processSignup, processLogin, getUser } = require("../controllers/user");

router.route("/signup").post(processSignup);
router.route("/login").post(processLogin);
router.route("/:id/user-data").get(getUser);

module.exports = router;
