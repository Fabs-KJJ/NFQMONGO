const express = require('express');
const Platform = require('../model/platformModel');

const app = express();

// Assuming this is an endpoint for creating a new platform
module.exports = {
    addPlatform: async (req, res) => {
        try {
          const { name } = req.body; // Get platform information from the request body
      
          // Create a new Platform document
          const newPlatform = new Platform({ name });
      
          // Save the document to the database
          await newPlatform.save();
      
          res.status(201).json({ success: true, message: 'Platform created successfully' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ success: false, message: 'Internal server error' });
        }
      }
}



