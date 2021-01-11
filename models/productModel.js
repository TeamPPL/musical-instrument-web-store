const ObjectId = require('mongodb').ObjectId;
const {db} = require('../dal/db');

exports.list = async () => {
    const productsCollection = db().collection('product');
    let products = await productsCollection.find({}).toArray();
    //console.log(products);
    
    return products;
}

exports.findById = async (id) => {
    const productsCollection = db().collection('product');
    let product = await productsCollection.findOne({
        _id: ObjectId(id)
    });
    //console.log(id);
    //console.log(productsCollection);
    //console.log(products);
    
    return product;
}

exports.relatedProducts = async (id) => {
    const productsCollection = db().collection('product');
    let product = await productsCollection.findOne({
        _id: ObjectId(id)
    });

    let relatedProducts = await productsCollection.find({
        filter: product.filter
    }).toArray();
    //console.log(id);
    //console.log(productsCollection);
    //console.log(products);
    
    return relatedProducts;
}

exports.lastestProducts = async (id) => {
    const productsCollection = db().collection('product');
    let lastestProducts = await productsCollection.find({}).sort({createdDate: -1}).limit(8).toArray();
    //console.log(lastestProducts);
    return lastestProducts;
}

exports.getTotalCount = async (search) => {
    const productsCollection = db().collection('product');
    let products = await productsCollection.find({title: {'$regex' : new RegExp(search, "i") }})
    //let totalNum = await productsCollection.countDocuments();
    let totalNum = await products.count();
    //console.log(totalNum);
    return totalNum;
}

exports.getProductsAtPage = async (pageNumber, nPerPage) => {
    const productsCollection = db().collection('product');
    let products = await productsCollection.find({})
        .skip( pageNumber > 0 ? ( ( pageNumber - 1 ) * nPerPage ) : 0 )
        .sort({title: 1})
        .limit(nPerPage)
        .toArray();
    //console.log(products);
    return products;
}

exports.filter = async (sorted, nPerPage, pageNumber, search, minPrice, maxPrice) => {
    const productsCollection = db().collection('product');

    let sortQuery = {};

    if (sorted === "alphabet-asc") {
        sortQuery.title = 1;
    } else if (sorted === "alphabet-desc") {    
        sortQuery.title = -1;
    } else if (sorted === "lastest") {
        sortQuery.createdDate = -1;
    } else if (sorted === "oldest") {
        sortQuery.createdDate = 1;
    }

    if (!minPrice)
    {
        minPrice = 0;
    }
    
    if (!maxPrice)
    {
        maxPrice = 0;
    }

    console.log(`${minPrice} + ${maxPrice}`);

    let products = await productsCollection.find(
        {
            title: {
                '$regex' : new RegExp(search, "i") 
            },
            $and : [
                {sellPrice: { "$gte": minPrice}},
                {sellPrice: { "$lte": maxPrice}}
            ]
        } 
        )
        .sort(sortQuery)
        .skip( pageNumber > 0 ? ( ( pageNumber - 1 ) * nPerPage ) : 0 )
        .limit(nPerPage)
        .toArray();
        
        console.log(products);

    return products;
}

/*
return [
        {
            id: 1,
            title: 'Super Cool Guitar',
            cover: 'https://i.pinimg.com/564x/b1/f6/44/b1f6441229cedff6fcb5cbc8a10f35ae.jpg',
            filter: 'guitar',
            price: 999999,
            discount: 654985
        },
        {
            id: 2,
            title: 'Sherlock Violin',
            cover: 'https://i.pinimg.com/564x/cd/4e/24/cd4e2468a4ae1f5e01b27d49aee5aac2.jpg',
            filter: 'violin',
            price: 14022000,
            discount: 0
        },
        {
            id: 3,
            title: 'Heaven piano',
            cover: 'https://i.pinimg.com/564x/9f/75/c6/9f75c6bad3fbbd2683494b455e09ea2d.jpg',
            filter: 'piano',
            price: 50,
            discount: 0
        },
        {
            id: 4,
            title: 'Guitar',
            cover: 'https://i.pinimg.com/564x/15/7e/36/157e361ecf3de6940788e15110087f2e.jpg',
            filter: 'guitar',
            price: 50,
            discount: 48
        },
        {
            id: 5,
            title: 'Ultra piano',
            cover: 'https://i.pinimg.com/564x/a2/c2/29/a2c2296a3d3eb56795103ab7b94b98ff.jpg',
            filter: 'piano',
            price: 50,
            discount: 0
        },
        {
            id: 6,
            title: 'Guitar',
            cover: 'https://i.pinimg.com/564x/03/0e/c6/030ec6b6139cd55205116a036e22c3fa.jpg',
            filter: 'guitar',
            price: 50,
            discount: 0

        },
        {
            id: 7,
            title: 'Special drum',
            cover: 'https://i.pinimg.com/564x/72/24/51/72245132a2d200b5a7c17b2180d9a1fc.jpg',
            filter: 'drum',
            price: 50,
            discount: 0
        },
        {
            id: 8,
            title: 'Guitar',
            cover: 'https://i.pinimg.com/564x/16/6e/21/166e21e483d2060a623dabcb0faab152.jpg',
            filter: 'guitar',
            price: 50,
            discount: 30
        },
        {
            id: 9,
            title: 'Super Cool Guitar',
            cover: 'https://i.pinimg.com/564x/b1/f6/44/b1f6441229cedff6fcb5cbc8a10f35ae.jpg',
            filter: 'guitar',
            price: 999999,
            discount: 654985
        },
        {
            id: 10,
            title: 'Sherlock Violin',
            cover: 'https://i.pinimg.com/564x/cd/4e/24/cd4e2468a4ae1f5e01b27d49aee5aac2.jpg',
            filter: 'violin',
            price: 14022000,
            discount: 0
        },
        {
            id: 11,
            title: 'Heaven piano',
            cover: 'https://i.pinimg.com/564x/9f/75/c6/9f75c6bad3fbbd2683494b455e09ea2d.jpg',
            filter: 'piano',
            price: 50,
            discount: 0
        },
        {
            id: 12,
            title: 'Guitar',
            cover: 'https://i.pinimg.com/564x/15/7e/36/157e361ecf3de6940788e15110087f2e.jpg',
            filter: 'guitar',
            price: 50,
            discount: 48
        },
    ]
*/
