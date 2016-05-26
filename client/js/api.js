angular.module('EasyRashApp.api', ['EasyRashApp.config'])

.factory('Api', function($http,CONFIG,$window,$timeout,$q) {
  var self = this;

  self.getUsers = function() {
    return $http.get(CONFIG.endpoint+CONFIG.users).then(
      function(response) {
        return response.data;
      },function(error) {
        return error;
      });
    };

    self.getEvents = function() {
      return $http.get(CONFIG.endpoint+CONFIG.events).then(
        function(response) {
          return response.data;
        },function(error) {
          return error;
        });
      };

      self.getArticle = function( articleName ) {
        return $http.get(CONFIG.endpoint+CONFIG.article+"/"+articleName).then(
          function(response) {
            console.log(response)
            return response.data;
          },function(error) {
            return error;
          });
      };


      return self;
    });
