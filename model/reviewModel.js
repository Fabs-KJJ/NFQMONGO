const mongoose = require ('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' , // reference
        required: true,
    },
    film: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Film',
        required: true,
    },
    content: {
        type: String,
        required: [true,'Review must have a content'],
    },
    likes: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: 'User', 
        },
    ],
    dislikes:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },],
    comments: [
        {   user:{
            type : mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type:String,
            required: true,
        }
    }
    ],
    helpfulVotes: {
        type: Number,
        default:0,
    }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
