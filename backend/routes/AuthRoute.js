const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/signUp", async (req, res) => {
  const user = new User(req.body);

  try {
    const savedUser = await user.save();

    const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET);
    res.cookie("token", token, { expire: new Date(Date.now() + 8000000) });
    const { _id, firstName, lastName, email, role } = savedUser;

    return res.json({
      token: token,
      user: { _id, firstName, lastName, email, role },
    });

  } catch (error) {
    res.status(404).send(error.message);
  }
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res
      .status(404)
      .send("This email doesn't exist, You have to sign up");

  const isPassCorrect = await bcrypt.compare(req.body.password, user.password);

  if (!isPassCorrect) return res.status(404).send("The password is invalid");

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  res.cookie("token", token, { expire: new Date(Date.now() + 8000000) });

  const { _id, firstName, lastName, email, role } = user;
  return res.json({
    token: token,
    user: { _id, firstName, lastName, email, role },
  });
});

module.exports = router;
