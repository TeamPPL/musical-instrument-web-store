const {db} = require('../dal/db');

exports.insertOne = async (cartInfo) => {
    const accountCollection = db().collection('receipt');
    try {
      await accountCollection.insertOne(cartInfo);
    } catch (err) {
      return console.log('Database Connection Error!', err.message);
    }
}