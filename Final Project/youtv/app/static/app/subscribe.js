document.addEventListener('DOMContentLoaded', () =>{
    const data = document.querySelector('#data');
    const isAuthenticated = data.getAttribute('data-isauthenticaed');
    const creator = data.getAttribute('data-creator-username');
    const currentUser = data.getAttribute('data-current-user-username');
    if(!isAuthenticated || (creator === currentUser)){
        return;
    }
    const subButton = document.querySelector('#subscribe');
    subButton.addEventListener('click', () =>{
        fetch(`/subscribe/${creator}`, {
            method : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
        })
        .then(response => response.json())
        .then(result => {
            console.log(result.message)
            document.querySelector('.subs').innerHTML = `${result.subs} subscribers`
            const isGrey = subButton.classList.contains('grey');
            if(isGrey){
                subButton.classList.remove('grey');
                subButton.value = 'Subscribe';
            }
            else{
                subButton.classList.add('grey');
                subButton.value = 'Subscribed';
            }
        })
        .catch(error => {
            console.log(error);
        })
    })
})


