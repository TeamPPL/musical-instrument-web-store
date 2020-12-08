
const bcrypt = require('bcrypt');
const accountModel = require('../models/accountModel');
const cloudinary = require('../cloudinary/cloudinary');
const fs = require('fs');
const formidable = require('formidable');

exports.index = async (req, res, next) => {
    let username = req.user.username;
    console.log(username);
    let account = await accountModel.findByUsername(username);

    console.log(account);
    res.render('user/accountInfo', {account});
}

exports.getLogin = (req, res, next) => {
    res.render('user/login');
};

exports.getSignup = (req, res, next) => {
    res.render('user/signup');
};

exports.createNewAccount = async (req, res, next) => {
    const name = req.body.name;
    const username = req.body.username;
    const password = req.body.password;
    const phone = req.body.phone;
    const email = req.body.email;

    let account = await accountModel.findByUsername(username);

    if (account !== null) 
    {
        //Ton tai username roi
    } else {
        //Chua co username nay
        let hash = bcrypt.hashSync(password, 10);
        let accountInfos = {
            "username": username,
            "password": hash,
            "name": name,
            "phone": phone,
            "email": email,
            "createdDate": new Date(),
            "modifiedDate": new Date()
        };

        accountModel.insertOne(accountInfos);
    }

    next();
}

exports.updateAccountInfo = async (req, res, next) => {
    const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    if (files) {
      let avatar;
      let temp_path = files.cover.path;
      if (files.cover.size === 0) {
          avatar = 0;
      } else {
        let upload = await cloudinary.uploader.upload(temp_path, {folder: "imgdb"}, function(error, result) {
            console.log(result, error);
          });
        avatar = upload.secure_url;
      }
      
      const name = fields.name;
      const email = fields.email;
      const username = fields.username;
      const phone = fields.phone;
    
      let updatedAccount = {
          name,
          email,
          username,
          phone,
          "modifiedDate": new Date()
      };
      if (avatar !== 0) {
        updatedAccount.avatar = avatar;
      }
      try {
        let result = await accountModel.updateAAccount(updatedAccount);
        //var message="ADDED SUCCESSFULLY";
        //res.render('products/addproduct',{productDetail,message});
        console.log(result);
        res.redirect('/user');
      }
      catch(err){
        
      }  
    }
    await console.log(upload.secure_url);
  });

}