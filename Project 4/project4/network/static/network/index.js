document.addEventListener('DOMContentLoaded', () =>
{
    document.querySelector('#post').addEventListener('click', post)
});


function post() {
    document.querySelector('#post-form').onsubmit() = () =>{
        let content = document.querySelector('#content');
        fetch('/post', {
            method : 'POST',
            cotent : content
        })
        .then(response => response.json())
        .then(result => {
            if(result.message = 'Post Success'){
                content.value='';
            }
        });

        return false;
    }
}