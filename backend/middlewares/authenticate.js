const Question = require('../models/Question');
const User = require('../models/User');
const { verifyToken } = require('../utils/jwtUtils');

// Verify User Token
const verifyUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
        return next({
            status: 401,
            message: 'No token provided'
        });
        }

        const decoded = await verifyToken(token);
        
        const user = await User.findById(decoded.userId);
        if (!user) {
        return next({
            status: 404,
            message: 'User not found'
        });
        }

        req.user = user;
        next();
    } catch (error) {
        next({
        status: 401,
        message: 'Invalid or expired token'
        });
    }
};

// Verify Admin Privileges
const verifyAdmin = (req, res, next) => {
  try {
    // Check if req.user exists (set by verifyUser middleware)
    if (!req.user) {
      return next({
        status: 401,
        message: 'User not authenticated'
      });
    }

    // Check if user has admin privileges
    if (req.user.admin === true) {
      next();
    } else {
      next({
        status: 403,
        message: 'You are not authorized to perform this operation!'
      });
    }
  } catch (error) {
    next({
      status: 500,
      message: 'Error verifying admin privileges'
    });
  }
};

const verifyAuthor = async (req, res, next) => {
  try {
    if (!req.user) {
      return next({
        status: 401,
        message: 'User not authenticated'
      });
    }

    const questionId = req.params.questionId;
    const question = await Question.findById(questionId);

    if (!question) {
      return next({
        status: 404,
        message: 'Question not found'
      });
    }

    if (!question.author.equals(req.user._id)) {
      return next({
        status: 403,
        message: 'You are not the author of this question'
      });
    }

    req.question = question; 
    next();

  } catch (error) {
    next({
      status: 500,
      message: 'Error verifying author'
    });
  }
};

module.exports = {verifyUser, verifyAuthor, verifyAdmin};
