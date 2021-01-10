const {db} = require('../dal/db');

exports.insertOne = async (receipt) => {
    const accountCollection = db().collection('receipt');
    try {
      await accountCollection.insertOne(receipt);
    } catch (err) {
      return console.log('Database Connection Error!', err.message);
    }
}