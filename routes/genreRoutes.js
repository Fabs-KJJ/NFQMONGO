// routes/genreRoutes.js
const express = require('express');
const routes = express.Router();
const genreController = require('../controller/genreController');

// Get all genres
routes.get('/getgenre', genreController.getAllGenres);

// Create a new genre
routes.post('/addgenre', genreController.createGenre);

module.exports = routes;
