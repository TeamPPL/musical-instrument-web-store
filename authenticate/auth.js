const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const RememberMeStrategy = require('passport-remember-me').Strategy;

const storeToken = require('./storeToken');
const accountModel = require('../models/accountModel');

module.exports = (app) => {
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(passport.authenticate('remember-me'));

    passport.serializeUser((user, done) => {
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
        
        //Account doesn't exist
        if (account == null) 
        {
          return done(null, false, {message: "This username doesn't exist!"});
        }

        //Check password
        if (!bcrypt.compareSync(password, account.password))
        {
          //Incorrect
         return done(null, false, {message: "Incorrect password!"});
        }
        //Correct

        //If account hasn't been activated
        if (!account.isActivated)
        {
          return done(null, false, {message: "Your account is not activated yet!"})
        }

        //Check if the account is locked by admin
        if (account.isLocked)
        {
          return done(null, false, {message: "Your account has been locked. Contact admin to resolve this!"})
        }

        return done(null, account);
      })
    );

    passport.use(
      new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        //console.log(profile);
        let account = await accountModel.findAndModifyGoogle(profile)
        //console.log(account);
        return done(null, account);
      }
    ));

    passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ['id', 'displayName', 'photos', 'email']
      }, async function(accessToken, refreshToken, profile, done) {
        console.log(profile);
        let account = await accountModel.findAndModifyFacebook(profile);
        //console.log(account);
        return done(null, account);
      }
    ));

    passport.use(new RememberMeStrategy(
      async (token, done) => {
        console.log('token: ')
        console.dir(token);
        storeToken.consumeRememberMeToken(app, token, async (err, uid) => {
          console.dir(uid);
          if (err) 
            return done(err);
          if (!uid) 
            return done(null, false);

          let account = await accountModel.findById(uid);
          console.dir(account);
          if (account == null) 
          {
            return done(null, false, {message: "This username doesn't exist!"});
          }
          else 
          {
            return done(null, account);
          }
        })
      },
      (app, user, done) => {
        let token = utils.randomString(64);
        storeToken.saveRememberMeToken(app, token, user._id, function(err) {
          if (err) { return done(err); }
          return done(null, token);
        });
      }
    ));
};