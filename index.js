let map;
let markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 	40.730610, lng: -73.935242},
    zoom: 10,
  });
}

BEER_URL = "https://api.punkapi.com/v2/beers"
BREW_URL = "https://api.openbrewerydb.org/breweries"
const BEER_FETCH = fetch(BEER_URL).then(r => r.json());
const BREW_FETCH = fetch(BREW_URL).then(r => r.json());

document.addEventListener('DOMContentLoaded', () => {
    fetchBrewContent();
    // searchHandler();

    document.querySelector('form#search')[0].addEventListener('change', formSwapHandler )
    document.querySelector('form#search')[1].addEventListener('change', formSwapHandler )
    document.querySelector("form#search").addEventListener('submit',searchHandler)
})

function fetchBeerContent() {
    BEER_FETCH.then(o => o.forEach(renderListBeer))
}

function renderListBeer(obj) {
    const list = document.querySelector("div#menu-container");

    const caption = document.createElement("div");
    caption.className = "caption";

    const searchIcon = document.createElement("img")
    searchIcon.src = './assets/search-solid.svg'
    searchIcon.id = 'search-icon'

    const item = document.createElement("div");
    item.className = "menu-block";
    item.id = obj.id

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

    //give class and add to list
    item.classList.add('menu-block');
    list.append(item);

    //show beer details when clicked
    searchIcon.addEventListener('click', fetchBeerDetails)
}

function fetchBrewContent() {
    BREW_FETCH.then(o => o.forEach(renderListBrew))
}

function renderListBrew(obj) {
    const list = document.querySelector("div#menu-container");
    const caption = document.createElement("div");
    caption.className = "caption";

    const searchIcon = document.createElement("img")
    searchIcon.src = './assets/search-solid.svg'
    searchIcon.id = 'search-icon'

    const item = document.createElement("div");
    item.className = "menu-block";
    item.id = obj.id

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

function fetchBeerDetails(e) {
    fetch(BEER_URL + `/${e.target.parentNode.id}`)
    .then(res => res.json())
    .then(obj => {
        // console.log(obj[0])

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
    })
}

//used to fetch add'l details for content section
function fetchBrewDetails(e) {
    fetch(BREW_URL + `/${e.target.parentNode.id}`)
    .then(res => res.json())
    .then(obj => {
        const name = document.querySelector('#detail-name')
        name.textContent = obj.name

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
    })
}

function formSwapHandler(e){
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

function clearBody() {
    const bodyContent = document.querySelector("div#content-section");
    while(bodyContent.firstChild) {bodyContent.removeChild(bodyContent.firstChild)};
}

function clearList() {
    const listContent = document.querySelector("div#menu-container");
    // console.log(listContent)
    while(listContent.firstChild) {listContent.removeChild(listContent.firstChild)};
}

function removeMarkers() {
    for (i=0; i<markers.length; i++) {
        markers[i].setMap(null)
    }
}