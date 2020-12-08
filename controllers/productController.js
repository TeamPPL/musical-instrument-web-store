const exphbs = require('express-handlebars');
const fs = require('fs');

const productModel = require('../models/productModel');

var hbs = exphbs.create({
    extname: 'hbs',
    defaultView: 'index',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials/'
});

exports.index = async (req, res, next) => {
    let pageNumber = req.query.page;
    let nPerPage = req.query.show;

    if (pageNumber === "" || isNaN(pageNumber)) {
        pageNumber = 1;
    } else {
        pageNumber = parseInt(pageNumber);
        if (pageNumber <= 0)
            pageNumber = 1;
    }

    if (nPerPage === "" || isNaN(nPerPage)) {
        nPerPage = 9;
    } else {
        nPerPage = parseInt(nPerPage);
        if (nPerPage <= 0)
            nPerPage = 9;
    }

    //console.log(`${pageNumber}  ${nPerPage}`);
    const productItems = await productModel.getProductsAtPage(pageNumber, nPerPage);
    const totalCount = await productModel.getTotalCount();

    let totalPage = Math.ceil(totalCount / nPerPage);
    let isFirstPage = pageNumber === 1;
    let isLastPage = pageNumber === totalPage;

    let leftOverPage = 4;
    let pageList = [];

    //go backward
    for(let i = pageNumber - 1; i >= pageNumber - (leftOverPage / 2) && i > 0; --i)
    {
        pageList.push({
            index: i,
            isCurrentPage: false
        });
        leftOverPage--;
    }

    pageList.push({
        index: pageNumber,
        isCurrentPage: true
    });

    //go forward
    for(let i = pageNumber + 1; i <= pageNumber + (leftOverPage / 2) && i <= totalPage; ++i)
    {
        pageList.push({
            index: i,
            isCurrentPage: false
        });
        leftOverPage--;
    }

    //console.log(productItems);
    let pageInfo = {
        totalCount,
        totalPage,
        currentPage: pageNumber,
        prevPage: pageNumber - 1,
        nextPage: pageNumber + 1,
        firstItemOfPage: pageNumber > 0 ? (pageNumber - 1) * nPerPage + 1 : 1,
        lastItemOfPage: productItems.length < nPerPage ? (pageNumber - 1) * nPerPage +  productItems.length :  pageNumber * nPerPage - 1,
        isFirstPage,
        isLastPage,
        pageList
    }
    //console.log(pageInfo);
    res.render('products/products', {pageInfo, productItems});
};

exports.filter = async (req, res, next) => {
    let sorted = req.body.sorted;
    let nPerPage = req.body.nPerPage;
    let pageNumber = req.body.pageNumber;

    console.log(`${sorted} ${nPerPage}`);

    if (nPerPage === "" || isNaN(nPerPage)) {
        nPerPage = 9;
    } else {
        nPerPage = parseInt(nPerPage);
        if (nPerPage <= 0)
            nPerPage = 9;
    }
    if (pageNumber === "" || isNaN(pageNumber)) {
        pageNumber = 1;
    } else {
        pageNumber = parseInt(pageNumber);
        if (pageNumber <= 0)
            pageNumber = 1;
    }

    //console.log(`${pageNumber}  ${nPerPage}`);
    const productItems = await productModel.filter(sorted, nPerPage, pageNumber);
    const totalCount = await productModel.getTotalCount();

    //console.log(productItems);

    let totalPage = Math.ceil(totalCount / nPerPage);
    let isFirstPage = pageNumber === 1;
    let isLastPage = pageNumber === totalPage;

    let leftOverPage = 4;
    let pageList = [];

    //go backward
    for(let i = pageNumber - 1; i >= pageNumber - (leftOverPage / 2) && i > 0; --i)
    {
        pageList.push({
            index: i,
            isCurrentPage: false
        });
        leftOverPage--;
    }

    pageList.push({
        index: pageNumber,
        isCurrentPage: true
    });

    //go forward
    for(let i = pageNumber + 1; i <= pageNumber + (leftOverPage / 2) && i <= totalPage; ++i)
    {
        pageList.push({
            index: i,
            isCurrentPage: false
        });
        leftOverPage--;
    }
    
    let pageInfo = {
        totalCount,
        totalPage,
        currentPage: pageNumber,
        prevPage: pageNumber - 1,
        nextPage: pageNumber + 1,
        firstItemOfPage: pageNumber > 0 ? (pageNumber - 1) * nPerPage + 1 : 1,
        lastItemOfPage: productItems.length < nPerPage ? (pageNumber - 1) * nPerPage +  productItems.length :  pageNumber * nPerPage - 1,
        isFirstPage,
        isLastPage,
        pageList
    }

    partials = fs.readFileSync('./views/partials/productItems.hbs', {encoding:'utf8', flag:'r'});
    console.log(pageInfo);
    res.send({partials, pageInfo, productItems});
    /*
    res.render('partials/productItems', { 
        pageInfo, 
        productItems
    });*/
    /*
    layout : false,
        data : {
            pageInfo, 
            productItems
        }
    });*/
};