const exphbs = require('express-handlebars');
const fs = require('fs');

const productModel = require('../models/productModel');
const { search } = require('../routes');

var hbs = exphbs.create({
    extname: 'hbs',
    defaultView: 'index',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials/'
});

exports.getProductsGET = async (req, res, next) => {

    let sorted = req.query.sorted;
    let nPerPage = req.query.nPerPage;
    let pageNumber = req.query.pageNumber;
    let searchText = req.query.search;
    let priceMin = req.query.priceMin;
    let priceMax = req.query.priceMax;
    let filter = req.query.filter;
    let manufacturer = req.query.manufacturer;


    //Default pageNum
    if (pageNumber === "" || isNaN(pageNumber)) {
        pageNumber = 1;
    } else {
        pageNumber = parseInt(pageNumber);
        if (pageNumber <= 0)
            pageNumber = 1;
    }

    //Default item per page
    if (nPerPage === "" || isNaN(nPerPage)) {
        nPerPage = 9;
    } else {
        nPerPage = parseInt(nPerPage);
        if (nPerPage <= 0)
            nPerPage = 9;
    }

    //Default sort type
    if (sorted)
    {
        if (sorted !== "alphabet-asc" && sorted !== "alphabet-desc" && sorted !== "lastest" && sorted !== "oldest")
        {
            req.flash("error", "Wrong type of sorting!");
            res.redirect("/error");
        }
    } else {
        sorted = "alphabet-asc";
    }

    //Default prices
    if (priceMin && priceMax)
    {
        priceMin = priceMin.split("$")[1];
        priceMax = priceMax.split("$")[1];
        
        priceMin = parseInt(priceMin);
        priceMax = parseInt(priceMax);
    } else {
        priceMin = 0;
        priceMax = 9000;
    }

    //Default filter: all products
    if (!filter || filter === "")
    {
        filter = "all";
    }

    //Default manufacturer: all manufacturer
    if (!manufacturer || manufacturer === "")
    {
        manufacturer = "all"
    }

    //console.log(`${pageNumber}  ${nPerPage}`);
    const productItems = await productModel.filter(sorted, nPerPage, pageNumber, searchText, priceMin, priceMax, filter, manufacturer);
    const totalCount = await productModel.getTotalCount(searchText, priceMin, priceMax, filter, manufacturer);

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
    let isNotEmpty = totalPage > 0;
    //console.log(productItems);
    let pageInfo = {
        totalCount,
        totalPage,
        currentPage: pageNumber,
        prevPage: pageNumber - 1,
        nextPage: pageNumber + 1,
        firstItemOfPage: totalPage > 0 ? (pageNumber - 1) * nPerPage + 1 : 0,
        lastItemOfPage: productItems.length < nPerPage ? (pageNumber - 1) * nPerPage +  productItems.length :  pageNumber * nPerPage - 1,
        isFirstPage,
        isLastPage,
        pageList,
        isNotEmpty,
    }
    
    //filterOption
    let filterOption = {};

    switch (filter) {
        case "guitar":
            filterOption.isGuitar = true;
            break;
        case "violin":
            filterOption.isViolin = true;
            break;
        case "piano":
            filterOption.isPiano = true;
            break;
        case "drum":
            filterOption.isDrum = true;
            break;
        default:
            filterOption.isAll = true;
            break;
    }

    switch (manufacturer) {
        case "gibson":
            filterOption.isGibson = true;
            break;
        case "steinway":
            filterOption.isSteinway = true;
            break;
        case "sennheiser":
            filterOption.isSennheiser = true;
            break;
        case "yamaha":
            filterOption.isYamaha = true;
            break;
        case "roland":
            filterOption.isRoland = true;
            break;
        default:
            filterOption.isAllManufacturer = true;
            break;
    }

    res.render('products/products', {pageInfo, productItems, filterOption});
};

exports.getProductsAjax = async (req, res, next) => {
    let sorted = req.body.sorted;
    let nPerPage = req.body.nPerPage;
    let pageNumber = req.body.pageNumber;
    let searchText = req.body.search;
    let priceMin = req.body.priceMin;
    let priceMax = req.body.priceMax;
    let filter = req.body.filter;
    let manufacturer = req.body.manufacturer;

    //console.log(`${priceMin} ${priceMax}`);
    if (priceMin && priceMax)
    {
        priceMin = priceMin.split("$")[1];
        priceMax = priceMax.split("$")[1];
        
        priceMin = parseInt(priceMin);
        priceMax = parseInt(priceMax);
    } else{
        priceMin = 0;
        priceMax = 9000;
    }

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

    //Default filter: all products
    if (!filter || filter === '')
    {
        filter = "$all";
    }

    //Default manufacturer: all manufacturer
    if (!manufacturer || manufacturer === '')
    {
        manufacturer = "$all";
    }

    //console.log(`${pageNumber}  ${nPerPage}`);
    const productItems = await productModel.filter(sorted, nPerPage, pageNumber, searchText, priceMin, priceMax, filter, manufacturer);
    const totalCount = await productModel.getTotalCount(searchText, priceMin, priceMax, filter, manufacturer);

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

    //Check empty
    let isNotEmpty = totalPage > 0;

    let pageInfo = {
        totalCount,
        totalPage,
        currentPage: pageNumber,
        prevPage: pageNumber - 1,
        nextPage: pageNumber + 1,
        firstItemOfPage: totalPage > 0 ? (pageNumber - 1) * nPerPage + 1 : 0,
        lastItemOfPage: productItems.length < nPerPage ? (pageNumber - 1) * nPerPage +  productItems.length :  pageNumber * nPerPage - 1,
        isFirstPage,
        isLastPage,
        pageList,
        isNotEmpty,
    }

    //partials = fs.readFileSync('./views/partials/productItems.hbs', {encoding:'utf8', flag:'r'});
    console.log(pageInfo);
    res.send({pageInfo, productItems});
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