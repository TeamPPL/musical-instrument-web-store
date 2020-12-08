const express = require('express');
const passport = require('passport');
const router = express.Router();

router.use(passport.initialize());
router.use(passport.session());

/* controllers */
const userController = require('../controllers/userControllers');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

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


module.exports = router;
