const ObjectId = require('mongodb').ObjectId;
const {db} = require('../dal/dal');
const cloudinary = require('../cloudinary/cloudinary');

exports.list = async () => {
    const accountCollection = db().collection('account');
    const accounts = await accountCollection.find({}).toArray();

    return accounts;
}

exports.findByUsername = async (name) => {
  const accountCollection = db().collection('account');
  console.log(name);
  const account = await accountCollection.findOne({
      username: name
  });

  return account;
}

exports.findById = async (id) => {
  const accountCollection = db().collection('account');
  let account = await accountCollection.findOne({
      _id: ObjectId(id)
  });
  
  return account;
}

exports.insertOne = async (accountInfos) => {
  const accountCollection = db().collection('account');
  try {
    await accountCollection.insertOne(accountInfos);
  } catch (err) {
    return console.log('Database Connection Error!', err.message);
}
}

exports.updateAAccount = async (updatedAccount) => {
  const accountCollection = db().collection('account');
  let result = undefined;

  try {
      result = await accountCollection.findOneAndUpdate(
          {
          username: updatedAccount.username
          },
          {
              $set : updatedAccount
          });
  } catch (err) {
      return console.log('Database Connection Error!', err.message);
  }
  return result;
}

exports.updateAvatar = async (temp_path) => {
  var upload = await cloudinary.uploader.upload(temp_path, {folder: "imgdb"}, function(error, result) {
    console.log(result, error);
  });
  return upload;
}