const JWT = require('jsonwebtoken');
const createError = require('http-errors');
const config = require('../config/config');
const user = require('../model/userModel');

module.exports = {
  signAccessToken: (userId, username, isAdmin) => {
    // Function to sign an access token
    return new Promise((resolve, reject) => {
      const payload = {
        userId: userId,
        username: username,
        isAdmin: isAdmin,
      };
      const secret = process.env.ACCESS_TOKEN_SECRET;
      const options = {
        expiresIn: config.accessTokenExpiration,
        issuer: 'NairoFilmQuest.com',
        audience: userId,
      };

      JWT.sign(payload, secret, options, (error, token) => {
        if (error) {
          console.error(error.message);
          reject(createError.InternalServerError());
        }
        resolve(token);
      });
    });
  },

  // Middleware function to verify the access token
  verifyAccessToken: (req, res, next) => {
    if (!req.headers['authorization']) return next(createError.Unauthorized());

    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader.split(' ');
    const token = bearerToken[1];

    if (bearerToken.length !== 2 || bearerToken[0] !== 'Bearer') {
      return next(createError.Unauthorized());
    }

    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        console.error('Error verifying access token:', err.message);
        return next(createError.Unauthorized());
      }

      console.log('Token Payload:', payload);

      const userId = payload.userId;
      const isAdmin = payload.isAdmin;

      if (!userId) {
        return next(createError.Unauthorized('Invalid token payload'));
      }

      req.user = { id: userId, isAdmin: isAdmin };
      next();
    });
  },

  // Function to assign a refresh token
  signRefreshToken: (UserId) => {
    return new Promise((resolve, reject) => {
      const payload = {};
      const secret = process.env.REFRESH_TOKEN_SECRET;
      const options = {
        expiresIn: config.refreshTokenExpiration,
        issuer: 'NairoFilmQuest.com',
        audience: UserId,
      };
      JWT.sign(payload, secret, options, (error, token) => {
        if (error) {
          console.error(error.message);
          reject(createError.InternalServerError());
        }
        resolve(token);
      });
    });
  },

  // Middleware function to verify the refresh token
  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
        if (err) return reject(createError.Unauthorized());
        const userId = payload.aud;
        resolve(userId);
      });
    });
  },

  // Middleware function to authenticate the token
  authenticateToken: (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return next(createError.Unauthorized());
    }

    const bearerToken = authHeader.split(' ');
    const token = bearerToken[1];

    if (bearerToken.length !== 2 || bearerToken[0] !== 'Bearer') {
      return next(createError.Unauthorized());
    }

    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        console.error('Error verifying access token:', err.message);
        return next(createError.Unauthorized());
      }

      console.log('Decoded Token:', user);
      req.user = user;
      next();
    });
  },
};
