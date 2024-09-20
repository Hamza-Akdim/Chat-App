const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");

exports.sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId)
    return res.status(404).send("You Have to Fill All Fields");

  const newMessage = {
    sender: req.auth._id,
    content: content,
    chat: chatId,
  };

  try {
    const message = new Message(newMessage);
    let savedMessage = await message.save();
    savedMessage = await savedMessage.populate(
      //When populating the sender field, only the firstName, lastName, and picturePath fields of the sender document will be included in the resulting populated document.
      "sender",
      "firstName lastName picturePath"
    );
    savedMessage = await savedMessage.populate("chat");
    savedMessage = await User.populate(savedMessage, {
      path: "chat.users",
      select: "firstName lastName picturePath email",
    });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });
    res.status(200).send(savedMessage);
  } catch (err) {
    res.status(404).send(err);
  }
};

exports.fetchAllMessages = async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "firstName lastName email picturePath")
    .populate("chat");

  res.status(200).send(messages);
};
