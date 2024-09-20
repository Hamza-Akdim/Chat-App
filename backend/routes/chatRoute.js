const express = require("express");
const router = express.Router();
const {
  accessChat,
  fetchChats,
  createGroup,
  renameGroup,
  addUserToGroup,
  removeFromGroup,
} = require("../controllers/chatControllers");
const { requireSignIn } = require("../middlewares/auth");

router.post("/", requireSignIn, accessChat);
router.get("/", requireSignIn, fetchChats);
router.post("/group", requireSignIn, createGroup);
router.put("/rename", requireSignIn, renameGroup);
router.put("/groupAdd", requireSignIn, addUserToGroup);
router.put("/groupRemove", requireSignIn, removeFromGroup);


module.exports = router;
