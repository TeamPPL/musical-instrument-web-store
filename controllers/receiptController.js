const receiptModel = require('../models/receiptModel');

exports.purchaseHistory = async (req, res, next) => {
    if (req.user == undefined){
         res.redirect('/');
         return;
    }
    let id = req.user._id;
    let receiptList = await receiptModel.userList(id);
    let Receipts = [];
    receiptList.forEach(item => {
        console.log(item);
        let newReceipt = {
            _id: item._id,
            name: item.info.name,
            createdDate: item.createdDate,
            totalPrice: item.totalPrice,
            status: ""
        }
        let newStatus = item.status;
        if (newStatus == 0){
            newReceipt.status = "Pending";
        } else if (newStatus == 1){
            newReceipt.status = "Delivering";
        } else if (newStatus == 2){
            newReceipt.status = "Delivered";
        } else if (newStatus == -1){
            newReceipt.status = "Canceled";
        } else {
            newReceipt.status = "Unknown";
        }
        Receipts.push(newReceipt);
    });

    res.render('receipt/purchaseHistory',{Receipts});
}