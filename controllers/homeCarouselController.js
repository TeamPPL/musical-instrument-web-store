const carouselModel = require('../models/carouselModel');
const lastestProductModel = require('../models/lastestProductModel');
const specialOfferModel = require('../models/specialOfferModel');


exports.index = async (req, res, next) => {
    // Get books from model
    const carouselItems = carouselModel.list();
    const lastestProductItems = lastestProductModel.list();
    const specialOfferItems = await specialOfferModel.list();
    console.log(specialOfferItems);
    // Pass data to view to display list of books
    res.render('index', {carouselItems, lastestProductItems, specialOfferItems});
};