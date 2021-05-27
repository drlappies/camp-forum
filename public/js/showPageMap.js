mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: campgroundGeo.coordinates,
    zoom: 12
});

map.addControl(new mapboxgl.NavigationControl(), 'bottom-left');

const popup = new mapboxgl.Popup({ offset: 25 })
    .setHTML(
        `<div>${campgroundTitle}</div><div>${campgroundLocation}</div>`
    );

const marker = new mapboxgl.Marker()
    .setLngLat(campgroundGeo.coordinates)
    .setPopup(popup)
    .addTo(map)