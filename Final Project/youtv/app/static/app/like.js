
document.addEventListener('DOMContentLoaded', () =>{
    const data = document.querySelector('#data');
    const isAuthenticated = data.getAttribute('data-isauthenticated');
    const videoId = data.getAttribute('data-video-id');
    const likeButton = document.querySelector('.like');
    const dislikeButton = document.querySelector('.dislike');
    if(isAuthenticated){
        likeButton.onclick = () => like(videoId);
        dislikeButton.onclick = () => dislike(videoId);
    }
});


function like(videoId){
    fetch(`/like/${videoId}`, {
        method : 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
    })
    .then(response => response.json())
    .then(result => {
        console.log(result.message)
        document.querySelector('.like-count').innerHTML = `${result.likes}`;
        const hasRed = document.querySelector('.like-icon').classList.contains('red');
        if(hasRed){
            document.querySelector('.like-icon').classList.remove('red');
        }
        else{
            document.querySelector('.like-icon').classList.add('red');
        }
        const isdisliked = document.querySelector('.dislike-icon').classList.contains('red');
        if(isdisliked && document.querySelector('.like-icon').classList.contains('red')){
            dislike(videoId);
        }
    })
    .catch(error => {
        console.log(error);
    })
}


function dislike(videoId){
    fetch(`/dislike/${videoId}`, {
        method : 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
    })
    .then(response => response.json())
    .then(result => {
        console.log(result.message)
        document.querySelector('.dislike-count').innerHTML = `${result.dislikes}`;
        const hasRed = document.querySelector('.dislike-icon').classList.contains('red');
        if(hasRed){
            document.querySelector('.dislike-icon').classList.remove('red');
        }
        else{
            document.querySelector('.dislike-icon').classList.add('red');
        }
        const isliked = document.querySelector('.like-icon').classList.contains('red');
        if(isliked && document.querySelector('.dislike-icon').classList.contains('red')){
            like(videoId);
        }
    })
    .catch(error => {
        console.log(error);
    })
}


