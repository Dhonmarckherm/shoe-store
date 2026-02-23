const User = require('../models/User');
const Cart = require('../models/Cart');
const { generateToken } = require('../middleware/auth');
const { encryptFaceData, decryptFaceData, compareFaces } = require('../utils/encryption');
const { sendPasswordChangeNotification } = require('../utils/emailService');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          token: generateToken(user._id),
        },
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

/**
 * @desc    Login user with email and password
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        hasFaceRegistered: !!user.faceDescriptor,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

/**
 * @desc    Register face for user
 * @route   POST /api/auth/face-register
 * @access  Private
 */
const registerFace = async (req, res) => {
  try {
    const { faceDescriptor } = req.body;
    const userId = req.user._id;

    // Validate face descriptor
    if (!Array.isArray(faceDescriptor) || faceDescriptor.length !== 128) {
      return res.status(400).json({
        success: false,
        message: 'Invalid face descriptor. Expected array of 128 floats.',
      });
    }

    // Encrypt face descriptor
    const encryptedFaceData = encryptFaceData(faceDescriptor);

    // Update user with face descriptor
    const user = await User.findByIdAndUpdate(
      userId,
      { faceDescriptor: encryptedFaceData },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'Face registered successfully',
      data: {
        hasFaceRegistered: true,
      },
    });
  } catch (error) {
    console.error('Face registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during face registration',
      error: error.message,
    });
  }
};

/**
 * @desc    Login with face recognition
 * @route   POST /api/auth/face-login
 * @access  Public
 */
const faceLogin = async (req, res) => {
  try {
    const { faceDescriptor } = req.body;

    // Validate face descriptor
    if (!Array.isArray(faceDescriptor) || faceDescriptor.length !== 128) {
      return res.status(400).json({
        success: false,
        message: 'Invalid face descriptor. Expected array of 128 floats.',
      });
    }

    // Get all users with face descriptors
    const users = await User.find({
      faceDescriptor: { $ne: null },
    });

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'No users with face recognition found. Please register with face recognition first.',
      });
    }

    // Compare face with all registered faces
    let matchedUser = null;
    let minDistance = Infinity;
    const threshold = 0.6; // Euclidean distance threshold

    for (const user of users) {
      try {
        const storedDescriptor = decryptFaceData(user.faceDescriptor);
        const distance = calculateEuclideanDistance(faceDescriptor, storedDescriptor);

        if (distance < minDistance) {
          minDistance = distance;
        }

        if (distance < threshold) {
          matchedUser = user;
          break;
        }
      } catch (err) {
        console.error('Error comparing face for user:', user._id, err);
        continue;
      }
    }

    if (!matchedUser) {
      // Check if there are any users without face registration
      const usersWithoutFace = await User.findOne({
        faceDescriptor: { $eq: null },
      });

      if (usersWithoutFace) {
        return res.status(401).json({
          success: false,
          message: 'Face not recognized. Some users have not registered their face. Please login with email/password or register your face first.',
          usersWithoutFaceCount: await User.countDocuments({ faceDescriptor: { $eq: null } }),
        });
      }

      return res.status(401).json({
        success: false,
        message: `Face not recognized. Please ensure your face is registered. Closest match distance: ${minDistance.toFixed(3)} (threshold: ${threshold})`,
      });
    }

    res.json({
      success: true,
      message: 'Face login successful',
      data: {
        _id: matchedUser._id,
        fullName: matchedUser.fullName,
        email: matchedUser.email,
        token: generateToken(matchedUser._id),
      },
    });
  } catch (error) {
    console.error('Face login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during face login',
      error: error.message,
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        hasFaceRegistered: !!user.faceDescriptor,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * Calculate Euclidean distance between two face descriptors
 */
const calculateEuclideanDistance = (desc1, desc2) => {
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    sum += Math.pow(desc1[i] - desc2[i], 2);
  }
  return Math.sqrt(sum);
};

/**
 * @desc    Delete user account
 * @route   DELETE /api/auth/profile
 * @access  Private
 */
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete user's cart
    await Cart.findOneAndDelete({ user: req.user._id });

    // Delete user
    await User.findByIdAndDelete(req.user._id);

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during account deletion',
      error: error.message,
    });
  }
};

/**
 * @desc    Change user password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    // Send email notification
    if (user.notificationSettings?.emailOnPasswordChange !== false) {
      try {
        await sendPasswordChangeNotification(
          user.email,
          user.fullName,
          user.passwordChangedAt
        );
      } catch (emailError) {
        console.error('Failed to send password change email:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.json({
      success: true,
      message: 'Password changed successfully. A confirmation email has been sent.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change',
      error: error.message,
    });
  }
};

/**
 * @desc    Become a seller
 * @route   POST /api/auth/become-seller
 * @access  Private
 */
const becomeSeller = async (req, res) => {
  try {
    const { storeName, description, phone } = req.body;

    if (!storeName || storeName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Store name is required',
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if already seller (handle undefined case)
    if (user.isSeller === true) {
      return res.status(400).json({
        success: false,
        message: 'You are already a seller',
      });
    }

    // Update user to become seller using findByIdAndUpdate to avoid validation issues
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          isSeller: true,
          role: 'seller',
          sellerInfo: {
            storeName: storeName.trim(),
            description: description ? description.trim() : '',
            phone: phone ? phone.trim() : '',
            verified: false,
          },
        },
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'You are now a seller! Your store is pending verification.',
      data: {
        isSeller: updatedUser.isSeller,
        sellerInfo: updatedUser.sellerInfo,
      },
    });
  } catch (error) {
    console.error('Become seller error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
      error: error.message,
    });
  }
};

/**
 * @desc    Update notification settings
 * @route   PUT /api/auth/notification-settings
 * @access  Private
 */
const updateNotificationSettings = async (req, res) => {
  try {
    const { emailOnPasswordChange } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.notificationSettings = {
      ...user.notificationSettings,
      emailOnPasswordChange,
    };

    await user.save();

    res.json({
      success: true,
      message: 'Notification settings updated',
      data: user.notificationSettings,
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  registerFace,
  faceLogin,
  getProfile,
  deleteAccount,
  changePassword,
  becomeSeller,
  updateNotificationSettings,
};
