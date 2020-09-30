const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + Date.now() + file.originalname);
  },
});
const upload = multer({ storage: storage });
const { protect } = require("../controller/AuthController");
const {
  CreateStory,
  GetStories,
  GetStoriesById,
  DeleteStory,
  UpdateStory,
  GetStoriesLogedin,
  GetStoriesUserById,
  likes,
  postComment,
  deleteComment,
} = require("../controller/storiesController");
// get stories
router.get("/", GetStories);
// get stories of loged in users
router.get("/user", protect, GetStoriesLogedin);
// get stories by userID
router.get("/user/:uid", protect, GetStoriesUserById);
// create story
router.post("/", protect, upload.single("imageURL"), CreateStory);
// get story by id
router.get("/:id", GetStoriesById);
// update story
router.patch("/:id", protect, upload.single("imageURL"), UpdateStory);
// delete story
router.delete("/:id", protect, DeleteStory);
// like story
router.get("/like/:pid", protect, likes);
// comment on story
router.post("/comment/:sId", protect, postComment);
// delete comment on story
router.delete("/comment/:sId/:cId", protect, deleteComment);

module.exports = router;
