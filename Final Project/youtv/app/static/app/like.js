const csrfToken = getCookie('csrftoken');

document.addEventListener('DOMContentLoaded', () =>{
    const likeBar = document.querySelector('.like-bar');
    const isAuthenticated = likeBar.getAttribute('data-isauthenticaed');
    const videoId = likeBar.getAttribute('data-id');
    if(isAuthenticated === 'True'){
        const like = document.querySelector('.like');
        like.addEventListener('click', () =>{
            fetch(`/like/${videoId}`, {
                method : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
            })
            .then(response => response.json())
            .then(result => {
                document.querySelector('.like-count').innerHTML = `${result.likes}`;
            })
            .catch(error => {
                console.log(error);
            })
        });
    }

});


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}