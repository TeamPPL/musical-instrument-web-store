const { db } = require('../dal/db');

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
  let receipt = await receiptCollection.find({ userId: id }).toArray();
  return receipt;
}

exports.getReceiptsAtPage = async (pageNumber, nPerPage, id) => {
  const receiptCollection = db().collection('receipt');
  let receipts = await receiptCollection.find({ userId: id })
    .skip(pageNumber > 0 ? ((pageNumber - 1) * nPerPage) : 0)
    .sort({ createdDate: -1 })
    .limit(nPerPage)
    .toArray();
  return receipts;
}

exports.getTotalCount = async () => {
  const receiptCollection = db().collection('receipt')
  let totalNum = await receiptCollection.countDocuments();
  //console.log(totalNum);
  return totalNum;
}

exports.filter = async (sorted, nPerPage, pageNumber, id) => {
  const receiptCollection = db().collection('receipt');
  let sortQuery = {};

  if (sorted === "alphabet-asc") {
      sortQuery.totalPrice = 1;
  } else if (sorted === "alphabet-desc") {
      sortQuery.totalPrice = -1;
  } else if (sorted === "lastest") {
      sortQuery.createdDate = -1;
  } else if (sorted === "oldest") {
      sortQuery.createdDate = 1;
  }
  let receipt = await receiptCollection.find({ userId: id })
      .sort(sortQuery)
      .skip( pageNumber > 0 ? ( ( pageNumber - 1 ) * nPerPage ) : 0 )
      .limit(nPerPage)
      .toArray();
      
  return receipt;
}