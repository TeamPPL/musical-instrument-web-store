var express = require('express');
var router = express.Router();
const productController = require('../controllers/productController');
const detailController = require('../controllers/detailController');

/* GET home page. */
router.get('/', productController.getProductsGET);
router.get('/detail/:id', detailController.index);

router.post('/', productController.getProductsAjax);

module.exports = router;
