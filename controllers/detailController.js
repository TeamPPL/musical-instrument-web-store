const productModel = require('../models/productModel');

exports.index = (req, res, next) => {
    const idProduct = parseInt(req.body.ID);

    const productItems = productModel.list()[idProduct - 1];
    res.render('detail/detail', {productItems , idProduct});
};