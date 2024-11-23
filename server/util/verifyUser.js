import { errorHandler } from "../error/error.js";
import User from "../model/user.model.js";
import jwt from 'jsonwebtoken';

export const verifyUser = async (req, res, next) => {
  try {
    // Extract the access token from cookies
    const access_token = req.cookies.access_token;

    // Log the token for debugging purposes (remove in production)
    console.log("Access Token:", access_token);

    // Check if the token exists
    if (!access_token) {
      return next(errorHandler(401, "Unauthorized - Token not provided"));
    }

    // Verify the token
    jwt.verify(access_token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error("Token verification failed:", err.message);
        return next(errorHandler(401, "Unauthorized - Invalid Token"));
      }

      // Attach the decoded user information to the request
      req.user = user;
      next(); // Proceed to the next middleware or route handler
    });
  } catch (error) {
    console.error("Error in verifyUser middleware:", error.message);
    return next(errorHandler(500, "Internal Server Error"));
  }
};
