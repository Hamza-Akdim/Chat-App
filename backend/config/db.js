const mongoose = require("mongoose");

exports.connectDB = () => {
  mongoose
    .connect("mongodb://localhost/social-media-app")
    .then(() => console.log("Database is connected ...".blue.bold))
    .catch(() => console.log("Error: database could not connect".red.bold));
};
