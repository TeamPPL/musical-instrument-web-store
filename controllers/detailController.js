const productModel = require('../models/productModel');

exports.index = (req, res, next) => {
    const productItems = productModel.list()[0];
    res.render('detail/detail', {productItems});
};