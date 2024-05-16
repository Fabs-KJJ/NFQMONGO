const express = require('express');
const routes = express.Router();


const searchController = require ('../controller/searchController');

try{
    routes.get('/search', searchController.search);
}catch(err){
    console.error('error', err);
}

module.exports = routes;