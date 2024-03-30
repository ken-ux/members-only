var express = require("express");
var router = express.Router();

const index_controller = require("../controllers/indexController");

/* GET home page. */
router.get("/", index_controller.index);

// GET sign-up page
router.get("/sign-up", index_controller.sign_up_get);

// POST sign-up page
router.post("/sign-up", index_controller.sign_up_post);

// GET login page
router.get("/login", index_controller.login_get);

// POST login page
router.post("/login", index_controller.login_post);

// GET logout
router.get("/logout", index_controller.logout);

// GET profile page
router.get("/profile", index_controller.profile_get);

// POST profile page
router.post("/profile", index_controller.profile_post);

// GET message page
router.get("/send-message", index_controller.send_message_get);

// POST message page
router.post("/send-message", index_controller.send_message_post);

// GET delete message page
router.get("/delete/:id", index_controller.delete_message_get);

// POST delete message page
router.post("/delete/:id", index_controller.delete_message_post);

module.exports = router;
