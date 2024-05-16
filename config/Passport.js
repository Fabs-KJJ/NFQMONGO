const passport = require('passport');
const User = require('../model/userModel');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt'); 

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
}, async (email, password, done) => { // Fix the parameter name to 'email'
    try {
        console.log('Entered Email:', email); // Fix the log statement
        console.log('Entered Password:', password);

        const user = await User.findOne({ email });

        console.log('Found User:', user);

        if (!user) {
            return done(null, false, { message: 'User not found' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return done(null, false, { message: 'Incorrect password' });
        }

        return done(null, user, { message: 'Login successful' });
    } catch (error) {
        return done(error);
    }
}));


const jwtOptions = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.ACCESS_TOKEN_SECRET,
};

passport.use(new JWTStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
        const user = await User.findById(jwtPayload.sub);

        if (user) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'User not found' });
        }
    } catch (error) {
        return done(error);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

module.exports = passport;
