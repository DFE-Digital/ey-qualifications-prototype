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
  var searchResults = data.qualifications.filter(x => x.name.toLowerCase().includes(searchTerm.toLowerCase()));
  searchResults = filterLevels(searchResults, request);
  request.session.data['result-count'] = searchResults.length;
  request.session.data['search-results'] = searchResults;
  response.redirect("/current/r3/search-results");
})

function filterLevels(qualifications, request) {
  // reset level checked to false
  for (var i = 2; i <= 7; i++) {
    var levelChecked = `level-${i}-checked`;
    request.session.data[levelChecked] = false;
  }

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

