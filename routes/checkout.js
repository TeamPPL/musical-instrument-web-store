var express = require('express');
var router = express.Router();
const checkoutController = require('../controllers/checkoutController');

const homeCarouselController = require('../controllers/homeCarouselController');

/* GET home page. */
router.get('/', checkoutController.index);
//router.get('/', checkoutController.index);
router.get('/add-to-cart/:id', checkoutController.addToCart)

module.exports = router;