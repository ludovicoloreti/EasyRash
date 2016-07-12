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
var rashManager = require('./save-annotations');
var lockManager = require("./lock-manager");
var email   = require("emailjs/email");
var server  = email.server.connect({
  user:    "easyrash2016@gmail.com",
  password:"ludovicofilippo",
  host:    "smtp.gmail.com",
  ssl:     true,
  port:    465
});

// Middleware: Checks if a lock is sat while the user is navigating in other pages
checkLock = function(req, res, next){
  var userId = req.user._id;
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
    Event.find({ $or: [ { chairs: req.user._id } ,
      { pc_members: req.user._id } ] },
      function (err, events) {
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
      // select the event where is located the file
      Event.find({
        "submissions": {
          "$elemMatch": {
            "url": req.params.id+'.html'
          }
        }
      }, function (err, events) {
        if (err) return next(err);
        // set all useful variable for the client
        var userId = req.user._id;
        var isChair = false;
        var isPcMember = false;
        var isRev = false;
        var numOfChairs = 0;
        var numOfRevs = 0;
        for(var event of events){

          var chairs = event.chairs;
          numOfChairs = chairs.length;
          var pc_members = event.pc_members;
          var submissions = event.submissions;
          for (i=0; i<chairs.length; i++) {
            if (userId === chairs[i])
            {
              isChair = true;
              break;
            }
          }
          for(i=0; i<pc_members.length; i++) {
            if(userId === pc_members[i]){
              isPcMember = true;
              break;
            }
          }
          for(i=0; i<submissions.length; i++) {
            if(submissions[i].url === req.params.id+'.html'){
              numOfRevs = submissions[i].reviewers.length;
              for(var rev of submissions[i].reviewers){
                if(rev === userId){
                  isRev = true;
                  break;
                }
              }
            }

          }
        }
        // Apply rash.js jquery styles
        rash.prepareForReading( file , function( error, preparationResult ){
          if (error) {
            console.log(error.message);
            res.json( {success: false, message: error.message} );
          }else{
            res.json( {data: preparationResult, chair: isChair, reviewer: isRev, pcMember: isPcMember, numChairs: numOfChairs, numRevs: numOfRevs} );
          }
        });
      });
    });

    app.get('/api/doclist',passport.authenticate('jwt', {session: false}), checkAuth, function(req, res) {
      var userId = req.user.id;
      console.log(userId);
      Event.find({
        "submissions": {
          "$elemMatch": {
            "reviewers": {
              "$all": [userId]
            }
          }
        }
      },
      {"submissions": 1},
      function (err, events) {
        if (err) return next(err);
        var docList = new Array();
        for(var event of events){
          for(var sub of event.submissions){
            for(var rev of sub.reviewers){
              if(rev === userId){
                docList.push(sub);
              }
            }
          }
        }
        res.json({data: docList});
      });

    });

    // Get the raw RASH document prepared for annotation  (a simple html file).
    app.get('/api/raw-article/:id',passport.authenticate('jwt', {session: false}), checkAuth, function(req, res) {
      var fileName = req.params.id;
      var file = path.resolve('db/articles/'+fileName+'.html');
      console.log('File: '+fileName+'.html');
      var userId = req.user._id;
      Event.find({
        "submissions": {
          "$elemMatch": {
            "url": fileName+'.html'
          }
        }
      }, function (err, events) {
        if (err) return next(err);
        // set all useful variable for the client
        var isChair = false;
        var isRev = false;
        for(var event of events){
          var chairs = event.chairs;
          var pc_members = event.pc_members;
          var submissions = event.submissions;
          for (i=0; i<chairs.length; i++) {
            if (userId === chairs[i])
            {
              isChair = true;
              break;
            }
          }
          for(i=0; i<submissions.length; i++) {
            if(submissions[i].url === fileName+'.html'){
              for(var rev of submissions[i].reviewers){
                if(rev === userId){
                  isRev = true;
                  break;
                }
              }
            }
          }
        }
        if ( (isRev == true) || (isChair == true) ) {
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
        } else {
          res.json( {success: false, message: "You haven't the permission to review this document."} );
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

    app.post('/api/save-annotations/:id', passport.authenticate('jwt', {session: false}), checkAuth, function(req, res) {
      /* Prepare the rash file */
      var fileName = req.params.id;
      var file = path.resolve('db/articles/'+fileName+'.html');
      console.log('File: '+req.params.id+'.html');
      console.log('Data: '+req.body);

      rashManager.saveRASH( file, req.body, function( error, result ){
        if (error) {
          console.log(error.message);
          res.json( {success: false, message: error.message} );
        }else{

          res.json( { success: true, message:"Resource saved", data: result } );
        }

      });

      // lockManager.releaseLock(fileName, function(result){
      //   if(result){
      //     res.json( {success: true, message: "Lock released successfully"} );
      //   }else {
      //     res.json( {success: false, message: "Error in releasing the lock"} );
      //   }
      // });
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
          sex: req.body.sex,
          confirmed: false
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
          } else {
            strToSplit = req.body.email;
            var usrname = strToSplit.split("@");
            var usrForMail = newUser;
            usrForMail._id = undefined;
            // send the message and get a callback with an error or details of the message that was sent
            server.send({
              text:    "Hey, " + newUser.given_name + "!\nHere is your data.\n mail: "+ newUser.email+"\npassword: "+newUser.pass+"\nPlease confirm your registration using this url: http://"+req.headers.host+"/api/confirm/"+newUser.email+"\n\nRegards.",
              from:    "EasyRash <easyrash2016@gmail.com>",
              to:      user_id,
              subject: "EasyRash Confirm Registration"
            }, function(err, message) { console.log(err || message); });

            msgToSend = {
              success: true,
              msg: 'User successfully created. Mail sent to '+req.body.email
            };
            console.log(notice("New user created"),notice(JSON.stringify(msgToSend)));
            res.json(msgToSend);
          }
        });
      }
    });

    // confirm email address after signup
    app.get('/api/confirm/:mail', function(req, res) {
      console.log(notice("\nMail confirmation called by "+req.params.mail+"\n"));
      User.findOneAndUpdate(
        { email: req.params.mail },
        { "confirmed": true }, function (err, successed) {
          if (err) return next(err);
          console.log(successed);
          res.json(["Mail successfully confirmed, you are now registered."]);
        });
      });

      // Route to authenticate a user (POST http://localhost:8080/api/authenticate)
      app.post('/api/authenticate', function(req, res) {
        console.log(warn("»   /api/authenticate called. Request Body is: \n"+JSON.stringify(req.body)));
        User.findOne({
          email: req.body.email,
          pass: req.body.pass,
          confirmed: true
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

      // Update user
      app.post('/api/userUpdate', passport.authenticate('jwt', {session: false}), checkAuth, function(req, res) {
        var userId = req.body._id;
        var passwd;
        console.log("userID: "+userId);
        User.findOne({
          _id: userId,
        }, function(err, user) {
          if (err) throw err;
          if (!user) {
            return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
          } else {
            if (user.pass === req.body.oldPass) {
              if( !req.body.newPass ) {
                passwd = req.body.oldPass;
              } else {
                passwd = req.body.newPass;
              }
              console.log("updating user", req.body)
              User.findOneAndUpdate(
                { _id: req.body._id },
                { email: req.body.email,
                  family_name: req.body.family_name,
                  given_name: req.body.given_name,
                  sex: req.body.sex,
                  pass: passwd
                }, function(err, numberAffected, rawResponse) {
                    console.log(err,numberAffected,rawResponse)
                    if (err) {
                      return next(err);
                    }
                   res.json({success: true, rsp: rawResponse});
                 });
                } else {
                  res.status(403).send({success: false, msg: 'Forbidden. Password incorrect.'});
                }
              }
            });
          });

          // Route to get user's info
          app.get('/api/memberinfo', passport.authenticate('jwt', { session: false}), checkAuth, checkLock, function(req, res) {
            var token = getToken(req.headers);
            if (token) {
              var decoded = jwt.decode(token, config.secret);
              User.findOne({
                email: decoded.email,
              }, function(err, user) {
                if (err) throw err;
                if (!user) {
                  return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
                } else {
                  strToSplit = user.email;
                  var usrname = strToSplit.split("@");
                  user.pass = undefined;
                  user.confirmed = undefined;
                  res.json({success: true, msg: 'Welcome in the member area ' + usrname[0] + '!', data: user});
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
