// controllers/searchController.js

const Film = require('../model/filmModel');  // Adjust the model import based on your structure

module.exports = {
    search: async (req, res, next) => {
        try {
            const query = req.query.q; // Extract the search query from request parameters
            const results = await Film.find({
                $or: [
                    { title: { $regex: new RegExp(query, 'i') } }, // Case-insensitive title search
                    { director: { $regex: new RegExp(query, 'i') } } // Case-insensitive director search
                ]
            });

            res.json({ success: true, data: results });
        } catch (error) {
            console.error('Error searching:', error);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    },
};
