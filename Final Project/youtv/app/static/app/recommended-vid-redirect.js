document.addEventListener('DOMContentLoaded', () =>{
    const recommendedVids = document.querySelectorAll('.recommended-vid');

    recommendedVids.forEach(element => {
        element.addEventListener('click', () => {
            const videoId = element.getAttribute('data-video');

            window.location.href = `/watch/${videoId}`;
        });
    });
});