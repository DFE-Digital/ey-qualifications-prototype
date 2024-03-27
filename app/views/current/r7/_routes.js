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
  var qualifications = data.qualifications;
  request.session.data['result-count'] = qualifications.length;
  request.session.data['search-results'] = qualifications;
  request.session.data['awarding-organisations'] = setAwardingOrganisations(qualifications, request);

  response.redirect("/current/r7/search-results");
})

// Route search results
router.post('/post-search-results', function(request, response) {
  var searchTerm = request.session.data['qualification-search']
  var qualifications = data.qualifications.filter(x => x.name.toLowerCase().includes(searchTerm.toLowerCase()));
  request.session.data['awarding-organisations'] = setAwardingOrganisations(qualifications, request);
  qualifications = filterQualificationYear(qualifications, request);
  qualifications = filterLevels(qualifications, request);
  qualifications = filterAwardingOrganisations(qualifications, request);
  request.session.data['result-count'] = qualifications.length;
  request.session.data['search-results'] = qualifications;
  response.redirect("/current/r7/search-results");
})

function filterQualificationYear(qualifications, request) {
  // if the data doesn't include the qualification year then just return the list of qualifications as nothing to filter out.
  if (request.session.data['qualification-year'] == undefined || request.session.data['qualification-year'].length == 0) return qualifications;

  return qualifications.filter(x => x.beforeOrAfter2014 == request.session.data['qualification-year']);
}

function filterLevels(qualifications, request) {
  // reset level checked to false
  for (var i = 2; i <= 7; i++) {
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
  if (request.session.data['awarding-organisation'] == undefined || request.session.data['awarding-organisation'] == 'none') return qualifications;

  return qualifications.filter(x => x.awardingOrganisation == request.session.data['awarding-organisation']); 
}

function compareByText(a, b){
  return a.text.localeCompare(b.text);
}

function setAwardingOrganisations(qualifications, request) {
  var awardingOrganisations = qualifications.map(x => x.awardingOrganisation);
  let uniqueAwardingOrganisations = [...new Set(awardingOrganisations)];
  var formattedAwardingOrganisations = [{"value": "none", text: "--Select--"}];
  uniqueAwardingOrganisations.forEach(element => {
    if (request.session.data['awarding-organisation'] != undefined && element == request.session.data['awarding-organisation']) {
      formattedAwardingOrganisations.push({"value": element, "text": element, "selected": true});
    } else {
      formattedAwardingOrganisations.push({"value": element, "text": element});
    }
  });
  return formattedAwardingOrganisations.sort(compareByText);
}

module.exports = router