const mongoose = require('mongoose');

const filmSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    synopsis: {
        type: String,
        required: true
    },
    director: {
        type: String,
        required: true
    },
    whereToWatch: [{
        platform: { type: mongoose.Schema.Types.ObjectId, ref: 'Platform', required: true },
        link: { type: String, required: true },
    }],
    ratings: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        value: { type: Number },
        review: { type: String }
    }],
    reviews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: { type: String },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    }],
    posterImagePath: {
        type: String,
        required: true
    },
    runtime: {
        type: String,
        required: true
    },
    genre: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre',
        required: true,
    }],
    cast: [{
        type: String,
        required: true
    }],
    agerating: {
        type: String,
        required: true
    },
    releaseyear: {
        type: Number,
        required: true,
    },
    trailers: [{
        link: { type: String, required: true },
    }],
    isSeries: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Film = mongoose.model('Film', filmSchema);
module.exports = Film;
