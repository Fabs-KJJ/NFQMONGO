const express = require('express');
const routes = express.Router();
const watchlistContoller = require ('../controller/watchlistController');
const authmiddleware = require('../helpers/jwtHelper');
try{
    routes.use(authmiddleware.verifyAccessToken);
    routes.post('/addToWatchlist/:id', watchlistContoller.addWatchlist);
    routes.delete('/remove/:id/:filmId', watchlistContoller.removeFromWatchlist);
    routes.get('/getWatchlist/:id', watchlistContoller.getWatchList);
    routes.get('/getWatchlist/:id', watchlistContoller.getWatchList);
    routes.get('/inWatchlist/:id/:filmId', watchlistContoller.isInWatchlist);
}catch(err){
    console.error(err);
}
module.exports = routes;