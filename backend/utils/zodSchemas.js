const { z } = require('zod');

// Registration Schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

// Login Schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// AI Question Request Schema
const aiAskSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty'),
  materialIds: z.array(z.string()).optional(),
  conversationId: z.string().optional().nullable(),
  customApiKey: z.string().optional(),
});

// AI Explain Topic Schema
const aiExplainSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  materialIds: z.array(z.string()).optional(),
  depth: z.enum(['simple', 'detailed', 'analogy']).optional().default('detailed'),
  conversationId: z.string().optional().nullable(),
  customApiKey: z.string().optional(),
});

// AI Summarize Schema
const aiSummarizeSchema = z.object({
  materialIds: z.array(z.string()).min(1, 'At least one study material must be selected'),
  length: z.enum(['short', 'medium', 'comprehensive']).optional().default('medium'),
  conversationId: z.string().optional().nullable(),
  customApiKey: z.string().optional(),
});

// AI MCQ Generation Schema
const aiMCQSchema = z.object({
  materialIds: z.array(z.string()).optional(),
  topic: z.string().optional(),
  count: z.number().int().min(1).max(20).optional().default(5),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
  conversationId: z.string().optional().nullable(),
  customApiKey: z.string().optional(),
});

// AI Important Questions Schema
const aiQuestionsSchema = z.object({
  materialIds: z.array(z.string()).optional(),
  topic: z.string().optional(),
  count: z.number().int().min(1).max(15).optional().default(5),
  conversationId: z.string().optional().nullable(),
  customApiKey: z.string().optional(),
});

// AI Study Notes Schema
const aiNotesSchema = z.object({
  materialIds: z.array(z.string()).optional(),
  topic: z.string().optional(),
  format: z.enum(['summary', 'flashcards', 'cheatsheet']).optional().default('summary'),
  conversationId: z.string().optional().nullable(),
  customApiKey: z.string().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  aiAskSchema,
  aiExplainSchema,
  aiSummarizeSchema,
  aiMCQSchema,
  aiQuestionsSchema,
  aiNotesSchema,
};
