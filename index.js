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

    const item = document.createElement("div");
    item.className = "menu-block";
    item.id = obj.id

    const name = document.createElement("div");
    name.className = "title";
    name.innerHTML = `${obj.name} (ABV ${obj.abv}%)`;

    const subtitle = document.createElement("div");
    subtitle.className = "subtitle";
    subtitle.innerHTML = obj.tagline
    console.log('hello')

    caption.append(name, subtitle);
    item.append(caption);
    item.classList.add('menu-block');
    list.append(item);
}

function fetchBrewContent() {
    BREW_FETCH.then(o => o.forEach(renderListBrew))
}

function renderListBrew(obj) {
    const list = document.querySelector("div#menu-container");
    const caption = document.createElement("div");
    caption.className = "caption";

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
    item.addEventListener("click", fetchBrewDetails)
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
                console.log(lat, lng);
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
        console.log(beerFetch)
        clearList();
        removeMarkers();
        beerFetch.then(o => o.forEach(renderListBeer))
    }
}

//used to fetch add'l details for content section
function fetchBrewDetails(e) {
    console.log(e.target)
    fetch(BREW_URL + `/${e.target.id}`)
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

        try { 
            map.panTo({lat: parseFloat(obj.latitude), lng: parseFloat(obj.longitude)})
        } catch {
            alert('No geolocation data available for this brewery.')
        }
        
    })
}

function formSwapHandler(e){
    clearList()

    if (e.target.value === 'beer') {
        //hide the map
        document.querySelector('#map').style.display = 'none'
    } else {
        //bring the map back
        document.querySelector('#map').style.display = 'block'
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