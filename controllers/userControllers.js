
const bcrypt = require('bcrypt');
const accountModel = require('../models/accountModel');
const cloudinary = require('../cloudinary/cloudinary');
const fs = require('fs');
const formidable = require('formidable');
const { report } = require('../routes');
const storeToken = require('../authenticate/storeToken');

const saltRounds = 10;

exports.index = async (req, res, next) => {
  let username = req.user.username;
  console.log(username);
  let account = await accountModel.findByUsername(username);

  console.log(account);
  res.render('user/accountInfo', {account});
}

exports.getLogin = (req, res, next) => {
  res.render('user/login', {message: req.flash('error')[0]});
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
        let hash = bcrypt.hashSync(password, saltRounds);
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

exports.logout = async (req, res, next) => {
  req.logout();
  res.clearCookie('remember_me');
  res.redirect(req.get('referer'));
}

exports.rememberMe = async (req, res, next) => {
    // Issue a remember me cookie if the option was checked
    if (!req.body.remember_me) { 
      return next(); 
    }
    //console.log(req.body.remember_me);
    console.dir(req.app.locals.tokens);
    storeToken.issueToken(req.app, req.user, function(err, token) {
      if (err) { return next(err); }
      res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 }); //7 days
      console.dir(req.app.locals.tokens);
      res.redirect(req.get('referer'));
      return next();
    });
}