const express = require("express");
const { route } = require("express/lib/application");
const router = express.Router();
const userController = require("../controllers/userController");

// Get
router.get("/users", userController.viewAllUsers);
router.get("/users/viewuser/:id", userController.viewSelectedUser);
router.get("/users/createuser", userController.formCreateUser);
router.get("/users/edituser/:id", userController.editUser);
router.get("/users/:id", userController.deleteUser);

// Post
router.post("/users", userController.findUser);
router.post("/users/edituser/:id", userController.updateUser);
router.post("/users/createuser", userController.createUser);

module.exports = router;
