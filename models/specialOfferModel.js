const ObjectId = require('mongodb').ObjectId;
const {db} = require('../dal/db');

exports.list = async () => {
    const specialOfferCollection = db().collection('special-offer');
    let specialOffers = await specialOfferCollection.find({}).toArray();

    return specialOffers;
}