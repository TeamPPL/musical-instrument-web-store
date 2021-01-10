
const fs = require('fs');
const formidable = require('formidable');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const accountModel = require('../models/accountModel');
const cloudinary = require('../cloudinary/cloudinary');
const { report } = require('../routes');
const storeToken = require('../authenticate/storeToken');
const { stringify } = require('querystring');
const utils = require('../authenticate/utils');
const mailTransporter = require('../mailer/mailer');

const saltRounds = 10;
const resetTokenExpireTime = 3600000; //1 hours

exports.index = async (req, res, next) => {
  let username = req.user.username;
  console.log(username);
  let account = await accountModel.findByUsername(username);

  console.log(account);
  res.render('user/accountInfo', {account});
}

exports.getLogin = (req, res, next) => {

  //Check isAuthenticated
  if (req.isAuthenticated())
  {
    res.redirect('/user');
  }
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

    if (account) 
    {
        //Account already exist, checked with ajax but still recheck here
        req.flash("error", "Username already exist!");
        res.redirect(req.get("referer"));
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
            "modifiedDate": new Date(),
            "isActivated": false,
            "isLocked": false,
        };

        accountModel.insertOne(accountInfos);
    }

    //Create token
    const token = crypto.randomBytes(32).toString('hex');
    let tokenInfos = {
      activateToken : token
    }

    accountModel.updateToken(email, tokenInfos);

    //Send activated mail!

    let data = {
      from: 'No-Reply Music Embassy <no-reply-musicembassy@musicembassy.com>',
      to: email,
      subject: 'Music Embassy Account Activation',
      html: `<h3>Welcome to Music Embassy!</h3> <br>
        <p>You are receiving this because you have registered to Music Embassy.</p>
        <p>Please click on the following link, or paste this into your browser to activate your account:</p>
        <a href="http://${req.headers.host}/user/activate/${token}"> Activate account </a>
        <p>Best wishes.<p>`,
    };

    mailTransporter.transporter.sendMail(data, function(error, info){
      if (error) {
        console.log(error);

        //Delete error account
        accountModel.removeAccount({username: username});

        req.flash('error', 'Unable to send email.');
        res.redirect('/error');
      } else {
        req.flash('message-info', 'An e-mail has been sent to ' + email + ' with further instructions.');
        res.redirect('/user/login');
      }
    });
  
}

exports.activateAccount = async (req, res, next) => {
  const token = req.params.token;

  let account = await accountModel.findByActivateToken(token);
  
  if (account)
  {

    if (account.isActivated)
    {
      req.flash("message-info", "Your account is already activated!");
      res.redirect('/user/login');
    }

    //Mark account as activated
    await accountModel.markTokenAsActivated(token);

    req.flash("message-info", "Account activate successfully!");
    res.redirect('/user/login');
  }
  else {
    //Error.
    req.flash("error", "Token expired!");
    res.redirect('/error');
  }

}

