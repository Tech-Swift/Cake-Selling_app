const multer = require('multer');
const path = require('path');
const sharp = require('sharp');

// Set storage engine
const storage = multer.memoryStorage(); // Use memory storage for processing

// File filter (images only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Image processing middleware
const processImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const ext = path.extname(req.file.originalname).toLowerCase();
    const filename = Date.now() + '-' + req.file.fieldname + '.webp'; // Convert to WebP
    
    // Process image with sharp
    const processedImage = await sharp(req.file.buffer)
      .resize(800, 600, { // Resize to reasonable dimensions
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80 }) // Convert to WebP with 80% quality
      .toBuffer();

    // Save processed image
    const fs = require('fs').promises;
    await fs.writeFile(`uploads/${filename}`, processedImage);
    
    // Update file info
    req.file.filename = filename;
    req.file.path = `uploads/${filename}`;
    req.file.size = processedImage.length;
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { upload, processImage }; 