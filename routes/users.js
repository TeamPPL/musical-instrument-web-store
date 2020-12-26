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

router.get('/login', userController.getLogin);
router.get('/signup', userController.getSignup);
router.get('/logout', userController.logout);

router.post('/login', passport.authenticate('local', {
    successRedirect: '/user', //redirect back to personal page
    failureRedirect: '/user/login',
    failureFlash: 'Invalid username or password.'
  })
);

router.get('/login/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/login/google/callback', 
  passport.authenticate('google', { 
    successRedirect: '/user',
    failureRedirect: '/login'
  })
);

router.get('/login/facebook',
  passport.authenticate('facebook',  { scope: ['email'] })
);

router.get('/login/facebook/callback', 
  passport.authenticate('facebook', { 
    successRedirect: '/user',
    failureRedirect: '/login'
  })
);

router.post('/signup', 
  userController.createNewAccount,
  passport.authenticate('local', {
    successRedirect: '/user', //redirect back to personal page
    failureRedirect: '/user/login',
    failureFlash: true
  })
);


router.post('/update', ensureAuth, userController.updateAccountInfo);

module.exports = router;
