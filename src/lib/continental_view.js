const geoViewport = require('@mapbox/geo-viewport');

// Use GeoViewport and the window size to determine and appropriate center and zoom for the continental US
const continentalView = function(w,h) { return geoViewport.viewport([-128.8, 23.6, -65.4, 50.2], [w, h]); }

module.exports = {
   continentalView: continentalView,
   continental: continentalView(window.innerWidth/2, window.innerHeight/2)
};