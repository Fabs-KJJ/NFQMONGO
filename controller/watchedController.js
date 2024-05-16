const createError = require('http-errors');
const Watched = require('../model/watchedModel');

module.exports = {
    moveToWatched: async (req, res, next) => {
        try {
            const {filmId} = req.body;

            if(!req.user.id) {
                throw createError(401, 'Unauthorized');
            }

            const watchlistItem = await Watchlist.findOne({
                user: req.user.id,
                'films.film': filmId,
            });

            if(!watchlistItem) {
                //Movie not found in watchlist
                return res.status(404).json({
                    success: false,
                    message: "Film is not on your watch list"
                })
            }

            //creating a new entry in watched collection
            const watchedItem = new Watched({
                user: req.user.id,
                film: filmId,
            });
            await watchedItem.save();

            //remove the movie from the watchlist
            await watchedItem.remove();

            res.status(200).json({
                success: true,
                message: 'movie added to watched list successfully'
            });
        }catch(error) {
            console.error('Error moving movie to watched list:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            })
        }
    },
    getWatchedList: async (req, res, next) => {
        try {
            const userId = req.user.id; // Use the correct way to get the authenticated user's ID
            const watchedItems = await Watched.find({ user: userId })
                .populate({
                    path: "film",
                    select: ["title", "posterImagePath"]
                })
                .populate({
                    path: 'user',
                    select: "username"
                });

            res.status(200).json(watchedItems);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
};