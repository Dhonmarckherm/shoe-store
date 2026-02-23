const { body, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Registration validation rules
 */
const registerValidation = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ max: 100 })
    .withMessage('Full name cannot exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidationErrors,
];

/**
 * Login validation rules
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

/**
 * Face registration validation
 */
const faceRegistrationValidation = [
  body('faceDescriptor')
    .isArray()
    .withMessage('Face descriptor must be an array')
    .notEmpty()
    .withMessage('Face descriptor is required'),
  handleValidationErrors,
];

/**
 * Face login validation
 */
const faceLoginValidation = [
  body('faceDescriptor')
    .isArray()
    .withMessage('Face descriptor must be an array')
    .notEmpty()
    .withMessage('Face descriptor is required'),
  handleValidationErrors,
];

/**
 * Cart item validation
 */
const cartItemValidation = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('size')
    .notEmpty()
    .withMessage('Size is required'),
  handleValidationErrors,
];

/**
 * Update cart item validation
 */
const updateCartItemValidation = [
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  handleValidationErrors,
];

module.exports = {
  registerValidation,
  loginValidation,
  faceRegistrationValidation,
  faceLoginValidation,
  cartItemValidation,
  updateCartItemValidation,
  handleValidationErrors,
};
