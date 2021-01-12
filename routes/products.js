var express = require('express');
var router = express.Router();
const productController = require('../controllers/productController');
const detailController = require('../controllers/detailController');

/* GET home page. */
router.get('/', productController.index);
router.get('/detail/:id', detailController.index);
router.get('/detail/comment/:id', detailController.comment);
router.post('/detail/comment/:id', detailController.comments);

router.post('/', productController.filter);

module.exports = router;
