const express = require('express');
const router = express.Router();
const {
  askQuestion,
  summarizeContent,
  explainTopic,
  analyzeImage,
  generateMCQs,
  generateExamQuestions,
  generateNotes,
  analyzeAudio,
  saveStudyItem,
  getSavedStudyItems,
  deleteSavedStudyItem,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/ask', protect, askQuestion);
router.post('/summarize', protect, summarizeContent);
router.post('/explain', protect, explainTopic);
router.post('/analyze-image', protect, analyzeImage);
router.post('/generate-mcqs', protect, generateMCQs);
router.post('/generate-questions', protect, generateExamQuestions);
router.post('/generate-notes', protect, generateNotes);
router.post('/analyze-audio', protect, analyzeAudio);

// Saved items routes
router.post('/save', protect, saveStudyItem);
router.get('/saved', protect, getSavedStudyItems);
router.delete('/saved/:id', protect, deleteSavedStudyItem);

module.exports = router;
