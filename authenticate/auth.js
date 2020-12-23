const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const accountModel = require('../models/accountModel');

module.exports = (app) => {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) => {
        console.log(user);
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        let account = await accountModel.findById(id);

        if (account == null) 
        {
          done(null, false);
        }
        else
        {
          done(null, account);
        }
     });
    
    passport.use(
      new LocalStrategy( async (username, password, done) => {
        let account = await accountModel.findByUsername(username);
        
        if (account == null) 
        {
          return done(null, false);
        }

        if (!bcrypt.compareSync(password, account.password))
        {
          return done(null, false);
        }
        else 
        {
          return done(null, account);
        }
      })
    );

    passport.use(
      new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "https://music-embassy.herokuapp.com/user/login/google/callback"
      },
      async (accessToken, refreshToken, profile, done) => {
        let account = await accountModel.findAndModifyGoogle(profile)
          
          if (account == null) 
          {
            return done(null, false);
          }
          
      }
  ));
};