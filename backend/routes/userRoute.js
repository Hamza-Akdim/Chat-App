const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const {requireSignIn} = require("../middlewares/auth")

//search user using its name
router.get("",requireSignIn, async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [ 
            { firstName: { $regex: req.query.search, $options: "i" } },
            { lastName: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const usersList = await User.find(keyword).select({
      email: 1,
      firstName: 1,
      lastName: 1,
      picturePath: 1,
    });

    res.status(200).send(usersList);
  } catch (err) {
    res.status(404).send(err);
  }
});

module.exports = router;
