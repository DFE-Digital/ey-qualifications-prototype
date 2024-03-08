//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here

// Route qualification answer
router.post('/route-qual-answer', function(request, response) {

  var AwardingOrg = request.session.data['AwardingOrg']
  if (AwardingOrg == "Yes"){
      response.redirect("/current/r2/awarding-body-name")
  } else {
      response.redirect("/current/r2/search-qualification-name")
  }
})

var data = require('./data/qualifications.json');

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
  //request.session.data['awarding-organisations'] = [{"value": "1", "text": "abc"}, {"value": "2", "text": "xyz"}];
  response.redirect("/current/r3/search-results");
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

router.get('/current/r3/qualification-detail/:qualificationId', function(request, response){
  console.log('qualification-id')
  var qualificationId = request.params.qualificationId;
  var qualification = data.qualifications.filter(x => x.id == qualificationId);
  request.session.data['qualification'] = qualification[0];
  response.redirect(`/current/r3/qualification-detail?qualificationId=${qualificationId}`);
})

module.exports = router


// Logging session data 
 
router.use((req, res, next) => { 
    const log = { 
    method: req.method, 
    url: req.originalUrl, 
    data: req.session.data 
    } 
    console.log(JSON.stringify(log, null, 2)) 
   
    next() 
    })

// GET SPRINT NAME - useful for relative templates
router.use('/', (req, res, next) => {
    res.locals.currentURL = req.originalUrl; //current screen
    res.locals.prevURL = req.get('Referrer'); // previous screen
  console.log('previous page is: ' + res.locals.prevURL + " and current page is " + req.url + " " + res.locals.currentURL );
    next();
  });

// Start folder specific routes



// !! Use when previous sprint iterations are required
router.use('/alpha', require('./views/alpha/_routes'));

// current sprint, remember to add older sprint when adding a new folder!
router.use('/current', require('./views/current/_routes'));

