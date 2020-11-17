const productModel = require('../models/productModel');

const MAX_RELATED_PRODUCT_PER_PAGE = 4;

exports.index = (req, res, next) => {
    const idProduct = parseInt(req.query.ID);

    const productItems = productModel.list()[idProduct - 1];
    const allRelatedProducts = function(){
        let relatedProducts = [];  

        let i = 0;
        productModel.list().forEach(element => {
            if (i < 4) {
                // break;
                if (((element.filter).localeCompare(productItems.filter) == 0) && (element.id != productItems.id)) {
                    relatedProducts.push(element);
                }
                else {
                    // do nothing
                }
            }
            else {
                i++;
                // do nothing
            }
        });

        return relatedProducts;
    };
    
    res.render('detail/detail', {productItems, allRelatedProducts});
};