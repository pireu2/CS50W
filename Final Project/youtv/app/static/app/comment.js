document.addEventListener('DOMContentLoaded', () =>{
    const data = document.querySelector('#data')
    const videoId = data.getAttribute('data-video-id');
    const currentUser = data.getAttribute('data-current-user-username');
    const isAuthenticated = data.getAttribute('data-isauthenticaed');
    if (!isAuthenticated){
        return;
    }
    const commentForm = document.querySelector('.comment-form');
    commentForm.onsubmit = (event) =>{
        event.preventDefault();
        const textArea = commentForm.querySelector('textarea') 
        let textAreaValue = textArea.value;
        if(textAreaValue === ''){
            return;
        }
        fetch(`/comment`, {
            method : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({
                    content : textAreaValue,
                    video_id: videoId
                })
        })
        .then(response => response.json())
            .then(result => {
                if(result.status === 200){
                    const newComment = document.querySelector('#new-comment');
                    newComment.innerHTML = `
                    <div class="comment pb-3">
                        <div style="display: flex; align-items: center; gap: 1.5rem; padding-top: 5px;">
                            <div class="avatar-container">
                                <img class="avatar" src="${result.avatarurl}">
                            </div>
                        </div>
                        <div class="comment-data pe-2">
                            <div style="display: flex; gap:1rem; vertical-align: middle; align-items: center;">
                                <div class="comment-username">
                                    ${currentUser}
                                </div>
                                <div class="comment-time">
                                    ${result.timestamp}
                                </div>
                            </div>
                            ${textAreaValue}
                        </div>
                    </div>`
                textArea.value='';
                document.querySelector('#comms').innerHTML =`${result.comments} comments`
                }
                else{
                    document.querySelector('#error').innerHTML = result.error;
                }
            })
            .catch(error => {
                console.log(error)
            });


        return false;
    } 
})