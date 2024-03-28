const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const Message = require("../models/message");
const { check, body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");

exports.index = asyncHandler(async (req, res, next) => {
  const messages = await Message.find({});
  res.render("index", { title: "Members Only", messages: messages });
});

exports.sign_up_get = (req, res, next) => {
  res.render("sign_up", { title: "Sign-Up" });
};

exports.sign_up_post = [
  // Validate and sanitize fields.
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("First name cannot be empty.")
    .isLength({ max: 30 })
    .withMessage("First name cannot be longer than 30 characters.")
    .isAlpha()
    .withMessage("First name must use alphabet letters.")
    .escape(),
  body("last_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Last name cannot be empty.")
    .isLength({ max: 30 })
    .withMessage("Last name cannot be longer than 30 characters.")
    .isAlpha()
    .withMessage("Last name must use alphabet letters.")
    .escape(),
  body("username")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Username cannot be empty.")
    .isLength({ max: 30 })
    .withMessage("Username cannot be longer than 30 characters.")
    .isAlphanumeric()
    .withMessage("Username must only use letters and numbers.")
    .escape(),
  check("username").custom(async (value) => {
    const usernameExists = await User.findOne({ username: value }).exec();
    if (usernameExists) {
      throw new Error("Username is already in use.");
    }
  }),
  body("password", "Password must be at least 10 characters long.")
    .trim()
    .isLength({ min: 10 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a User object with escaped and trimmed data.
    const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      username: req.body.username,
      password: req.body.password,
      membership: req.body.membership === process.env.MEMBERSHIP_PW,
      admin: false,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("sign_up", {
        title: "Sign-Up",
        user: user,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Encrypt password for security.
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) {
          throw new Error("Error saving password. Please try again.");
        }
        user.password = hashedPassword;
        await user.save();

        // New user saved. Redirect to home page.
        res.redirect("/");
      });
    }
  }),
];

exports.login_get = (req, res, next) => {
  res.render("login", { title: "Login" });
};

exports.login_post = [
  // Validate and sanitize fields.
  body("username").trim().escape(),
  check("username").custom(async (value) => {
    const usernameExists = await User.findOne({ username: value }).exec();
    if (usernameExists === null) {
      throw new Error(
        "User does not exist. Please check username and try again."
      );
    }
  }),
  body("password").trim().escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("login", {
        title: "Login",
        username: req.body.username,
        errors: errors.array(),
      });
      return;
    }
    // Validation is successful, call next() to go on with passport authentication.
    next();
  },

  // Authenticate user
  (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      // If user isn't authenticated, rerender page with error message.
      if (!user) {
        const errors = [{ msg: info.message }];
        return res.render("login", { title: "Login", errors: errors });
      }
      // User is authenticated, log them into the session.
      req.login(user, function (err) {
        if (err) {
          return next(err);
        }
        // Redirect to home page if there are no login issues
        return res.redirect("/");
      });
    })(req, res, next);
  },
];

exports.profile_get = (req, res, next) => {
  res.send("NOT IMPLEMENTED: Profile GET");
};
