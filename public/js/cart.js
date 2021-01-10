$(document).on('click', '.btn-remove', function() {
    let data = {
        id: this.id,
    };
    sendRequest(data);
    return;
});

function sendRequest(data) {
    $.post('/cart', data, (result, status) => {
        let cartSource   = result.cartPartial;
        console.log(cartSource);
        let template = Handlebars.compile(cartSource);
        //console.log(template);
        let htmlCartCompiled = template(result);
        document.getElementById("cart_items").innerHTML = htmlCartCompiled;
        document.getElementById("go_to_cart").innerHTML = result.cartCount;
    })
}