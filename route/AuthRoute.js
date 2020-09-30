const express = require("express");
const router = express.Router();
const {
  signUp,
  signIn,
  updatePassword,
  protect,
} = require("../controller/AuthController");
// signUp
router.post("/signUp", signUp);
router.post("/signIn", signIn);
router.patch("/updatePassword", protect, updatePassword);

module.exports = router;
