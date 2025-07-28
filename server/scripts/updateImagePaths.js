const mongoose = require('mongoose');
require('dotenv').config();

// Import your Cake model
const Cake = require('../models/Cake');

async function updateImagePaths() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI_PRODUCTION || process.env.MONGO_URI);
    console.log('Connected to database');

    // Get all cakes
    const cakes = await Cake.find({});
    console.log(`Found ${cakes.length} cakes to update`);

    let updatedCount = 0;

    for (const cake of cakes) {
      if (cake.image && !cake.image.includes('.webp')) {
        // Create WebP path
        const webpPath = cake.image.replace(/\.[^/.]+$/, '.webp');
        
        // Update the cake
        await Cake.findByIdAndUpdate(cake._id, { image: webpPath });
        console.log(`✅ Updated: ${cake.image} → ${webpPath}`);
        updatedCount++;
      }
    }

    console.log(`\n🎉 Updated ${updatedCount} cake images to use WebP format`);
    
  } catch (error) {
    console.error('Error updating image paths:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

updateImagePaths(); 