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

        let isEmpty = result.empty;
        if (isEmpty == 1){
            document.getElementById('shopping-cart').innerHTML =`<section class="emty_cart_area p_100">
                                        <div class="container">
                                            <div class="emty_cart_inner">
                                                <i class="icon-handbag icons"></i>
                                                <h3>Your Cart is Empty</h3>
                                                <h4>back to <a href="/products">shopping</a></h4>
                                            </div>
                                        </div>
                                    </section>`;
            document.getElementById("go_to_cart").innerHTML = 0;
            return;
        }
        let cartSource   = result.cartPartial;
        let template = Handlebars.compile(cartSource);
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
    let data = {
        mode: 1,
        id: this.id,
        qty: this.value
    };
    sendRequest(data);
    return;
});