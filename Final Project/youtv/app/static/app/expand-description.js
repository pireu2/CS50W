document.addEventListener('DOMContentLoaded', ()=>{
    const descriptionContainer = document.querySelector('.description-container');
    const description = document.querySelector('.description');
    const moreButton = document.querySelector('.more-button');

    const descriptionHeight = description.scrollHeight;
    const maxHeight = 100;
  
    if (descriptionHeight > maxHeight) {
      descriptionContainer.style.maxHeight = `${maxHeight}px`;
      moreButton.style.display = 'block'; 
      descriptionContainer.classList.add('transparency-gradient-text')
    }

    moreButton.addEventListener('click', function () {
        if (moreButton.textContent === '...more') {
          descriptionContainer.style.maxHeight = `${descriptionHeight}px`;
          moreButton.textContent = 'show less';
          descriptionContainer.classList.remove('transparency-gradient-text');
        } else {
          descriptionContainer.style.maxHeight = `${maxHeight}px`;
          moreButton.textContent = '...more';
          descriptionContainer.classList.add('transparency-gradient-text');
        }
        console.log(descriptionContainer.style.maxHeight);
      });
});