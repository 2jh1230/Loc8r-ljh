//2020810057 이정환
require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require('passport');
// require('./models/db');
require('./app_api/models/db');
require('./app_api/config/passport');

const apiRouter = require('./app_api/routes/index');

var app = express();

const cors = require('cors');
const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 
};
app.use(cors(corsOptions));

app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// view engine setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'app_public', 'build',))); // Angular build 폴더 설정
app.use(passport.initialize());

app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'pug');

// API 라우터만 설정 (프론트엔드 라우터 비활성화)
app.use('/api', apiRouter);

// error handler
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res
      .status(401)
      .json({"2020810057 이정환 message": err.name + ": " + err.message});
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

module.exports = app;
