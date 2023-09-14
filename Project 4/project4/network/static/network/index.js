document.addEventListener('DOMContentLoaded', () =>
{
    const isAuthenticated = checkAuthentication();
    const isOnProfile = checkProfile();
    if (isAuthenticated && !isOnProfile){
        document.addEventListener('click', post)
    }
    if (isOnProfile){
        getPostsByUser(profile)
    }
    else{
        getPosts()
    }
});

function checkProfile(){
    postfield = document.querySelector('#posts');
    profile = postfield.getAttribute('data-user');
    return profile;
}


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
                getPosts();
                console.log('da');
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


function checkAuthentication(){
    const isAuthenticatedDiv = document.querySelector('#is_authenticated');
    const isAuthenticated = isAuthenticatedDiv.getAttribute('data-isauthenticated')
    if (isAuthenticated === "True"){
        return true;
    }
    else{
        return false;
    }
}

function user(username){
    window.location.href = `/user/${username}`;
}

function renderPost(post, postsContainer){
    const csrfToken = getCookie('csrftoken');
    const div = document.createElement('div');
    div.className = 'post';
    div.innerHTML = `
    <div class="card mb-3">
        <h5 class="card-header">
            <div class="user" style="cursor: pointer; display: inline-block;">
                <img src="/static/network/avatar.png" alt="Avatar Image" class="avatar">
                ${post.author}
            </div> 
        </h5>
        <div class="card-body" >
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

    div.querySelector(".user").onclick = () =>{
        user(post.author)
    };


    const isAuthenticated = checkAuthentication();
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
    postsContainer.append(div);
}


function getPosts(){
    const csrfToken = getCookie('csrftoken');
    const postsContainer = document.querySelector('#posts');

    while (postsContainer.firstChild) {
        postsContainer.removeChild(postsContainer.firstChild);
    }

    fetch('/get_posts', {
        method : 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
    })
    .then(response => response.json())
    .then(result => {
        result.forEach(post => renderPost(post, postsContainer))
    })
    .catch(error =>{
        console.log(error);
    })
}

function getPostsByUser(username){
    const csrfToken = getCookie('csrftoken');
    const postsContainer = document.querySelector('#posts');

    while (postsContainer.firstChild) {
        postsContainer.removeChild(postsContainer.firstChild);
    }

    fetch(`/get_posts_by_user/${username}`, {
        method : 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
    })
    .then(response => response.json())
    .then(result => {
        result.forEach(post => renderPost(post, postsContainer))
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