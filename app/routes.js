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

// r3
router.use('/current/r3', require('./views/current/r3/_routes'));

// r6
router.use('/current/r6', require('./views/current/r6/_routes'));

// r7
router.use('/current/r7', require('./views/current/r7/_routes'));

// r8
router.use('/current/r8', require('./views/current/r8/_routes'));

// r9
router.use('/current/r9', require('./views/current/r9/_routes'));

// r10
router.use('/current/r10', require('./views/current/r10/_routes'));

// r11
router.use('/current/r11', require('./views/current/r11/_routes'));

// r12
router.use('/current/r12', require('./views/current/r12/_routes'));

// r13
router.use('/current/r13', require('./views/current/r13/_routes'));

// r14
router.use('/current/r14', require('./views/current/r14/_routes'));

// r15
router.use('/current/r14', require('./views/current/r15/_routes'));


module.exports = router
