const Question = require('../models/Question');
const mongoose = require('mongoose');
// GET all questions - Public access
const getAllQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find()
      .populate('author', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: questions,
      message: 'Questions retrieved successfully'
    });
  } catch (error) {
    next({
      status: 500,
      message: 'Error retrieving questions',
      error: error.message
    });
  }
};

// GET question by ID - Public access
const getQuestionById = async (req, res, next) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findById(questionId)
      .populate('author', 'username email');

    if (!question) {
      return next({
        status: 404,
        message: 'Question not found'
      });
    }

    res.status(200).json({
      success: true,
      data: question,
      message: 'Question retrieved successfully'
    });
  } catch (error) {
    next({
      status: 500,
      message: 'Error retrieving question',
      error: error.message
    });
  }
};

// CREATE new question - Author (any authenticated user)
const createQuestion = async (req, res, next) => {
  try {
    const { text, options, keywords, correctAnswerIndex } = req.body;

    // Validate required fields
    if (!text) {
      return next({
        status: 400,
        message: 'Question text is required'
      });
    }

    if (!options || !Array.isArray(options) || options.length === 0) {
      return next({
        status: 400,
        message: 'Options array is required and must not be empty'
      });
    }

    if (correctAnswerIndex === undefined || correctAnswerIndex === null) {
      return next({
        status: 400,
        message: 'Correct answer index is required'
      });
    }

    if (correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
      return next({
        status: 400,
        message: 'Correct answer index must be within options range'
      });
    }

    const newQuestion = new Question({
      text,
      author: new mongoose.Types.ObjectId(req.user._id),
      options,
      keywords: keywords || [],
      correctAnswerIndex
    });

    const savedQuestion = await newQuestion.save();
    const populatedQuestion = await savedQuestion.populate('author', 'username email');

    res.status(201).json({
      success: true,
      data: populatedQuestion,
      message: 'Question created successfully'
    });
  } catch (error) {
    next({
      status: 500,
      message: 'Error creating question',
      error: error.message
    });
  }
};

// UPDATE question - Author only (verifyAuthor middleware required)
const updateQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { text, options, keywords, correctAnswerIndex } = req.body;

    const question = await Question.findById(questionId);

    if (!question) {
      return next({
        status: 404,
        message: 'Question not found'
      });
    }

    // Update fields if provided
    if (text !== undefined) question.text = text;

    if (options !== undefined) {
      if (!Array.isArray(options) || options.length === 0) {
        return next({
          status: 400,
          message: 'Options must be a non-empty array'
        });
      }
      question.options = options;
    }

    if (keywords !== undefined) {
      if (!Array.isArray(keywords)) {
        return next({
          status: 400,
          message: 'Keywords must be an array'
        });
      }
      question.keywords = keywords;
    }

    if (correctAnswerIndex !== undefined) {
      if (correctAnswerIndex < 0 || correctAnswerIndex >= question.options.length) {
        return next({
          status: 400,
          message: 'Correct answer index must be within options range'
        });
      }
      question.correctAnswerIndex = correctAnswerIndex;
    }

    const updatedQuestion = await question.save();
    const populatedQuestion = await updatedQuestion.populate('author', 'email');

    res.status(200).json({
      success: true,
      data: populatedQuestion,
      message: 'Question updated successfully'
    });
  } catch (error) {
    next({
      status: 500,
      message: 'Error updating question',
      error: error.message
    });
  }
};

// DELETE question - Author only (verifyAuthor middleware required)
const deleteQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findByIdAndDelete(questionId);

    if (!question) {
      return next({
        status: 404,
        message: 'Question not found'
      });
    }

    res.status(200).json({
      success: true,
      data: question,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    next({
      status: 500,
      message: 'Error deleting question',
      error: error.message
    });
  }
};

module.exports = {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion
};