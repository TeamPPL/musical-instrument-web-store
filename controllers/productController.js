
const productModel = require('../models/productModel');

exports.index = (req, res, next) => {
    const productItems = productModel.list();
    res.render('products/products', {productItems});
};