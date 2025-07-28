const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function optimizeImages() {
  const uploadsDir = path.join(__dirname, '../uploads');
  
  try {
    // Read all files in uploads directory
    const files = await fs.readdir(uploadsDir);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|bmp)$/i.test(file)
    );

    console.log(`Found ${imageFiles.length} images to optimize...`);

    for (const file of imageFiles) {
      const inputPath = path.join(uploadsDir, file);
      const outputPath = path.join(uploadsDir, file.replace(/\.[^/.]+$/, '.webp'));
      
      try {
        // Get original file size
        const stats = await fs.stat(inputPath);
        const originalSize = stats.size;
        
        // Optimize image
        await sharp(inputPath)
          .resize(800, 600, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 80 })
          .toFile(outputPath);
        
        // Get optimized file size
        const optimizedStats = await fs.stat(outputPath);
        const optimizedSize = optimizedStats.size;
        
        // Calculate savings
        const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
        
        console.log(`✅ ${file}: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(optimizedSize / 1024 / 1024).toFixed(2)}MB (${savings}% smaller)`);
        
        // Remove original file (optional - uncomment if you want to replace)
        // await fs.unlink(inputPath);
        
      } catch (error) {
        console.error(`❌ Error optimizing ${file}:`, error.message);
      }
    }
    
    console.log('\n🎉 Image optimization complete!');
    
  } catch (error) {
    console.error('Error reading uploads directory:', error);
  }
}

optimizeImages(); 