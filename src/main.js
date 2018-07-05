require('./styles/map_style.scss');
import bboxes from '../data/bboxes';
import controls from './lib/map_controls';
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

map.on('load', function() {
    var baseStyle = map.getStyle()
    // Add zoom and rotation controls to the map
    //map.addControl(new mapboxgl.Navigation({ position: 'bottom-left' }));

    map.touchZoomRotate.disableRotation();

    // Given a state postal abbreviation and a US Census district number, focus the map on that area
    function focusMap(stateAbbr, districtCode) {
      // Set the interactive menu to focus on the state and district code, if provided
      stateSelect.val = stateAbbr;
      $('#district').empty();
      possibleDistricts[stateAbbr].map(function(d) { $('#district') .append($("<option></option>") .attr('value', d).text(d)); });
      if (districtCode) $('#district').val(districtCode);

      // For each district color layer in the map, apply some filters...
      for (var i = 1; i <= 5; i++) {

        // The filter that filters based on color is the one we want to preserve. If there are already multiple filters applied, it will be the last one
        var exisitingFilter = map.getFilter('districts_' + i);
        if (exisitingFilter[0] === 'all') {
          exisitingFilter = exisitingFilter[exisitingFilter.length - 1];
        }

        // Create a fresh filter to be applied
        var filter = ['all'];

        // Add filters for the focus state and district number
        if (stateAbbr) filter.push(['==', 'state', stateAbbr]);
        if (districtCode) filter.push(['==', 'number', districtCode]);

        // Add the existing color filter
        var layerFilter = filter.concat([exisitingFilter]);

        // Set new layer filter for each district layer in the map
        map.setFilter('districts_' + i, layerFilter);
        map.setFilter('districts_' + i + '_boundary', layerFilter);
        map.setFilter('districts_' + i + '_label', layerFilter);

      }

      // Create a generic filter for the focus state and district number that does not include color filtering
      var boundaryFilter = ['all'];
      if (stateAbbr) boundaryFilter.push(['==', 'state', stateAbbr]);
      if (districtCode) boundaryFilter.push(['==', 'number', districtCode]);

      // Apply the generic filter to the boundary lines
      map.setFilter('districts_boundary_line', boundaryFilter);

      // Determine current window height and width and whether the bbox should focus on a single district
      var height = window.innerHeight, width = window.innerWidth, districtAbbr = districtCode ? districtCode : '';

      // Determine the best center and zoom level for the new map focus and then go there
      var view = geoViewport.viewport(bboxes[stateAbbr + districtAbbr], [width/2, height/2]);
      map.jumpTo(view);
    }

    // Check the URL hash to determine how the map should be focused
    function checkHash() {
      // If a URL hash is found...
      if(window.location.hash) {
        var hash = window.location.hash;
        // Split up the hash string into its components
        var hashData = hash.substring(1).split('&').map(function(d) { return d.split('=') });
        // Determine state or district based on the hash data
        var state, district;
        hashData.map(function(d) {
          if (d[0] === 'state') state = d[1];
          if (d[0] === 'district') district = d[1];
        })

        // If a state or state and district were found in the URL hash, focus the map to this location
        if (state || (state && district)) focusMap(state, district);
      } else {
        // If there is no URL hash...And if its not the first time the page is loading...
        if (!initial) {
          // Reset the map style to its original style object and jump back to the continental view
          map.setStyle(baseStyle);
          map.jumpTo(continentalView(window.innerWidth/2, window.innerHeight/2));
          // Empty the list of districts because no state is selected
          $('#district').empty();
        }
      }
    }

    // When the URL hash changes, call the checkHash function
    window.onhashchange = checkHash;

    // Record that it initial page load and the hash still needs to be checked
    var initial = true;
    checkHash();

    // Record that it is no longer the initial page load
    initial = false;

    // A click handler that shows what was under the cursor where the user clicked.
    map.on("click", function(e) {
      var district = null;

      // The map control provides a client-side-only way to determine what
      // is under the cursor. We restrict the query to only the layers that
      // provide congressional district polygons. Note that this only scans
      // features that are currently shown on the map. So if you've filtered
      // the districts so only a state or a single district is showing, this
      // will restrict the query to those districts.
      var features = map.queryRenderedFeatures(e.point, { layers: ["districts_1", "districts_2", "districts_3", "districts_4", "districts_5"] });
      if (features.length > 0)
         // The feature properties come from the original GeoJSON uploaded to Mapbox.
         district = features[0].properties;
      if (district) {
        alert("That's " + district.state + "-" + district.number + ", i.e." + district.title_long + ".");
      } else {
        alert("You clicked on a location that is not within a U.S. congressional district.")
      }
   })
});