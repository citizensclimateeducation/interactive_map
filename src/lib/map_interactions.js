const mapboxgl = require('mapbox-gl');
import bboxes from '../../data/bboxes';
const geoViewport = require('@mapbox/geo-viewport');
import { continentalView } from './continental_view';

// Given a state postal abbreviation and a US Census district number, focus the map on that area
function focusMap(map, stateAbbr, districtCode, possibleDistricts) {
   // Set the interactive menu to focus on the state and district code, if provided
   $('#state').val(stateAbbr);
   $('#district').empty();
   possibleDistricts[stateAbbr].map(function (d) { $('#district').append($("<option></option>").attr('value', d).text(d)); });
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
   var view = geoViewport.viewport(bboxes[stateAbbr + districtAbbr], [width / 2, height / 2]);
   map.jumpTo(view);
}

// Check the URL hash to determine how the map should be focused
function checkHash(map, possibleDistricts, baseStyle, initial = false) {
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
     if (state || (state && district)) focusMap(map, state, district, possibleDistricts);
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

export default function(map, possibleDistricts) {
   const baseStyle = map.getStyle();
    // Add zoom and rotation controls to the map
    //map.addControl(new mapboxgl.Navigation({ position: 'bottom-left' }));
    map.touchZoomRotate.disableRotation();

    // When the URL hash changes, call the checkHash function
    window.onhashchange = function(){ checkHash(map, possibleDistricts, baseStyle) };

    // Record that it initial page load and the hash still needs to be checked
    checkHash(map, possibleDistricts, baseStyle, true);

   map.on('click', function (e) {
      var features = map.queryRenderedFeatures(e.point, {
         layers: ['chapter-locations']
      });

      if (!features.length) {
         return;
      }

      var feature = features[0];

      var popup = new mapboxgl.Popup({ offset: [0, -15] })
         .setLngLat(feature.geometry.coordinates)
         .setHTML("<h3>" + feature.properties.Name + '</h3><p>' + feature.properties.Description + '</p>')
         .setLngLat(feature.geometry.coordinates)
         .addTo(map);
   });
};