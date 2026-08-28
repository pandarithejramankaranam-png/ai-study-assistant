const { generateMultimodalContent, generateStructuredMCQs } = require('../services/geminiService');
const Material = require('../models/Material');
const SavedStudyItem = require('../models/SavedStudyItem');
const Conversation = require('../models/Conversation');
const {
  aiAskSchema,
  aiExplainSchema,
  aiSummarizeSchema,
  aiMCQSchema,
  aiQuestionsSchema,
  aiNotesSchema,
} = require('../utils/zodSchemas');

// Helper to fetch user's selected study materials from DB
const fetchMaterialsForUser = async (materialIds, userId) => {
  if (!materialIds || materialIds.length === 0) return [];
  return await Material.find({ _id: { $in: materialIds }, userId: userId });
};

// Helper to record Q&A message in MongoDB Conversation history
const recordInConversationHistory = async (userId, conversationId, userMessage, aiResponse, toolUsed = '') => {
  try {
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, user: userId });
    }

    if (!conversation) {
      conversation = await Conversation.create({
        user: userId,
        title: userMessage.slice(0, 35) + (userMessage.length > 35 ? '...' : ''),
        messages: [],
      });
    }

    conversation.messages.push({
      sender: 'user',
      text: userMessage,
      toolUsed,
      timestamp: new Date(),
    });

    conversation.messages.push({
      sender: 'ai',
      text: aiResponse,
      toolUsed,
      timestamp: new Date(),
    });

    await conversation.save();
    return conversation;
  } catch (err) {
    console.warn('[AI Controller] Error saving conversation history:', err.message);
    return null;
  }
};

// @desc    1. Ask AI about uploaded PDF(s) or multiple materials
// @route   POST /api/ai/ask
// @access  Private
const askQuestion = async (req, res) => {
  try {
    const validation = aiAskSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error.errors[0].message });
    }

    const { question, materialIds, conversationId } = req.body;
    const materials = await fetchMaterialsForUser(materialIds, req.user._id);

    const systemInstruction = `You are StudyLens AI, an expert, encouraging, and articulate multimodal study assistant for college students.
Answer the user's question clearly, accurately, and comprehensively based on all attached study materials (PDFs, handwritten image notes, audio recordings, text).
Format math, formulas, code, key points, and definitions using clean Markdown.`;

    const answer = await generateMultimodalContent({
      prompt: `User Question: ${question}`,
      materials,
      systemInstruction,
    });

    const conversation = await recordInConversationHistory(req.user._id, conversationId, question, answer, 'ask');

    res.json({
      question,
      answer,
      conversationId: conversation ? conversation._id : null,
      materialIds: materialIds || [],
    });
  } catch (error) {
    console.error('Ask AI error:', error);
    res.status(500).json({ message: error.message || 'Error executing Gemini API ask question' });
  }
};

// @desc    2. Summarize PDF / Materials
// @route   POST /api/ai/summarize
// @access  Private
const summarizeContent = async (req, res) => {
  try {
    const validation = aiSummarizeSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error.errors[0].message });
    }

    const { materialIds, length, conversationId } = req.body;
    const materials = await fetchMaterialsForUser(materialIds, req.user._id);

    if (materials.length === 0) {
      return res.status(400).json({ message: 'Please select at least one study material to generate a summary.' });
    }

    const prompt = `Provide a ${length || 'medium'} executive summary of the attached study materials.
Include:
- 📌 **Executive Summary**: Core theme and objective.
- 🔑 **Key Takeaways & Concepts**: Essential bullet points.
- 💡 **Terminology & Definitions**: Glossary of key terms.
- 📝 **Exam Review Pointers**: High-yield points to memorize.`;

    const summaryText = await generateMultimodalContent({ prompt, materials });
    const userPrompt = `Summarize selected materials (${materials.map((m) => m.title).join(', ')})`;

    const conversation = await recordInConversationHistory(req.user._id, conversationId, userPrompt, summaryText, 'summarize');

    res.json({
      title: `Summary of ${materials.map((m) => m.title).join(', ')}`,
      summary: summaryText,
      conversationId: conversation ? conversation._id : null,
      materialIds,
    });
  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({ message: error.message || 'Error generating summary' });
  }
};

// @desc    3. Explain a Topic with Analogies / Technical Breakdown
// @route   POST /api/ai/explain
// @access  Private
const explainTopic = async (req, res) => {
  try {
    const validation = aiExplainSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error.errors[0].message });
    }

    const { topic, materialIds, depth, conversationId } = req.body;
    const materials = await fetchMaterialsForUser(materialIds, req.user._id);

    const prompt = `Explain the topic: "${topic}" in depth for a college student.
Depth/Style: ${depth || 'detailed'} (simple breakdown, detailed technical explanation, or intuitive analogies).

Structure:
1. **Core Concept Overview**: High-level explanation in 2-3 simple sentences.
2. **Detailed Breakdown**: Step-by-step logic, formulas, or mechanism.
3. **Real-World Analogy**: Relatable comparison for easy retention.
4. **Common Misconceptions & Exam Tips**: Key traps to avoid in tests.`;

    const explanationText = await generateMultimodalContent({ prompt, materials });
    const userPrompt = `Explain topic: ${topic} (${depth} mode)`;

    const conversation = await recordInConversationHistory(req.user._id, conversationId, userPrompt, explanationText, 'explain');

    res.json({
      topic,
      explanation: explanationText,
      depth,
      conversationId: conversation ? conversation._id : null,
    });
  } catch (error) {
    console.error('Explain Topic error:', error);
    res.status(500).json({ message: error.message || 'Error explaining topic' });
  }
};

