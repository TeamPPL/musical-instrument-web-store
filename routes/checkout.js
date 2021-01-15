var express = require('express');
var router = express.Router();
const checkoutController = require('../controllers/checkoutController');

const homeCarouselController = require('../controllers/homeCarouselController');

/* GET home page. */
router.get('/', checkoutController.index);

//router.get('/add-to-cart/:id', checkoutController.addToCart);
router.post('/add-to-cart', checkoutController.addToCart);

router.post('/', checkoutController.updateCart);
router.get('/checkout', checkoutController.billingDetail);
router.post('/checkout', checkoutController.billingDetailUpdate);
router.post('/receipt', checkoutController.addReceipt);

module.exports = router;