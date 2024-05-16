const { populate } = require('../model/userModel');
const Watchlist = require('../model/watchlistModel');
const createError = require('http-errors');

module.exports = {
    // getWatchList controller
getWatchList: async (req, res, next) => {
    try {
        const userId = req.user.id; // Use the correct way to get the authenticated user's ID
        const watchlistItems = await Watchlist.find({ user: userId })
            .populate({
                path: "films.film",
                select: ["title","posterImagePath"]
            })
            .populate({
                path: 'user',
                select: "username"
            });

        res.status(200).json(watchlistItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
},




    // Add a new watchlist item based on the request body
addWatchlist: async (req, res, next) => {
    try {
        // Extract movie details from the request body
        const { filmId } = req.body;

        if (!req.user.id) {
            throw createError(401, 'Unauthorized');
        }

        // Check if the film is already in the user's watchlist
        const existingWatchlistItem = await Watchlist.findOne({
            user: req.user.id,
            'films.film': filmId,
        });

        if (existingWatchlistItem) {
            // Film is already in the watchlist, send a response indicating the same
            return res.status(400).json({
                success: false,
                message: 'Movie is already in the watchlist',
            });
        }

        // Create a new watchlist item
        const newWatchlistItem = new Watchlist({
            user: req.user.id,
            films: [{ film: filmId }],
        });

        // Save the new watchlist item to the database
        const savedWatchlistItem = await newWatchlistItem.save();

        // Send a success response
        res.status(200).json({
            success: true,
            message: 'Movie added to watchlist successfully',
            watchlistItem: savedWatchlistItem,
        });
    } catch (error) {
        console.error('Error adding movie to watchlist:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
},
removeFromWatchlist: async (req, res, next) => {
    try {
        const { filmId } = req.body;

        if (!req.user.id) {
            throw createError(401, 'Unauthorized');
        }

        // Find the watchlist item
        const watchlistItem = await Watchlist.findOne({
            user: req.user.id,
            'films.film': filmId,
        });

        if (!watchlistItem) {
            // Movie not found in watchlist
            return res.status(404).json({
                success: false,
                message: 'Film is not on your watchlist',
            });
        }

        // Remove the movie from the watchlist
        await Watchlist.findOneAndUpdate(
            { user: req.user.id },
            { $pull: { films: { film: filmId } } },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Movie removed from watchlist successfully',
        });
    } catch (error) {
        console.error('Error removing movie from watchlist:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
},
isInWatchlist: async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const filmId = req.params.filmId;

        const watchlistItem = await Watchlist.findOne({
            user: userId,
            'films.film': filmId,
        });

        const isInWatchlist = !!watchlistItem;

        res.status(200).json({
            success: true,
            isInWatchlist: isInWatchlist,
        });
    } catch (error) {
        console.error('Error checking watchlist status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
},

}
