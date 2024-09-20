const { expressjwt: jwt } = require("express-jwt");
require("dotenv").config();

exports.requireSignIn = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  userProperty: "auth",
});
