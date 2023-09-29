document.addEventListener('DOMContentLoaded', () =>{
    const profile = document.querySelectorAll('#redirect')
    profile.forEach(element => {
        element.addEventListener('click', () =>{
            username = element.getAttribute('data-username');
            window.location.href= `/profile/${username}`;
        });
    });
});