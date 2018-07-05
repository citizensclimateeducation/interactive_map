import stateList from '../../data/states';
import bboxes from '../../data/bboxes';

let controls = {
   initializeControls() {
      let possibleDistricts = {};
      stateList.map(function(d) { possibleDistricts[d.abbr] = [] });
      
      // For each state, add the numbers of its districts
      for (let d in bboxes) {
        possibleDistricts[d.slice(0,2)].push(d.slice(2,d.length));
      }
      
      // Sort in ascending order each state's list of districts
      for (let d in possibleDistricts) {
        possibleDistricts[d].sort(function(a,b) {
          if (b === "") { return 1 } else { return parseInt(a) - parseInt(b); }
        });
        // For states with only one district, make the list of districts only contain an at-large choice
        if (possibleDistricts[d].length === 2) possibleDistricts[d] = ['00'];
      }

      // Add an option to the interactive State menu for each state
      const stateSelect = document.querySelector('#state');
      stateList.map(function(d) {
         var option = document.createElement("option");
         option.text = d.name;
         option.value = d.abbr;
         stateSelect.appendChild(option);
      });

      return possibleDistricts;
   },

   addListeners() {
      const stateSelect = document.querySelector('#state');
      stateSelect.onchange = () => {
         if (stateSelect.value === '') { window.location.hash = '#' }
         else {
            const hash = window.location.hash;
            const newHash = 'state=' + stateSelect.value;
            window.location.hash = newHash;
         }
      };

      const districtSelect = document.querySelector('#district');
      districtSelect.onchange = () => {
         const hash = window.location.hash;
         const currentDistrictIndex = hash.indexOf('&district=');
         const newHash = currentDistrictIndex >= 0 ?
            hash.slice(0, currentDistrictIndex) + '&district=' + districtSelect.value :
            hash + '&district=' + districtSelect.value;
         window.location.hash = newHash;
      };
   }
};

export default controls;