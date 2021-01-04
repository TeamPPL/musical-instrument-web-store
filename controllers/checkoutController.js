const { param } = require("../routes");
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
        var storedItem = this.items[id]
        if (!storedItem){
            storedItem = this.items[id] = {item: item, qty: 0, price: 0};
        }
        storedItem.qty++;
        storedItem.price = parseInt(storedItem.item.price) * storedItem.qty;
        this.totalQty++;
        this.totalPrice += parseInt(storedItem.item.price);
    }

    this.generateArray = function() {
        let arr = [];
        for (var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    }
}
const specialOfferModel = require('../models/specialOfferModel');
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