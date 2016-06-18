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

.controller('AnnotatorCtrl', function($scope, $routeParams, $document, $sce, $location, $anchorScroll, $timeout, Api) {
  console.log("Annotator")
  $scope.loading = true;
  var parser = new DOMParser();


  Api.getArticle($routeParams.articleId, "processed").then(function(response) {
    // console.log("> Articolo:\n",response);
    var doc = parser.parseFromString(response, 'text/html');
    var scriptList = doc.querySelectorAll('[type="application/ld+json"]');
    var docBody = doc.getElementsByTagName("body")[0];

    $scope.loading = false;

    $scope.articleBody = $sce.trustAsHtml(docBody.innerHTML);
    // console.log($scope.articleBody )

    // Prova
    var annotations = new Array();

    for (i=0; i < scriptList.length; i++) {
      annotations.push( JSON.parse(scriptList[i].textContent) );
    }

    // console.log(annotations)
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

  $scope.loadRash = function(){
    Api.getArticle($routeParams.articleId, "unprocessed").then(function(response) {
      //var rawArticle = parser.parseFromString(response.body, 'text/html');
      console.log(response);
      $scope.articleBody = $sce.trustAsHtml(response.body);
      console.log($scope.articleBody);
    });

  }

  $scope.exit = function(){
    Api.saveAnnotations($routeParams.articleId).then(function(response) {
      console.log(response);
    });

  }


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

  function selection(){
    if (window.getSelection) {
      console.log(1)
      return window.getSelection();
    } else if (document.getSelection) {
      console.log(2)
      return document.getSelection();
    } else if (document.selection) {
      console.log(3)
      return document.selection.createRange().text;
    }
  }

  // indexOf method added for range selection pourposes
  NodeList.prototype.indexOf = function(n) {
    var i=-1;
    while (this.item(i) !== n) {i++} ;
    return i
  }

  function compatibleExtremes(n) {
    var res = (n.anchorNode === n.focusNode  && n.type=='Range');
    console.log(res);
    return res;
  }

  count = 0;

  $scope.highlight = function() {
    // Get the selection
    var s = selection()
    console.log(s)
    // Get the anchor's parent element
    var dad = s.anchorNode.parentElement
    // var guida = s.anchorNode.substringData(s.anchorOffset,20)
    if (compatibleExtremes(s)) { // compatibleExtremes(s)
      var spanId = 'span-'+ ($('#article-container span').length+1)
      // Prendo l'elemento dal padre in base all'indexOf
      var pos = dad.childNodes.indexOf(s.anchorNode)
      var n = {
        id: spanId,
        node: dad.id ? dad.id: createId(dad),
        pos: pos,
        // guide: guida,
        start: Math.min(s.anchorOffset,s.focusOffset),
        end: Math.max(s.anchorOffset,s.focusOffset)
      }
      insertNote(n,true)
    }else {
      var message = "Uncorrect selection";
      showErrors(message);
    }

  };

  function createId(element){
    element.setAttribute('id', 'parent-'+count)
    count++;
    return element.getAttribute('id');
  }

  function insertNote(note,active) {
		// Creo un range
		var r = document.createRange()
		var node = $('#'+note.node)[0].childNodes[note.pos]
		// Setto il range
		r.setStart(node,note.start);
		r.setEnd(node,note.end)
		// Creo lo span
		var span = document.createElement('span')
		span.setAttribute('id',note.id)
		span.setAttribute('class','highlight')
		// Avvolgo il range con lo span
		r.surroundContents(span)
	}

  function showErrors(message){
    $scope.error = true;
    $scope.message = message;
  }

  function hideErrors(){
    $scope.error = true;
    $scope.message = "";
  }

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
  console.log("account");
  // Get user info

});
