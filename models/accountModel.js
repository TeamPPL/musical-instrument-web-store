const ObjectId = require('mongodb').ObjectId;
const {db} = require('../dal/db');
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

exports.findByEmail = async (email) => {
  const accountCollection = db().collection('account');
  let account = await accountCollection.findOne({
      email: email
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
    username: info._json.email === null ? "facebookuser" + info.id : info._json.email,
    name: info.displayName,
    email: info._json.email,
    avatar: info.photos[0].value,
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

exports.updateAvatar = async (temp_path) => {
  var upload = await cloudinary.uploader.upload(temp_path, {folder: "imgdb"}, function(error, result) {
    console.log(result, error);
  });
  return upload;
}

exports.updateToken = async (email, tokenInfos) => {
  const accountCollection = db().collection('account');
  let result = undefined;

  try {
      result = await accountCollection.findOneAndUpdate(
          {
            email: email
          },
          {
            $set : tokenInfos
          });
  } catch (err) {
      return console.log('Database Connection Error!', err.message);
  }
  return result;
}

exports.findByResetToken = async (token) => {
  const accountCollection = db().collection('account');
  let account = await accountCollection.findOne({
    resetPasswordToken : token
  });
  
  return account;
}

exports.findByActivateToken = async (token) => {
  const accountCollection = db().collection('account');
  let account = await accountCollection.findOne({
    activateToken : token
  });
  
  return account;
}

exports.updatePassword = async (identifier, hashedPass) => {
  const accountCollection = db().collection('account');
  let result = undefined;

  try {
      result = await accountCollection.findOneAndUpdate(
          identifier,
          {
            $set : {
              password: hashedPass
            }
          });
  } catch (err) {
      return console.log('Database Connection Error!', err.message);
  }
  return result;
}

exports.markTokenAsDone = async (token) => {
  const accountCollection = db().collection('account');
  let result = undefined;

  try {
      result = await accountCollection.findOneAndUpdate(
          {
            resetPasswordToken: token
          },
          {
            $set : {
              resetPasswordToken: "done"
            }
          });
  } catch (err) {
      return console.log('Database Connection Error!', err.message);
  }
  return result;
}

exports.markTokenAsActivated = async (token) => {
  const accountCollection = db().collection('account');
  let result = undefined;

  try {
      result = await accountCollection.findOneAndUpdate(
          {
            activateToken: token
          },
          {
            $set : {
              isActivated: true
            }
          });
  } catch (err) {
      return console.log('Database Connection Error!', err.message);
  }
  return result;
}

exports.removeAccount = async (query) => {
  const accountCollection = db().collection('account');
  let result = await accountCollection.deleteOne({
    query
  });
  
  return result;
}