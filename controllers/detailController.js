const productModel = require('../models/productModel');

exports.index = (req, res, next) => {
    const idProduct = parseInt(req.query.ID);

    const productItems = productModel.list()[idProduct - 1];
    console.log(productItems);
    console.log(idProduct);
    res.render('detail/detail', {productItems , idProduct});
};