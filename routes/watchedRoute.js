const express = require('express');
const router = express.Router();
const watchedController = require('../controller/watchedController');

// Route to get the watched list
router.get('/watched', watchedController.getWatchedList);

// Route to move a movie from watchlist to watched list
router.post('/watched/move', watchedController.moveToWatched);

module.exports = router;
