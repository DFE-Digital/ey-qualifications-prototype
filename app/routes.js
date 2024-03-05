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

  console.log('here');
  var searchTerm = request.session.data['qualification-search']
  var searchResults = data.qualifications.filter(x => x.name.includes(searchTerm));
  request.session.data['result-count'] = searchResults.length;
  request.session.data['search-results'] = searchResults;
  response.redirect("/current/r3/search-results");
})

router.get('/current/r3/qualification-detail/:qualificationId', function(request, response){
  console.log('qualid')
  var qualificationId = request.params.qualificationId;
  var qualification = data.qualifications.filter(x => x.id == qualificationId);
  request.session.data['qualification'] = qualification[0];
  response.redirect("/current/r3/qualification-detail?qualificationId="+qualificationId);
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

