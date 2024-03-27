const asyncHandler = require("express-async-handler");
const Message = require("../models/message");

exports.index = asyncHandler(async (req, res, next) => {
  const messages = await Message.find({});
  res.render("index", { title: "Members Only", messages: messages });
});

exports.sign_up_get = (req, res, next) => {
  res.render("sign_up");
};

exports.sign_up_post = (req, res, next) => {
  res.send("NOT IMPLEMENTED: Sign-up POST");
};

exports.login_get = (req, res, next) => {
  res.send("NOT IMPLEMENTED: Login page GET");
};

exports.login_post = (req, res, next) => {
  res.send("NOT IMPLEMENTED: Login page POST");
};

exports.profile_get = (req, res, next) => {
  res.send("NOT IMPLEMENTED: Profile GET");
};
