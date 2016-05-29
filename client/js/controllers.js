angular.module('EasyRashApp.controllers', [])

.controller('AppCtrl', function($scope, $http, CONFIG, $window, AuthService, AUTH_EVENTS) {

  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $window.location.href = "/#/login";
    var alertPopup = console.error("Session Lost.\nSorry you have to login again.");
  });


  $scope.destroySession = function() {
    AuthService.logout();
  };

  $scope.getInfo = function() {
    $http.get(CONFIG.endpoint + CONFIG.userinfo).then(function(result) {
      console.log(result.data)
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

.controller('AnnotatorCtrl', function($scope, $routeParams, $document, $sce, $location, $anchorScroll, Api) {
  console.log("Annotator")

  var parser = new DOMParser();


  Api.getArticle($routeParams.articleId).then(function(response) {
    console.log("> Articolo:\n",response);
    var doc = parser.parseFromString(response, 'text/html');
    var scriptList = doc.querySelectorAll('[type="application/ld+json"]');
    var docBody = doc.getElementsByTagName("body")[0];
    $scope.articleBody = $sce.trustAsHtml(docBody.innerHTML);
    console.log($scope.articleBody )

    // Prova
    var annotations = new Array();

    for (i=0; i < scriptList.length; i++) {
      annotations.push( JSON.parse(scriptList[i].textContent) );
    }

    console.log(annotations)
    var commentsList = new Array();
    for (i=0; i < annotations.length; i++) {
      var annotation = annotations[i];
      for (j=0; j < annotation.length; j++) {

        if(annotation[j]['@type'] == "comment") {
          commentsList.push( annotation[j] );
        }
      }
    }
    $scope.commentsList = commentsList;


    // Fine Prova

  })

  $scope.showSelection = function(index){
    var elementId = $scope.commentsList[index]["ref"];
    //elementId = elementId.replace('#', '');
    console.log(elementId);
    console.log($document[0].getElementById(elementId));
    //console.log(angular.element(elementId));
    var element = $document[0].getElementById(elementId);
    element.className += " highlight";

  };

  $scope.hideSelection = function(index){
    var elementId = $scope.commentsList[index]["ref"];
    //elementId = elementId.replace('#', '');
    console.log(elementId);
    console.log($document[0].getElementById(elementId));
    console.log(angular.element(elementId));
    var element = $document[0].getElementById(elementId);
    element.classList.remove('highlight');

  };

  /*
    Angular doesn't handle anchor hash linking due to its routeProvider module.
    It is necessary to implement a function that handles this behavior.
  */
  $scope.scrollTo = function(id) {
    console.log("cliccato");
    $location.hash(id);
    console.log($location.hash());
    $anchorScroll();
  };


//   $scope.highlight = function(e){
//     console.log("highlighting")
//     var text;
//     if (window.getSelection) {
//         /* get the Selection object */
//         userSelection = window.getSelection()
//
//         /* get the innerText (without the tags) */
//         text = userSelection.toString();
//
//         /* Creating Range object based on the userSelection object */
//         var rangeObject = getRangeObject(userSelection);
//
//         /*
//            This extracts the contents from the DOM literally, inclusive of the tags.
//            The content extracted also disappears from the DOM
//         */
//         contents = rangeObject.extractContents();
//
//         var span = document.createElement("span");
//         span.className = "highlight";
//         span.appendChild(contents);
//
//         /* Insert your new span element in the same position from where the selected text was extracted */
//         rangeObject.insertNode(span);
//
//     } else if (document.selection && document.selection.type != "Control") {
//             text = document.selection.createRange().text;
//     }
// };

// function getRangeObject(selectionObject){
//     try{
//         if(selectionObject.getRangeAt)
//             return selectionObject.getRangeAt(0);
//     }
//     catch(ex){
//         console.log(ex);
//     }
// }

})

.controller('LoginCtrl', function($scope, AuthService, $window) {
  console.log("login");
  if (AuthService.isAuthenticated() === true) {
    $window.location.href = "/#/dash";
  }
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
  console.log("register");
  if (AuthService.isAuthenticated() === true) {
    $window.location.href = "/#/dash";
  }

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

.controller('EventCtrl', function($scope, $routeParams, Api) {

  console.log("event");

  Api.getEvent($routeParams.eventId).then(function(response) {
    console.log("> Evento:\n",response);
    $scope.eventInfo = response;
  })
})

.controller('AccountCtrl', function($scope) {
  console.log("account")
});
