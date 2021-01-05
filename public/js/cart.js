$(document).on('click', '.btn-remove', function() {
    let data = {
        id: this.id,
    };
    sendRequest(data);
    return;
});
function sendRequest(data) {
    $.post('/cart', data, (result, status) => {
        document.body.innerHTML = result;
    })
}