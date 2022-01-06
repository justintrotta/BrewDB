//google maps initialization
let map;
let markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 	40.730610, lng: -73.935242},
    zoom: 10,
  });
}

//setting up variables to be reused in fetching from each API
const DB_URL = "http://localhost:3000/comments"
const BEER_URL = "https://api.punkapi.com/v2/beers"
const BREW_URL = "https://api.openbrewerydb.org/breweries"
const BEER_FETCH = fetch(BEER_URL).then(r => r.json());
const BREW_FETCH = fetch(BREW_URL).then(r => r.json());

//initialize the app with DOMContentLoaded evt handler and attach other preliminary evt handlers
document.addEventListener('DOMContentLoaded', () => {
    fetchBrewContent();
    addBeerCommentHandler();
    addBrewCommentHandler();

    document.querySelector('form#search')[0].addEventListener('change', formSwapHandler )
    document.querySelector('form#search')[1].addEventListener('change', formSwapHandler )
    document.querySelector("form#search").addEventListener('submit',searchHandler)
})

//fetch beer data from API for beer search
function fetchBeerContent() {
    BEER_FETCH.then(o => o.forEach(renderListBeer))
}

//render summary-level elements for display in search results panel for beer search
function renderListBeer(obj) {
    const list = document.querySelector("div#menu-container");

    const caption = document.createElement("div");
    caption.className = "caption";

    const searchIcon = document.createElement("img")
    searchIcon.src = './assets/search-solid.svg'
    searchIcon.id = 'search-icon'

    const item = document.createElement("div");
    item.className = "menu-block";
    item.id = obj.id;
    item.propertyName = obj.name;

    const name = document.createElement("div");
    name.className = "title";
    name.innerHTML = `${obj.name} (ABV ${obj.abv}%)`;

    const subtitle = document.createElement("div");
    subtitle.className = "subtitle";
    subtitle.innerHTML = obj.tagline

    //combine title and subtitle
    // put those inside the menu item
    caption.append(name, subtitle);
    item.append(caption);
    item.append(searchIcon)

    //give class for styling and add to list
    item.classList.add('menu-block');
    list.append(item);

    //show beer details when clicked
    searchIcon.addEventListener('click', fetchBeerDetails)
}

//fetch beer data from API for brewery search
function fetchBrewContent() {
    BREW_FETCH.then(o => o.forEach(renderListBrew))
}

//render summary-level elements for display in search results panel for brewery search
function renderListBrew(obj) {
    const list = document.querySelector("div#menu-container");
    const caption = document.createElement("div");
    caption.className = "caption";

    const searchIcon = document.createElement("img")
    searchIcon.src = './assets/search-solid.svg'
    searchIcon.id = 'search-icon'

    const item = document.createElement("div");
    item.className = "menu-block";
    item.id = obj.id;

    const name = document.createElement("div");
    name.className = "title";
    name.innerHTML = obj.name;

    const subtitle = document.createElement("div");
    subtitle.className = "subtitle";
    subtitle.innerHTML = `${obj.city}, ${obj.state}`;

    caption.append(name, subtitle);
    item.append(caption);
    item.append(searchIcon)

    item.classList.add('menu-block');
    list.append(item);

    const location = {lat: parseFloat(obj.latitude), lng: parseFloat(obj.longitude)}

    let marker = new google.maps.Marker({
        title: obj.name,
        position: location,
        map: map
    })

    markers.push(marker)

    //when user clicks on a search result, populate details section
    //also pan to result in the map view
    searchIcon.addEventListener('click', fetchBrewDetails)
}

