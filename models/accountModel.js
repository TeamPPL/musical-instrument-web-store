const ObjectId = require('mongodb').ObjectId;
const {db} = require('../dal/db');

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

exports.findAndModifyGoogle = async (info) => {
  const accountCollection = db().collection('account');

  //console.log(`${info} \n-------------------------------------------------------------\n ${email} `);
  let receivedInfo = {
    GoogleID: info.id,
    username: info._json.email,
    name: info.displayName,
    email: info._json.email,
    avatar: info._json.picture,
    provider: "google",
    createdDate: new Date(),
    modifiedDate: new Date()
  }

  let account = await accountCollection.findOneAndUpdate(
    { GoogleID: info.id },
    {
      $setOnInsert: receivedInfo,
    },
    {
      returnOriginal: false,
      upsert: true,
    }
  );
  //console.log(account);
  return account.value;
}

exports.findAndModifyFacebook = async (info) => {
  const accountCollection = db().collection('account');

  //console.log(`${info} \n-------------------------------------------------------------\n ${email} `);
  let receivedInfo = {
    FacebookID: info.id,
    username: info.email ? "facebookuser" + info.id : info.email,
    name: info.displayName,
    email: info.email,
    avatar: info.picture,
    phone: info.phone,
    provider: "facebook",
    createdDate: new Date(),
    modifiedDate: new Date()
  }

  let account = await accountCollection.findOneAndUpdate(
    { FacebookID: info.id },
    {
      $setOnInsert: receivedInfo,
    },
    {
      returnOriginal: false,
      upsert: true,
    }
  );
  //console.log(account);
  return account.value;
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