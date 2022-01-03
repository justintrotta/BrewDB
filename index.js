let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 	40.730610, lng: -73.935242},
    zoom: 8,
  });
}

    BEER_URL = "https://api.punkapi.com/v2/beers"
    BREW_URL = "https://api.openbrewerydb.org/breweries"
    const BEER_FETCH = fetch(BEER_URL).then(r => r.json());
    const BREW_FETCH = fetch(BREW_URL).then(r => r.json());
    console.log(BEER_FETCH)
    console.log(BREW_FETCH)

    fetchBrewContent();
    searchHandler();
    // formSwapHandler();
    

    function fetchBeerContent() {
        BEER_FETCH.then(o => o.forEach(renderList))
    }

    function fetchBrewContent() {
        BREW_FETCH.then(o => o.forEach(renderListBrew))
    }
    
    function renderListBrew(obj) {
        const list = document.querySelector("div#menu-panel");
        const caption = document.createElement("div");
        caption.className = "caption";

        const item = document.createElement("div");
        item.className = "menu-block";

        const name = document.createElement("div");
        name.className = "title";
        name.innerHTML = obj.name;

        const subtitle = document.createElement("div");
        subtitle.className = "subtitle";
        subtitle.innerHTML = `${obj.city}, ${obj.state}`;

        caption.append(name, subtitle);
        item.append(caption);
        list.append(item);

        const location = {lat: parseFloat(obj.latitude), lng: parseFloat(obj.longitude)}

        const marker = new google.maps.Marker({
            position: location,
            map: map
        })

        console.log(location)

        item.addEventListener("click", (e) => {

        })
    }

    function searchHandler() {
        let searchBar = document.querySelector("form#search");
        console.log(searchBar)
        searchBar.addEventListener("submit", (e) => {
            e.preventDefault();
            let cityName = e.target.value;
            cityName = cityName.toLowerCase();
            let cityArr = cityName.split(" ");
            cityName = cityArr.join("_");
            console.log(cityName);
        })
    }

    // function formSwapHandler(){
        // const beer = document.querySelector("beer button")
    //     // const brew = document.querySelector("brew button")

    //     beer.addEventListener("click", (e) => {
    //         clearBody();
    //         fetchBeerContent();
    //     })

    //     brew.addEventListener("click", (e) => {
    //         clearBody();
    //     })
    // }

    function clearBody(){
        const bodyContent = document.querySelector("div#content-section");
        while(bodyContent.firstChild) {bodyContent.removeChild(bodyContent.firstChild)};
    }

    function clearList(){
        const listContent = document.querySelector("div#menu-panel");
        while(listContent.firstChild) {listContent.removeChild(listContent.firstChild)};
    }

