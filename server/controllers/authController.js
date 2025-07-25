const { registerValidation, loginValidation } = require('../validations/authValidation');
const authService = require('../services/authService');

exports.register = async (req, res, next) => {
  try {
    const { error } = registerValidation.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const userData = await authService.registerUser(req.body);
    res.status(201).json(userData);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { error } = loginValidation.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const userData = await authService.loginUser(req.body);
    res.json(userData);
  } catch (err) {
    next(err);
  }
};
