angular.module('EasyRashApp.services', ['EasyRashApp.config'])

.factory('Api', function($http,CONFIG,$window,$timeout,$q) {
  var self = this;

  self.getUsers = function() {
    return $http.get(CONFIG.users).then(
      function(response) {
        return response.data;
      },function(error) {
        return error;
      });
    };

    self.getEvents = function() {
      return $http.get(CONFIG.events).then(
        function(response) {
          return response.data;
        },function(error) {
          return error;
        });
      };


      return self;
    })

    .factory('$localstorage', ['$window', function($window) {
      return {
        set: function(key, value) {
          $window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
          return $window.localStorage[key] || defaultValue;
        },
        setObject: function(key, value) {
          $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
          return JSON.parse($window.localStorage[key] || '{}');
        }
      }
    }]);
