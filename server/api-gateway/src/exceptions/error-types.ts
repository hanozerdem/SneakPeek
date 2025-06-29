import { HttpStatus } from "@nestjs/common";
import { CustomError, HttpError } from "./custom-exceptions";

export const ErrorType = {
  /*---------- User Exceptions ----------*/
  REGISTER_FAILED: {
    status: HttpStatus.BAD_REQUEST,
    message: "User registration failed. Please check your details and try again.",
    type: HttpError,
  },
  LOGIN_FAILED: {
    status: HttpStatus.UNAUTHORIZED,
    message: "Login attempt failed. Invalid credentials provided.",
    type: HttpError,
  },
  UPDATE_FAILED: {
    status: HttpStatus.BAD_REQUEST,
    message: "User update failed. Please verify the input data.",
    type: HttpError,
  },
  DELETE_FAILED: {
    status: HttpStatus.BAD_REQUEST,
    message: "User deletion failed. The user may not exist.",
    type: HttpError,
  },
  GET_USER_BY_ID_FAILED: {
    status: HttpStatus.BAD_REQUEST,
    message: "There is an error occured during getting the user by giving id",
    type: HttpError,
  },

  /*---------- Product Exceptions ----------*/
  PRODUCT_FIND_FAILED: {
    status: HttpStatus.NOT_FOUND,
    message: "No product found for the given ID.",
    type: HttpError,
  },
  GET_PRODUCTS_FAILED: {
    status: HttpStatus.NOT_FOUND,
    message: "Failed to get all products",
    type: HttpError,
  },
  PRODUCT_UPDATE_FAILED: {
    status: HttpStatus.BAD_REQUEST,
    message: "Product update failed. Ensure valid data is provided.",
    type: HttpError,
  },
  PRODUCT_DELETE_FAILED: {
    status: HttpStatus.NOT_FOUND,
    message: "Product deletion failed. The product may not exist.",
    type: HttpError,
  },
  PRODUCT_CREATION_FAILED: {
    status: HttpStatus.BAD_REQUEST,
    message: "Failed to create the product. Please check input data.",
    type: HttpError,
  },

  /*---------- Review Exceptions ----------*/
  REVIEW_ADD_FAILED: {
    status: HttpStatus.BAD_REQUEST,
    message: "Failed to add a review. Please ensure valid product ID and rating.",
    type: HttpError,
  },
  REVIEW_GET_FAILED: {
    status: HttpStatus.NOT_FOUND,
    message: "No reviews found for the given product ID.",
    type: HttpError,
  },
  REVIEW_DELETE_FAILED: {
    status: HttpStatus.NOT_FOUND,
    message: "Review deletion failed. The review may not exist.",
    type: HttpError,
  },

  /*---------- Wishlist Exceptions ----------*/
  ADD_TO_WISHLIST_FAILED: {
    status: HttpStatus.BAD_REQUEST,
    message: "Failed to add product to wishlist. Please try again.",
    type: HttpError,
  },
  GET_WISHLIST_FAILED: {
    status: HttpStatus.BAD_REQUEST,
    message: "Failed to get products from wishlist. Please try again.",
    type: HttpError,
  },
  REMOVE_FROM_WISHLIST_FAILED: {
    status: HttpStatus.BAD_REQUEST,
    message: "Failed to remove product from wishlist. Please try again.",
    type: HttpError,
  },

  /*---------- Token Exceptions ----------*/
  NO_TOKEN_PROVIDED: {
    status: HttpStatus.UNAUTHORIZED,
    message: "Access denied. No authentication token provided.",
    type: HttpError,
  },
  TOKEN_EXPIRED: {
    status: HttpStatus.UNAUTHORIZED,
    message: "Session expired. Please refresh your authentication token.",
    type: HttpError,
  },
  INVALID_TOKEN: {
    status: HttpStatus.UNAUTHORIZED,
    message: "Authentication failed. Invalid token provided.",
    type: HttpError,
  },

  /*---------- Role Exceptions ----------*/
  PERMISSION_DENIED: {
    status: HttpStatus.FORBIDDEN,
    message: "Access denied. You do not have the required permissions.",
    type: HttpError,
  },

  /*---------- Order Exceptions ----------*/
  ORDER_CREATION_FAILED: {
    status: HttpStatus.BAD_REQUEST,
    message: "Order creation failed. Please verify the order details.",
    type: HttpError,
  },
  ORDER_UPDATE_FAILED: {
    status: HttpStatus.BAD_REQUEST,
    message: "Failed to update the order status. Please check the provided status.",
    type: HttpError,
  },
  ORDER_REFUND_FAILED: {
    status: HttpStatus.BAD_REQUEST,
    message: "Refund request failed. Please ensure the order and user are valid.",
    type: HttpError,
  },
  ORDER_HISTORY_FAILED: {
    status: HttpStatus.NOT_FOUND,
    message: "Could not retrieve the order history for the given user.",
    type: HttpError,
  },
  ORDER_STATUS_FAILED: {
    status: HttpStatus.NOT_FOUND,
    message: "Could not retrieve the status for the given order.",
    type: HttpError,
  },
  ORDER_FIND_FAILED: {
    status: HttpStatus.NOT_FOUND,
    message: "Order not found for the given ID.",
    type: HttpError,
  },

  /*---------- Default Exceptions ----------*/
  UNKNOWN: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: "An unexpected system error occurred. Please try again later.",
    type: CustomError,
  },
};
