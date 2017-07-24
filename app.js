var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require('lodash');
var sslRedirect = require('heroku-ssl-redirect');


var index = require('./routes/index');
var users = require('./routes/users');
var blog = require('./routes/blog');
var subdomain = require('express-subdomain');

var app = express();

// Utility libraries
app.locals._ = require('lodash')
app.locals.moment = require('moment')

// Pug view engine setup
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');


// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, '/public', 'favicon.ico')));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Redirect middleware
app.use(forceLiveDomain)
app.use(wwwRedirect);
app.use(blogRedirect);
app.use(sslRedirect(['staging','production'], 301));

app.use('/', index);


//////////////////////////////
// Redirect Middleware      //
//////////////////////////////

// Redirect .blog subdomain to /blog -- middleware
function blogRedirect(req, res, next) {
    if (req.headers.host.slice(0, 5) === 'blog.') {
        var newHost = req.headers.host.slice(5);
        return res.redirect(301, req.protocol + '://' + newHost + '/blog' + req.originalUrl);
    }
    next();
};
// Redirect www subdomain to root --  middleware
function wwwRedirect(req, res, next) {
    if (req.headers.host.slice(0, 4) === 'www.') {
        var newHost = req.headers.host.slice(4);
        return res.redirect(301, req.protocol + '://' + newHost + req.originalUrl);
    }
    next();
};
app.set('trust proxy', true);

// Don't allow user to hit Heroku now that we have a domain
function forceLiveDomain(req, res, next) {
  var host = req.get('Host');
  if (host === 'eng-base.herokuapp.com') {
    return res.redirect(301, 'https://eng-base.com' + req.originalUrl);
  }
  return next();
};


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
