const express = require('express');
const routes = express.Router();
const { verifyAccessToken } = require('../helpers/jwtHelper');

const userController = require("../controller/userController");
const authController = require("../controller/auth");
const authmiddleware = require("../helpers/jwtHelper");
const auth = require('../controller/auth');


routes.post('/register/addUserStep1', auth.addUserStep1);
routes.post('/register/addUserStep2', authmiddleware.verifyAccessToken,authController.uploadProfilePicture, auth.addUserStep2);
routes.post('/login', authController.login);
routes.post('/forgot-password', authController.forgotPassword);
routes.post('/reset-password/:token', authController.resetPassword);
routes.post('/logout', authController.logOut);
routes.get('/api/profile/:id', userController.getProfile);
routes.put('/update/:id', userController.updateUser);

// Apply verifyAccessToken middleware before routes that require authentication
routes.use(authmiddleware.verifyAccessToken);


// Private Routes (Require Authentication)
routes.delete('/delete/:id', userController.deleteUser);


routes.get('/find', userController.getAllUsers);
routes.get('/stats', userController.userStats);
routes.post('/addToFavorites/:filmId', userController.addToFavorites);


// Error handling middleware
routes.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = routes;
