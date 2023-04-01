const express = require("express");
const { route } = require("express/lib/application");
const router = express.Router();
const loginController = require("../controllers/loginController");
const userController = require("../controllers/userController");

// Get
router.get("/login", loginController.loginPage);
router.get("/", loginController.login);
router.get("/redirect", loginController.login);
router.get("/logout", loginController.logout);

// Post
router.post("/auth", loginController.auth);

module.exports = router;
