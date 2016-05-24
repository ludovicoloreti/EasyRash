angular.module('EasyRashApp.controllers', [])

.controller('AppCtrl', function($scope, $window, AuthService, AUTH_EVENTS) {
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $window.location.href = "/dash";
    var alertPopup = alert("Session Lost.\nSorry you have to login again.");
  });

  $scope.destroySession = function() {
    AuthService.logout();
  };

  $scope.getInfo = function() {
    $http.get(CONFIG.endpoint + CONFIG.userinfo).then(function(result) {
      $scope.memberinfo = result.data.msg;
    });
  };

  $scope.logout = function() {
    AuthService.logout();
    $window.location.href = "/login";
  };
})

.controller('DashCtrl', function($scope, Api) {
  console.log("dash");
  Api.getUsers().then(function(response) {
    console.log("> Utenti:\n",response);
  })

  Api.getEvents().then(function(response) {
    console.log("> Eventi:\n",response);
  })
})

.controller('ArticlesCtrl', function($scope) {
  console.log("articles")
})

.controller('ArticleCtrl', function($scope, $routeParams) {
  console.log("Article - ", $routeParams.articleId)
})

.controller('LoginCtrl', function($scope, AuthService, $window) {
  console.log("login")
  $scope.user = {
    name: '',
    password: ''
  };

  $scope.login = function() {
    AuthService.login($scope.user).then(function(msg) {
      //$state.go('inside');
      $window.location.href = "/dash";
    }, function(errMsg) {
      var alertPopup = alert("Login failed!\nTry again.");
    });
  };
})

.controller('RegisterCtrl', function($scope, AuthService) {
  $scope.user = {
    name: '',
    password: ''
  };

  $scope.signup = function() {
    AuthService.register($scope.user).then(function(msg) {
      $window.location.href = "/dash";
      var alertPopup = alert("Registered successfully!\nThank you.");
    }, function(errMsg) {
      var alertPopup = alert("Register failed!\nPlease, try again.");
    });
  };
})

.controller('EventsCtrl', function($scope, Api) {

  console.log("events");

  Api.getEvents().then(function(response) {
    console.log("> Eventi:\n",response);
    $scope.eventsList = response;
  })
})

.controller('AccountCtrl', function($scope) {
  console.log("account")
});
