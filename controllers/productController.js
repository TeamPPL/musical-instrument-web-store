const productModel = require('../models/productModel');

exports.index = async (req, res, next) => {
    const productItems = await productModel.list();
    console.log(productItems);
    res.render('products/products', {productItems});
};