//handle submit event for search form
//search for breweries if brewery search is selected
//else search for beers
function searchHandler(e) {
    e.preventDefault()

    let searchBar = document.querySelector("form");
    
    if (!!document.querySelector('form#search').searchToggle[1].checked) {
        //prepare to search for breweries
        e.preventDefault();
        let cityName = e.target[2].value;
        let cityLower = cityName.toLowerCase();
        let cityArr = cityLower.split(" ");
        let cityUrl = cityArr.join("_");
        const cityFetch = fetch(BREW_URL + `?by_city=${cityUrl}`).then(r => r.json());
        
        clearList();
        removeMarkers();
        cityFetch.then(o => o.forEach(renderListBrew))
        cityFetch.then(o => {
                let lat = parseFloat(o[0].latitude);
                let lng = parseFloat(o[0].longitude);
                // console.log(lat, lng);
                let location = {lat: lat, lng: lng};
                map.panTo(location)
            })
    } else {
        //prepare to search for beers
        e.preventDefault();
        let beerName = e.target[2].value;
        let beerLower = beerName.toLowerCase();
        let beerArr = beerLower.split(" ");
        let beerUrl = beerArr.join("_");

        const beerFetch = fetch(BEER_URL + `?beer_name=${beerUrl}`).then(r => r.json());
        
        clearList();
        removeMarkers();
        beerFetch.then(o => o.forEach(renderListBeer))
    }
}

//for beer search-- fetch detail-level data for the beer that is clicked
//this data is used to populate the details section on the right of the screen
function fetchBeerDetails(e) {
    const parentName = e.target.parentNode.propertyName
    const parentId = e.target.parentNode.id;
    fetch(BEER_URL + `/${parentId}`)
    .then(res => res.json())
    .then(obj => {
        const beerImg = document.querySelector("#detail-image")
        beerImg.style.display = 'block'
        beerImg.src = obj[0].image_url
        beerImg.style.height = '200px';

        const beerName = document.querySelector('#detail-beer-name')
        beerName.textContent = obj[0].name

        const tagline = document.querySelector('#detail-tagline')
        tagline.textContent = obj[0].tagline

        const desc = document.querySelector('#detail-description')
        desc.textContent = obj[0].description

        const since = document.querySelector('#detail-since')
        since.textContent = obj[0].first_brewed

        const abv = document.querySelector('#detail-abv')
        abv.textContent = obj[0].abv

        const ibu = document.querySelector('#detail-ibu')
        ibu.textContent = obj[0].ibu

        const tips = document.querySelector('#detail-tips')
        tips.textContent = obj[0].brewers_tips

        if (!!document.querySelector("#placeholder")) {
            document.querySelector("#placeholder").remove()
        }
    
        document.querySelector('#beer-details').style.display = 'flex'

                /* COMMENT SECTION */
        removeComments("beer");
        populateComments(parentName, "beer");      
        console.log(parentName)
    })
}

//for brewery search-- fetch detail-level data for the brewery that is clicked
//this data is used to populate the details section on the right of the screen
function fetchBrewDetails(e) {
    const parentId = e.target.parentNode.id;
    fetch(BREW_URL + `/${parentId}`)
    .then(res => res.json())
    .then(obj => {
        const name = document.querySelector('#detail-name')
        name.textContent = obj.name
        //need to pass the object ID on the element in order for the topic on posted comments to match the obj in the brew API
        name.dataset.id = obj.id

        const type = document.querySelector('#detail-type')
        type.textContent = obj.brewery_type

        const address = document.querySelector('#detail-address')
        address.textContent = obj.street

        const cityState = document.querySelector('#detail-city-state')
        cityState.textContent = `${obj.city}, ${obj.state}`

        const phone = document.querySelector('#detail-phone')
        phone.textContent = obj.phone

        const website = document.querySelector('#detail-website')
        website.textContent = obj.website_url
        website.href = obj.website_url
        
        if (!!document.querySelector("#placeholder")) {
            document.querySelector("#placeholder").remove()
        }

        try { 
            map.panTo({lat: parseFloat(obj.latitude), lng: parseFloat(obj.longitude)})
            map.setZoom(14)
        } catch {
            alert('No geolocation data available for this brewery.')
        }

        document.querySelector('#brewery-details').style.display = 'flex'

                /* COMMENT SECTION */
        removeComments("brew");
        populateComments(obj.id, "brew");//obj.name

    })
}

