


$(document).ready(function(){
    const container = document.querySelector('.rating');
    const items = container.querySelectorAll('.rating-item');
    
    container.onclick = e => {
        const elClass = e.target.classList;
        if(!elClass.contains('active')){
            items.forEach(
                item => item.classList.remove('active')
                );
                console.log(e.target.getAttribute('data-rate'));
                elClass.add('active');
                $('#postStar').val(e.target.getAttribute('data-rate'));
            }
        }
    // document.SubmitReview.Star.val(choosen);    
    // $('#postStar').val(choosen);
    // console.log("-->  "+ choosen)
    // document.getElementById("postStar").value = choosen;
});