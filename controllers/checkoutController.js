//const { param, checkout } = require("../routes");
const productModel = require('../models/productModel');
const checkoutModel = require('../models/checkoutModel');
const fs = require('fs');

exports.index = async (req, res, next) =>{
    const cart = new Cart(req.session.cart? req.session.cart : {});
    let cartItems = cart.generateArray();
    res.render('shopping-cart/cart', {cartItems});
}

function Cart(oldCart) {
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;

    this.add = function(item, id) {
        let storedItem = this.items[id];
        if (!storedItem){
            storedItem = this.items[id] = {item: item, qty: 0, price: 0};
        }
        storedItem.qty++;
        storedItem.price = (parseFloat(storedItem.item.price) - parseFloat(storedItem.item.discount?storedItem.item.discount:0)) * parseInt(storedItem.qty);

        this.updateQuantity();
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
        console.log(this.totalPrice);
    }

    this.update = function(id, new_quantity) {
        this.items[id].qty = parseInt(new_quantity);
        this.items[id].price = (parseFloat(this.items[id].item.price) - parseFloat(this.items[id].item.discount?this.items[id].item.discount:0))* this.items[id].qty;
        this.updateQuantity();
    }

    this.remove = function(id){
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
    const id = req.params.id;
    const cart = new Cart(req.session.cart? req.session.cart : {});

    const productItem = await productModel.findById(id);
    cart.add(productItem, productItem._id);

    req.app.locals.cartCount = cart.totalQty;

    req.session.cart = cart;
    let cartItems = cart.generateArray();

    console.log(cartItems);
    //res.render('shopping-cart/cart', {cartItems});
     res.redirect('/');
}

exports.updateCart = async (req,res,next)=>{
    const mode = parseInt(req.body.mode);
    const id = req.body.id;
    const cart = new Cart(req.session.cart? req.session.cart : {});

    if (mode == 0){
        cart.remove(id);
    }
    else if (mode == 1){
        const qty= req.body.qty;
        cart.update(id,qty);
    }
    else {
        res.send('Error 500');
    }

    req.app.locals.cartCount = cart.totalQty;

    let cartPartial = fs.readFileSync('./views/partials/cartItems.hbs', {encoding:'utf8', flag:'r'});
    let cartItems = cart.generateArray();

    let cartCount = cart.totalQty;
    res.send({cartPartial, cartItems, cartCount});
}