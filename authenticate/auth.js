const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;
const accountModel = require('../models/accountModel');

module.exports = (app) => {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) => {
        //console.log(user);
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
        //console.log(account);
        if (account == null) 
        {
          return done(null, false);
        }

        

        if (!bcrypt.compare(password, account.password)) 
        //if (password !== account.password)
        {
          return done(null, false);
        }
        else 
        {
          return done(null, account);
        }
      })
    );
};