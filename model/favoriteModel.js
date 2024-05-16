const mongoose = require('mongoose');//is Object Data Modelling that helps you create and manage MONGODB objects in Node.js apps
//uses Encapsulation and abstraction
const favoriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    filmId:{
        type: String,
        required: true,
    },
    review:{
        type: String,
        required: false,
    },
    rating:{
        type: Number,
        required:true
    },
    mediaType:{
        type: String,
        enum: ["film", "series"],
        required:true,
    },
    director:{
        type:String,
        required:true,
    },
    releaseDate:{
        type: String,
        required:true,
    },
    genre:{
        type: String,
        required: true,
    },
    mediaPoster:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default:Date.now
    }
});

const favorite = mongoose.model('favorite', favoriteSchema);

module.exports = favorite;