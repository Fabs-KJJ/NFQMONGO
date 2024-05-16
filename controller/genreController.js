// controllers/genreController.js
const Genre = require('../model/genre');
const createError = require('http-errors');

module.exports = {
  getAllGenres: async (req, res, next) => {
    try {
      const genres = await Genre.find();
      res.json({ success: true, data: genres });
    } catch (error) {
      console.error('Error getting genres:', error);
      next(createError(500, 'Internal Server Error'));
    }
  },

  createGenre: async (req, res, next) => {
    try {
      const { name } = req.body;
      const genre = new Genre({ name });
      const savedGenre = await genre.save();
      res.status(201).json({ success: true, data: savedGenre });
    } catch (error) {
      console.error('Error creating genre:', error);
      if (error.name === 'MongoError' && error.code === 11000) {
        // Duplicate key error (e.g., unique constraint violated)
        next(createError(409, 'Genre with this name already exists'));
      } else {
        next(createError(500, 'Internal Server Error'));
      }
    }
  },
};
