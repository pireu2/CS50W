const postsPerPage = 10;


document.addEventListener('DOMContentLoaded', () =>
{
    const isAuthenticated = checkAuthentication();
    const isOnProfile = checkProfile();
    const isOnFollowing = checkFollowing();
    if (isAuthenticated && !isOnProfile){
        document.addEventListener('click', post)
    }
    let followButton;
    if (isOnProfile) {
        getPostsByUser(isOnProfile)
        followButton = document.querySelector('#follow-button');
        if (followButton) {
            followButton.addEventListener('click', follow);
        }
    } else if (isOnFollowing) {
        getFollowingPosts();
    } else {

        getPosts();
    }
});

function checkFollowing(){
    let postfield = document.querySelector('#posts');
    let following = postfield.getAttribute('data-following');
    return following === 'true';
}

function checkProfile(){
    const postfield = document.querySelector('#posts');
    return postfield.getAttribute('data-user');
}

function follow(){
    const currentUser = document.querySelector('#posts').getAttribute('data-current-user');
    const profileUser = document.querySelector('#posts').getAttribute('data-user');
    const csrfToken = getCookie('csrftoken');
    if (currentUser === profileUser){
        return;
    }
    const button = document.querySelector('#follow-button');
    let buttonValue = button.value;
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
    const postform = document.querySelector('#post-form')
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
    return isAuthenticated === "True";
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
    const currentUser = document.querySelector('#posts').getAttribute('data-current-user')
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
                let image = div.querySelector('.like');
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

function getFollowingPosts(page = 1){
    const csrfToken = getCookie('csrftoken');
    const postsContainer = document.querySelector('#posts');

    while (postsContainer.firstChild) {
        postsContainer.removeChild(postsContainer.firstChild);
    }

    removeAllEventListeners(document.querySelector('#prev-button'));
    removeAllEventListeners(document.querySelector('#next-button'));

    fetch('/get_posts_following', {
        method : 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            page : page
        })
    })
    .then(response => response.json())
    .then(result => {
        result.data.forEach(post => renderPost(post, postsContainer))
        const totalPosts = result.total_posts;
        const totalPages = Math.ceil(totalPosts / postsPerPage);
        document.querySelector('#prev-button').disabled = page === 1;
        document.querySelector('#next-button').disabled = page === totalPages;
        document.querySelector('#prev-button').addEventListener('click', () => {
            if (page > 1) {
                getFollowingPosts(page - 1);
            }
        }); 
        document.querySelector('#next-button').addEventListener('click', () => {
            if (page < totalPages){
                getFollowingPosts(page + 1);
            }
        });
    })
    .catch(error =>{
        console.log(error);
    })
}

function removeAllEventListeners(element) {
    if(element === null){
        return;
    }
    const clonedElement = element.cloneNode(true);
    element.parentNode.replaceChild(clonedElement, element);
}


function getPosts(page = 1){
    const csrfToken = getCookie('csrftoken');
    const postsContainer = document.querySelector('#posts');

    while (postsContainer.firstChild) {
        postsContainer.removeChild(postsContainer.firstChild);
    }

    removeAllEventListeners(document.querySelector('#prev-button'));
    removeAllEventListeners(document.querySelector('#next-button'));

    fetch(`/get_posts`, {
        method : 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            page : page
        })
    })
    .then(response => response.json())
    .then(result => {
        result.data.forEach(post => renderPost(post, postsContainer))
        const totalPosts = result.total_posts;
        const totalPages = Math.ceil(totalPosts / postsPerPage);
        document.querySelector('#prev-button').disabled = page === 1;
        document.querySelector('#next-button').disabled = page === totalPages;
        document.querySelector('#prev-button').addEventListener('click', () => {
            if (page > 1) {
                getPosts(page - 1);
            }
        }); 
        document.querySelector('#next-button').addEventListener('click', () => {
            if (page < totalPages){
                getPosts(page + 1);
            }
        });
    })
    .catch(error =>{
        console.log(error);
    })
}

function getPostsByUser(username, page = 1){
    const csrfToken = getCookie('csrftoken');
    const postsContainer = document.querySelector('#posts');

    while (postsContainer.firstChild) {
        postsContainer.removeChild(postsContainer.firstChild);
    }

    removeAllEventListeners(document.querySelector('#prev-button'));
    removeAllEventListeners(document.querySelector('#next-button'));

    fetch(`/get_posts_by_user/${username}`, {
        method : 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            page : page
        })
    })
    .then(response => response.json())
    .then(result => {
        result.data.forEach(post => renderPost(post, postsContainer))
        const totalPosts = result.total_posts;
        const totalPages = Math.ceil(totalPosts / postsPerPage);
        document.querySelector('#prev-button').disabled = page === 1;
        document.querySelector('#next-button').disabled = page === totalPages;
        document.querySelector('#prev-button').addEventListener('click', () => {
            if (page > 1) {
                getPostsByUser(username, page - 1);
            }
        }); 
        document.querySelector('#next-button').addEventListener('click', () => {
            if (page < totalPages){
                getPostsByUser(username, page + 1);
            }
        });
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