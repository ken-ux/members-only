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

// GET profile page
router.get("/profile", index_controller.profile_get);

module.exports = router;
