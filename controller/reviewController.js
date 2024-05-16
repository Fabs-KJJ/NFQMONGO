const Review = require ('../model/reviewModel');
const createError = require('http-errors');
const Film = require ('../model/filmModel')
module.exports = {
    likeReview: async (req, res, next) => {
        try {
            const { reviewId } = req.params;
            const userId = req.user.id;
    
            console.log('Review ID:', reviewId);
    
            const review = await Review.findById(reviewId);
    
            console.log('Retrieved Review:', review);
    
            if (!review) {
                throw new createError(404, "No such review exists!");
            }
    
            if (!review.likes.includes(userId)) {
                review.likes.push(userId);
                await review.save();
            }
            res.json({ success: true, message: 'Review liked successfully' });
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    disLikeReview: async (req, res, next) => {
        try{
            const {reviewId} = req.params;
            const userId = req.user.id;

            const review = await Review.findById(reviewId);

            if(!review) {
                throw new createError(404, "No such review exists!");
            }

            if(!review.dislikes.includes(userId)) {
                review.dislikes.push(userId);
                await review.save();
            }
            res.json({success: true, message: 'Review disliked successfully'});
        }catch(error) {
            console.error(error);
            next(error);
        }
    },
    addReview: async (req, res, next) => {
        const { filmId, text } = req.body;
        const id = req.params.id;

        try {
            // Create a new review instance
            const newReview = new Review({
                user: id,
                film: filmId,
                content: text,
                dateAdded: new Date()
            });

            // Save the new review to the database
            const savedReview = await newReview.save();

            res.json({ success: true, data: savedReview });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                error: 'Internal Server Error'
            });
        }
    },

    getReviews: async (req, res) => {
        try {
          const filmId = req.params.filmId;
      
          console.log('Film ID:', filmId);
      
          // Fetch reviews from the database using the filmId
          const reviews = await Review.find({ film: filmId })
            .populate('user', 'username') // Assuming 'username' is a field in the User model
            .exec();
      
          if (reviews.length === 0) {
            return res.status(404).json({
              success: false,
              message: 'No reviews found for film ID: ' + filmId,
            });
          }
      
          // Send the reviews as the response
          res.status(200).json({ success: true, data: reviews });
        } catch (error) {
          console.error('Error getting reviews:', error);
      
          // Handle specific types of errors
          if (error.name === 'CastError') {
            // Handle invalid ObjectId format
            return res.status(400).json({
              success: false,
              message: 'Invalid film ID format: ' + req.params.filmId,
            });
          }
      
          res.status(500).json({
            success: false,
            message: 'Internal server error',
          });
        }
      },
      editReview: async (req, res, next) => {
        const {reviewId} = req.params;
        const {text} = req.body;
        const userId = req.user.id;

        try{
            const review = await Review.findById(reviewId);

            if(!review) {
                throw new createError(404, "No such review exists!");
            }

            if(review.user.toString() !== userId) {
                throw new createError(403, "You are not authorized to edit this review");
            }

            review.content = text;
            const updatedReview = await review.save();

            res.json({success: true, data: updatedReview, message: 'review updated successfully'})
        }catch(error) {
            console.error(error);
            next(error);
        }
      }
    
}