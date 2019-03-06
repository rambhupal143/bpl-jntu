var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var flash    = require('connect-flash');
require('./config/passport')(passport);


var app = express();


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/**
 * Express Validator Middleware for Form Validation
 */ 
var expressValidator = require('express-validator')


app.use(expressValidator())
app.use(session({
	secret: 'rambhupalworld',
	resave: true,
	saveUninitialized: true,
	cookie: { maxAge: 60000 }
 })); 

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(cookieParser('rambhupalworld'))

app.use(express.static(path.join(__dirname, 'public')));
 
app.use(passport.initialize());
app.use(passport.session()); 
app.use(flash());

//var index = require('./routes/index');
require('./routes/logon')(app, passport);
require('./routes/options')(app, passport);
require('./routes/admin')(app, passport);


app.use(require('connect-flash')());
app.use(function(req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

var debug = require('debug')('passport-oracle:server');
//var http = require('http');
var oracledb = require('oracledb');
var log4js = require('log4js');
log4js.configure('./config/log4js.json');

var log = log4js.getLogger("startup");

var dbconfig = require("./config/dbconfig.js");

process.env.UV_THREADPOOL_SIZE = 100;


oracledb.createPool({
    user:             dbconfig.user,
    password:         dbconfig.password,
    connectString:    dbconfig.connectString,
    poolMax:          100,
    poolMin:          2,
    poolIncrement:    5,
    poolTimeout:      4
	//poolAlias: 'hrpool'
}, function(err, pool) {

    if (err) {
      log.error("ERROR: ", new Date(), ": createPool() callback: " + err.message);
      return;
    }

    require('./config/oracledb.js')(pool);

});


/**
 * Get port from environment and store in Express.
 */

var port = process.env.PORT || '3000';
//app.set('port', port);

app.listen(port, function(){
	console.log('Server running at port 3000: http://127.0.0.1:3000')
})
//module.exports = app;



