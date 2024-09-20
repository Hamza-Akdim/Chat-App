const Chat = require("../models/chatModel");
const User = require("../models/userModel");

exports.accessChat = async (req, res) => {
  const { userId } = req.body; // "userId" is another user who I had or I will have chat with him
  if (!userId) {
    console.log("userId param is not sent with request");
    return res.sendStatus(400);
  }

  let chat = await Chat.findOne({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.auth._id } } }, //$elemMatch: Is a mongoDB operator, It is used to specify that at least one element in the array must satisfy the given condition.
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  chat = await User.populate(chat, {
    path: "latestMessage.sender",
    select: "firstName lastName picturePath email",
  });

  if (chat) {
    res.send(chat);
  } else {
    let chatData = {
      chatName: "sender",
      isGroupChat: "false",
      users: [req.auth._id, userId],
    };

    try {
      const chat = new Chat(chatData);
      const savedChat = await chat.save();

      const FullChat = await Chat.findOne({ _id: savedChat._id }).populate(
        "users",
        "-password"
      );

      res.status(200).json(FullChat);
    } catch (error) {
      res.status(404).send(error);
    }
  }
};

exports.fetchChats = async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.auth._id } } })
      .populate("users", "-password")
      .populate("groupAdmin")
      .populate("latestMessage")
      .sort({ updateAt: -1 }) // from the newest to the oldest
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "firstName lastName picturePath email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(404).send(error);
  }
};

exports.createGroup = async (req, res) => {
  if (!req.body.users || !req.body.name)
    return res.status(404).send("You have to fill all the fields");

  var users = JSON.parse(req.body.users);

  if (users.length < 2)
    return res
      .status(404)
      .send(
        "It is required to have more than 2 users to create a group of chat"
      );

  users.push(req.auth);

  try {
    const groupChat = new Chat({
      chatName: req.body.name,
      isGroupChat: true,
      users: users,
      groupAdmin: req.auth,
    });

    const savedGroupChat = await groupChat.save();

    const fullGroupChat = await Chat.findOne({ _id: savedGroupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).send(fullGroupChat);
  } catch (error) {
    res.status(404).status(error);
  }
};

exports.renameGroup = async (req, res) => {
  const { groupId, newGroupName } = req.body;

  const result = await Chat.findOneAndUpdate(
    { _id: groupId, isGroupChat: true },
    {
      $set: {
        chatName: newGroupName,
      },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!result) return res.status(404).send("No Group Ghat is Found");
  else res.status(200).json(result);
};

exports.addUserToGroup = async (req, res) => {
  const { userId, chatId } = req.body;
  if (!userId || !chatId) return res.status(400).send("Please Fill all Fields");

  const chat = await Chat.findById(chatId).populate("groupAdmin", "-password");

  if (!chat) return res.status(400).send("Chat is Not Found");
  
  if (chat.groupAdmin._id != req.auth._id)
    return res.status(400).send("You Are Not Allowed, Only For Admin");

  const updatedChat = await Chat.findOneAndUpdate(
    { _id: chatId },
    {
      $push: {
        users: userId,
      },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) return res.status(400).send("Chat Not Found");
  else res.status(200).send(updatedChat);
};

exports.removeFromGroup = async (req, res) => {
  const { userId, chatId } = req.body;
  if (!userId || !chatId) return res.status(400).send("Please Fill all Fields");

  const chat = await Chat.findById(chatId).populate("groupAdmin", "-password");

  if (!chat) return res.status(400).send("Chat is Not Found");

  if (chat.groupAdmin._id != req.auth._id)
    return res.status(400).send("You Are Not Allowed, Only For Admin");

  const removed = await Chat.findOneAndUpdate(
    { _id: chatId },
    {
      $pull: {
        users: userId,
      },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) return res.status(400).send("Chat Not Found");
  else res.status(200).send(removed);
};
