// user routes
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userscontroller");
const verifyToken = require("../middleware/authmiddleware");

router.post("/register", userController.addUser);
router.post("/login", userController.loginUser);
router.post("/changepassword", verifyToken, userController.changePassword);
router.put("/update", verifyToken, userController.updateUser);
router.get("/get", verifyToken, userController.getUser);
router.post("/sendemail", userController.sendOTP);
router.post("/verifyotp", userController.verifyOTP);
router.post("/resetpassword", userController.resetPassword);

module.exports = router;