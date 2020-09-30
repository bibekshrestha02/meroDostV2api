const mongoose = require("mongoose");
const responseSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  comment: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
const schema = new mongoose.Schema({
  productAdmin: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
    required: [true, "Enter title of your story"],
  },
  summery: {
    type: String,
    required: [true, "Enter Summery of your story"],
  },
  imageURL: {
    type: String,
    required: [true, "Upload image for your story"],
  },
  likes: {
    type: Array,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  response: [responseSchema],
});

module.exports = mongoose.model("Story", schema);
