import { ApiError } from "../utils/ApiError.utils.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import jwt from "jsonwebtoken";
import { newUser } from "../models/account.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const rawHeader =
      (typeof req.header === "function" ? req.header("Authorization") : null) ||
      req.headers?.authorization ||
      req.headers?.Authorization;

    const token =
      req.cookies?.accessToken ||
      (typeof rawHeader === "string"
        ? rawHeader.replace(/^Bearer\s+/i, "").trim()
        : null);

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const secret =
      process.env.ACCESS_TOKEN_SECRET ||
      "test_access_secret_key_super_secret_12345678";

    const decodedToken = jwt.verify(token, secret);

    const user = await newUser
      .findById(decodedToken?._id)
      .select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export const verifyOwnerOrAdmin = (paramName = "id") => {
  return asyncHandler(async (req, _, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }
    const targetId = req.params[paramName];
    const isOwner = req.user._id.toString() === targetId?.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new ApiError(
        403,
        "Forbidden: You do not have permission to modify or delete this resource"
      );
    }
    next();
  });
};
