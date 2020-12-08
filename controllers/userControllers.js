
const bcrypt = require('bcrypt');
const accountModel = require('../models/accountModel');

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
            "email": email
        };

        accountModel.insertOne(accountInfos);
    }

    next();
}

exports.accountInfo = (req, res, next) => {
    
}