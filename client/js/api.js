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
    return $http.get(CONFIG.endpoint+CONFIG.doclist).then(
      function(response) {
        return response.data;
      },function(error) {
        return error;
      });
    };

  // TODO : da rivedere
  self.saveAnnotations = function( data ) {
    return $http.post(CONFIG.endpoint+CONFIG.save_annotations+"/"+data.articleName, data).then(
      function(response) {
        return response.data;
      },function(error) {
        return error;
      });
    };

    self.saveDecision = function( data ) {
      return $http.post(CONFIG.endpoint+CONFIG.save_decision+"/"+data.articleName, data).then(
        function(response) {
          return response.data;
        },function(error) {
          return error;
        });
      };

    self.updateUser = function( data ) {
      return $http.post(CONFIG.endpoint+CONFIG.updateUser, data).then(
        function(response) {
          console.log(response)
          return response;
        },function(error) {
          console.log(error)
          return error;
        });
      };


  return self;
  }
);
