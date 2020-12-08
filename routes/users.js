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
/*
router.post('/login', (req, res, next) => {
  console.log('LMAO!!!');
  console.log(req.body.username);
  next();
}
);
*/
router.post('/login', passport.authenticate('local', {
    successRedirect: '/user', //redirect ve personal page
    failureRedirect: '/user/login',
    failureFlash: true
  })
);

router.post('/signup', 
  userController.createNewAccount,
  passport.authenticate('local', {
    successRedirect: '/user', //redirect ve personal page
    failureRedirect: '/user/login',
    failureFlash: true
  })
);

router.post('/update', ensureAuth, userController.updateAccountInfo);

module.exports = router;
