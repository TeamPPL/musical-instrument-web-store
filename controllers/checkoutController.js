//const { param, checkout } = require("../routes");
const productModel = require('../models/productModel');
const receiptModel = require('../models/receiptModel');
const fs = require('fs');
const { session } = require('passport');

exports.index = async (req, res, next) =>{

  

    if (req.session.cart == undefined || req.app.locals.cartCount == 0 || req.app.locals.cartCount == undefined){
        res.render('shopping-cart/emptyCart');
        return;
    }

    const cart = new Cart(req.session.cart? req.session.cart : {});
    await cart.updateData();

    let cartItems = cart.generateArray();
    let totalPrice = cart.totalPrice;

    res.render('shopping-cart/cart', {cartItems, totalPrice});
}

function Cart(oldCart) {
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;

    this.updateData = async function() {
        for (var item_id in this.items){
            try{
                let product = await productModel.findById(item_id);
                this.items[item_id].item = await product;
                this.items[item_id].price = (parseFloat(this.items[item_id].item.price) -
                    parseFloat(this.items[item_id].item.discount?this.items[item_id].item.discount:0)) * parseInt(this.items[item_id].qty);
            }catch (err){
                console.log('item in cart failed update');
            }
        }
        //this.updateQuantity();
    }

    this.updateItemQuantity = async function(item,id){
        //item = await productModel.findById(id);
        let storedItem = this.items[id];
        if (!storedItem){
            storedItem = this.items[id] = {item: item, qty: 0, price: 0};
        }
        storedItem.qty--;
        //await this.updateData();
        storedItem.item = item;
        storedItem.price = (parseFloat(storedItem.item.price) -
            parseFloat(storedItem.item.discount?storedItem.item.discount:0)) * parseInt(storedItem.qty);

        this.updateQuantity();
        console.log(this.items);
    }

    this.add = async function(item, id) {
        //item = await productModel.findById(id);
        let storedItem = this.items[id];
        if (!storedItem){
            storedItem = this.items[id] = {item: item, qty: 0, price: 0};
        }
        storedItem.qty++;
        //await this.updateData();
        storedItem.item = item;
        storedItem.price = (parseFloat(storedItem.item.price) -
            parseFloat(storedItem.item.discount?storedItem.item.discount:0)) * parseInt(storedItem.qty);

        this.updateQuantity();
        console.log(this.items);
    }

    this.updateQuantity = function(){
        let new_quantity = 0; 
        let total = 0;  
        for (var item_id in this.items){
            let qty = this.items[item_id].qty;
            total += this.items[item_id].price;
            new_quantity += qty;
        }
        this.totalPrice = total;
        this.totalQty = new_quantity;
    }

    this.update = async function(id, new_quantity) {
        //await this.updateData();
        this.items[id].qty = parseInt(new_quantity);
        //this.items[id].price = (parseFloat(this.items[id].item.price) - parseFloat(this.items[id].item.discount?this.items[id].item.discount:0))* this.items[id].qty;
        await this.updateData();
        this.updateQuantity();
    }

    this.remove = async function(id){
        delete this.items[id];
        this.updateQuantity();
    }

    this.generateArray = function() {
        let arr = [];
        for (var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    }
}

exports.addToCart = async (req, res, next) => {
    const id = req.body.id;
    let cart = new Cart(req.session.cart? req.session.cart : {});

    const productItem = await productModel.findById(id);
    let item_name = productItem.title;

    if (productItem.inStock <= 0) {
        res.send({fail: 1, item_name});
        return;
    }

    await cart.add(productItem, productItem._id);

    if (cart.items[id].qty > cart.items[id].item.inStock) {
        await cart.updateItemQuantity(productItem, productItem._id);
        res.send({fail: 1, item_name});
        return;
    }

    req.app.locals.cartCount = cart.totalQty;

    req.session.cart = cart;
    //let item_name = cart.items[id].item.title;
    let item_qty = cart.items[id].qty;
    let item_total = cart.items[id].price;
    res.send({cartCount: cart.totalQty, item_name, item_qty, item_total});
}

exports.updateCart = async (req,res,next)=>{
    const mode = parseInt(req.body.mode);
    const id = req.body.id;
    const cart = new Cart(req.session.cart? req.session.cart : {});

    if (mode == 0){
        await cart.remove(id);
    }
    else if (mode == 1){
        let qty= req.body.qty;
        if (qty == ''){
            qty = "1";
        }
        await cart.update(id,qty);
    }
    else {
        res.send('Error 500');
        return;
    }

    req.session.cart = cart;
    req.app.locals.cartCount = cart.totalQty;

    let cartItems = cart.generateArray();

    let cartCount = cart.totalQty;
    let totalPrice = cart.totalPrice;

    if (req.session.cart == undefined || req.app.locals.cartCount == 0 || req.app.locals.cartCount == undefined){
        let empty = 1;
        res.send({empty});
        return;
    }
    let cartPartial = fs.readFileSync('./views/partials/cartItems.hbs', {encoding:'utf8', flag:'r'});
    res.send({cartPartial, cartItems, cartCount, totalPrice});
}


exports.billingDetail = async(req, res, next) => {              

    if (req.user == undefined){
         res.redirect('/user/login');
         return;
    }
    const cart = new Cart(req.session.cart? req.session.cart : {});
    cart.updateData();
    let cartItems = cart.generateArray();
    let totalPrice = cart.totalPrice;

    let userInfo = req.user;
    let user = {
        name: userInfo.name,
        phone: userInfo.phone,
        email: userInfo.email
    }
    res.render('shopping-cart/checkout/billingDetail',{cartItems, User: user, totalPrice});
}

exports.billingDetailUpdate = (req, res, next) => {
    const country_index = req.body.country;
    let shipping_fee = 31;
    if (country_index == 1){
        shipping_fee = 30;
    }
    else if (country_index == 2) {
        shipping_fee = 5;
    }
    else if (country_index == 3) {
        shipping_fee = 3;
    }
    res.send({shipping_fee});
}

exports.addReceipt = async (req, res, next) => {
    const cart = new Cart(req.session.cart? req.session.cart : {});
    await cart.updateData();
    for (var item_id in cart.items){
        if (cart.items[item_id].qty > cart.items[item_id].item.inStock){
            res.send('out of stock');
            return;
        }
    }

    for (var item_id2 in cart.items){
        var qty_changed = -cart.items[item_id2].qty
        productModel.updateStock(item_id2, qty_changed);
    }

    let orderItems = cart.generateArray();
    let total = cart.totalPrice;

    let newReceipt ={
        userId: req.user._id,
        info: req.body,
        createdDate: new Date(),
        status: 0,
        totalPrice: total,
        detail: orderItems
    }

    const country = req.body.country;
    let shipping_fee = 31;
    if (country == "other"){
        shipping_fee = 30;
    }
    else if (country == "america") {
        shipping_fee = 5;
    }
    else if (country == "vietnam") {
        shipping_fee = 3;
    }

    newReceipt.shipping_fee = shipping_fee;

    req.session.cart = null;
    req.app.locals.cartCount = null;

    console.log(newReceipt);
    await receiptModel.insertOne(newReceipt);
    res.redirect('/receipt/purchase-history');
}