var Todo = require('./models/todo');
var mongoose = require('mongoose');
var Event = require('./models/event');
var User = require('./models/user');
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

module.exports = function (app) {

  app.get('/events', function(req, res, next) {
    Event.find(function (err, events) {
      if (err) return next(err);
      res.json(events);
    });
  });

  app.get('/events/:id', function(req, res, next) {
    Event.findById(req.params.id, function (err, post) {
      if (err) return next(err);
      res.json(post);
    });
  });

  /* GET users listing. */
  app.get('/users', function(req, res, next) {
    User.find(function (err, users) {
      if (err) return next(err);
      res.json(users);
    });
  });

  app.get('/users/:id', function(req, res, next) {
    User.findById(req.params.id, function (err, post) {
      if (err) return next(err);
      res.json(post);
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
        res.sendFile(__dirname + '/client/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
};
