
const express = require('express');
const router = express.Router();
const musicInstrumentController = require('../controllers/musicInstrumentController');

/* GET list of books. */
const dataMusicInstrument = musicInstrumentController.indexData;
router.get('/', dataMusicInstrument);

// router.get('/', function(req, res, next) {
//     // const dataBook = bookController.index;
//     // res.render('layout', {dataBook});
//     return dataBook;
// }
// );

module.exports = router;