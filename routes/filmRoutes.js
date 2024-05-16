const express = require ('express');
const route = express.Router();
const authmiddleware = require('../helpers/jwtHelper');

const filmController = require('../controller/filmController')
const watchlistroutes = require("../routes/watchlistRoutes");

try{
    route.get('/getFilms', filmController.getFilms);
    route.get('/getFilmDetails/:id', filmController.getFilmDetails);

    // route.use(authmiddleware.verifyAccessToken);
    
    route.post('/addFilm', filmController.addFilm);
    route.delete('/deleteFilm/:id', filmController.deleteFilm);
    route.get('/getFile/:path', filmController.getFile);
    route.put('/updateFilm/:id', filmController.updateFilm);

    route.get('/film/random', filmController.getRandom);
    route.post('/addRating/:filmId', filmController.addRating);
}catch(err){
    console.error('Error during route registration:', err);
}

module.exports = route;