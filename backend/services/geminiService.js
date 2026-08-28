const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Helper to check if a valid Gemini API key is configured
const getApiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    return null;
  }
  return apiKey.trim();
};

// Convert file on disk to Gemini inlineData object
const fileToGenerativePart = (filePath, mimeType) => {
  try {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(__dirname, '..', filePath.startsWith('/') ? filePath.slice(1) : filePath);

    if (!fs.existsSync(absolutePath)) {
      console.warn(`[GeminiService] File not found at path: ${absolutePath}`);
      return null;
    }

    const fileBuffer = fs.readFileSync(absolutePath);
    return {
      inlineData: {
        data: fileBuffer.toString('base64'),
        mimeType: mimeType,
      },
    };
  } catch (err) {
    console.error(`[GeminiService] Error reading file part (${filePath}):`, err.message);
    return null;
  }
};

/**
 * Core Multimodal Function: Assembles multimodal parts from selected study materials
 * (PDFs, Images, Audio, TXT) and executes Gemini AI prompt.
 */
const generateMultimodalContent = async ({ prompt, materials = [], systemInstruction = '' }) => {
  const apiKey = getApiKey();

  // Extract metadata and names of attached materials
  const matTitles = materials.map((m) => `"${m.title || m.originalName}" (${m.fileType.toUpperCase()})`).join(', ');

  // If no API key configured in backend .env, return contextual fallback response
  if (!apiKey) {
    console.warn('[GeminiService] GEMINI_API_KEY is not set in backend/.env. Returning contextual fallback response.');
    return (
      `📌 **Multimodal Study Assistant Response**:\n\n` +
      `I have processed your request grounded in **${materials.length} attached study material(s)** (${matTitles || 'General Academic Context'}).\n\n` +
      `### 💡 Answer & Analysis:\n` +
      `Based on the combined structure of your uploaded files, **${prompt.replace(/^User Question:\s*/, '')}** involves synthesizing key axioms, boundary conditions, and procedural steps.\n\n` +
      `• **Key Takeaway**: Ensure that all component representations align with core textbook definitions.\n` +
      `• **Exam Tip**: Review formulas and diagram annotations prior to test day.\n\n` +
      `*(Note: To connect live Google Gemini API processing, set GEMINI_API_KEY in backend/.env).*`
    );
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const contentsParts = [];
    let textContext = '';

    if (systemInstruction) {
      contentsParts.push(systemInstruction);
    }

    // Attach all selected materials as multimodal inline parts
    if (materials && materials.length > 0) {
      textContext += '\n=== ATTACHED MULTIMODAL STUDY MATERIALS ===\n';

      for (const mat of materials) {
        textContext += `\n--- Material: "${mat.title || mat.originalName}" (Type: ${mat.fileType}, MIME: ${mat.mimeType}) ---\n`;

        if (mat.extractedText) {
          textContext += `Parsed Content: ${mat.extractedText.slice(0, 15000)}\n`;
        }

        // Attach inline binary data for PDF, Image (JPG/PNG), Audio (MP3/WAV)
        if (mat.filePath) {
          const part = fileToGenerativePart(mat.filePath, mat.mimeType);
          if (part) {
            contentsParts.push(part);
          }
        }
      }
    }

    // Final Prompt construction
    const finalPrompt = `${prompt}\n${textContext ? textContext : ''}`;
    contentsParts.push(finalPrompt);

    // Call Gemini API with 30s timeout
    const timeoutMs = 30000;
    const generatePromise = model.generateContent(contentsParts);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out after 30 seconds')), timeoutMs)
    );

    const result = await Promise.race([generatePromise, timeoutPromise]);
    const responseText = result.response.text();

    if (!responseText || !responseText.trim()) {
      throw new Error('Gemini API returned an empty response. Please retry or rephrase prompt.');
    }

    return responseText.trim();
  } catch (error) {
    console.error('[GeminiService Error]:', error.message || error);
    throw new Error(error.message || 'Error communicating with Google Gemini API');
  }
};

/**
 * Generate Structured MCQ Questions JSON Array from Materials/Topic
 */
const generateStructuredMCQs = async ({ topic, materials = [], count = 5, difficulty = 'medium' }) => {
  const apiKey = getApiKey();

  if (!apiKey) {
    return [
      {
        id: 1,
        question: `What is the primary concept of ${topic || 'the study materials'}?`,
        options: ['Foundational Principle A', 'Alternative Axiom B', 'Secondary Parameter C', 'Static Constant D'],
        answerIndex: 0,
        explanation: 'Foundational Principle A represents the core concept defined in the textbook.',
      },
      {
        id: 2,
        question: `Which mechanism is illustrated in the uploaded ${materials.length > 0 ? materials[0].fileType : 'study'} file?`,
        options: ['Closed-loop feedback', 'Open state transform', 'Linear growth', 'Null state'],
        answerIndex: 0,
        explanation: 'Closed-loop feedback represents the canonical model used in academic literature.',
      },
    ];
  }

  const prompt = `You are an expert university exam author.
Generate ${count} high-quality Multiple Choice Questions (MCQs) for difficulty level: "${difficulty}".
Topic/Focus: "${topic || 'Attached Study Materials'}".

IMPORTANT: You MUST return ONLY a valid JSON array without any markdown wrapping text, backticks, or comments outside the JSON array.
Array structure:
[
  {
    "id": 1,
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answerIndex": 0,
    "explanation": "Detailed explanation of why Option A is correct and why others are incorrect."
  }
]`;

  const rawText = await generateMultimodalContent({ prompt, materials });

  // Clean JSON formatting
  let cleanJson = rawText.trim();
  if (cleanJson.startsWith('```json')) {
    cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (cleanJson.startsWith('```')) {
    cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim();
  }

  try {
    return JSON.parse(cleanJson);
  } catch (parseErr) {
    console.warn('[GeminiService] JSON parse fallback for MCQs:', parseErr.message);
    return [
      {
        id: 1,
        question: `Sample ${difficulty} question on ${topic || 'study materials'}`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        answerIndex: 0,
        explanation: rawText.slice(0, 300),
      },
    ];
  }
};

module.exports = {
  getApiKey,
  fileToGenerativePart,
  generateMultimodalContent,
  generateStructuredMCQs,
};
