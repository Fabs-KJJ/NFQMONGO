const express = require ('express');
const router = express.Router();
const platformController = require('../controller/platformController');

try{
    router.post('/platforms/add', platformController.addPlatform)
}catch{

};

module.exports = router;

