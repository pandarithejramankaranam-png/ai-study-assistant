const mongoose = require('mongoose');

const savedStudyItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['summary', 'mcq', 'exam_questions', 'notes', 'explanation'],
      required: true,
    },
    content: {
      type: mongoose.Schema.Types.Mixed, // Stores Markdown string or JSON object (for quizzes)
      required: true,
    },
    materialIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material',
      },
    ],
    metadata: {
      score: Number,
      totalQuestions: Number,
      difficulty: String,
      topic: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SavedStudyItem', savedStudyItemSchema);
