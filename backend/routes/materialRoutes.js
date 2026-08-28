const express = require('express');
const router = express.Router();
const { uploadMaterial, getMaterials, getMaterialById, deleteMaterial } = require('../controllers/materialController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', protect, upload.single('file'), uploadMaterial);
router.get('/', protect, getMaterials);
router.get('/:id', protect, getMaterialById);
router.delete('/:id', protect, deleteMaterial);

module.exports = router;
