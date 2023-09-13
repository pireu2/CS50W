document.addEventListener('DOMContentLoaded', () =>
{
    let post = document.querySelector('#post')
    if (post !== null){
        post.addEventListener('click', post)
    }
    getPosts()
});


function post() {
    document.querySelector('#post-form').onsubmit = (event) =>{
        event.preventDefault();
        const contentTextarea = document.querySelector('#content');
        const content = contentTextarea.value;
        const csrfToken = getCookie('csrftoken');

        fetch('/post', {
            method : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                content : content
            })
        })
        .then(response => response.json())
        .then(result => {
            if(result.status === 200){
                contentTextarea.value='';
            }
            else{
                document.querySelector('#error').innerHTML = result.error
            }
        })
        .catch(error => {
            console.log(error)
        });

        return false;
    }
}


function like(id){
    const csrfToken = getCookie('csrftoken');
    
}

function getPosts(){
    const csrfToken = getCookie('csrftoken');
    fetch('/get_posts', {
        method : 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
    })
    .then(response => response.json())
    .then(result => {
        result.forEach(post => {
            const div = document.createElement('div');
            div.className = 'post';
            div.innerHTML = `
            <div class="card mb-3">
                <h5 class="card-header"> 
                    <img src="/static/network/avatar.png" alt="Avatar Image" class="avatar">
                    ${post.author}
                </h5>
                <div class="card-body">
                    <p class="text-muted">${post.timestamp}</p>
                    <p class="card-text">${post.content}</p>
                    <p class="cart-text" id="like-block"> 
                        <img src="/static/network/like.png" alt="Like Image" class="like">
                        <span class="like-count">${post.likes}</span>
                    </p>
                    <a href="#" class="link-secondary">Comments</a>
                </div>
            </div>
            `;

            let isAuthenticated = false;
            if (document.querySelector('#post-form')){
                isAuthenticated = true;
            }
            


            if (isAuthenticated){
                const likeImage = div.querySelector('.like');
                let isliked = false;
                fetch(`/isliked/${post.id}`, {
                    method : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                })
                .then(response => response.json())
                .then(result => {
                    isliked = result.isliked;
                    if (isliked){
                        div.querySelector('.like').src = "/static/network/like-blue.png";
                    }
                    else{
                        div.querySelector('.like').src = "/static/network/like.png";
                    }
                })
                .catch(error => {
                    console.log(error);
                })

                likeImage.addEventListener('click', () => {
                    fetch(`/like/${post.id}`, {
                        method : 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrfToken
                        },
                    })
                    .then(response => response.json())
                    .then(result => {
                        div.querySelector('.like-count').innerHTML = `${result.likes}`;
                        image = div.querySelector('.like');
                        isliked = !isliked;
                        if (isliked){
                            image.src = "/static/network/like-blue.png";
                        }
                        else{
                            image.src = "/static/network/like.png";
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    })
                });
            }

            document.querySelector('#posts').append(div);
            
        })
    })
    .catch(error =>{
        console.log(error);
    })
}

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