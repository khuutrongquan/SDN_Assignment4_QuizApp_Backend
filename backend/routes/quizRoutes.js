const { verifyAdmin, verifyAuthor, verifyUser} = require('../middlewares/authenticate');
const express = require('express');
const router = express.Router();
const {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz
} = require('../controllers/quizController');

// GET all quizzes - Public access
router.get('/', getAllQuizzes);

// GET quiz by ID - Public access
router.get('/:quizId', getQuizById);

// POST create new quiz - Admin only
router.post('/', verifyUser, verifyAdmin, createQuiz);

// PUT update quiz - Admin only
router.put('/:quizId', verifyUser, verifyAdmin, updateQuiz);

// DELETE quiz - Admin only
router.delete('/:quizId', verifyUser, verifyAdmin, deleteQuiz);

module.exports = router