document.addEventListener("DOMContentLoaded", () => {

    BASE_URL = "https://api.openbrewerydb.org/breweries"
    const BASE_FETCH = fetch(BASE_URL).then(r => r.json());
    console.log(BASE_FETCH)

    fetchContent();

    function fetchContent() {
        BASE_FETCH.then(o => o.forEach(renderList))
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

        const location = document.createElement("div");
        location.className = "subtitle";
        location.innerHTML = `${obj.city}, ${obj.state}`;

        const favicon = `https://s2.googleusercontent.com/s2/favicons?domain=${obj.website_url}`;
        const img = document.createElement("img");
        img.className = "icon";
        img.src = favicon;

        caption.append(name, location);
        list.append(caption, img);



    }
})