const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const { signToken, successResponse, errorResponse, validateEmail } = require('../utils/helpers');

const AuthController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return errorResponse(res, 'Email and password are required.', 400);
      }

      if (!validateEmail(email)) {
        return errorResponse(res, 'Invalid email format.', 400);
      }

      const user = UserModel.findByEmail(email);
      if (!user) {
        return errorResponse(res, 'Invalid email or password credentials.', 401);
      }

      const isMatch = bcrypt.compareSync(password, user.password_hash);
      if (!isMatch) {
        return errorResponse(res, 'Invalid email or password credentials.', 401);
      }

      const token = signToken({ id: user.id, email: user.email, role: user.role });

      return successResponse(res, {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }, 'Login successful');
    } catch (err) {
      console.error('[AuthController.login]', err);
      return errorResponse(res, 'Internal server error during authentication.', 500);
    }
  },

  async getMe(req, res) {
    return successResponse(res, {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.created_at
      }
    }, 'Current user session verified');
  },

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return errorResponse(res, 'Current password and new password are required.', 400);
      }

      if (newPassword.length < 6) {
        return errorResponse(res, 'New password must be at least 6 characters.', 400);
      }

      const userWithHash = UserModel.findByEmail(req.user.email);
      const isMatch = bcrypt.compareSync(currentPassword, userWithHash.password_hash);
      if (!isMatch) {
        return errorResponse(res, 'Current password is incorrect.', 400);
      }

      const salt = bcrypt.genSaltSync(10);
      const newHash = bcrypt.hashSync(newPassword, salt);
      UserModel.updatePassword(req.user.id, newHash);

      return successResponse(res, null, 'Password updated successfully');
    } catch (err) {
      console.error('[AuthController.changePassword]', err);
      return errorResponse(res, 'Failed to update password.', 500);
    }
  },

  async updateProfile(req, res) {
    try {
      const { name, email } = req.body;
      if (!name || !email) {
        return errorResponse(res, 'Name and email are required.', 400);
      }

      if (!validateEmail(email)) {
        return errorResponse(res, 'Invalid email format.', 400);
      }

      UserModel.updateProfile(req.user.id, name, email);
      return successResponse(res, { id: req.user.id, name, email }, 'Profile updated successfully');
    } catch (err) {
      console.error('[AuthController.updateProfile]', err);
      return errorResponse(res, 'Failed to update profile.', 500);
    }
  }
};

module.exports = AuthController;
