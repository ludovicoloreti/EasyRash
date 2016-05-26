var Todo = require('./models/todo');
var mongoose = require('mongoose');
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

var rash = require('./rash');
/*
function getTodos(res) {
Todo.find(function (err, todos) {

// if there is an error retrieving, send the error. nothing after res.send(err) will execute
if (err) {
res.send(err);
}

res.json(todos); // return all todos in JSON format
});
}
;*/

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


module.exports = function (app) {

  app.get('/api/events', passport.authenticate('jwt', {session: false}), checkAuth,  function(req, res, next) {
    Event.find(function (err, events) {
      if (err) return next(err);
      //else
      res.json(events);
    });
  });

  app.get('/api/events/:id',passport.authenticate('jwt', {session: false}), checkAuth, function(req, res, next) {
    Event.findById(req.params.id, function (err, post) {
      if (err) return next(err);
      //else
      res.json(post);
    });
  });

  /* GET users listing. */
  app.get('/api/users',passport.authenticate('jwt', {session: false}), checkAuth, function(req, res, next) {
    User.find(function (err, users) {
      if (err) return next(err);
      //else
      res.json(users);
    });
  });

  app.get('/api/users/:id', passport.authenticate('jwt', {session: false}), checkAuth,  function(req, res, next) {
    User.findById(req.params.id, function (err, post) {
      if (err) return next(err);
      //else
      res.json(post);
    });
  });

  app.get('/api/article/:id',passport.authenticate('jwt', {session: false}), checkAuth, function(req, res) {
    // Come ti mando il risultato?
    // In rash.prepare ho prepareto l'html e ho una stringa, come te la mando al client?
    rash.prepare( path.resolve('db/articles/'+req.params.id+'.html'), function( preparationResult ){
      res.json( preparationResult );
    });



    //res.sendFile(path.resolve('db/articles/'+req.params.id+'.html') );
  });



  app.post('/api/signup', function(req, res) {
    // TODO control everything
    console.log(warn("»   /api/signup called. Request Body is: \n" + JSON.stringify(req.body)));
    if (!req.body.email || !req.body.pass) {
      errToSend = {
        success: false,
        msg: 'Please insert at least email and password.'
      };
      console.info(warn("Error email/pass"),warn(errToSend));
      res.json(errToSend);
    } else {
      // Create a new user
      var newUser = new User({
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
            msg: 'email already exists.'
          };
          console.log(error(err),error(errToSend));
          return res.json(errToSend);
        }
        msgToSend = {
          success: true,
          msg: 'Successful created new user.'
        };
        console.log(notice("New user created"),notice(JSON.stringify(msgToSend)));
        res.json(msgToSend);
      });
    }
  });

  // route to authenticate a user (POST http://localhost:8080/api/authenticate)
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


  app.get('/api/memberinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
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

// application -------------------------------------------------------------
app.get('*', function (req, res) {
  // console.log(res)
  res.sendFile(__dirname + '/client/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});
};