// @desc    4. Analyze Image / Handwritten Note
// @route   POST /api/ai/analyze-image
// @access  Private
const analyzeImage = async (req, res) => {
  try {
    const { materialIds, conversationId } = req.body;
    const materials = await fetchMaterialsForUser(materialIds, req.user._id);

    const imageMaterials = materials.filter((m) => m.fileType === 'image');
    if (imageMaterials.length === 0) {
      return res.status(400).json({ message: 'Please select at least one uploaded image/handwritten note to analyze.' });
    }

    const prompt = `Analyze the attached handwritten note / study image(s).
Include:
1. **OCR / Extracted Text**: Transcribe all readable handwritten text, equations, and diagrams.
2. **Diagram / Visual Breakdown**: Explain what the diagram or graph illustrates.
3. **Core Concept Explanation**: Provide a step-by-step academic explanation of the concepts shown in the image.
4. **Exam Relevance**: Key formulas or points shown that are likely to appear on exams.`;

    const analysisText = await generateMultimodalContent({ prompt, materials: imageMaterials });
    const userPrompt = `Analyze image / handwritten note (${imageMaterials.map((m) => m.title).join(', ')})`;

    const conversation = await recordInConversationHistory(req.user._id, conversationId, userPrompt, analysisText, 'analyze_image');

    res.json({
      title: `Image Analysis of ${imageMaterials.map((m) => m.title).join(', ')}`,
      analysis: analysisText,
      conversationId: conversation ? conversation._id : null,
    });
  } catch (error) {
    console.error('Analyze Image error:', error);
    res.status(500).json({ message: error.message || 'Error analyzing image' });
  }
};

// @desc    5. Generate MCQs (Interactive Quiz)
// @route   POST /api/ai/generate-mcqs
// @access  Private
const generateMCQs = async (req, res) => {
  try {
    const validation = aiMCQSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error.errors[0].message });
    }

    const { materialIds, topic, count, difficulty, conversationId } = req.body;
    const materials = await fetchMaterialsForUser(materialIds, req.user._id);

    const mcqs = await generateStructuredMCQs({
      topic: topic || (materials.length > 0 ? materials.map((m) => m.title).join(', ') : 'Study Materials'),
      materials,
      count: Number(count) || 5,
      difficulty: difficulty || 'medium',
    });

    const userPrompt = `Generate ${count} ${difficulty} MCQs for ${topic || 'study materials'}`;
    const aiTextSummary = `🎯 Generated ${mcqs.length} MCQ Questions for "${topic || 'Study Materials'}".`;

    const conversation = await recordInConversationHistory(req.user._id, conversationId, userPrompt, aiTextSummary, 'mcq');

    res.json({
      topic: topic || 'Study Materials Quiz',
      difficulty: difficulty || 'medium',
      mcqs,
      conversationId: conversation ? conversation._id : null,
    });
  } catch (error) {
    console.error('Generate MCQs error:', error);
    res.status(500).json({ message: error.message || 'Error generating MCQs' });
  }
};

// @desc    6. Generate Important Exam Questions
// @route   POST /api/ai/generate-questions
// @access  Private
const generateExamQuestions = async (req, res) => {
  try {
    const validation = aiQuestionsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error.errors[0].message });
    }

    const { materialIds, topic, count, conversationId } = req.body;
    const materials = await fetchMaterialsForUser(materialIds, req.user._id);

    const prompt = `Generate ${count || 5} probable, high-yield university exam questions for topic: "${topic || 'Attached Study Materials'}".

Categorize as:
1. **Short Answer Questions (2-5 Marks)** with model solution outlines.
2. **Long Analytical Questions (10-15 Marks)** with step-by-step model solutions.
3. **Key Marks Distribution & Scoring Keywords**: Keywords examiners look for when grading.`;

    const questionsContent = await generateMultimodalContent({ prompt, materials });
    const userPrompt = `Predict ${count || 5} important exam questions for ${topic || 'study materials'}`;

    const conversation = await recordInConversationHistory(req.user._id, conversationId, userPrompt, questionsContent, 'exam');

    res.json({
      topic: topic || 'Important Exam Questions',
      questionsContent,
      conversationId: conversation ? conversation._id : null,
    });
  } catch (error) {
    console.error('Generate Exam Questions error:', error);
    res.status(500).json({ message: error.message || 'Error generating exam questions' });
  }
};

