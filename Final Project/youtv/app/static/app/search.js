document.addEventListener('DOMContentLoaded', () =>{
    searchButton = document.querySelector('#search-button');
    searchButton.addEventListener('click', () =>{
        searchValue = document.querySelector('#search').value;
        if(searchValue === ''){
            return;
        }
        window.location.href= `/search/${searchValue}`;
    });
});