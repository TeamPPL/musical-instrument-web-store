var express = require('express');
var router = express.Router();
const receiptController = require('../controllers/receiptController');

router.get('/purchase-history', receiptController.index);
router.post('/purchase-history', receiptController.filter);

module.exports = router;