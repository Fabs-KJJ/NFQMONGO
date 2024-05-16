const express = require ('express');
const router = express.Router();
const reviewController = require('../controller/reviewController');
const authmiddleware = require('../helpers/jwtHelper');

try{
    router.use(authmiddleware.verifyAccessToken);
    router.post('/addReview/:id', reviewController.addReview);
    router.post('/like/:reviewId', reviewController.likeReview);
    router.put('/reviews/:reviewId/edit', reviewController.editReview);
    router.post('/dislike/:reviewId', reviewController.disLikeReview);
    router.post('/like/:filmId/:reviewId', reviewController.likeReview);
    router.get('/getReview/:filmId', reviewController.getReviews);
    // router.post('/comment/:reviewId', reviewController.addComment);
    // router.post('/vote/:reviewId', reviewController.voteReview);
}catch(err) {
    console.error(err);
}

module.exports = router;