var express = require('express');
var router = express.Router();
const ctrlLocations = require('../controllers/locations');
const ctrlOthers = require('../controllers/others');

/* Locations pages */
router.get('/', ctrlLocations.homelist);
router.get('/location', ctrlLocations.locationInfo);
router.get('/location/review/new', ctrlLocations.addReview);

router.get('/location/:locationid', ctrlLocations.locationInfo);
//router.route('/location/review/new').get(ctrlLocations.addReview).post(ctrlLocations.doAddReview);
router.route('/location/:locationid/review/new')  // locationid를 동적으로 받도록 설정
    .get(ctrlLocations.addReview)
    .post(ctrlLocations.doAddReview);
    
/* Other pages */
router.get('/about', ctrlOthers.about);

module.exports = router;