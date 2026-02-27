const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwtUtils');

// GET all users - Admin only
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users,
      message: 'Users retrieved successfully'
    });
  } catch (error) {
    next({
      status: 500,
      message: 'Error retrieving users',
      error: error.message
    });
  }
};

// GET user by ID
const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password');

    if (!user) {
      return next({
        status: 404,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user,
      message: 'User retrieved successfully'
    });
  } catch (error) {
    next({
      status: 500,
      message: 'Error retrieving user',
      error: error.message
    });
  }
};

// REGISTER new user
const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username) {
      return next({
        status: 400,
        message: 'Username is required'
      });
    }

    if (!email) {
      return next({
        status: 400,
        message: 'Email is required'
      });
    }

    if (!password) {
      return next({
        status: 400,
        message: 'Password is required'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next({
        status: 409,
        message: 'Email already registered'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      admin: false
    });

    const savedUser = await newUser.save();

    // Generate token
    const token = generateToken(savedUser._id);
    if (!token) {
      return next({
        status: 500,
        message: 'Error generating token'
      });
    }

    res.status(201).json({
      success: true,
      data: {
        userId: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        admin: savedUser.admin
      },
      token,
      message: 'User registered successfully'
    });
  } catch (error) {
    next({
      status: 500,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// LOGIN user
const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username) {
      return next({
        status: 400,
        message: 'Username is required'
      });
    }

    if (!password) {
      return next({
        status: 400,
        message: 'Password is required'
      });
    }

    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      return next({
        status: 401,
        message: 'Invalid username or password'
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return next({
        status: 401,
        message: 'Invalid username or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        username: user.username,
        email: user.email,
        admin: user.admin
      }, 
      token,
      message: 'Login successful'
    });
  } catch (error) {
    next({
      status: 500,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// UPDATE user (own profile only or Admin can update any)
const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { username, email, password } = req.body;

    // Check if user is updating their own profile or is admin
    if (req.user._id.toString() !== userId && !req.user.admin) {
      return next({
        status: 403,
        message: 'You can only update your own profile'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return next({
        status: 404,
        message: 'User not found'
      });
    }

    // Update fields if provided
    if (username !== undefined) user.username = username;

    if (email !== undefined) {
      // Check if new email already exists
      const existingUser = await User.findOne({ 
        email: email,
        _id: { $ne: userId }
      });

      if (existingUser) {
        return next({
          status: 409,
          message: 'Email already registered'
        });
      }

      user.email = email;
    }

    if (password !== undefined) {
      user.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      data: {
        userId: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        admin: updatedUser.admin
      },
      message: 'User updated successfully'
    });
  } catch (error) {
    next({
      status: 500,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// DELETE user - Admin only
const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return next({
        status: 404,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next({
      status: 500,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  registerUser,
  loginUser,
  updateUser,
  deleteUser
};