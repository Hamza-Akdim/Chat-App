const express = require("express");
const app = express();
const chatRoute = require("./routes/chatRoute");
const messageRoute = require("./routes/messageRoute");
const authRoute = require("./routes/AuthRoute");
const userRoute = require("./routes/userRoute")
const { connectDB } = require("./config/db");
const cors = require("cors");
require("dotenv").config();
require("colors");

// DataBase connection
connectDB();

//Middlewares
app.use(cors());
app.use(express.json());

//API
app.use("/api/auth", authRoute);
app.use("/api/chat", chatRoute);
app.use("/api/message", messageRoute);
app.use("/api/user", userRoute);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`The server is running on the port ${port}...`.yellow.bold);
});


const io = require("socket.io")(server, {
  pingTimeOut: 60000, //the server will wait 60000, if the user doesn't send any message the server will close the socket connection
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("Connected to the socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id); //create a new room for the user using its id. This room will be exclusive to that particular user only
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room : " + room);
  });

  socket.on("new message", (newMessageRecieved) => {
    let chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return; //I don't want to send this message to the one who wrote it

      socket.in(user._id).emit("message recieved", newMessageRecieved); // "in" : means inside that user's room, emit or send that message
    });
  });
});