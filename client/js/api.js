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

  self.getCurrentUser = function() {
    return $http.get(CONFIG.endpoint + CONFIG.userinfo).then(function(result) {
      return result.data;
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

  self.getEvent = function( eventId ) {
    return $http.get(CONFIG.endpoint+CONFIG.event+"/"+eventId).then(
      function(response) {
        return response.data;
      },function(error) {
        return error;
      });
    };

  self.getArticle = function( articleName, type ) {
    if (type === "processed") {
      return $http.get(CONFIG.endpoint+CONFIG.article+"/"+articleName).then(
        function(response) {
          return response.data;
        },function(error) {
          return error;
        });
    }else{
      return $http.get(CONFIG.endpoint+CONFIG.raw_article+"/"+articleName).then(
        function(response) {
          return response.data;
        },function(error) {
          return error;
        });
      }
    };

  self.getArticlesToReview = function(){
    return $http.get(CONFIG.endpoint+CONFIG.docsList).then(
      function(response) {
        return response.data;
      },function(error) {
        return error;
      });
    }
  };

  // TODO : da rivedere
  self.saveAnnotations = function( articleName ) {
    return $http.post(CONFIG.endpoint+CONFIG.article+"/"+articleName).then(
      function(response) {
        return response.data;
      },function(error) {
        return error;
      });
    };


  return self;
  }
);
