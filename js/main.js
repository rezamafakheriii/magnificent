
let typingTimer;  
let spinner;              
let doneTypingInterval = 600;  //time in ms (1 seconds)
let myInput = document.getElementById('top-search-input');
let submit_btn = document.getElementById('top-search');
let search_icon = document.getElementById('search-icon');
let top_form = document.getElementById('top-form-id');
let select_form = document.querySelector('.select-form');
let search_result_header = document.querySelector('.search-result-header h4');
let page_form = document.querySelector('.page-number');
let page_input = document.querySelector('.page-number-input');
let next_btn = document.querySelector('.next-btn');
let prev_btn = document.querySelector('.prev-btn');

function testInputNumber(value) {
    var number = Number(value);
    number = (number.length) >= 5 ? 1 : number;
    return number;
}

function escapeHtml(text) {
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
  
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}


function removeSpinner() {
    search_icon.src = './icons/search.svg';
    search_icon.classList.remove('spinner');
}

function addSpinner() {
    search_icon.src = './icons/loading.svg';
    search_icon.classList.add('spinner');
}


next_btn.addEventListener('click', (e) => {
    e.preventDefault();
    if(testInputNumber(page_input.value) >= 1) {
        page_input.value = testInputNumber(page_input.value) + 1;
        ajaxNavigation(escapeHtml(myInput.value), true, select_form.value, page_input.value);
    }
});

prev_btn.addEventListener('click', (e) => {
    e.preventDefault();
    if(testInputNumber(page_input.value) >= 2) {
        page_input.value = testInputNumber(page_input.value) - 1;
        ajaxNavigation(escapeHtml(myInput.value), true, select_form.value, page_input.value);
    }
});


select_form.addEventListener('change',(event) => {
    let sort_option = event.target.value;
    ajaxNavigation(escapeHtml(myInput.value), false, sort_option, page_input.value);
});

top_form.addEventListener('keypress', function (e) {
    var key = e.which || e.keyCode;
    if (key === 13) { // 13 is enter
        e.preventDefault();
        ajaxNavigation(escapeHtml(myInput.value));
    }
});

page_form.addEventListener('keypress', function (e) {
    let key = e.which || e.keyCode;
    if(key === 13) {
        e.preventDefault();
        ajaxNavigation(escapeHtml(myInput.value), true, select_form.value, page_input.value)
    }
})

//on keyup, start the countdown
myInput.addEventListener('keyup', (e) => {
    clearTimeout(typingTimer);
    clearTimeout(spinner);

    let userText = escapeHtml(myInput.value).replace(/\s+$/, '');

    var key = e.which || e.keyCode;
    if (key === 13) { // 13 is enter
        e.preventDefault();
        document.getElementById('searchResult').style.display = "none";
        removeSpinner();
        return;
    }

    if (escapeHtml(myInput.value) && userText !== '') {
        spinner = setTimeout(addSpinner, doneTypingInterval);
        typingTimer = setTimeout(searchQuery.bind(null, userText), doneTypingInterval);
    }
    if(escapeHtml(myInput.value) == '' || escapeHtml(myInput.value) == null) {
        document.getElementById('searchResult').style.display = "none";
        removeSpinner();
    }
});

//user is "finished typing," do something
function searchQuery (userInput) {
    let url = 'https://newsapi.org/v2/everything?' +
    `q=${encodeURI(userInput)}&` +
    'sortBy=popularity&' + 
    'pageSize=5&' + 
    'apiKey=b3be36840aec4d83a1529ebe495cff40';

    makeAjaxReq('GET', url);
}

// make ajax request 
function makeAjaxReq(method, url) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let jsonObj = JSON.parse(this.responseText);
            let articles = jsonObj.articles;
            changeSearchDom(articles);
        }
    };
    xhttp.open(method, url, true);
    xhttp.send();
}


function changeSearchDom(articles) {
    let search_result = document.getElementById('searchResult');
    let ul = document.getElementById('searchResultList');
    search_result.style.display = "block";
    var htmlNode = [];

    removeSpinner();
    if(articles.length !== 0) {
        articles.forEach(article => {
            htmlNode += `<ul><li>${article.title}</li></ul>`;
        });
    } else {
        search_result.style.display = "none";
        removeSpinner();
    }
    ul.innerHTML = htmlNode;
}






addEventListener('popstate', function (event) {
    event.preventDefault();
    var flag = false;    
    var query = getQueryVariable('q') || '';
    var sort = getQueryVariable('sort') || 'popularity';
    var pageNumber = getQueryVariable('page') || 1;

    select_form.value = sort;
    page_input.value = pageNumber;

    myInput.value = decodeURI(query);
    // var current_pos = document.documentElement.scrollTop;
    // document.body.scrollTop = current_pos; // For Safari
    // document.documentElement.scrollTop = current_pos;
    ajaxNavigation(query, flag, sort, pageNumber);
});

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURI(pair[0]) == variable) {
            return decodeURI(pair[1]);
        }
    }
}



function ajaxNavigation(userInput, flag = true, sort_option = 'popularity', pageNumber = 1) {
    let page_number = pageNumber;
    let sort = sort_option;
    const pageInfo = {
        title: null,
        url: location.href
    } 

    let newUrl = `?q=${encodeURI(userInput)}&sort=${sort}&page=${page_number}`;

    search_result_header.textContent = decodeURI(userInput) || 'همه مقالات';
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            if(flag) {history.pushState(pageInfo, "new title", encodeURI(newUrl));}
            let jsonObj = JSON.parse(this.responseText);
            let articles = jsonObj.articles;
            articlesList(articles);
        }
    };

    let url = 'https://newsapi.org/v2/everything?' +
    `q=${userInput}&` +
    `sortBy=${sort}&` + 
    'pageSize=12&' + 
    `page=${page_number}&` +
    'apiKey=b3be36840aec4d83a1529ebe495cff40';

    xhttp.open('GET', url, true);
    xhttp.send();
}


function articlesList(articles) {
    let articles_list = document.getElementById('articles_list');
    let htmlNode = [];
    articles.forEach(article => {
        htmlNode += `<div class="col-12 col-md-6 col-lg-4 p-0 p-md-2">
        <div class="articles-card">
            <div class="container-fluid">
                <div class="row" dir="rtl">
                    <div class="col-4 col-md-12 p-0">
                        <div class="img-wrapper">
                            <img src="${article.urlToImage}" alt="" width="100%">
                        </div>
                    </div>
                    <div class="col-8 col-md-12 px-3 pt-3 pb-2 text-section">
                        <div class="details text-right">
                            <span class="author">${article.author}</span>
                            -
                            <span class="time">${article.publishedAt}</span>    
                        </div>
                        <h2 class="text-right card-header-trim">${article.title}</h2>
                        <p class="description text-right d-none d-md-block">
                        ${article.description}
                        </p>
                        <div class="tags">
                            <a href="#">flexbox</a>
                            <a href="#">css</a>
                            <a href="#">grid</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`
    });

    articles_list.innerHTML = htmlNode;
}