exports.updateAccountInfo = async (req, res, next) => {
    const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    if (files) {
      const name = fields.name;
      const email = fields.email;
      const username = fields.username;
      const phone = fields.phone;

      //Check available username
      let isAvailableUsernameAccount = await accountModel.findByUsername(username);

      if (isAvailableUsernameAccount && username !== req.user.username)
      {
        req.flash("error", "Username already exist!");
        res.redirect(req.get('referer'));
      }

      //Check email change
      if (email !== req.user.email)
      {
        req.flash("error", "You cannot change your registered email. If you wish to do so, please contact admin for help!");
        res.redirect(req.get('referer'));
      }

      //Upload image
      let avatar;
      let temp_path = files.cover.path;
      if (files.cover.size === 0) {
          avatar = 0;
      } else {
        let upload = await accountModel.updateAvatar(temp_path);
        avatar = upload.secure_url;
      }
      
    
      let updatedAccount = {
          name,
          //email,
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
      res.redirect('/user');
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

exports.checkSignupData = async (req, res, next) => {
  let email = req.body.email;
  let username = req.body.username;

  //Return status: -1 - empty input, 0 - account already exist, 1 - free to use email/username

  if (email === ""){
    res.send({status: -1});
  }

  if (username === ""){
    res.send({status: -1});
  }

  if (email !== "" && username !== "") {
    let usernameList = await accountModel.findByUsername(username);

    if (usernameList)
    {
      res.send({status: 0});
    }

    let emailList = await accountModel.findByEmail(email);

    if (emailList)
    {
      res.send({status: 0});
    }
  }

  res.send({status: 1});
}

exports.renderForgetPassword = async (req, res, next) => {
  res.render('user/forgetPassword');
}

exports.sendEmailResetPassword = async (req, res, next) => {
  const email = req.body.email
  const user = await accountModel.findByEmail(email);
  console.log(user);
  if (!user) {
    req.flash('error', 'This email address is not exists.');
    return res.redirect('/user/forgot');
  }
  const token = crypto.randomBytes(32).toString('hex');
  let tokenInfos = {
    resetPasswordToken : token,
    resetPasswordExpires : Date.now(),
  }

  accountModel.updateToken(email, tokenInfos);
    
  let data = {
    from: 'no-reply-musicembassy@musicembassy.com',
    to: email,
    subject: 'Music Embassy Account Password Reset',
    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
    'http://' + req.headers.host + '/user/reset/' + token + '\n\n' +
    'If you did not request this, please ignore this email and your password will remain unchanged.\n',
  };

  mailTransporter.transporter.sendMail(data, (err, info) => {
    if (err) {
      req.flash('error', 'Unable to send email.');
      res.redirect('/error');
    }

    req.flash('message-info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
    res.redirect('/user/forgot');
  });         
}

exports.renderResetPassword = async (req, res, next) => {
  const token = req.params.token;
  const account = await accountModel.findByResetToken(token);

  //Find token in DB.
  if (!account) {
    req.flash("error", "Token is not available!");
    res.redirect('/error');
  }
  //Check if token is expired or not?
  if (Date.now() - account.resetPasswordExpires > resetTokenExpireTime)
  {
    req.flash("error", "Reset link expired!");
    res.redirect('/error');
  }

  res.render('user/resetPassword', {token});
}

exports.resetPassword = async (req, res, next) => {
  const pass = req.body.password;
  const repass = req.body.repassword;
  const token = req.params.token;

  //Check is password and re-password are the same?
  if (pass != repass)
  {
    req.flash("error", "Password and Re-Password must be the same!");
    return res.redirect(req.get('referer'),);
  }
  //Hash password and save to DB.
  let hash = bcrypt.hashSync(pass, saltRounds);
  let account = await accountModel.updatePassword({resetPasswordToken: token}, hash);
  
  if (account)
  {
    //Change pass successfull.

    //Mark token so user can't use this link to change password anymore.
    await accountModel.markTokenAsDone(token);

    req.flash("message-info", "Password changed successfully!");
    res.redirect('/user/login');
  }
  else {
    //Error.
    req.flash("error", "Password changed failed!");
    res.redirect('/error');
  }

}

exports.changePassword = async (req, res, next) => {
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;
  const comfirmNewPassword = req.body.reNewPassword;

  const username = req.user.username;
  const account = await accountModel.findByUsername(username);

  if (account)
  {
    if (!bcrypt.compareSync(currentPassword, account.password))
    {
      req.flash("error", "Current password doesn't match!");
      res.redirect(req.get('referer'));
    }
    
    //Check is password and re-password are the same?
    if (newPassword != comfirmNewPassword)
    {
      req.flash("error", "New Password and Comfirm New Password must be the same!");
      res.redirect(req.get('referer'));
    }
        
  }
  //Hash password and save to DB.
  let hash = bcrypt.hashSync(newPassword, saltRounds);
  let accountReturn = await accountModel.updatePassword({username: username}, hash);
  
  if (accountReturn)
  {
    //Change pass successfull.

    req.flash("message-info", "Password changed successfully!");
    res.redirect(req.get('referer'));
  }
  else {
    //Error.
    req.flash("error", "Password changed failed!");
    res.redirect(req.get('referer'));
  }

}