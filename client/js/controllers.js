angular.module('EasyRashApp.controllers', [])

.controller('AppCtrl', function($scope, $window, AuthService, AUTH_EVENTS) {
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $window.location.href = "/#/login";
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
    $window.location.href = "/#/login";
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

.controller('AnnotatorCtrl', function($scope) {
  console.log("Annotator")

  $scope.highlight = function(e){
    console.log("highlighting")
    var text;
    if (window.getSelection) {
        /* get the Selection object */
        userSelection = window.getSelection()

        /* get the innerText (without the tags) */
        text = userSelection.toString();

        /* Creating Range object based on the userSelection object */
        var rangeObject = getRangeObject(userSelection);

        /*
           This extracts the contents from the DOM literally, inclusive of the tags.
           The content extracted also disappears from the DOM
        */
        contents = rangeObject.extractContents();

        var span = document.createElement("span");
        span.className = "highlight";
        span.appendChild(contents);

        /* Insert your new span element in the same position from where the selected text was extracted */
        rangeObject.insertNode(span);

    } else if (document.selection && document.selection.type != "Control") {
            text = document.selection.createRange().text;
    }
};

function getRangeObject(selectionObject){
    try{
        if(selectionObject.getRangeAt)
            return selectionObject.getRangeAt(0);
    }
    catch(ex){
        console.log(ex);
    }
}

})

.controller('LoginCtrl', function($scope, AuthService, $window) {
  console.log("login")
  $scope.user = {
    email: '',
    pass: ''
  };

  $scope.login = function() {
    console.log($scope.user);
    AuthService.login($scope.user).then(function(msg) {
      //$state.go('inside');
      console.log(msg)
      $window.location.href = "/#/dash";
    }, function(errMsg) {
      var alertPopup = alert("Login failed!\nTry again.\n\n"+errMsg);
    });
  };
})

.controller('RegisterCtrl', function($scope, $window, AuthService) {
  $scope.user = {
    email: '',
    pass: '',
    given_name: '',
    family_name: '',
    sex: ''
  };

  $scope.signup = function() {
    console.log($scope.user)
    AuthService.register($scope.user).then(function(msg) {
      $window.location.href = "/#/dash";
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
