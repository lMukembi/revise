const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.processSignup = async (req, res) => {
  const { email, name, school, password } = req.body;

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const newUser = await User.create({
    name,
    school,
    email,
    password: hash,
  });

  await newUser.save();

  const result = { id: newUser.id };
  const tokenID = jwt.sign(result, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  res.status(200).json({
    status: true,
    result: newUser,
    tokenID: tokenID,
    message: "User created successfully.",
  });
};

exports.processLogin = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      message: "Not registered!",
    });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(404).json({ message: "Password does not match." });
  }

  const result = { id: user.id };
  const tokenID = jwt.sign(result, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  res.status(200).json({ status: true, result: user, tokenID: tokenID });
};

exports.getUser = async (req, res) => {
  try {
    const userData = await User.findOne({ _id: req.params.id });

    res.status(200).json(userData);
  } catch (error) {
    res.status(404).json({ message: "No user." });
  }
};
