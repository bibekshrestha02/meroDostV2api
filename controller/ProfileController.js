const userModel = require("../model/userModel");
const UserModel = require("../model/userModel");
const storyModel = require("../model/storiesModel");
exports.editProfile = async (req, res, next) => {
  try {
    const id = req.user._id;
    const { name, email, about } = req.body;
    if (!name || !email) {
      throw "Email or Name can't be Empty";
    }
    const user = await UserModel.findByIdAndUpdate(
      { _id: id },
      { name: name, email: email, about: about },
      {
        new: true,
      }
    );
    res.status(200).json({
      status: "Sucess",
      data: user,
    });
  } catch (error) {
    let err = new Error(error);
    if (error.code === 11000) {
      err = new Error("Email already Exists");
    }
    next(err);
  }
};
exports.uploadPhoto = async (req, res, next) => {
  try {
    const id = req.user._id;
    const imageURL = req.file.path;
    const user = await UserModel.findByIdAndUpdate(
      { _id: id },
      { imageURL },
      {
        new: true,
      }
    );
    res.status(200).json({
      status: "Sucess",
      data: {
        imageURL: user.imageURL,
      },
    });
  } catch (error) {
    let err = new Error(error);
    next(err);
  }
};
exports.allUsers = async (req, res, next) => {
  try {
    const userID = req.user._id;
    const data = await userModel.find({}).populate('bookmarks.productAdmin','-bookmarks -password').exec();
    res.json({
      status: "Success",
      total: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// get bookmarks
exports.getBookmark = async (req, res, next) => {
  try {
    const uID = req.user._id;
    const data = await userModel.findById({ _id: uID }).then(e=>e.populate('bookmarks.productAdmin','-bookmarks -password').execPopulate());
    res.json({
      status: "Success",
      data:data.bookmarks
    });
  } catch (error) {
    const err = new Error(error);
    next(err);
  }
};


// bookmark
exports.bookmark = async (req, res, next) => {
  try {
    const { pid } = req.params;
    const uID = req.user._id;
    const userData = await userModel.findById({ _id: uID });
    const isStory = await storyModel.findById({ _id: pid });
    if (!userData) {
      throw "Invalid user ID";
    }
    if (!isStory) {
      throw "Invalid story ID";
    }
    const isBookmark = userData.bookmarks.find(
      (e) => e._id.toString() === pid.toString()
    );
    // check is bookmark?
    let newBookMark;
    if (isBookmark) {
      // remove bookmark
      newBookMark = userData.bookmarks.filter(
        (e) => e._id.toString() !== pid.toString()
      );
    } else {
      // add bookmark
      newBookMark = userData.bookmarks.concat(isStory);
    }
    userData.bookmarks = newBookMark;
 const data = await userData.save().then(e=>e.populate('bookmarks.productAdmin','-password -bookmarks').execPopulate());;
    res.json({
      status: "Success",
      data: data.bookmarks,
    });
  } catch (error) {
    const err = new Error(error);
    next(err);
  }
};

// follow
exports.follow = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const logInID = req.user._id;
    const userData = await userModel.findById({ _id: logInID });
    const isUser = await userModel.findById({ _id: uid });
    if (!userData) {
      throw "Invalid user ID";
    }
    if (!isUser) {
      throw "Invalid follow user ID";
    }
    const isFollowing = userData.following.some(
      (e) => e.toString() === uid.toString()
    );
    // check is follow?
    let newFollowers;
    let newFollowing;
    if (isFollowing) {
      // remove following
      newFollowing = userData.following.filter(
        (e) => e.toString() !== uid.toString()
      );
      newFollowers = isUser.followers.filter(
        (e) => e.toString() !== logInID.toString()
      );
    } else {
      // add following
      newFollowing = userData.following.concat(uid);
      newFollowers = isUser.followers.concat(logInID);
    }
    userData.following = newFollowing;
    isUser.followers = newFollowers;
    const follow = await isUser.save();
    const result = await userData.save();
    res.json({
      status: "Success",
      data: { follow, result },
    });
  } catch (error) {
    const err = new Error(error);
    next(err);
  }
};
