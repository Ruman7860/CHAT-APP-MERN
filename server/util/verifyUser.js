import { errorHandler } from "../error/error.js";
import User from "../model/user.model.js";
import jwt from 'jsonwebtoken';

export const verifyUser = async (req, res, next) => {
  try {
    const access_token = req.cookies.access_token;
    console.log("Cookies:", req.cookies); // Debug cookies
    console.log("Access Token:", access_token); // Debug token

    if (!access_token) {
      return next(errorHandler(401, "Unauthorized - Token not provided"));
    }

    jwt.verify(access_token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error("JWT Verification Error:", err.message); // Debug verification errors
        return next(errorHandler(401, "Unauthorized - Invalid Token"));
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Error in verifyUser:", error.message);
    return next(errorHandler(500, "Internal Server Error"));
  }
};
