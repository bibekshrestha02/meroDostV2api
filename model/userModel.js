const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Enter your name"],
  },
  email: {
    type: String,
    required: [true, "Enter your email"],
    validate: [validator.isEmail, "Invalid Email"],
    unique: [true, "Email Exits"],
  },
  password: {
    type: String,
    required: [true, "Enter your password"],
  },
  imageURL: {
    type: String,
    default: "uploads/Profile/iconProfile.png",
  },
  bookmarks: {
    type: Array,
  },
  followers: {
    type: Array,
  },
  following: {
    type: Array,
  },
  about: {
    type: String,
  },
});
userSchema.pre("save", async function (next) {
  const password = await bcryptjs.hash(this.password, 12);
  this.password = password;
  next();
});
userSchema.methods.checkPassword = async function (
  enterPassword,
  userPassword
) {
  return await bcryptjs.compare(enterPassword, userPassword);
   
};
module.exports = mongoose.model("User", userSchema);
