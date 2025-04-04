// import statement
import jwt from "jsonwebtoken";
// generating token method
export const generateTokenAndSetCookie = (res, userId) => {
  // generating jwt token using jwt.sign() function
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // Setting cookie
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    seure: process.env.NODE_ENV !== "production",
  });
};
