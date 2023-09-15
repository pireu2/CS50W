document.addEventListener('DOMContentLoaded', () =>
{
    const isAuthenticated = checkAuthentication();
    const isOnProfile = checkProfile();
    const isOnFollowing = checkFollowing();
    if (isAuthenticated && !isOnProfile){
        document.addEventListener('click', post)
    }
    if (isOnProfile){
        if (isAuthenticated){
            getPostsByUser(profile)
            document.querySelector('#follow-button').addEventListener('click', follow)
        }
        else{
            getPostsByUser(profile);
        }
    }
    else if (isOnFollowing){
        getFollowingPosts();
    }
    else{

        getPosts();
    }
});

function checkFollowing(){
    postfield = document.querySelector('#posts');
    following = postfield.getAttribute('data-following');
    if (following === 'true'){
        return true;
    }
    else{
        return false;
    }
}

function checkProfile(){
    postfield = document.querySelector('#posts');
    profile = postfield.getAttribute('data-user');
    return profile;
}

function follow(){
    currentUser = document.querySelector('#posts').getAttribute('data-current-user');
    profileUser = document.querySelector('#posts').getAttribute('data-user');
    const csrfToken = getCookie('csrftoken');
    if (currentUser == profileUser){
        return;
    }
    button = document.querySelector('#follow-button');
    buttonValue = button.value;
    if (button.value === 'Follow'){
        fetch(`/follow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                user_to_follow : profileUser
            })
        })
        .then(response => response.json())
        .then(result => {
            if(result.status === 200){
                console.log(result.message)
                button.value = 'Unfollow';
                let followers = parseInt(document.querySelector('#followers').innerHTML);
                followers++;
                document.querySelector('#followers').innerHTML = followers;
            }
            else{
                document.querySelector('#error').innerHTML = result.error
            }
        })
        .catch(error => {
            console.log(error)
        });
    }
    else if (buttonValue === 'Unfollow'){
        fetch(`/unfollow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                user_to_unfollow : profileUser
            })
        })
        .then(response => response.json())
        .then(result => {
            if(result.status === 200){
                console.log(result.message)
                button.value = 'Follow';
                let followers = parseInt(document.querySelector('#followers').innerHTML);
                followers--;
                document.querySelector('#followers').innerHTML = followers;
            }
            else{
                document.querySelector('#error').innerHTML = result.error
            }
        })
        .catch(error => {
            console.log(error)
        });  
    }
}

function post() {
    postform = document.querySelector('#post-form')
    if (postform){
        postform.onsubmit = (event) =>{
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
            <p id="post-content"  class="card-text">${post.content}</p>
            <p class="card-text" id="button-place"></p>
            <p class="card-text" id="like-block"> 
                <img src="/static/network/like.png" alt="Like Image" class="like">
                <span class="like-count">${post.likes}</span>
            </p>
        </div>
    </div>
    `;
    currentUser = document.querySelector('#posts').getAttribute('data-current-user')
    if (currentUser === post.author) {
        const buttonPlace = div.querySelector('#button-place');
        buttonPlace.innerHTML = '<button id="edit-button" class="btn btn-secondary" style="width: 60px;">Edit</button>';
        const editButton = div.querySelector('#edit-button');
        
        editButton.addEventListener('click', () => {
            const contentPlace = div.querySelector('#post-content');
            const contentValue = contentPlace.innerHTML;
            contentPlace.innerHTML = `
                <textarea class="form-control mb-3" id="edit-body">${contentValue}</textarea>
                <button id="save-button" style="width: 60px;" class="btn btn-secondary">Save</button>
                <div id="error"></div>
            `;
            editButton.style.display = 'none';
            const saveButton = div.querySelector('#save-button');
            
            saveButton.addEventListener('click', () => {
                const editedContent = div.querySelector('#edit-body').value;
                // Send the edited content to the server for saving
                // You'll need to implement the server-side logic for saving the edited content
                // Once saved, you can update the UI with the edited content
                fetch(`/edit/${post.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                    body: JSON.stringify({
                        new_content : editedContent
                    })
                })
                .then(response => response.json())
                .then(result => {
                    if(result.status === 200){
                        contentPlace.innerHTML = editedContent;
                        editButton.style.display = 'inline-block';
                        console.log('Edit Success');
                    }
                    else{
                        div.querySelector('#error').innerHTML = result.error;
                    }
                })
                .catch(error => {
                    console.log(error)
                });
            });
        });
    }
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

function getFollowingPosts(){
    const csrfToken = getCookie('csrftoken');
    const postsContainer = document.querySelector('#posts');

    fetch('/get_posts_following', {
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