// @desc    7. Generate Study Notes / Flashcards
// @route   POST /api/ai/generate-notes
// @access  Private
const generateNotes = async (req, res) => {
  try {
    const validation = aiNotesSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error.errors[0].message });
    }

    const { materialIds, topic, format, conversationId } = req.body;
    const materials = await fetchMaterialsForUser(materialIds, req.user._id);

    let prompt = '';
    if (format === 'flashcards') {
      prompt = `Generate 10 digital revision flashcards for: "${topic || 'Study Materials'}".
Return strictly a valid JSON array of objects with front and back keys:
[
  { "front": "Concept / Question", "back": "Clear concise answer / definition" }
]`;
    } else if (format === 'cheatsheet') {
      prompt = `Create a 1-page compact exam cheat sheet for "${topic || 'Study Materials'}".
Include key formulas, definitions, code/syntax snippets, and quick memory shortcuts in Markdown.`;
    } else {
      prompt = `Create comprehensive, beautifully organized revision study notes for "${topic || 'Study Materials'}".
Use clean headings, bullet points, callout blocks, and formula boxes.`;
    }

    let notesText = await generateMultimodalContent({ prompt, materials });
    let finalNotesOutput = notesText;

    if (format === 'flashcards') {
      if (notesText.startsWith('```json')) notesText = notesText.replace(/^```json/, '').replace(/```$/, '').trim();
      else if (notesText.startsWith('```')) notesText = notesText.replace(/^```/, '').replace(/```$/, '').trim();
      try {
        finalNotesOutput = JSON.parse(notesText);
      } catch (e) {
        finalNotesOutput = notesText;
      }
    }

    const userPrompt = `Generate study notes (${format}) for ${topic || 'study materials'}`;
    const aiTextSummary = typeof finalNotesOutput === 'string' ? finalNotesOutput : `⚡ Generated ${finalNotesOutput.length} Flashcard cards.`;

    const conversation = await recordInConversationHistory(req.user._id, conversationId, userPrompt, aiTextSummary, 'notes');

    res.json({
      topic: topic || 'Generated Notes',
      format,
      notes: finalNotesOutput,
      conversationId: conversation ? conversation._id : null,
    });
  } catch (error) {
    console.error('Generate Notes error:', error);
    res.status(500).json({ message: error.message || 'Error generating study notes' });
  }
};

// @desc    8. Analyze Audio / Lecture Content
// @route   POST /api/ai/analyze-audio
// @access  Private
const analyzeAudio = async (req, res) => {
  try {
    const { materialIds, conversationId } = req.body;
    const materials = await fetchMaterialsForUser(materialIds, req.user._id);

    const audioMaterials = materials.filter((m) => m.fileType === 'audio');
    if (audioMaterials.length === 0) {
      return res.status(400).json({ message: 'Please select at least one uploaded voice lecture/audio recording.' });
    }

    const prompt = `Analyze the attached audio recording / voice lecture content.
Include:
1. **Lecture Transcript Summary**: Core points discussed in the voice recording.
2. **Key Concepts Explained**: Technical topics covered by the lecturer.
3. **Important Announcements / Exam Hints**: Any mentioned test deadlines, assignment tips, or emphasized concepts.`;

    const analysisText = await generateMultimodalContent({ prompt, materials: audioMaterials });
    const userPrompt = `Analyze voice lecture audio (${audioMaterials.map((m) => m.title).join(', ')})`;

    const conversation = await recordInConversationHistory(req.user._id, conversationId, userPrompt, analysisText, 'analyze_audio');

    res.json({
      title: `Audio Lecture Analysis of ${audioMaterials.map((m) => m.title).join(', ')}`,
      analysis: analysisText,
      conversationId: conversation ? conversation._id : null,
    });
  } catch (error) {
    console.error('Analyze Audio error:', error);
    res.status(500).json({ message: error.message || 'Error analyzing audio recording' });
  }
};

// @desc    Save generated study item to MongoDB user profile
// @route   POST /api/ai/save
// @access  Private
const saveStudyItem = async (req, res) => {
  try {
    const { title, type, content, materialIds, metadata } = req.body;

    if (!title || !type || !content) {
      return res.status(400).json({ message: 'Title, type, and content are required' });
    }

    const savedItem = await SavedStudyItem.create({
      user: req.user._id,
      title,
      type,
      content,
      materialIds: materialIds || [],
      metadata: metadata || {},
    });

    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: 'Error saving study item', error: error.message });
  }
};

// @desc    Get user's saved study items
// @route   GET /api/ai/saved
// @access  Private
const getSavedStudyItems = async (req, res) => {
  try {
    const items = await SavedStudyItem.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching saved items', error: error.message });
  }
};

// @desc    Delete saved study item
// @route   DELETE /api/ai/saved/:id
// @access  Private
const deleteSavedStudyItem = async (req, res) => {
  try {
    const item = await SavedStudyItem.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!item) {
      return res.status(404).json({ message: 'Saved item not found' });
    }
    res.json({ message: 'Item deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting saved item', error: error.message });
  }
};

module.exports = {
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
};
