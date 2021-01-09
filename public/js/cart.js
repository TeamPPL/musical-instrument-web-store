$(document).on('click', '.btn-remove', function() {
    let data = {
        mode: 0,
        id: this.id,
    };
    sendRequest(data);
    return;
});

Handlebars.registerHelper("minus", function(a,b) {return a - b;});

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
$('#cart_items').on('keyup keypress', function(e) {
    var keyCode = e.keyCode || e.which;
    if (keyCode === 13) { 
      e.preventDefault();
      return false;
    }
  });
$(document).on('change', '.cart-quantity', function() {
    document.getElementsByClassName('item_total_price')[0].innerHTML = 1;
    let data = {
        mode: 1,
        id: this.id,
        qty: this.value
    };
    sendRequest(data);
    return;
});
  