const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Configuration with sanitized secure filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize original filename (remove special chars/spaces)
    const sanitizedExt = path.extname(file.originalname).toLowerCase();
    const cleanBaseName = path
      .basename(file.originalname, sanitizedExt)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 50);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${cleanBaseName}-${uniqueSuffix}${sanitizedExt}`);
  },
});

// Strict File Filter for PDF, JPG, JPEG, PNG, MP3, and WAV
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const isAllowedExt = ['.pdf', '.jpg', '.jpeg', '.png', '.mp3', '.wav'].includes(ext);

  if (allowedMimeTypes.includes(file.mimetype) || isAllowedExt) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only PDFs, Images (JPG, JPEG, PNG), and Audio files (MP3, WAV) are supported.'
      )
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max size
  },
});

module.exports = upload;
