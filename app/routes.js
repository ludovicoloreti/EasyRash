// Imports
var Todo = require('./models/todo');
var mongoose = require('mongoose'); // Mongodb connection
var Event = require('./models/event');
var User = require('./models/user');
var passport	= require('passport');
var jwt = require('jwt-simple');
var config = require('../config/server/database'); // get db config file
var path = require('path');
var color = require('colors-cli/safe')
var error = color.red.bold;
var warn = color.yellow;
var notice = color.x45;
// Custom module import
var rash = require('./rash');
var lockManager = require("./lock-manager");

// Middleware: Checks if a lock is sat while the user is navigating in other pages
checkLock = function(req, res, next){
  var userId = req.user.id;
  // Checks if a user has a lock that shounldn't be present
  lockManager.searchAndRelease(userId, function(result){
    next();
  });
}
// Middleware: Checks if the user is authenticated
checkAuth = function(req, res, next) {
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      email: decoded.email
    }, function(err, user) {
      if (err) throw err;

      if (!user) {
        errToSend = {
          success: false,
          msg: 'Authentication failed. User not found.'
        };
        console.log(error(errToSend));
        return res.status(403).send(errToSend);
      } else {
        console.log(notice("Authentication success"));
        req.user = user;
        next();
      }
    });
  } else {
    errToSend = {
      success: false,
      msg: 'No token provided.'
    };
    console.log(error(errToSend));
    return res.status(403).send(errToSend);
  }
};

// Get the token from the HTTP header
getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

