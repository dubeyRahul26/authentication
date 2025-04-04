// import statements
import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import validator from "validator";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendSuccessEmail,
} from "../mailtrap/emails.js";

// Implementing the signup controller
export const signup = async (req, res) => {
  // first we would recieve the email-address , name and password from the frontend
  const { email, name, password } = req.body;

  try {
    // if any of the fields are misisng then simply return the error and handle it in the catch handler
    if (!email || !name || !password)
      throw new Error("All fields are required");

    // Validate email format
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    // if email already exists then return the message: email already exists
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists)
      return res
        .status(400)
        .json({ success: false, message: "Email already exists " });

    // Now since all fields are provided and email is also valid and unique so we can create a new user
    // but before that we hash the password for security purposes
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // generating verification code for authenticating email range : [100000 , 999999]
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Creating new User instance
    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
    });

    // Save the user instance created into the database
    await user.save();

    // generating jwt token and setting cookie
    generateTokenAndSetCookie(res, user._id);

    // Sending a verification email to the user
    await sendVerificationEmail(user.email, verificationToken);

    // Sending the response of success to the client
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: { ...user._doc, password: undefined },
    });

    // handling the error's
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// verification controller
export const verifyEmail = async (req, res) => {
  // extracting the token from the request body
  const { code } = req.body;

  // try-catch to handle asynchronous tasks
  try {
    // Finding a user in the DB with the recieved token from the client and it should also not be expired
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    // if such a user does not exist , return success as false with the below message
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }
    // if such a user exist then mark it as verified in DB and remove the verification token and it's expiration fields
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    // save the change in the DB
    await user.save();

    // sending a welcome email notification
    await sendWelcomeEmail(user.email, user.name);

    // Sending the response back to the client of success
    res.status(200).json({
      success: true,
      message: "Verified email",
      user: { ...user._doc, password: undefined },
    });
    // handling the error response
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login controller implementation
export const login = async (req, res) => {
  // getting the email and password sent from the client
  const { email, password } = req.body;

  // try-catch for async code
  try {
    // finding the user with the provided email
    const user = await User.findOne({ email });

    // if no such email exists send a 404 error message
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Invalid email " });

    // if user is found then compare the password provided with the one saved in the DB
    const isPasswordValid = await bcryptjs.compare(password, user.password);

    // if password is not valid then send a 404 error message
    if (!isPasswordValid)
      return res
        .status(404)
        .json({ success: false, message: "Invalid password" });

    // if the details a correct then just set the cookie
    generateTokenAndSetCookie(res, user._id);

    // set the last login value to the current date and time value
    user.lastLogin = new Date();

    // Save the changes in the DB
    await user.save();

    // send response back to the client of successful login
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: { ...user._doc, password: undefined },
    });

    // handle the error
  } catch (error) {
    console.log("Error in login : " + error.message);
    res.status(404).json({ success: false, message: error.message });
  }
};

// Logout controller implementation
export const logout = async (req, res) => {
  // just clear the cookie from user's browser
  res.clearCookie("jwt");
  // And send the response of successful logout
  res.status(200).json({ success: true, message: "Logged Out successfully" });
};

// forgot password controller implementation
export const forgotPassword = async (req, res) => {
  // get the email sent by the user
  const { email } = req.body;

  // try-catch for async code
  try {
    // find the user in the DB with the provided email
    const user = await User.findOne({ email });

    // if no such user email exists , just return 404 error message
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "No Such email id exists" });

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    // setting the reset related fields in the DB
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    // Saving the changes made in the DB
    await user.save();

    // Sending password reset email to the user
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );
    // sending a response of successful password email sending to the user's email
    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });

    // handling any error's
  } catch (error) {
    console.log("Error in forgot password : ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Reset password controller implementation
export const resetPassword = async (req, res) => {
  // recieving password reset token form the request parameters
  const { token } = req.params;
  // recieving newly created password from the user
  const { password } = req.body;
  // try-catch for async code
  try {
    // finding the user in the DB with the provided token by the user's request parameter and the one saved in the DB which is also not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    // if no such user exists simply return 404 error message
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Invalid or expired reset token" });

    // if user is found then firstly hash the newly provided password by the user
    const hashedPassword = await bcryptjs.hash(password, 10);

    // save the hashed password in DB
    user.password = hashedPassword;

    // remove the reset related fields as they are no longer required
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    // save the changes made in the DB permanently
    await user.save();

    // send a success email to the user that his/her password reset request had been processed successfully
    await sendSuccessEmail(user.email);

    // send the response of successful reset password
    return res.status(200).json({
      success: true,
      message: "Your password has been updated",
    });

    // handle error's
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// function to check authentication each time a referesh happens
export const checkAuth = async (req , res) =>{

  // try-catch for handling async code 
  try {

    // finding a user with the id taken from the local storage in the user's browser which was extracted previously in the verifyToken protect route/method
    const user = await User.findById(req.userId).select("-password") ;

    // if no such user exists then simply return 404 error
    if(!user) 
      return res.status(404).json({ success : false, message : "User not found " });

    // if user is found then return success true with the user details
    res.status(200).json({ success : true, data : user}) ;

    // handling error's
  } catch (error) {
    console.log("Error: " + error);
    res.status(400).json({ success : false, message : error.message });
  }
}