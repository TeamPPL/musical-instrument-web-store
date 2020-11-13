
const musicInstrumentModel = require('../models/musicInstrumentModel');

exports.indexData = (req, res, next) => {
    // Get books from model
    const musicInstruments = musicInstrumentModel.list();
    // Pass data to view to display list of books
    res.render('MusicInstrument/musicInstrumentList', {musicInstruments, myname: "Sgrayk"});
};