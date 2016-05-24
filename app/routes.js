var Todo = require('./models/todo');
var mongoose = require('mongoose');
var Event = require('./models/event');
var User = require('./models/user');
var passport	= require('passport');
var jwt = require('jwt-simple');
var config = require('../config/server/database'); // get db config file

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
        return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
      } else {
        console.log("Authentication success");
        //res.json({success: true, msg: 'Welcome in the member area ' + user.name + '!'});
        next();
      }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
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
      res.json(events);
    });
  });

  app.get('/api/events/:id',passport.authenticate('jwt', {session: false}), checkAuth, function(req, res, next) {
    Event.findById(req.params.id, function (err, post) {
      if (err) return next(err);
      res.json(post);
    });
  });

  /* GET users listing. */
  app.get('/api/users',passport.authenticate('jwt', {session: false}), checkAuth, function(req, res, next) {
    User.find(function (err, users) {
      if (err) return next(err);
      res.json(users);
    });
  });

  app.get('/api/users/:id', passport.authenticate('jwt', {session: false}), checkAuth,  function(req, res, next) {
    User.findById(req.params.id, function (err, post) {
      if (err) return next(err);
      res.json(post);
    });
  });

  app.post('/api/signup', function(req, res) {
    // TODO control everything
    console.log(req.body);
    if (!req.body.email || !req.body.pass) {
      console.info("Error email/pass")
      res.json({success: false, msg: 'Please insert at least email and password.'});
    } else {
      console.log("ok!");
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
          console.log(err)
          return res.json({success: false, msg: 'email already exists.'});
        }
        console.log("pare vada");
        res.json({success: true, msg: 'Successful created new user.'});
      });
    }
  });

  // route to authenticate a user (POST http://localhost:8080/api/authenticate)
  app.post('/api/authenticate', function(req, res) {
    console.log(req.body)
    User.findOne({
      email: req.body.email,
      pass: req.body.pass
    }, function(err, user) {
      if (err) throw err;

      if (user) {
        console.log("user correct");
        console.log(user);
        // if user is found and password is right create a token
        var token = jwt.encode(user, config.secret);
        // return the information including token as JSON
        res.json({success: true, token: 'JWT ' + token});
      } else {
        res.send({success: false, msg: 'Authentication failed. User not found.'});

      }
    });
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