// Routing module related to app
module.exports = function (app) {

  // Get all events
  app.get('/api/events', passport.authenticate('jwt', {session: false}), checkAuth, checkLock,  function(req, res, next) {
    Event.find(function (err, events) {
      if (err) return next(err);
      //else
      res.json(events);
    });
  });

  // Get an event with a given id
  app.get('/api/event/:id',passport.authenticate('jwt', {session: false}), checkAuth, checkLock, function(req, res, next) {
    Event.findById(req.params.id, function (err, post) {
      if (err) return next(err);
      //else
      res.json(post);
    });
  });

  // Get the list of users
  app.get('/api/users',passport.authenticate('jwt', {session: false}), checkAuth, checkLock, function(req, res, next) {
    User.find(function (err, users) {
      if (err) return next(err);
      //else
      res.json(users);
    });
  });

  // Get a user by id
  app.get('/api/user/:id', passport.authenticate('jwt', {session: false}), checkAuth, checkLock,  function(req, res, next) {
    User.findById(req.params.id, function (err, post) {
      if (err) return next(err);
      //else
      res.json(post);
    });
  });

  // Get an article by name with RASH style applied
  app.get('/api/article/:id',passport.authenticate('jwt', {session: false}), checkAuth, checkLock, function(req, res) {
    /* Prepare the rash file */
    var file = path.resolve('db/articles/'+req.params.id+'.html');
    console.log('File: '+req.params.id+'.html');

    rash.prepareForReading( file , function( error, preparationResult ){
      if (error) {
        console.log(error.message);
        res.json( {success: false, message: error.message} );
      }else{
        res.json( preparationResult );
      }

    });
  });

  // Get the raw RASH document prepared for annotation  (a simple html file).
  app.get('/api/raw-article/:id',passport.authenticate('jwt', {session: false}), checkAuth, function(req, res) {
    var fileName = req.params.id;
    var file = path.resolve('db/articles/'+fileName+'.html');

    console.log('File: '+fileName+'.html');

    var userId = req.user.id;
    console.log(userId);
    lockManager.acquireLock(fileName, userId, function(resourceAcquired){
      if(resourceAcquired){
        rash.prepareForAnnotation( file , function( error, preparationResult ){
          if (error) {
            console.log(error.message);
            res.json( {success: false, message: error.message} );
          }else{

            res.json( { success: true, message:"Resource aquired succesfully", data: preparationResult } );
          }

        });
      }else {
        res.json( {success: false, message: "Document already under review"} );
      }
    });

  });

  // Unset the lock for the specified article name
  app.post('/api/article/:id',passport.authenticate('jwt', {session: false}), checkAuth, function(req, res) {
    /* Prepare the rash file */
    var fileName = req.params.id;
    var file = path.resolve('db/articles/'+fileName+'.html');
    console.log('File: '+req.params.id+'.html');

    lockManager.releaseLock(fileName, function(result){
      if(result){
        res.json( {success: true, message: "Lock released successfully"} );
      }else {
        res.json( {success: false, message: "Error in releasing the lock"} );
      }
    });
  });

  // User registration
  app.post('/api/signup', function(req, res) {
    // TODO control everything
    console.log(warn("»   /api/signup called. Request Body is: \n" + JSON.stringify(req.body)));
    if (!req.body.email || !req.body.pass || !req.body.given_name || !req.body.family_name) {
      errToSend = {
        success: false,
        msg: 'Please insert at least email, password, name and surname'
      };
      console.info(warn("Error email/pass/name/surname"),warn(errToSend));
      res.json(errToSend);
    } else {
      // Create a new user
      // generating _id for Mongodb
      var user_id = req.body.given_name + " " + req.body.family_name + " <" + req.body.email + ">";
      var newUser = new User({
        _id: user_id,
        given_name: req.body.given_name,
        family_name: req.body.family_name,
        email: req.body.email,
        pass: req.body.pass,
        sex: req.body.sex
      });
      // save the user
      newUser.save(function(err) {
        if (err) {
          errToSend = {
            success: false,
            err: err,
            msg: 'The triple Name, Surname and Email already exists.'
          };
          console.log(error(err),error(errToSend));
          return res.json(errToSend);
        }
        msgToSend = {
          success: true,
          msg: 'User successfully created.'
        };
        console.log(notice("New user created"),notice(JSON.stringify(msgToSend)));
        res.json(msgToSend);
      });
    }
  });

  // Route to authenticate a user (POST http://localhost:8080/api/authenticate)
  app.post('/api/authenticate', function(req, res) {
    console.log(warn("»   /api/authenticate called. Request Body is: \n"+JSON.stringify(req.body)));
    User.findOne({
      email: req.body.email,
      pass: req.body.pass
    }, function(err, user) {
      if (err) throw err;
      if (user) {
        console.log(notice("User correct!\n"), notice(user));
        // if user is found and password is right create a token
        var token = jwt.encode(user, config.secret);
        // return the information including token as JSON
        msgToSend = {
          success: true,
          token: 'JWT ' + token
        };
        console.log(notice("Got Token!\n"),notice(JSON.stringify(msgToSend)));
        res.json(msgToSend);
      } else {
        errToSend = {
          success: false,
          msg: 'Authentication failed. User not found.'
        };
        console.log(error(JSON.stringify(errToSend)));
        res.send(errToSend);

      }
    });
  });

  // Route to get user's info
  app.get('/api/memberinfo', passport.authenticate('jwt', { session: false}), checkAuth, checkLock, function(req, res) {
    var token = getToken(req.headers);
    if (token) {
      var decoded = jwt.decode(token, config.secret);
      User.findOne({
        email: decoded.email
      }, function(err, user) {
        if (err) throw err;

        if (!user) {
          return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
          strToSplit = user.email;
          var usrname = strToSplit.split("@");
          res.json({success: true, msg: 'Welcome in the member area ' + usrname[0] + '!'});
        }
      });
    } else {
      return res.status(403).send({success: false, msg: 'No token provided.'});
    }
  });
  /*
  // ESEMPI da usare ---------------------------------------------------------------------
  // get all todos
  app.get('/api/todos', function (req, res) {
  // use mongoose to get all todos in the database
  getTodos(res);
});

// create todo and send back all todos after creation
app.post('/api/todos', function (req, res) {

// create a todo, information comes from AJAX request from Angular
Todo.create({
text: req.body.text,
done: false
}, function (err, todo) {
if (err)
res.send(err);

// get and return all the todos after you create another
getTodos(res);
});

});

// delete a todo
app.delete('/api/todos/:todo_id', function (req, res) {
Todo.remove({
_id: req.params.todo_id
}, function (err, todo) {
if (err)
res.send(err);

getTodos(res);
});
});*/

// Otherwise return the index.html
app.get('*', function (req, res) {
  // console.log(res)
  res.sendFile(__dirname + '/client/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});
};
