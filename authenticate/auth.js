const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const RememberMeStrategy = require('passport-remember-me').Strategy;

const utils = require('./utils');
const accountModel = require('../models/accountModel');

module.exports = (app) => {
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(passport.authenticate('remember-me'));

    var tokens = {}

    function consumeRememberMeToken(token, fn) {
      let uid = tokens[token];
      delete tokens[token];
      return fn(null, uid);
    }

    function saveRememberMeToken(token, uid, fn) {
      tokens[token] = uid;
      return fn();
    }

    function issueToken(user, done) {
      let token = utils.randomString(64);
      saveRememberMeToken(token, user.id, function(err) {
        if (err) { return done(err); }
        return done(null, token);
      });
    }

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
        
        if (account == null) 
        {
          return done(null, false, {message: "This username doesn't exist!"});
        }

        if (!bcrypt.compareSync(password, account.password))
        {
         return done(null, false, {message: "Incorrect password!"});
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
        consumeRememberMeToken(token, async (err, uid) => {
          if (err) 
            return done(err);
          if (!uid) 
            return done(null, false);

          let account = await accountModel.findById(uid);
      
          if (account == null) 
          {
            return done(null, false);
          }
          else 
          {
            return done(null, account);
          }
        })
      },
      issueToken
    ));
};