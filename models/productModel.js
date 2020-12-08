const ObjectId = require('mongodb').ObjectId;
const {db} = require('../dal/dal');

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