const { verifyUser, verifyAuthor } = require('../middlewares/authenticate');
const express = require('express');
const router = express.Router();

const {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion
} = require('../controllers/questionController');

// Public routes
// GET all questions - Public access
router.get('/', getAllQuestions);

// GET question by ID - Public access
router.get('/:questionId', getQuestionById);

// Protected routes
// POST create new question - Authenticated user
router.post('/', verifyUser, createQuestion);

// PUT update question - Author only (verifyAuthor checks ownership)
router.put('/:questionId', verifyUser, verifyAuthor, updateQuestion);

// DELETE question - Author only (verifyAuthor checks ownership)
router.delete('/:questionId', verifyUser, verifyAuthor, deleteQuestion);

module.exports = router;