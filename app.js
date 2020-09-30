const express = require("express");
const app = express();
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const storiesRoute = require("./route/StoriesRoute");
const userRoute = require("./route/UsersRoute");
const authRoute = require("./route/AuthRoute");
dotenv.config({ path: "./config.env" });

mongoose
  .connect(
    `mongodb+srv://bibek:${process.env.mongoPassword}@cluster0.uiqok.mongodb.net/merodost?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
  )
  .then((res) => console.log("Connected to Database"))
  .catch((err) => {
    console.log(err);
  });

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use("/stories", storiesRoute);
app.use("/user", userRoute);
app.use("/auth", authRoute);

app.use((req, res, next) => {
  const error = new Error("Page not Found");
  error.status = 401;
  next(error);
});
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({ message: error.message });
});

module.exports = app;
