const express = require('express');
const route = express.Router();
const listController = require('../controller/listsController');
const authmiddleware = require('../helpers/jwtHelper');

try{
    // route.use(authmiddleware.verifyAccessToken);
    route.get('/getLists', listController.getLists);
    route.post('/addLists', listController.addLists);
    route.delete('/deleteList/:id', listController.deleteList);
    route.patch('/updateLists/:id', listController.updateList);
}catch(err){
    console.error(err)
}

module.exports = route;