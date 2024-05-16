const mongoose = require('mongoose');

const watchedSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    film: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Film',
        required: true,
    },
});

const Watched = mongoose.model('Watched', watchedSchema);

module.exports = Watched;
