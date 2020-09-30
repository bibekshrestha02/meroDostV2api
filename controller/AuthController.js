const userModel = require("../model/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
// validation error
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.path);
  const message = `Invalid input data: ${errors.join(", ")}`;
  return message;
};
// generate token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.jtw_secure_key);
};
// send res.
const createSendToken = (user, status, res) => {
  const token = signToken(user._id);
  user.password = undefined;
  res.status(status).json({
    status: "Success",
    token: token,
    data: user,
  });
};
// signUp
exports.signUp = async (req, res, next) => {
  try {
    const { email, name, password } = req.body;
    const result = await userModel.create({ email, name, password });
    createSendToken(result, 201, res);
  } catch (error) {
    let err;
    if (error.code === 11000) {
      err = new Error("Email already Exists");
      err.status = 400;
    }
    if (error._message === "User validation failed") {
      const message = handleValidationErrorDB(error);
      err = new Error(message);
      err.status = 400;
    }
    next(err);
  }
};
// sigin
exports.signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    //   1. check email or passwrod entered
    if (!email || !password) {
      throw "Please provide email or password";
    }
    const user = await userModel.findOne({ email: email });

    // 2. check if password correct and userExists
    if (!user) {
      throw "Invalid email";
    }
    if (!(await user.checkPassword(password, user.password))) {
      console.log(await user.checkPassword(password, user.password));
      throw "invalid Password";
    }
    createSendToken(user, 200, res);
  } catch (error) {
    const err = new Error(error);
    err.status = 401;
    next(err);
  }
};
// protect route
exports.protect = async (req, res, next) => {
  try {
    let token;
    // getting token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      throw "You are not logged in! Please log in to get access.";
    }
    const decode = await promisify(jwt.verify)(
      token,
      process.env.jtw_secure_key
    );
    const user = await userModel.findById({ _id: decode.id });
    if (!user) {
      throw "Invalid token";
    }
    req.user = user;
    next();
  } catch (error) {
    let err;
    if (error.name === "JsonWebTokenError") {
      err = new Error("Invalid Token. Login in again");
      err.status = 401;
    }
    err = new Error(error);
    err.status = 401;
    next(err);
  }
};

// update password
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id).select("+password");
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || !currentPassword) {
      throw "Enter the Current Password and New Password";
    }
    if (newPassword === currentPassword) {
      throw "Password can't be same";
    }
    // if current password is correct
    if (!(await user.checkPassword(currentPassword, user.password))) {
      throw "Invalid current password";
    }
    user.password = newPassword;
    await user.save();
    createSendToken(user, 200, res);
  } catch (error) {
    const err = new Error(error);
    next(err);
  }
};
