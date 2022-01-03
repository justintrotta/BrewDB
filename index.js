document.addEventListener("DOMContentLoaded", () => {

    BEER_URL = "https://api.punkapi.com/v2/beers"
    BREW_URL = "https://api.openbrewerydb.org/breweries"
    const BEER_FETCH = fetch(BEER_URL).then(r => r.json());
    const BREW_FETCH = fetch(BREW_URL).then(r => r.json());
    console.log(BASE_FETCH)
    console.log(BREW_FETCH)

    fetchContent();

    function fetchContent() {
        BEER_FETCH.then(o => o.forEach(renderList))
    }
    
    function renderList(obj) {
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
        subtitle.innerHTML = obj.tagline;

        const img = document.createElement("img");
        img.className = "icon";
        img.src = obj.image_url;

        caption.append(name, subtitle);
        item.append(caption, img);
        list.append(item);

        list.addEventListener("click", (e) => {

        })

    }
})