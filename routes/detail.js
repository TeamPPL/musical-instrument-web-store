var express = require('express');
var router = express.Router();
const detailController = require('../controllers/detailController');

/* GET home page. */
router.post('/', detailController.index);

module.exports = router;