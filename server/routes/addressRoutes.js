const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { protect } = require('../middleware/authMiddleware');
const { validateAddress } = require('../validations/addressValidation');
const { validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post('/', protect, validateAddress, handleValidation, addressController.addAddress);
router.get('/', protect, addressController.getAddresses);
router.put('/:addressId', protect, validateAddress, handleValidation, addressController.updateAddress);
router.delete('/:addressId', protect, addressController.deleteAddress);

module.exports = router;