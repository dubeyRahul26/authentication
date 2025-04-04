import express from "express";
import {
  signup,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

// Creating an express router
const router = express.Router();

// for verifying the auth of user each time a refresh occurs
router.get("/check-auth", verifyToken, checkAuth);

// defining the signup route
router.post("/signup", signup);

// defining the login route
router.post("/login", login);

// defining the logout route
router.post("/logout", logout);

// defining the verification email route
router.post("/verify-email", verifyEmail);

// defining the reset password routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
