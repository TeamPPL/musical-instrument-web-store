$(document).on('change', '#country-selector', function() {
    let country_index = document.getElementById("country-selector").selectedIndex;
    let data = {
        country: country_index
    }
    sendRequest(data);
    return;
});

function sendRequest(data) {
    $.post('/cart/checkout', data, (result, status) => {
        let shipping = parseFloat(result.shipping_fee);
        document.getElementById("shipping_fee").innerHTML = '$' + shipping.toString();
        let totalPrice = document.getElementById("total_price").innerHTML;
        totalPrice = totalPrice.substring(1);
        document.getElementById("total_payment").innerHTML ='$' + (parseFloat(totalPrice) - shipping).toString();
    })
}