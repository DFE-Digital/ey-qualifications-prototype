const express = require('express')
const router = express.Router()
// Add your routes here - above the module.exports line

var data = require('../../../data/qualifications.json');

// q1
router.post('/q1-post', function(request, response){
  if (request.session.data['awarding-location'] == undefined) {
    return response.redirect("/current/r15/q1-error")
  } 
  if (request.session.data['awarding-location'] == 'England') {
    return response.redirect("/current/r15/q2")
  } 
})

// q2
router.post('/q2-post', function(request, response){
  var noStartedDate = request.session.data['date-started-month'] == "" || request.session.data['date-started-year'] == "";
  var noAwardedDate = request.session.data['date-awarded-month'] == "" || request.session.data['date-awarded-year'] == "";
  if (noStartedDate && noAwardedDate) {
    return response.redirect("/current/r15/q2-error-date-started-awarded");
  }
  if (noStartedDate) {
    return response.redirect("/current/r15/q2-error-date-started");
  }
  if (noAwardedDate) {
    return response.redirect("/current/r15/q2-error-date-awarded");
  }
  return response.redirect("/current/r15/q3");
})

// q3
router.post('/q3-post', function(request, response){
  switch(request.session.data['qualification-level']) {
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "not-sure":
      var qualifications = data.qualifications;
      qualifications = filterQualificationYear(qualifications, request);
      qualifications = filterLevels(qualifications, request);
      request.session.data['awarding-organisations'] = setAwardingOrganisations(qualifications, request);
    
      response.redirect("/current/r15/q4");
      break;
    default:
      response.redirect("/current/r15/q3-error");
      break;
  }
})

// Confirm qualification
router.post('/confirm-post', function(request, response) {
  var redirectValue = request.session.data['redirect'];
  if (request.session.data['yes-no'] == undefined) {
    return response.redirect(`/current/r15/${redirectValue}-confirm-error`)
  }
  var yesNoValue = request.session.data['yes-no'];
  if (yesNoValue == 'Yes') {
    return response.redirect(`/current/r15/${redirectValue}-requirement1`);
  } else {
    return response.redirect('/current/r15/search-results');
  }
})

// Additional requirement 1
router.post('/eyq-292-requirement1-post', function(request, response) {
  var redirectValue = request.session.data['redirect'];
  if (request.session.data['ledToQTS'] == undefined) {
    return response.redirect(`/current/r15/eyq-292-requirement1-error`)
  } else {
    return response.redirect(`/current/r15/eyq-292-requirement2`)
  }
})

// Additional requirement 2
router.post('/eyq-292-requirement2-post', function(request, response) {
  var redirectValue = request.session.data['redirect'];
  if (request.session.data['isQAAConsistent'] == undefined) {
    return response.redirect(`/current/r15/eyq-292-requirement2-error`)
  } else {
    return response.redirect(`/current/r15/eyq-292-requirement3`)
  }
})

// Additional requirement 3
router.post('/eyq-292-requirement3-post', function(request, response) {
  var redirectValue = request.session.data['redirect'];
  if (request.session.data['includesAssessedPractice'] == undefined) {
    return response.redirect(`/current/r15/eyq-292-requirement3-error`)
  } else {
    return response.redirect(`/current/r15/eyq-292-requirements-check`)
  }
})


// Reset filters when select 'Check another qualification'
router.get('/reset-filters', function(request, response) {
  var resetData = {};
  // reset level checked to false
  for (var i = 2; i <= 8; i++) {
    var levelChecked = `level-${i}-checked`;
    resetData[levelChecked] = false;
  }
  request.session.data = resetData;

  response.redirect("/current/r15/q1");
})

// Search results
router.post('/check-your-answers-post', function(request, response) {
  if (request.session.data['awarding-organisation'] == 'none') return response.redirect('/current/r15/q4-error');

  response.redirect("/current/r15/check-your-answers");
});

router.post('/search-results-post', function(request, response) {

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
  var dateString = date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear();
  request.session.data['todays-date'] = dateString;

  response.redirect("/current/r15/search-results");
})

// Clear search results
router.get('/clear-search', function(request, response) {
  request.session.data['qualification-search'] = undefined;

  if (request.session.data['awarding-organisation'] == 'none') return response.redirect('/current/r15/q4-error');

  var qualifications = data.qualifications;

  qualifications = filterQualificationYear(qualifications, request);
  qualifications = filterLevels(qualifications, request);
  qualifications = filterAwardingOrganisations(qualifications, request);

  request.session.data['result-count'] = qualifications.length;
  request.session.data['search-results'] = qualifications;
  
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var date = new Date(Date.now());
  var dateString = date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear();
  request.session.data['todays-date'] = dateString;

  response.redirect("/current/r15/search-results");  // Redirect back to the search results page
});

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
  
  var filterValue = ''; // Current options in the beforeOrAfter2014 field is before, after & 2024
  var monthAsInt = request.session.data['date-started-month'];
  var yearAsInt = request.session.data['date-started-year'];
  if (monthAsInt < 9 && yearAsInt <= 2014){
    filterValue = 'before';
  } else if (monthAsInt >= 9 && yearAsInt == 2014 || monthAsInt >= 1 && yearAsInt > 2014 && monthAsInt <= 12 && yearAsInt <= 2023 || monthAsInt >= 1 && monthAsInt < 9 && yearAsInt == 2024){
    filterValue = 'after';
  } else {
    filterValue = '2024'
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

  // if the data doesn't include the qualification level, or the user has selected 'not sure' then just return the list of qualifications as nothing to filter out.
  if (request.session.data['qualification-level'] == undefined || request.session.data['qualification-level'] == "not-sure" || request.session.data['qualification-level'].length == 0) return qualifications;

  // User has selected qualification levels. Iterate through the selected levels and filter out the qualifications that match
  var filteredLevelQualifications = [];

  if (request.session.data['qualification-level'] == "degree-with-honours") {
    return qualifications.filter((q) => q.level === "degree-with-honours");
  }

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
  // If the data doesn’t include the awarding organisation filter, then return the lot
  if (request.session.data['awarding-organisation'] == undefined || request.session.data['awarding-organisation'] == 'none') return qualifications;
  
  // Handle the 'any' case separately
  if (request.session.data['awarding-organisation'] == 'any') {
    return qualifications.filter(x => x.awardingOrganisation == "Various awarding organisations" || x.awardingOrganisation == "All Higher Education Institutes");
  }
  
  // Otherwise, return the results with the selected awarding organisation plus 'Various awarding organisations' and 'All Higher Education Institutes'
  return qualifications.filter(x => 
    x.awardingOrganisation == request.session.data['awarding-organisation'] ||
    x.awardingOrganisation == "Various awarding organisations" ||
    x.awardingOrganisation == "All Higher Education Institutes"
  );
}

function compareByText(a, b) {
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
  formattedAwardingOrganisations = formattedAwardingOrganisations.filter((s) => !["Various awarding organisations", "All Higher Education Institutes"].includes(s.value));  
  formattedAwardingOrganisations = formattedAwardingOrganisations.sort(compareByText);
  formattedAwardingOrganisations.unshift({"value": "none", text: "Choose the awarding organisation"});
  return formattedAwardingOrganisations;
}


module.exports = router