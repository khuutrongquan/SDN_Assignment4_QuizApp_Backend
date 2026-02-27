const { verifyAdmin, verifyUser} = require('../middlewares/authenticate');
const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  registerUser,
  loginUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

// Public routes
// POST register new user
router.post('/register', registerUser);

// POST login user
router.post('/login', loginUser);

// GET user by ID - Public access
router.get('/:userId', getUserById);

// Protected routes
// GET all users (Admin only)
router.get('/', verifyUser, verifyAdmin, getAllUsers);

// PUT update user (own profile or Admin)
router.put('/:userId', verifyUser, updateUser);

// DELETE user (Admin only)
router.delete('/:userId', verifyUser, verifyAdmin, deleteUser);

module.exports = router;