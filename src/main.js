require('./styles/map_style.scss');
import controls from './lib/map_controls';
import mapInteraction from './lib/map_interactions';
import { continental } from './lib/continental_view';
const mapboxgl = require('mapbox-gl');

mapboxgl.accessToken = 'pk.eyJ1IjoiYmhlcm1zZSIsImEiOiJjaml4YXFkMDEzZDFoM29yZmFsZDUyaXV2In0.G5NaeT25EJO5fx4nhrN9fA';
const styleURL = 'mapbox://styles/bhermse/cjiyrhxxj0g802smxpjwcrk42';

const possibleDistricts = controls.initializeControls();
controls.addListeners();

const map = new mapboxgl.Map({
   container: 'map',
   style: styleURL,
   center: continental.center,
   zoom: continental.zoom
});

map.on('load', function(){mapInteraction(map, possibleDistricts)});