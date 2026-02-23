const express = require('express');
const router = express.Router();
const {
  register,
  login,
  registerFace,
  faceLogin,
  getProfile,
  deleteAccount,
  changePassword,
  becomeSeller,
  updateNotificationSettings,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
  faceRegistrationValidation,
  faceLoginValidation,
} = require('../middleware/validation');

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/face-login', faceLoginValidation, faceLogin);

// Protected routes
router.get('/profile', protect, getProfile);
router.delete('/profile', protect, deleteAccount);
router.put('/change-password', protect, changePassword);
router.post('/become-seller', protect, becomeSeller);
router.put('/notification-settings', protect, updateNotificationSettings);
router.post('/face-register', protect, faceRegistrationValidation, registerFace);

module.exports = router;
