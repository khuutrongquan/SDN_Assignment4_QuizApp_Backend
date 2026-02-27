const Quiz = require('../models/Quiz');

// GET all quizzes
const getAllQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find()
      .populate('author', 'username email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: quizzes,
      message: 'Quizzes retrieved successfully'
    });
  } catch (error) {
    next({
      status: 500,
      message: 'Error retrieving quizzes',
      error: error.message
    });
  }
};

// GET quiz by ID
const getQuizById = async (req, res, next) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId)
      .populate('author', 'username email')
      .populate('questions');

    if (!quiz) {
      return next({
        status: 404,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      data: quiz,
      message: 'Quiz retrieved successfully'
    });
  } catch (error) {
    next({
      status: 500,
      message: 'Error retrieving quiz',
      error: error.message
    });
  }
};

// CREATE new quiz (Admin only)
const createQuiz = async (req, res, next) => {
  try {
    const { title, description, questions } = req.body;

    // Validate required fields
    if (!title) {
      return next({
        status: 400,
        message: 'Title is required'
      });
    }

    const newQuiz = new Quiz({
      title,
      description: description || '',
      author: req.user._id,
      questions: questions || []
    });

    const savedQuiz = await newQuiz.save();

    const populatedQuiz = await savedQuiz.populate('author', 'username email');

    res.status(201).json({
      success: true,
      data: populatedQuiz,
      message: 'Quiz created successfully'
    });
  } catch (error) {
    next({
      status: 500,
      message: 'Error creating quiz',
      error: error.message
    });
  }
};

// UPDATE quiz (Admin only)
const updateQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { title, description, questions } = req.body;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return next({
        status: 404,
        message: 'Quiz not found'
      });
    }

    // Update fields if provided
    if (title !== undefined) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (questions !== undefined) quiz.questions = questions;

    const updatedQuiz = await quiz.save();

    const populatedQuiz = await updatedQuiz.populate('author', 'username email');

    res.status(200).json({
      success: true,
      data: populatedQuiz,
      message: 'Quiz updated successfully'
    });
  } catch (error) {
    next({
      status: 500,
      message: 'Error updating quiz',
      error: error.message
    });
  }
};

// DELETE quiz (Admin only)
const deleteQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findByIdAndDelete(quizId);

    if (!quiz) {
      return next({
        status: 404,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      data: quiz,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    next({
      status: 500,
      message: 'Error deleting quiz',
      error: error.message
    });
  }
};

module.exports = {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz
};