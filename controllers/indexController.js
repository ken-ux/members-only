const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const Message = require("../models/message");
const { check, body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");

exports.index = asyncHandler(async (req, res, next) => {
  const messages = await Message.find({}).populate("author").exec();
  res.render("index", { title: "Members Only", messages: messages });
});

exports.sign_up_get = (req, res, next) => {
  // Redirect user to home page if they're signed in.
  if (req.user) {
    return res.redirect("/");
  }
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

        // Login user after signing up.
        req.login(user, function (err) {
          if (err) {
            return next(err);
          }
          // New user saved and logged in. Redirect to home page.
          return res.redirect("/");
        });
      });
    }
  }),
];

exports.login_get = (req, res, next) => {
  // Redirect user to home page if they're signed in.
  if (req.user) {
    return res.redirect("/");
  }
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
      if (err) {
        return next(err);
      }
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
        // Redirect to home page if there are no login issues.
        return res.redirect("/");
      });
    })(req, res, next);
  },
];

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

exports.profile_get = (req, res, next) => {
  // Redirect user to home page if they're not signed in.
  if (!req.user) {
    return res.redirect("/");
  }
  res.render("profile", { title: "Profile" });
};

exports.profile_post = [
  // Sanitize fields.
  body("membershipPassword").trim().escape(),
  body("adminPassword").trim().escape(),

  asyncHandler(async (req, res, next) => {
    let admin_status = req.user.admin;
    let membership_status = req.user.membership;

    // Check if correct admin or membership passwords have been input.
    if (req.body.adminPassword === process.env.ADMIN_PW) {
      admin_status = true;
    }
    if (req.body.membershipPassword === process.env.MEMBERSHIP_PW) {
      membership_status = true;
    }

    // Update user admin and membership statuses.
    await User.findByIdAndUpdate(req.user.id, {
      admin: admin_status,
      membership: membership_status,
    });

    // Refresh page after updating user in database.
    res.redirect("/profile");
  }),
];

exports.send_message_get = (req, res, next) => {
  // Redirect user to home page if they're not signed in
  if (!req.user) {
    return res.redirect("/");
  }
  res.render("send_message", { title: "Send Message" });
};

exports.send_message_post = [
  // Validate and sanitize fields.
  body("title")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Title cannot be empty.")
    .isLength({ max: 30 })
    .withMessage("Title cannot be longer than 30 characters.")
    .escape(),
  body("text")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Message cannot be empty.")
    .isLength({ max: 300 })
    .withMessage("Message cannot be longer than 300 characters.")
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    const user = await User.findById(req.user.id);

    // Create a User object with escaped and trimmed data.
    const message = new Message({
      title: req.body.title,
      text: req.body.text,
      timestamp: Date.now(),
      author: user,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("send_message", {
        title: "Send Message",
        message: message,
        errors: errors.array(),
      });
      return;
    }
    // Validation is successful, update the timestamp before saving message and redirecting to index.
    message.timestamp = Date.now();
    await message.save();
    res.redirect("/");
  }),
];

exports.delete_message_get = asyncHandler(async (req, res, next) => {
  // Redirect user to home page if they're not signed in
  if (!req.user || !req.user.admin) {
    return res.redirect("/");
  }

  // Get message details and render form
  const message = await Message.findById(req.params.id)
    .populate("author")
    .exec();

  if (message === null) {
    // No results.
    res.redirect("/");
  }

  res.render("delete_message", { title: "Delete Message", message: message });
});

exports.delete_message_post = asyncHandler(async (req, res, next) => {
  await Message.findByIdAndDelete(req.body.messageid);
  res.redirect("/");
});
