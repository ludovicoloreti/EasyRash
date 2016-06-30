/*
 * Controllers module
 *
 * Contains all the controllers related to each view of the application
 */

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

.controller('AnnotatorCtrl', function($scope, $routeParams, $document, $sce, $location, $uibModal, $anchorScroll, $timeout,$compile, Api) {
  console.log("Annotator")
  // *** START SETUP
  $scope.loading = true;
  var parser = new DOMParser();
  var review = null;

  // Get the article
  callApiService();
  // *** END SETUP

  // Currently logged user
  function Person(){} // TODO implement

  // Currently dislayed article
  function Article(){} // TODO implement

  // Review object for the specified article
  function Review(article){
    this["@type"] = "review";
    this["@id"] = "#review"+$scope.reviewCounter;
    this["article"] = {
      "@id": "",
      "@id": "",
      "eval": {
        "@id": this["@id"]+"-eval",
        "@type": "score",
        "status": "",
        "author": "",
        "date": ""
      }
    };
    this["comments"] = new Array()
  }

  // Review handling funtions
  Review.prototype = {

    generateId: function(comment){
      // TODO implement
      $scope.commentCounter++;
      return this["@id"]+"-c"+$scope.commentCounter;
    },
    pushComment: function(comment){

      comment.setId( this.generateId(comment) );
      this["comments"].push({"key": comment.getId(),"value": comment});
      return comment;
    },
    getComment: function(commentId){
      for (var i=0; i<this.comments.length; i++) {
        if (this.comments[i].key == commentId) {
           return this.comments[i].value ;
        }
      }
    },
    deleteComment: function(commentId){
      for (var i=0; i<this.comments.length; i++) {
        if (this.comments[i].key == commentId) {
          this.comments.splice(i,1) ;
        }
      }
    }
  }


  // Comment on article part
  function Comment(ref, text, author) {
    this["@context"] = "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json";
    this["@type"] = "comment";
    this["@id"] = null;
    this["text"] = text;
    this["ref"] = ref;
    this["author"] = author;
    this["date"] = new Date();
  }

  // Comment handling methods
  Comment.prototype = {
    setId: function(id){
      this["@id"] = id;
    },
    getId: function(){
      return this["@id"];
    },
    setText: function(text){
      this["text"] = text;
    },
    getText: function(){
      return this["text"];
    }
  }


  // Get the article
  function callApiService(){
    // Get the article when the page loadthrough the Api service, the article type is processed
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

      $scope.reviewCounter = scriptList.length; // TODO check for the type
      console.log($scope.reviewCounter);
      $scope.commentCounter = commentsList.length; // TODO find a better solution
      console.log($scope.commentCounter);

      $scope.commentsList = commentsList;
      // Fine Prova

    });
  }

  $scope.$on('$locationChangeStart', function(event, next, current) {
    if(review.comments.length > 0){
      alert("You have unsaved content. If you leave the page all your work will be lost.\nAre you sure to exit?")
    }
  });

  $scope.loadRash = function(){
    Api.getArticle($routeParams.articleId, "unprocessed").then(function(response) {
      //var rawArticle = parser.parseFromString(response.body, 'text/html');

      console.log(response);
      if(response.success){
        review = new Review("bella");
        $scope.articleBody = $sce.trustAsHtml(response.data.body);
        console.log($scope.articleBody);
      }else{
        showErrors(response.message)
      }

    });

  }

  $scope.exit = function(){
    if(review.comments.length > 0){
      alert("All your work will be lost. Are you sure to exit?")
    }

    Api.saveAnnotations($routeParams.articleId).then(function(response) {
      console.log(response);
      callApiService();
    });

  }

  $scope.saveComment = function(text){
    // TODO handle comment
    var comment = new Comment("ref-to-implement", text, "author-to-implement");
    console.log(comment.getText());
    review.pushComment(comment);
    console.log(review);
    $scope.commentText = "";

  }
  $scope.showComments= function(){
    //console.log(review.comments);
    $scope.cs = review.comments;
    console.log($scope.cs);
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
      return window.getSelection();
    } else if (document.getSelection) {
      return document.getSelection();
    } else if (document.selection) {
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
    var res = (n.anchorNode.parentElement === n.focusNode.parentElement  && n.type=='Range');
    console.log(res);
    return res;
  }

  function findExtremes(selection){
    extremes = {};
    var selectionLength = selection.toString().length;
    var parentLength = selection.anchorNode.parentElement.innerText.length;
    extremes.start = selection.anchorOffset;
    extremes.end = extremes.start + selectionLength;

    return extremes;

  }

  count = 0;

  // $scope.highlight = function() {
  //   // Get the selection
  //   var s = selection()
  //   console.log(s)
  //   // Get the anchor's parent element
  //   var dad = s.anchorNode.parentElement
  //   // var guida = s.anchorNode.substringData(s.anchorOffset,20)
  //   if (compatibleExtremes(s)) { // compatibleExtremes(s)
  //     var spanId = 'span-'+ ($('#article-container span').length+1)
  //     // Prendo l'elemento dal padre in base all'indexOf
  //     var pos = dad.childNodes.indexOf(s.anchorNode);
  //     var extremes = findExtremes(s);
  //     console.log(extremes);
  //     var n = {
  //       id: spanId,
  //       node: dad.id ? dad.id: createId(dad),
  //       pos: pos,
  //       // guide: guida,
  //       // start:   Math.max(s.anchorOffset,s.focusOffset),
  //       // end: Math.min(s.anchorOffset,s.focusOffset)
  //       start: extremes.start,
  //       end: extremes.end
  //     }
  //     insertNote(n,true)
  //   }else {
  //     var message = "Uncorrect selection";
  //     showErrors(message);
  //   }
  //
  // };

  $scope.setupCommentOnModal = function($event){
    console.log("click");
    console.log($event);
  }

  $scope.highlight = function(){
    var s = selection();
    console.log(s);
    var range = s.getRangeAt(0);

    if(s.toString().length > 2){
        range.startPoint = s.anchorOffset;
        range.endPoint = s.extentOffset;
        var newNode = document.createElement("span");
        var spanId = 'fragment-'+ ($('#article-container span[id~="fragment"]').length+1);
        // TODO come compilare in angular il contenuto aggiunto?
        newNode.setAttribute('id', spanId);
        newNode.setAttribute('data-toggle', 'modal');
        newNode.setAttribute('data-target', '#comment-modal');
        newNode.setAttribute('ng-click', 'setupCommentOnModal($event)');
        newNode.setAttribute("class", "highlight");
        range.surroundContents(newNode);

    }else {
      console.log("Selection too short to be meaningful");
    }
  }

  function createId(element){
    element.setAttribute('id', 'parent-'+count)
    count++;
    return element.getAttribute('id');
  }

  function insertNote(note,active) {
		// Creo un range
		var r = document.createRange()
		var node = $('#'+note.node)[0];
		// Setto il range
		r.setStart(node,note.start);
		r.setEnd(node,note.end)
		// Creo lo span
		var span = document.createElement('span')
		span.setAttribute('id',note.id);
    span.setAttribute('data-toggle', 'modal');
    span.setAttribute('data-target', '#comment-modal');
		span.setAttribute('class','highlight');
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
      $scope.error = errMsg;
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
      $scope.error = errMsg;
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
