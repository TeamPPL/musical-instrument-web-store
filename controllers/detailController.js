const productModel = require('../models/productModel');
const commentModel = require('../models/commentModel');

const MAX_RELATED_PRODUCT_PER_PAGE = 4;

exports.index = async (req, res, next) => {
    const MAX_CMT_PER_PAGES = 2;

    const idProduct = req.params.id;
    const productItems = await productModel.findById(idProduct);
    const allRelatedProducts = await productModel.relatedProducts(idProduct);
    const comments = await commentModel.getCommentOfProducts(idProduct, MAX_CMT_PER_PAGES);
    const countCMT = await commentModel.totalComment(idProduct);
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

    res.render('products/detail/detail', {productItems, allRelatedProducts, comments, countCmt : comments.length, AverageReview : average, totalPages});
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

exports.getCommentsAjax = async (req, res, next) => {
    let idProduct = req.body.idProduct;
    let pageIndex = req.body.pageIndex;

    //console.log(`${pageNumber}  ${nPerPage}`);
    // const productItems = await productModel.filter(sorted, nPerPage, pageNumber, searchText, priceMin, priceMax, filter, manufacturer);
    // const totalCount = await productModel.getTotalCount(searchText, priceMin, priceMax, filter, manufacturer);

    // //console.log(productItems);

    // let totalPage = Math.ceil(totalCount / nPerPage);
    // let isFirstPage = pageNumber === 1;
    // let isLastPage = pageNumber === totalPage;

    // let leftOverPage = 4;
    // let pageList = [];

    // //go backward
    // for(let i = pageNumber - 1; i >= pageNumber - (leftOverPage / 2) && i > 0; --i)
    // {
    //     pageList.push({
    //         index: i,
    //         isCurrentPage: false
    //     });
    //     leftOverPage--;
    // }

    // pageList.push({
    //     index: pageNumber,
    //     isCurrentPage: true
    // });

    // //go forward
    // for(let i = pageNumber + 1; i <= pageNumber + (leftOverPage / 2) && i <= totalPage; ++i)
    // {
    //     pageList.push({
    //         index: i,
    //         isCurrentPage: false
    //     });
    //     leftOverPage--;
    // }

    // //Check empty
    // let isNotEmpty = totalPage > 0;

    // let pageInfo = {
    //     totalCount,
    //     totalPage,
    //     currentPage: pageNumber,
    //     prevPage: pageNumber - 1,
    //     nextPage: pageNumber + 1,
    //     firstItemOfPage: totalPage > 0 ? (pageNumber - 1) * nPerPage + 1 : 0,
    //     lastItemOfPage: productItems.length < nPerPage ? (pageNumber - 1) * nPerPage +  productItems.length :  pageNumber * nPerPage,
    //     isFirstPage,
    //     isLastPage,
    //     pageList,
    //     isNotEmpty,
    // }

    // //partials = fs.readFileSync('./views/partials/productItems.hbs', {encoding:'utf8', flag:'r'});
    // console.log(pageInfo);
    // res.send({pageInfo, productItems});
}