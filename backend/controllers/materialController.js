const Material = require('../models/Material');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');

// Helper to determine fileType ('pdf' | 'image' | 'audio')
const getFileType = (mimeType, originalName) => {
  const lowerName = originalName.toLowerCase();
  if (mimeType === 'application/pdf' || lowerName.endsWith('.pdf')) return 'pdf';
  if (
    mimeType.startsWith('image/') ||
    lowerName.endsWith('.jpg') ||
    lowerName.endsWith('.jpeg') ||
    lowerName.endsWith('.png')
  ) {
    return 'image';
  }
  if (
    mimeType.startsWith('audio/') ||
    lowerName.endsWith('.mp3') ||
    lowerName.endsWith('.wav')
  ) {
    return 'audio';
  }
  return 'pdf'; // default fallback
};

// @desc    Upload study material file (PDF, JPG, PNG, MP3, WAV)
// @route   POST /api/materials/upload
// @access  Private (JWT Protected)
const uploadMaterial = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No study material file provided' });
    }

    const { title, description, tags } = req.body;
    const file = req.file;
    const fileType = getFileType(file.mimetype, file.originalname);

    let extractedText = '';
    let processingStatus = 'processing';

    // Parse text if PDF
    if (fileType === 'pdf') {
      try {
        const dataBuffer = fs.readFileSync(file.path);
        const parsed = await pdfParse(dataBuffer);
        extractedText = parsed.text ? parsed.text.trim() : '';
        processingStatus = 'completed';
      } catch (pdfErr) {
        console.warn('PDF text parsing warning:', pdfErr.message);
        processingStatus = 'completed';
      }
    } else {
      processingStatus = 'completed';
    }

    // Parse tags
    let parsedTags = [];
    if (tags) {
      if (Array.isArray(tags)) parsedTags = tags;
      else if (typeof tags === 'string')
        parsedTags = tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
    }

    const material = await Material.create({
      userId: req.user._id,
      originalName: file.originalname,
      fileName: file.filename,
      filePath: `/uploads/${file.filename}`,
      fileType,
      mimeType: file.mimetype,
      fileSize: file.size,
      uploadDate: new Date(),
      processingStatus,
      title: title || file.originalname,
      description: description || '',
      extractedText,
      tags: parsedTags,
    });

    res.status(201).json(material);
  } catch (error) {
    console.error('Material upload error:', error);
    res.status(500).json({ message: 'Error uploading study material', error: error.message });
  }
};

// @desc    Get all materials for logged-in user only
// @route   GET /api/materials
// @access  Private (JWT Protected)
const getMaterials = async (req, res) => {
  try {
    const materials = await Material.find({ userId: req.user._id }).sort({ uploadDate: -1 });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching study materials', error: error.message });
  }
};

// @desc    Get single material by ID for logged-in user
// @route   GET /api/materials/:id
// @access  Private (JWT Protected)
const getMaterialById = async (req, res) => {
  try {
    const material = await Material.findOne({ _id: req.params.id, userId: req.user._id });
    if (!material) {
      return res.status(404).json({ message: 'Study material not found' });
    }
    res.json(material);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching material', error: error.message });
  }
};

// @desc    Delete material by ID for logged-in user only
// @route   DELETE /api/materials/:id
// @access  Private (JWT Protected)
const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findOne({ _id: req.params.id, userId: req.user._id });
    if (!material) {
      return res.status(404).json({ message: 'Study material not found or unauthorized' });
    }

    // Delete file from disk if it exists
    const fullPath = path.join(__dirname, '..', material.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    await material.deleteOne();
    res.json({ message: 'Material removed successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting material', error: error.message });
  }
};

module.exports = {
  uploadMaterial,
  getMaterials,
  getMaterialById,
  deleteMaterial,
};
