import { body, param, query, validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.utils.js";

// Middleware runner to execute validation chains and throw ApiError if validation fails
export const validate = (validations) => {
  return async (req, res, next) => {
    try {
      for (let validation of validations) {
        const result = await validation.run(req);
        if (result.errors.length) break;
      }

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      const extractedErrors = errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      }));

      return next(
        new ApiError(
          422,
          extractedErrors[0]?.message || "Validation failed",
          extractedErrors
        )
      );
    } catch (err) {
      return next(err);
    }
  };
};

// Validation rules
export const signupValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address format")
    .normalizeEmail(),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address format")
    .normalizeEmail(),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required"),
];

export const videoPublishValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Video title is required")
    .isLength({ max: 150 })
    .withMessage("Title cannot exceed 150 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Video description is required")
    .isLength({ max: 5000 })
    .withMessage("Description cannot exceed 5000 characters"),
];

export const commentValidation = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Comment content is required")
    .isLength({ max: 2000 })
    .withMessage("Comment cannot exceed 2000 characters"),
];

export const mongoIdValidation = (paramName = "id") => [
  param(paramName)
    .trim()
    .isMongoId()
    .withMessage(`Invalid ${paramName} parameter format`),
];

export const feedbackValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Feedback title is required")
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Feedback description is required")
    .isLength({ max: 5000 })
    .withMessage("Description cannot exceed 5000 characters"),
];
