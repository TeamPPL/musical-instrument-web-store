const {db} = require('../dal/db');

exports.insertOne = async (receipt) => {
    const receiptCollection = db().collection('receipt');
    try {
      await receiptCollection.insertOne(receipt);
    } catch (err) {
      return console.log('Database Connection Error!', err.message);
    }
}

exports.findById = async (id) => {
  const receiptCollection = db().collection('receipt');
  let receipt = await receiptCollection.findOne({
      _id: ObjectId(id)
  });
  return receipt;
}

exports.userList = async (id) => {
  const receiptCollection = db().collection('receipt');
  let receipt = await receiptCollection.find({userId: id}).toArray();
  return receipt;
}