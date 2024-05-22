const express = require('express')
const router = express.Router()
// Add your routes here - above the module.exports line

var data = require('../../../data/qualifications.json');

router.get('/reset-filters', function(request, response) {
  var resetData = {};
  // reset level checked to false
  for (var i = 2; i <= 7; i++) {
    var levelChecked = `level-${i}-checked`;
    resetData[levelChecked] = false;
  }
  request.session.data = resetData;

  response.redirect("/current/r10/q1");
})

router.post('/set-awarding-orgs', function(request, response){
  var qualifications = data.qualifications;
  qualifications = filterQualificationYear(qualifications, request);
  qualifications = filterLevels(qualifications, request);
  request.session.data['awarding-organisations'] = setAwardingOrganisations(qualifications, request);

  response.redirect("/current/r10/q4");
})

// Route search results
router.post('/post-search-results', function(request, response) {
  var qualifications = data.qualifications;

  qualifications = filterQualificationYear(qualifications, request);
  qualifications = filterLevels(qualifications, request);
  qualifications = filterAwardingOrganisations(qualifications, request);

  if (request.session.data['qualification-search'] != undefined) {
    var searchTerm = request.session.data['qualification-search'];
    qualifications = qualifications.filter(x => x.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  request.session.data['result-count'] = qualifications.length;
  request.session.data['search-results'] = qualifications;
  
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var date = new Date(Date.now());
  var dateString = date.getDate() + nth(date.getDate()) + " " + months[date.getMonth()] + " " + date.getFullYear();
  request.session.data['todays-date'] = dateString;

  response.redirect("/current/r10/search-results");
})

const nth = (d) => {
  const last = +String(d).slice(-2);
  if (last > 3 && last < 21) return 'th';
  const remainder = last % 10;
  if (remainder === 1) return "st";
  if (remainder === 2) return "nd";
  if (remainder === 3) return "rd";
  return "th";
};

function filterQualificationYear(qualifications, request) {
  // if the data doesn't include the qualification year then just return the list of qualifications as nothing to filter out.
  if (request.session.data['date-started-month'] == undefined || request.session.data['date-started-year'] == undefined || request.session.data['date-started-month'].length == 0 || request.session.data['date-started-year'].length == 0) return qualifications;
  
  var filterValue = 'before'; // Current options in the beforeOrAfter2014 field is before, after & 2024
  var monthAsInt = request.session.data['date-started-month'];
  var yearAsInt = request.session.data['date-started-year'];
  if (monthAsInt >= 9 && (yearAsInt >= 2014 && yearAsInt < 2024)){
    filterValue = 'after';
  }
  if (monthAsInt >= 9 && yearAsInt >= 2024){
    filterValue = '2024';
  }

  request.session.data['awarding-date'] = filterValue;

  return qualifications.filter(x => x.beforeOrAfter2014 == filterValue);
}

function filterLevels(qualifications, request) {
  // reset level checked to false
  for (var i = 2; i <= 8; i++) {
    var levelChecked = `level-${i}-checked`;
    request.session.data[levelChecked] = false;
  }

  // if the data doesn't include the qualification level then just return the list of qualifications as nothing to filter out.
  if (request.session.data['qualification-level'] == undefined || request.session.data['qualification-level'].length == 0) return qualifications;

  // User has selected qualification levels. Iterate through the selected levels and filter out the qualifications that match
  var filteredLevelQualifications = [];
  for (var i = 0; i < request.session.data['qualification-level'].length; i++) {
    var level = request.session.data['qualification-level'][i];
    var levelChecked = `level-${level}-checked`;
    // Used to show the level is checked when the page reloads
    request.session.data[levelChecked] = true;
    var levelQualifications = qualifications.filter(x => x.level == level);
    filteredLevelQualifications = filteredLevelQualifications.concat(levelQualifications);
  }
  return filteredLevelQualifications;
}

function filterAwardingOrganisations(qualifications, request) {
  // if the data doesn't include the awarding organisation filter, then return the lot
  if (request.session.data['awarding-organisation'] == undefined || request.session.data['awarding-organisation'] == 'none' || request.session.data['awarding-organisation'] == 'any') return qualifications;

  return qualifications.filter(x => x.awardingOrganisation == request.session.data['awarding-organisation']);
}

function compareByText(a, b){
  return a.text.localeCompare(b.text);
}

function setAwardingOrganisations(qualifications, request) {
  var awardingOrganisations = qualifications.map(x => x.awardingOrganisation);
  let uniqueAwardingOrganisations = [...new Set(awardingOrganisations)];
  var formattedAwardingOrganisations = [];
  uniqueAwardingOrganisations.forEach(element => {
    if (request.session.data['awarding-organisation'] != undefined && element == request.session.data['awarding-organisation']) {
      formattedAwardingOrganisations.push({"value": element, "text": element, "selected": true});
    } else {
      formattedAwardingOrganisations.push({"value": element, "text": element});
    }
  });
  formattedAwardingOrganisations = formattedAwardingOrganisations.sort(compareByText);
  formattedAwardingOrganisations.unshift({"value": "any", text: "Not in the list"});
  formattedAwardingOrganisations.unshift({"value": "none", text: "Choose the awarding organisation"});
  return formattedAwardingOrganisations;
}

module.exports = router