//when the search type (beer vs brewery) is toggled, style the UI accordingly
//hide irrelevant DOM components for the chosen search
function formSwapHandler(e){
    //remove search results from any previous search from the DOM
    clearList()

    if (e.target.value === 'beer') {
        //hide the map and the brewery details table
        document.querySelector('#map').style.display = 'none'
        document.querySelector('#details').style.height = '90vh'
        document.querySelector('#brewery-details').style.display = 'none'
        document.querySelector("#search-brew").placeholder = 'Enter keywords...'
    } else {
        //bring the map back and hide the beer details table
        document.querySelector('#map').style.display = 'block'
        document.querySelector('#detail-image').style.display = 'none'
        document.querySelector('#details').style.height = '40vh'
        document.querySelector('#beer-details').style.display = 'none'
        document.querySelector("#search-brew").placeholder = 'Enter city name...'
    }
}

//clear right side of screen
function clearBody() {
    const bodyContent = document.querySelector("div#content-section");
    while(bodyContent.firstChild) {bodyContent.removeChild(bodyContent.firstChild)};
}

//clear search results
function clearList() {
    const listContent = document.querySelector("div#menu-container");
    while(listContent.firstChild) {listContent.removeChild(listContent.firstChild)};
}

//remove markers from the map view (brewery search)
function removeMarkers() {
    for (i=0; i<markers.length; i++) {
        markers[i].setMap(null)
    }
}

//remove comments from the detail view
function removeComments(type) {
    // const comments = document.querySelector(`#${type}-comment`)
    const comments = document.querySelector(`#${type}-comment-section`)
    while(comments.firstChild) {comments.removeChild(comments.firstChild)};
}

//find and render comments for the selected beer/brewery in the detail view section
function populateComments(parentId, type) {
    fetch(DB_URL).then(r => r.json()).then(o => {
        console.log(parentId)
        
        const found = o.filter(i => i.topic === parentId );
        console.log(found)
        if (found) {
            const comment = document.querySelector(`td#${type}-comment-section`);
            
            for (i=0; i<found.length; i++) {
            // const singleComment = `${found[i].user}\n - Rating: ${found[i].rating}/5 - \n${found[i].comment}\n\n`;
            const singleComment = `"${found[i].comment}" -${found[i].user} (Rating: ${found[i].rating}/5)`;
            const commentEle = document.createElement("div");
            commentEle.textContent = singleComment;
            comment.append(commentEle);
            console.log(comment)
            }
        }
    })
}

//handle post new comment for beer
//'topic' for the POST must sync up with the id for the subject of the comment (i.e. the beer being reviewed) in order to correctly fetch
function addBeerCommentHandler() {
    const form = document.querySelector("form#beer-add-comment")

    form.addEventListener('submit', (e) => { 
        e.preventDefault();
        const topic = document.querySelector("#detail-beer-name").innerHTML;
        
        const ratingList = Array.from( document.querySelectorAll('form#beer-add-comment .rating-radio input') )
        const checked = ratingList.find(o => o.checked).value

        fetch(DB_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify({
                topic: topic,
                user: form[0].value,
                rating: checked,
                comment: form[8].value
            })

        })  
        .then((obj) => console.log(obj))
        e.target.reset()

        //then re-populate comments
        removeComments('beer')
        populateComments(topic, 'beer')
    })
}

//handle post new comment for brewery
//'topic' for the POST must sync up with the id for the subject of the comment (i.e. the brewery being reviewed) in order to correctly fetch
function addBrewCommentHandler() {    
    const form = document.querySelector("form#brew-add-comment")

    form.addEventListener('submit', (e) => { 
        e.preventDefault();
        const topic = document.querySelector("#detail-name").dataset.id;

        const ratingList = Array.from( document.querySelectorAll('form#brew-add-comment .rating-radio input') )
        const checked = ratingList.find(o => o.checked).value

        fetch(DB_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify({
                topic: topic,
                user: form[0].value,
                rating: checked,
                comment: form[8].value
            })

        })  
        .then((obj) => console.log(obj))
        e.target.reset()

        //then re-populate comments
        removeComments('brew')
        populateComments(topic, 'brew')
    })
}