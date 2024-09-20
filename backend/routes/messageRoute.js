const express = require("express");
const router = express.Router();
const {requireSignIn} = require("../middlewares/auth");
const {sendMessage, fetchAllMessages} = require("../controllers/messageControllers")

router.post("/", requireSignIn, sendMessage);
router.get("/:chatId", requireSignIn, fetchAllMessages);

module.exports = router;
