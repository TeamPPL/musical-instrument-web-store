var express = require('express');
var router = express.Router();
const checkoutController = require('../controllers/checkoutController');

router.get('/cart', checkoutController.cart);

module.exports = router;