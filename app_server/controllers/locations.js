const { response } = require('express');
var request = require('request');

const apiOptions = {
  server: 'http://localhost:3000'
}
if(process.env.REACT_APP_NODE_ENV === 'production') {
  apiOptions.server = 'https://loc8r-ljh.onrender.com'
}

const requestOptions ={
  url: `${apiOptions.server}`,
  method: 'GET',
  json:{},
  qs:{
    offset: 20
  }
};
request(requestOptions,(err, response, body) => {
  if(err) {
    console.log(err);
  } if(response.statusCode === 200){
    console.log(body);
  } else {
    console.log(response.statusCode);
  }
});

const homelist = (req, res) => {
  const path = '/api/locations';
  const requestOptions = {
    url : `${apiOptions.server}${path}`,
    method: 'GET',
    json: {},
    qs: {
      lng: 126.964062,
      lat: 37.468769,
      maxDistance: 200000
    }
  };
  request(
    requestOptions,
    (err, response, body) => {
      const statusCode = response.statusCode;
      let data = [];
      if(statusCode === 200 && body.length) {
        data = body.map( (item) => {
          item.distance = formatDistance(item.distance);
          return item;
        });
      };
      renderHompage(req, res, body);
    }
  );
};

const formatDistance = (distance) => {
  let thisDistance = 0;
  let unit = 'm';
  if (distance > 1000) {
    thisDistance = parseFloat(distance / 1000).toFixed(1);
    unit = "km";
  } else {
    thisDistance = Math.floor(distance);
  }
  return thisDistance + unit;
};

const renderDetailPage = function(req, res, location) {
  res.render('location-info', {
    title: location.name ,
    pageHeader: {
      title: location.name
      },
    sidebar: {
      context: 'is on Loc8r because it has accessible wifi and \
        space to sit down with your laptop and get some work done 2020810057 이정환',
      callToAction: "If you've been you like it - or if you \
        don't - please leave a review to help other people just like you."
    },
    location
  });
}
const renderHompage = (req, res, responseBody) => {
  let message = null;
  if (!(responseBody instanceof Array)) {
    message = "API lookup error";
    responseBody = [];
  } else {
    if(!responseBody.length) {
      message = "No places found nearby";
    }
  }
  res.render('locations-list', {
    title: 'Loc8r - find a place to work with wifi',
    pageHeader: {
      title: 'Loc8r',
      strapline: 'find places to work with wifi near you!'
    },
    sidebar: "Looking for wifi and a seat? Loc8r helps you find places \
    to work when out and about. Perhaps with coffee, cake or a pint? \
    Let Loc8r help you find the place you're looking for. 2020810057 이정환" ,
    locations: responseBody,
    message
  });
};

const getLocationInfo = (req, res, callback) => {
  const path = `/api/locations/${req.params.locationid}`;
  const requestOptions = {
    url: `${apiOptions.server}${path}`,
    method: 'GET',
    json: {}
  };
  request(
    requestOptions,
    (err, response, body) => {
      let data = body;
      const statusCode = response.statusCode;
      if (statusCode === 200) {
        data.coords = {
          lng: body.coords?.[0],
          lat: body.coords?.[1]
        };
        callback(req, res, data); 
      } else {
        showError (req, res, statusCode);
      }
    }
  );
}

const locationInfo = (req, res) => {
  getLocationInfo(req, res,
    (req, res, responseData) => renderDetailPage(req, res, responseData)
  );
};

const addReview = (req, res) => {
  getLocationInfo(req, res,
    (req, res, responseData) => renderReviewForm(req, res, responseData)
  );
};

const showError = (req, res, status) => {
  let title = '';
  let content = '';
  if (status === 404) {
    title = '404, page not found';
    content = "Oh dear. Looks like you can't find this page. Sorry 2020810057 이정환";
  } else {
    title = `${status}, something's gone wrong`;
    content = 'Something, somewhere, has gone just a little bit wrong 2020810057 이정환';
  }
  res.status(status);
  res.render('generic-text', {
    title,
    content
  });
};

const renderReviewForm = function(req, res, {name}){
  res.render('location-review-form', {
      title: `Review ${name} on Loc8r` ,
      pageHeader: { title: `Review ${name}` },
      error: req.query.err
    });
};


const about = function(req, res) {
  const content = 'Loc8r was created to help people find places to sit down \
    and get a bit of work done.<br/><br/>Lorem ipsum dolor sit \
    amet, consectetur adipiscing elit. Nunc sed lorem ac nisi digni \
    ssim accumsan. Nullam sit amet interdum magna. Morbi quis \
    faucibus nisi. Vestibulum mollis purus quis eros adipiscing \
    tristique. Proin posuere semper tellus, id placerat augue dapibus \
    ornare. Aenean leo metus, tempus in nisl eget, accumsan interdum \
    dui. Pellentesque sollicitudin volutpat ullamcorper.';
  
  console.log("Content:", content);  // Log the content for debugging
  
  res.render('generic-text', {
    title: 'About Loc8r',
    content: content
  });
};

const doAddReview = (req, res) => {
  const locationid = req.params.locationid;
  const path = `/api/locations/${locationid}/reviews`;
  const postdata = {
    author: req.body.name,
    rating: parseInt(req.body.rating, 10),
    reviewText: req.body.review
  };
  const requestOptions = {
    url: `${apiOptions.server}${path}`,
    method: 'POST',
    json: postdata
  };
  if (!postdata.author || !postdata.rating || !postdata.reviewText) {
    res.redirect(`/location/${locationid}/review/new?err=val`);
  } else {
    request(
      requestOptions,
      (err, {statusCode}, {name}) => {
        if (statusCode === 201 ) {
          res.redirect(`/location/${locationid}`);
        } else if (statusCode === 400 && name && name === 'ValidationError') {
          res.redirect(`/location/${locationid}/review/new?err=val`);
        } else {
          showError(req, res, statusCode);
        }
      }
    );
  }
};

module.exports = {
  homelist,
  locationInfo,
  addReview,
  doAddReview
};
