const storiesModel = require("../model/storiesModel");
const StoryModel = require("../model/storiesModel");
// creating the story
exports.CreateStory = async (req, res, next) => {
  try {
    const { title, summery } = req.body;
    const imageURL = req.file.path;
    const productAdmin = req.user._id;
    const result = await StoryModel.create({
      title,
      summery,
      imageURL,
      productAdmin,
    });
    const data = await result.populate("productAdmin").execPopulate();
    res.json({
      status: "Sucess",
      data,
    });
  } catch (error) {
    const errorMessage = new Error(error._message);
    next(errorMessage);
  }
};
// getting the stories
exports.GetStories = async (req, res, next) => {
  try {
    const data = await StoryModel.find()
      .populate("productAdmin", "-password")
      .populate("response.userID", "-password");
    res.json({
      status: "Sucess",
      data,
    });
  } catch (er) {
    const error = new Error("Something went wrong");
    next(error);
  }
};
// get stories of logedin user
exports.GetStoriesLogedin = async (req, res, next) => {
  try {
    const userID = req.user._id;
    const data = await storiesModel.find({ productAdmin: userID });
    res.json({
      status: "sucess",
      data,
    });
  } catch (error) {
    next(error);
  }
};
// get stories of  user by id
exports.GetStoriesUserById = async (req, res, next) => {
  try {
    const userID = req.params.uid;
    const data = await storiesModel.find({ productAdmin: userID });
    if (!data) {
      throw "Invalid user ID";
    }
    res.json({
      status: "sucess",
      data,
    });
  } catch (error) {
    const err = new Error(error);
    err.status = 404;
    next(err);
  }
};
// get story by id
exports.GetStoriesById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await StoryModel.findById({ _id: id }).populate(
      "productAdmin"
    );
    if (!data) {
      throw "Invalid ID";
    }
    res.json({
      status: "Sucess",
      data,
    });
  } catch (error) {
    const errMessage = new Error(error);
    errMessage.status = 404;
    next(errMessage);
  }
};
// delete story
exports.DeleteStory = async (req, res, next) => {
  try {
    const productID = req.params.id;
    const loginUserID = req.user._id;
    const productDetail = await storiesModel.findById({
      _id: productID,
    });
    // 1. product exist
    if (!productDetail) {
      throw "Invalid id";
    }
    if (productDetail.productAdmin.toString() !== loginUserID.toString()) {
      throw "Permission denied!";
    }
    await storiesModel.findByIdAndDelete({ _id: productID });
    res.json({
      status: "Sucess",
    });
  } catch (error) {
    const errMessage = new Error(error);
    errMessage.status = 404;
    next(errMessage);
  }
};
// update story
exports.UpdateStory = async (req, res, next) => {
  try {
    const productID = req.params.id;
    const loginUserID = req.user._id;
    const productDetail = await storiesModel.findById({
      _id: productID,
    });
    // 1. product exist
    if (!productDetail) {
      throw "Invalid id";
    }
    if (productDetail.productAdmin.toString() !== loginUserID.toString()) {
      throw "Permission denied!";
    }
    const { title, summery } = req.body;
    if (!title || !summery) {
      throw "Fields cannot be empty";
    }
    const data = await StoryModel.findByIdAndUpdate(
      { _id: productID },
      { title, summery },
      {
        new: true,
      }
    ).then((e) => e.populate("productAdmin").execPopulate());
    if (req.file) {
      const imageURL = req.file.path;
      data.imageURL = imageURL;
      const result = await data
        .save()
        .then((e) => e.populate("productAdmin", "-password").execPopulate())
        .then((e) => e.populate("response.userID", "-password").execPopulate());
      return res.json({
        status: "Sucess",
        data: result,
      });
    }
    res.json({
      status: "Sucess",
      data,
    });
  } catch (error) {
    const err = new Error(error);
    err.status = 401;
    next(err);
  }
};
// like
exports.likes = async (req, res, next) => {
  try {
    const { pid } = req.params;
    const uID = req.user._id;
    const storyData = await storiesModel.findById({ _id: pid });
    if (!storyData) {
      throw "Invalid Id";
    }
    const isLike = storyData.likes.some((e) => e.toString() === uID.toString());
    // check is Like?
    let newLike;
    if (isLike) {
      // remove like
      newLike = storyData.likes.filter((e) => e.toString() !== uID.toString());
    } else {
      // add like
      newLike = storyData.likes.concat(uID);
    }
    storyData.likes = newLike;
    const result = await storyData
      .save()
      .then((e) => e.populate("productAdmin", "-password").execPopulate())
      .then((e) => e.populate("response.userID", "-password").execPopulate());
    res.json({
      status: "Success",
      data: result,
    });
  } catch (error) {
    const err = new Error(error);
    next(err);
  }
};
//postComment
exports.postComment = async (req, res, next) => {
  try {
    const { sId } = req.params;
    const uID = req.user._id;
    const { comment } = req.body;
    if (!comment) {
      throw "Invalid Comment";
    }
    const story = await StoryModel.findById({ _id: sId });
    if (!story) {
      throw "Story not exits";
    }
    story.response.push({ userID: uID, comment: comment });
    const data = await story
      .save()
      .then((e) => e.populate("productAdmin", "-password").execPopulate())
      .then((e) => e.populate("response.userID", "-password").execPopulate());
    res.json({
      status: "Success",
      data,
    });
  } catch (error) {
    const err = new Error(error);
    next(err);
  }
};
//delte Comment
exports.deleteComment = async (req, res, next) => {
  try {
    const { sId, cId } = req.params;
    const uID = req.user._id;
    const story = await StoryModel.findById({ _id: sId });
    if (!story) {
      throw "Story not exits";
    }
    const selectComment = await story.response.find(
      (e) => e._id.toString() === cId.toString()
    );
    if (!selectComment) {
      throw "Invalid Comment Id";
    }
    if (selectComment.userID.toString() !== uID.toString()) {
      throw "Permission Denied";
    }
    const newComment = story.response.filter(
      (e) => e._id.toString() !== cId.toString()
    );
    story.response = newComment;
    const data = await story
      .save()
      .then((e) => e.populate("productAdmin", "-password").execPopulate())
      .then((e) => e.populate("response.userID", "-password").execPopulate());
    res.json({
      status: "Success",
      data,
    });
  } catch (error) {
    const err = new Error(error);
    next(err);
  }
};
