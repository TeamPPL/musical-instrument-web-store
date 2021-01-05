const { param, checkout } = require("../routes");
const productModel = require('../models/productModel');

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
        storedItem.price = parseInt(storedItem.item.price) * storedItem.qty;
        
        // let new_quantity = 0;   
        // for (var item_id in this.items){
        //     new_quantity +=this.items[item_id].qty;
        // }
        // this.totalQty = new_quantity;

        this.updateQuantity();

        //this.totalPrice += parseInt(storedItem.item.price);
    }

    this.updateQuantity = function(){
        let new_quantity = 0; 
        let total = 0;  
        for (var item_id in this.items){
            let qty = this.items[item_id].qty;
            total += this.items[item_id].price * qty;
            new_quantity += qty;
        }
        this.totalPrice = total;
        this.totalQty = new_quantity;
    }

    // this.update = function(id, new_quantity) {
    //     this.items[id].qty = new_quantity;
    //     this.items[id].price = parseInt(this.items[id].item.price) * this.items[id].qty;
    // }

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

exports.removeCart = async (req,res,next)=>{
    const id = req.body.id;
    const cart = new Cart(req.session.cart? req.session.cart : {});

    cart.remove(id);
    req.app.locals.cartCount = cart.totalQty;

    let cartItems = cart.generateArray();

     res.redirect('/cart');;
}