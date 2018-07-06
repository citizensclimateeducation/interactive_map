require('./styles/map_style.scss');
import bboxes from '../data/bboxes';
import controls from './lib/map_controls';
import mapInteraction from './lib/map_interactions';
const geoViewport = require('@mapbox/geo-viewport');
const mapboxgl = require('mapbox-gl');

mapboxgl.accessToken = 'pk.eyJ1IjoiYmhlcm1zZSIsImEiOiJjaml4YXFkMDEzZDFoM29yZmFsZDUyaXV2In0.G5NaeT25EJO5fx4nhrN9fA';
const styleURL = 'mapbox://styles/bhermse/cjiyrhxxj0g802smxpjwcrk42';
const mapId = 'bhermse.d7j45d9k'; // used by the click handler only

// Use GeoViewport and the window size to determine and appropriate center and zoom for the continental US
var continentalView = function(w,h) { return geoViewport.viewport([-128.8, 23.6, -65.4, 50.2], [w, h]); }
var continental = continentalView(window.innerWidth/2, window.innerHeight/2);

const stateSelect = document.querySelector('#state');
const possibleDistricts = controls.initializeControls();
controls.addListeners();

const map = new mapboxgl.Map({
   container: 'map',
   style: styleURL,
   center: continental.center,
   zoom: continental.zoom
});

map.on('load', function(){mapInteraction(map, possibleDistricts, geoViewport, bboxes)});