const mongoose = require('mongoose');
const User = require('../model/userModel');
const Film = require('../model/filmModel');
const createError = require('http-errors');
const bcrypt = require ('bcrypt');
const { authSchema } = require('../auth/auth_schema');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helpers/jwtHelper');
const JWT = require('jsonwebtoken');
const { config } = require('dotenv');
const jwtHelper = require('../helpers/jwtHelper')

const updateUserById = async (id, updateData) => {
    const result = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
    );

    if (!result) {
        throw createError(404, 'User does not exist');
    }

    return result;
};

module.exports = {
    
    
getAllUsers: async (req, res) => {
        const query = req.query.new;
    
        // if (req.user && req.user.isAdmin === true) {  // Use req.user.isAdmin to check for admin access
        if(true){
            try {
                const users = query ? await User.find().sort({ _id: -1 }).limit(10) : await User.find();
                console.log('req.user.isAdmin:', req.user.isAdmin);
                res.status(200).json(users); // Sending the result as the response
            } catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error" + error.message);
            }
        } else {
            res.status(403).json("You are not allowed to see all users");
        }
    },
    
    updateUser: async (req, res, next) => {
        try {
            // Check if user is authenticated
            if (!req.user || !req.user._id) {
                return res.status(401).json({ error: { status: 401, message: 'Unauthorized: User not authenticated' } });
            }
    
            const id = req.params.id; // extracting the id from the request parameters
            const { username, email, password } = req.body;
            let result;
    
            // Check if the user making the request is the same user being updated
            if (req.user._id.equals(id)) {
                if (password) {
                    // Handle password update
                    const hashedPassword = await bcrypt.hash(password, 10);
                    result = await updateUserById(id, { username, email, password: hashedPassword });
                } else {
                    // Handle non-password update
                    result = await updateUserById(id, { username, email });
                }
    
                console.log("User successfully updated:", result);
    
                res.json({ success: true, data: result });
            } else {
                console.log("User not authorized to update");
                throw createError(403, 'Unauthorized: You do not have permission to update this user.');
            }
        } catch (error) {
            console.error(error.message);
            next(error);
        }
    },
    
    
    
    
    
deleteUser: async (req, res, next) => {
        const id = req.params.id; // extracting the id from the request parameters
        const { username, email, password } = req.body;
        let result; // declare result variable outside the if block
    
        try {
            if (req.user.id === req.params.id || req.user.isAdmin) {
                if (password) {
                    const hashedPassword = await bcrypt.hash(password, 10);
    
                    result = await User.findByIdAndDelete(
                        id,
                        {
                            username,
                            email,
                            password: hashedPassword,
                        },
                        { new: true }
                    );
                    if (!result) {
                        throw createError(404, 'User does not exist');
                    }
                } else {
                    // Handle the case when password is not provided
                    result = await User.findByIdAndDelete(
                        id,
                        {
                            username,
                            email,
                        },
                        { new: true }
                    );
                    if (!result) {
                        throw createError(404, 'User does not exist');
                    }
                }
                console.log('Requesting user ID:', req.user.id);
                console.log('Target user ID:', id);
        
                res.json({ success: true, data: result });
            } else {
                throw createError(403, 'Unauthorized: You do not have permission to delete this user.');
            }
        } catch (error) {
            console.log(error.message);
            next(error);
        }
    },

    getProfile: async (req, res) => {
      
        try {
            const { id } = req.params; 
      
          console.log('User ID:', id);
      
          // Fetch user profile from the database using the correct variable name
          const userProfile = await User.findById(id);
      
          if (!userProfile) {
            return res.status(404).json({
              success: false,
              message: 'User profile not found for ID: ' + id,
            });
          }
      
          // Send the user profile as the response
          res.status(200).json({
            success: true,
            data: {
              username: userProfile.username,
              email: userProfile.email,
              bio: userProfile.Bio || '',
              location: userProfile.location || '',
              profilePicture: userProfile.profilePicture,
              message: 'you have fetched data',
            },
          });
        } catch (error) {
          console.error('Error getting user profile:', error);
      
          // Handle specific types of errors
          if (error.name === 'CastError') {
            // Handle invalid ObjectId format
            return res.status(400).json({
              success: false,
              message: 'Invalid user ID format: ' + req.params.id,  // Use the declared userId variable
            });
          }
      
          res.status(500).json({
            success: false,
            message: 'Internal server error',
          });
        }
      },
      
      

userStats: async (req, res, next) => {
            const today = new Date();
            const lastYear = today.setFullYear(today.setFullYear() -1);

            const monthsArray = [
                "January",
                "February",
                "March",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"
            ];

            try{
                const data = await User.aggregate([
                    {
                        $project:{
                            month: {$month: "$createdAt"}
                        }
                    },{
                        $group: {
                            _id: "$month",
                            total:{$sum: 1},
                        }
                    }
                ]);
                res.status(200).json(data);
            }catch(err){
                res.status(500).json(err)
            }
      },
addToFavorites: async(req, res, next) => {
        const userId = req.user.id;
        const filmId = req.params.filmId;
    
        try{
            const film = await Film.findById(filmId);
            if(!film) {
                throw createError(404, 'Film not found');
            }
    
            const user = await User.findByIdAndUpdate(
                userId,
                {$addToSet: {favorites: filmId}}, //add to set ensures uniqueness
                {new: true}
            );
            res.json({success: true, data: user});
        }catch (error) {
            console.error(error);
            res.status(500).json({success: false, error: 'Internal server error'});
        }
    },

}