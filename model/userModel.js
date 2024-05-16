const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const passportLocalMongoose = require ('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
   location: {
    type: String
   },
    profilePicture: {
        type: String,
    },
    Bio: {
        type: String,
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Film'
    }],
    watchlist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Watchlist',
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    resetToken: String,
    
    resetTokenExpiration: Date,
    
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
}, { strict: false });

// Hashing password before saving the data in the database
UserSchema.pre('save', async function (next) {
    try {
        const salt = await bcrypt.genSalt(10);
        if (this.isModified('password')) {
            const hashedPwd = await bcrypt.hash(this.password, salt);
            this.password = hashedPwd;
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Comparing password if it's entered or valid
UserSchema.methods.isValidPassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw error;
    }
};

UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', UserSchema);

module.exports = User;
