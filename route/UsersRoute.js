const express = require("express");
const router = express.Router();
const {
  editProfile,
  uploadPhoto,
  allUsers,
  bookmark,
  follow,
  getBookmark
} = require("../controller/ProfileController");
const { protect } = require("../controller/AuthController");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/Profile/");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + Date.now() + file.originalname);
  },
});
const upload = multer({ storage: storage });
// get users
router.get("/", protect, allUsers);
// update profile
router.patch("/updateProfile", protect, editProfile);
// upload photo
router.post("/uploadPhoto", protect, upload.single("profile"), uploadPhoto);

// follow users
router.get("/follow/:uid", protect, follow);

// bookmark
router.get("/bookmark/:pid", protect, bookmark);
router.get("/bookmark", protect, getBookmark);
module.exports = router;
