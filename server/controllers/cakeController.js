const cakeService = require('../services/cakeService');
const { validateCake } = require('../validations/cakeValidation');

// Create a new cake
exports.createCake = async (req, res) => {
  // If an image was uploaded, set the image path
  let imagePath = '';
  if (req.file) {
    imagePath = `/uploads/${req.file.filename}`;
  }

  const { error } = validateCake({ ...req.body, image: imagePath });
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const cakeData = {
      ...req.body,
      image: imagePath,
      createdBy: req.user._id
    };
    const cake = await cakeService.createCake(cakeData);
    res.status(201).json(cake);
  } catch (err) {
    console.error('Create Cake Error:', err);
    res.status(500).json({ message: 'Server error while creating cake' });
  }
};

// Get all cakes
exports.getAllCakes = async (req, res) => {
  try {
    const cakes = await cakeService.getAllCakes();
    res.json(cakes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch cakes' });
  }
};

// Get single cake
exports.getCakeById = async (req, res) => {
  try {
    const cake = await cakeService.getCakeById(req.params.id);
    if (!cake) return res.status(404).json({ message: 'Cake not found' });
    res.json(cake);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cake' });
  }
};

// Get cakes created by the logged-in user
exports.getCakesByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const cakes = await cakeService.getCakesByUser(userId);
    res.json(cakes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user cakes' });
  }
};
// Update a cake
exports.updateCake = async (req, res) => {
  const cakeId = req.params.id;
  const userId = req.user._id;
  let updateData = { ...req.body };
  // Parse stock and isAvailable from string to correct types if present
  if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);
  if (updateData.isAvailable !== undefined) updateData.isAvailable = updateData.isAvailable === 'true' || updateData.isAvailable === true;
  // Handle image upload
  if (req.file) {
    updateData.image = `/uploads/${req.file.filename}`;
  }
  console.log('Update Cake Debug:', { cakeId, userId, updateData });
  try {
    const updated = await cakeService.updateCake(cakeId, updateData, userId);
    if (!updated) {
      console.log('Update Cake Debug: Not found or not owner');
      return res.status(404).json({ message: 'Cake not found or not authorized' });
    }
    res.json(updated);
  } catch (err) {
    console.error('Update Cake Error:', err);
    res.status(500).json({ message: 'Failed to update cake' });
  }
};

// Delete a cake
exports.deleteCake = async (req, res) => {
  try {
    const deleted = await cakeService.deleteCake(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Cake not found' });
    res.json({ message: 'Cake deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting cake' });
  }
};

//Get featured cakes

exports.getFeaturedCakes = async (req, res) => {
  try {
    const cakes = await cakeService.getFeaturedCakes();
    res.status(200).json({ success: true, data: cakes });
  } catch (error) {
    console.error('Featured cakes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch featured cakes', error });
  }
};
