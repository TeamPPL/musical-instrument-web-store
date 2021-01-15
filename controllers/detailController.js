const productModel = require('../models/productModel');
const commentModel = require('../models/commentModel');

const MAX_RELATED_PRODUCT_PER_PAGE = 4;

exports.index = async (req, res, next) => {
    const idProduct = req.params.id;
    const productItems = await productModel.findById(idProduct);
    const allRelatedProducts = await productModel.relatedProducts(idProduct);
    const comments = await commentModel.getCommentOfProducts(idProduct);
    const countCMT = await commentModel.totalComment(idProduct);
    const MAX_CMT_PER_PAGES = 5;
    const totalPages = Math.ceil(countCMT / MAX_CMT_PER_PAGES);

    let average = 0;
    if(comments.length > 0){
        let sum = 0;
        for(var item of comments){
            sum = sum + item.Star;
        }
        average = Math.round(sum * 1.0 / (comments.length))
    }
    else{
        // do nothing
    }

    
    console.log(countCMT);

    res.render('products/detail/detail', {productItems, allRelatedProducts, comments, countCmt : comments.length, AverageReview : average});
};

exports.comment = async (req, res, next) => {
    const user = req.user;
    if(user != undefined){
        const idProduct = req.params.id;
        const productItems = await productModel.findById(idProduct);
        res.render('products/comments/comment', {productItems});
    }
    else{
        res.redirect('/user/login');
    }
};

exports.comments = async (req, res, next) => {

    const idProduct = req.params.id;
    const star = parseInt(req.body.Star);
    const cmt = req.body.reviewuser;
    const idUser = req.user._id.toString();

    let cmtDetail = {
        'ID_Product': idProduct,
        'ID_User': idUser,
        'comment': cmt,
        'star': star
    };
    
    console.log(cmtDetail);

    try {
      await commentModel.insertOne(cmtDetail);
      res.redirect('/products/detail/' + idProduct);
    }
    catch(error){
      
    } 

    
};