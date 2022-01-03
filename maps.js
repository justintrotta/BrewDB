let map

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 41.85003, lng: -87.65005 },
    
    zoom: 9,
  })
}