const mongoose = require('mongoose');
const User = require('../model/userModel');
const createError = require('http-errors');
const bcrypt = require('bcrypt');
const { authSchema } = require('../auth/auth_schema');
const {additionalInfoSchema} = require ('../auth/auth_schema');
const jwtHelper = require('../helpers/jwtHelper');
// const passport = require('passport');
const passport = require('../config/Passport');
const PasswordService = require('../services/passwordService');
const {signAccessToken, signRefreshToken} = require ('../helpers/jwtHelper');
const {authenticateToken} = require ('../helpers/jwtHelper');
const upload = require ("../config/Multer");
const path = require('path');

// Login controller function
module.exports = {
  addUserStep1: async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate the input
        const result = await authSchema.validateAsync({
            username,
            email,
            password,
        });

        // Check if the email is already registered
        const exists = await User.findOne({ email });

        if (exists) {
            throw createError.Conflict(`${email} is already registered`);
        }

        // Check if the username is already taken
        const usernameExists = await User.findOne({ username });

        if (usernameExists) {
            throw createError.Conflict(`Username ${username} is already taken`);
        }

        // Save the user with basic information
        const user = new User(result);
        const savedUser = await user.save();

        // Generate tokens for the next steps
        const accessToken = await signAccessToken(savedUser.id, savedUser.username, true);
        const refreshToken = await signRefreshToken(savedUser.id);

        console.log('User Created Successfully', savedUser);

        // Redirecting the user to the second step with the token
        const redirectUrl = `addUserStep2?token=${accessToken}`;
        res.json({ accessToken, refreshToken, message: 'User added successfully', redirectUrl });
    } catch (error) {
        if (error.isJoi === true) error.status = 422;
        console.error('Error in step 1:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
},




// ... (your other imports and middleware)

addUserStep2: async (req, res) => {
  try {
    // Call the authenticateToken middleware to verify the access token
    authenticateToken(req, res, async () => {
      const { location, bio } = req.body;

      // Validate the additional information
      const result = await additionalInfoSchema.validateAsync({
        location,
        bio,
      });

      // Retrieve user information from the verified token
      const userId = req.user.userId;
      const username = req.user.username;

      // Find the user by ID (assuming you have a model named User)
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Update the user with additional information
      user.location = result.location;
      user.bio = result.bio;

      // If a file was uploaded (profilePicture field in req.file), update the profilePicture path
      if (req.file) {
        user.profilePicture = path.join(__dirname, 'avatars', req.file.filename);
      }

      // Save the updated user
      const updatedUser = await user.save();

      // Generate tokens for the next steps (if any)
      const accessToken = await signAccessToken(updatedUser.id, updatedUser.username, true);
      const refreshToken = await signRefreshToken(updatedUser.id);

      console.log('User Step 2 Completed Successfully', updatedUser);

      res.json({
        accessToken,
        refreshToken,
        message: 'User registration completed successfully',
        user: updatedUser,
      });
    });
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    console.error('Error in step 2:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
},
uploadProfilePicture: upload.single('profilePicture'),



  login: async (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
      try {
        // Handle Passport authentication errors
        if (err || !user) {
          throw createError.Unauthorized('Invalid username/password combination');
        }

        // Validate the request body using the authentication schema
        const result = await authSchema.validateAsync(req.body);

        // If the provided password matches with the stored one in the database
        const validPassword = await bcrypt.compare(result.password, user.password);

        // If the passwords do not match, throw an unauthorized error
        if (!validPassword) {
          throw createError.Unauthorized('Invalid username/password combination');
        }

        // If valid, create and assign a token to the user
        const accessToken = await jwtHelper.signAccessToken(
          user.id,
          user.username,
          user.isAdmin,
        );
        const refreshToken = await jwtHelper.signRefreshToken(user.id);

        // Send the access and refresh token in the response
        res.send({
          user: {
            userId: user.id,
            username: user.username,
            isAdmin: user.isAdmin,
          },
          accessToken,
          refreshToken,
          message: 'Login successful',
        });

        console.log(`User ${user.username} logged in successfully`);
      } catch (error) {
        // If a joi validation error occurs, return a bad request error
        if (error.isJoi === true) {
          return next(createError.BadRequest('Invalid username/password'));
        }
        // Pass other errors to the next middleware for handling
        next(error);
      }
    })(req, res, next);
  },
  forgotPassword: async (req, res, next) => {
    try {
      const {email} = req.body;
      const resetToken = await PasswordService.generateResetToken(email);
      const user = await User.findOne({email});
      console.log('DEBUG: User object:', user);
      if (!user) {
        throw new Error('No account found with this email address');
      }
      const username = user.username;
       const emailStatus = await PasswordService.sendResetEmail(email, resetToken, username);

      res.json({ message: `Password reset email sent' Status: ${emailStatus} `});
    }catch(error) {
      console.error('Error in forgot password route', error);
      res.status(500).json({message: 'Internal server error'});
    }
  },

  resetPassword: async (req,res, next) =>{
    try{
      const {token} = req.params;
      const {password} = req.body;

      await PasswordService.resetPassword(token, password);

      res.json({message: 'Password reset successful'});
    }catch (error) {
      console.error('Error in reset password route:', error);
      res.status(500).json({message: 'internal server error'});
    }
  },
  logOut: async (req, res, next) => {
    try {
      const invalidatedTokens = [];
      const token = req.headers.authorization;
  
      // Add the token to the list of invalidated tokens
      invalidatedTokens.push(token);
  
      // Optionally, you may want to store invalidated tokens in a database
  
      // Respond with a success message
      res.json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Error during logout:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },


}