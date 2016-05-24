/*
  Set up
*/
var express = require('express');
var app = express(); 						// create app w/ express
var mongoose = require('mongoose'); 				// mongoose for mongodb
var port = process.env.PORT || 8080; 				// set the port
var database = require('./config/server/database'); 			// load the database config
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var jwt = require('jwt-simple');
var passport	= require('passport');

/*
  Connection
  Connect to local MongoDB instance. A remoteUrl is also available (modulus.io)
*/
mongoose.connect(database.localUrl);
// import the Strategy
require('./config/server/passport')(passport);

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/client'));
// log every request to the console
app.use(morgan('dev'));
 // parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({'extended': 'true'}));
// parse application/json
app.use(bodyParser.json());
// parse application/vnd.api+json as json
app.use(bodyParser.json({type: 'application/vnd.api+json'}));
// override with the X-HTTP-Method-Override header in the request
app.use(methodOverride('X-HTTP-Method-Override'));
// Use the passport package in our application
app.use(passport.initialize());

/*
  Setting un the routes
*/
require('./app/routes.js')(app);

/*
 listen (start app with node server.js)
*/
app.listen(port);
console.log("Server started.\nMagic happens on port " + port);
