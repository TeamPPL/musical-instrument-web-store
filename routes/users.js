const express = require('express');
const passport = require('passport');
const router = express.Router();

router.use(passport.initialize());
router.use(passport.session());

/* controllers */
const userController = require('../controllers/userControllers');
const ensureAuth = require('../authenticate/ensureAuth');

/* GET users listing. */
router.get('/', ensureAuth, userController.index);
//Render Login page
router.get('/login', userController.getLogin);
//Render signup page
router.get('/signup', userController.getSignup);
//Logout
router.get('/logout', userController.logout);
//Render forgot password page
router.get('/forgot', userController.renderForgetPassword);
//Render reset password page
router.get('/reset/:token', userController.renderResetPassword);
//Activate account page
router.get('/activate/:token', userController.activateAccount);

//Post login form
router.post('/login', passport.authenticate('local', {
    failureRedirect: '/user/login',
    failureFlash: true
  }), 
  userController.rememberMe
);

//Login with Google, redirect to Google OAuth
router.get('/login/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
//Get info from Google
router.get('/login/google/callback', 
  passport.authenticate('google', { 
    successRedirect: '/user',
    failureRedirect: '/login'
  })
);
//Login with Facebook, redirect to Facebook OAuth
router.get('/login/facebook',
  passport.authenticate('facebook',  { scope: ['email'] })
);
//Get info from Facebook
router.get('/login/facebook/callback', 
  passport.authenticate('facebook', { 
    successRedirect: '/user',
    failureRedirect: '/login'
  })
);

//Post signup form
router.post('/signup', 
  userController.createNewAccount
);

router.post('/signup/checkdata', userController.checkSignupData)

router.post('/update', ensureAuth, userController.updateAccountInfo);

router.post('/forgot', userController.sendEmailResetPassword);

router.post('/reset/:token', userController.resetPassword);

router.post('/change-password', ensureAuth, userController.changePassword);

module.exports = router;
