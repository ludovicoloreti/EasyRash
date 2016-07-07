/*
* Controllers module
*
* Contains all the controllers related to each view of the application
*/

angular.module('EasyRashApp.controllers', [])

.controller('AppCtrl', function($scope, Api, $rootScope, $http, CONFIG, $window, AuthService, AUTH_EVENTS) {

  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $window.location.href = "/#/login";
    var alertPopup = console.error("Session Lost.\nSorry you have to login again.");
  });

  // Destroy Session
  $scope.destroySession = function() {
    AuthService.logout();
  };

  // Get the logged user
  Api.getCurrentUser().then(function(response) {
    $scope.memberinfo = response.msg;
    console.log("Current User:\n",response);
  })

  // Logout service
  $scope.logout = function() {
    AuthService.logout();
    // Redirect to login page
    $window.location.href = "/#/login";
  };
})

.controller('DashCtrl', function($scope, Api) {

  Api.getArticlesToReview().then(function(response) {
    $scope.submissions = response.data;
  })

  Api.getEvents().then(function(response) {
    $scope.events = response;
  })
})

.controller('ArticlesCtrl', function($scope) {
  console.log("articles")
})

.controller('ArticleCtrl', function($scope, $routeParams) {
  console.log("Article - ", $routeParams.articleId)
})

.controller('AnnotatorCtrl', function($scope, $routeParams, $document, $sce, $location, $uibModal, $anchorScroll, $timeout,$compile, Api) {

  /**** START SETUP ****/

  // Loading gif activated
  $scope.loading = true;
  // Object used to create a DOM representation of the RASH article
  var parser = new DOMParser();
  // Review on the article
  var review = null;
  //List of comments from other reviewers
  var commentsList = null;

  // Get the logged user
  getCurrentUser();

  // Get list of documents the user can review
  getDocList();

  // Get the RASH article
  callApiService();

  // Annotator mode sat false
  $scope.annotatorMode = false;

  // Default highlight color
  $scope.selectionColor = "yellow"

  // Sidebar set open
  $scope.sidebarClosed = null;

  // Article rating serttings
  $scope.rating = 0;
  $scope.vote = {
      current: 1,
      max: 5
  }

  // Function: set the highlighting color
  $scope.setColor = function(color){
    $scope.selectionColor = color;
  }

  // Function: toggle the sidebar
  $scope.toggleSidebar = function() {
      $scope.sidebarClosed = $scope.sidebarClosed ? null: "sidebar-closed";
  };

  // Function: set the article rating
  $scope.getSelectedRating = function (rating) {
    console.log(rating);
  }
  /**** END SETUP ****/

  // Person object: RDF reviewer rapresentation
  function Person(){
    this["@context"] = "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json";
    this["@type"] = "person";
    this["@id"] = "mailto:"+$scope.reviewer.email;
    this["name"] = $scope.reviewer.given_name+" "+$scope.reviewer.family_name;
    this["as"] =  {
      "@id": "#role2",
      "@type": "role",
      "role_type": "pro:reviewer",
      "in": ""
    }
  } // TODO implement


  // Review object for the specified article
  function Review(article){
    this["@context"] = "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json";
    this["@type"] = "review";
    this["@id"] = "#review"+$scope.reviewCounter;
    this["article"] = {
      "@id": "",
      "eval": {
        "@id": this["@id"]+"-eval",
        "@type": "score",
        "status": "",
        "author": "mailto:"+$scope.reviewer.email,
        "date": new Date().toISOString()
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
      // If the comment has an id it means it's already in the comments array
      if( !comment['@id'] ){
        comment.setId( this.generateId(comment) );
        this["comments"].push({"key": comment.getRef(),"value": comment});
      }else {
        var index = 0;
        for (var i=0; i<this.comments.length; i++) {
          if (this.comments[i].key == comment.getRef()) { index = i; }
        }
        // Update the comment by replacing it in the array
        this["comments"].splice(index, 1, {"key": comment.getRef(),"value": comment} );
      }

      return comment;
    },
    getComment: function(commentKey){
      for (var i=0; i<this.comments.length; i++) {
        if (this.comments[i].key == commentKey) {
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
    },
    generateJsonLD: function(){
      var list = new Array();
      var jsonLD = {};
      jsonLD["@context"] = this["@context"];
      jsonLD["@type"] = this["@type"];
      jsonLD["@id"] = this["@id"];
      jsonLD["@article"]= this["article"];
      jsonLD["comments"] = new Array();

      for (var i=0; i<this.comments.length; i++) {
        jsonLD["comments"].push(this.comments[i].value["@id"]);
        list.push(this.comments[i].value);
      }

      list.unshift(jsonLD);
      list.push(new Person());
      return list;



    }

  }

  // Comment on article part
  function Comment(ref, text) {
    this["@context"] = "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json";
    this["@type"] = "comment";
    this["@id"] = null;
    this["text"] = text;
    this["ref"] = ref;
    this["author"] = "mailto:"+$scope.reviewer.email;
    this["date"] = new Date().toISOString();
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
    },
    getRef: function(){
      return this["ref"];
    }
  }

  // Function: get the currently logged user
  function getCurrentUser(){
    Api.getCurrentUser().then(function(response) {
      console.log(response.data);
      $scope.reviewer = response.data;
    })
  }

  // Funciton: get the list of article to review
  function getDocList(){
    Api.getArticlesToReview().then(function(response) {
      console.log(response.data);
      $scope.submissions = response.data;
    })
  }

  // Get the RASH article
  function callApiService(){
    // Get the article when the page loadthrough the Api service, the article type is processed
    Api.getArticle($routeParams.articleId, "processed").then(function(response) {
      $scope.annotatorMode = false;
      var doc = parser.parseFromString(response.data, 'text/html');
      var scriptList = doc.querySelectorAll('[type="application/ld+json"]');
      var docBody = doc.getElementsByTagName("body")[0];

      // DEFINING SCOPE -ROLE- VARIABLES SUCH AS "chair, pc_member, reviewer"
      $scope.isChair = response.chair; // true or false
      $scope.isReviewer = response.reviewer; // true or false
      $scope.isPcMember = response.pcMember; // true or false


      $scope.loading = false;

      $scope.articleBody = $sce.trustAsHtml(docBody.innerHTML);

      // trying..
      var annotations = new Array();

      for (i=0; i < scriptList.length; i++) {
        annotations.push( JSON.parse(scriptList[i].textContent) );
      }

      // console.log(annotations)
      commentsList = new Array();
      for (i=0; i < annotations.length; i++) {
        var annotation = annotations[i];
        for (j=0; j < annotation.length; j++) {

          if(annotation[j]['@type'] == "comment") {
            console.log("#article-container "+annotation[j]['ref']);
            annotation[j]['refText'] = docBody.querySelectorAll(annotation[j]['ref'])[0] ? docBody.querySelectorAll(annotation[j]['ref'])[0].innerText : "Error: no Reference detected";
            commentsList.push( annotation[j] );
          }
        }
      }

      $scope.reviewCounter = scriptList.length; // TODO check for the type
      console.log($scope.reviewCounter);
      $scope.commentCounter = commentsList.length; // TODO find a better solution
      console.log($scope.commentCounter);
      console.log(commentsList);
      $scope.commentsList = commentsList;
      // Fine Prova

    });
  }

  // Function: detects when a user clicks on a link. It prevents the action if the usr has unsaved annotations
  $scope.$on('$locationChangeStart', function( event ) {
    if(review.comments.length > 0){
      var answer = confirm("You have unsaved content. If you leave the page all your work will be lost.\nAre you sure to exit?")
      if (!answer) {
          event.preventDefault();
      }
    }
  });

  // Funciton: Load the original RASH article prepared for the review
  $scope.loadRash = function(){
    Api.getArticle($routeParams.articleId, "unprocessed").then(function(response) {

      //var rawArticle = parser.parseFromString(response.body, 'text/html');
      console.log(response);
      if(response.success){
        $scope.annotatorMode = true;
        // TODO
        review = new Review("TODO-review-id");
        $scope.articleBody = $sce.trustAsHtml(response.data.body);
        // console.log(response.data.info);
        console.log($scope.articleBody);
      }else{
        showErrors(response.message)
      }

    });

  }

  function prepareArticle(){
    var article = $("#article-container");
    article.find('*').each(function( index ) {
      if( $(this).attr('id') ){

        if( $(this).attr('id').startsWith('para-') || $(this).attr('id').startsWith('fragment')){
          $(this).removeClass("highlight");
          $(this).removeClass("yellow");
          $(this).removeClass("blue");
          $(this).removeClass("purple");
          $(this).removeClass("orange");
          $(this).removeClass("green");
          $(this).removeClass("ng-scope");
          $(this).removeAttr('data-toggle');
          $(this).removeAttr('data-target');
          $(this).removeAttr('ng-click');
        }
      }

    });
    console.log(article.html());
    return article.html();
  }

  $scope.saveAnnotations = function(){
    console.log(review);
    if(review.comments.length > 0){
      var data = {};
      data.annotations = review.generateJsonLD();
      data.article = prepareArticle();
      data.articleName = $routeParams.articleId;

      Api.saveAnnotations(data).then(function(response) {
        console.log(response);
        //callApiService();
      });
    }
  }

  // Function: exit the annotator mode
  $scope.exit = function(){
    // If the user has unsaved annotations
    // if(review.comments.length > 0){
    //   var answer = confirm("You have unsaved content. If you leave the page all your work will be lost.\nAre you sure to exit?")
    //   if (answer) {
    //     review = null;
    //     Api.saveAnnotations($routeParams.articleId).then(function(response) {
    //       console.log(response);
    //       callApiService();
    //     });
    //   }
    // }
  }

  // Function:
  $scope.saveComment = function(input){
    if( input.text ){
      var comment = review.getComment(input.fragmentId);
      // If the comment already present, update the text
      if( comment ){

        comment.setText(input.text);

      }else {
        // If the comment is not present, create it
        comment = new Comment(input.fragmentId, input.text);

      }

      console.log(comment.getText());
      review.pushComment(comment);
      console.log(review);
    }
  }

  $scope.deleteComment = function(input){
    console.log("Delete");
    console.log(input)

    var keepRef = false;
    var isSpan = input.fragmentId.startsWith('fragment');

    for(var i=0; i<commentsList.length; i++){
      if (commentsList[i]['ref'] === input.fragmentId){
        keepRef = true;
      }
    }

    if( keepRef ){
      // TODO REMOVE ALL ATTRIBUTES
      $(input.fragmentId).removeClass();
    }else if(isSpan) {
      $(input.fragmentId).replaceWith(function() {
         return $(this).contents();
       });
    }else {
      $(input.fragmentId).removeClass();
    }

    review.deleteComment(input.fragmentId);
  }

  $scope.cancel = function(input){
    // TODO resolve p deletion
    console.log("Cancel");
    var comment = review.getComment(input.fragmentId);
    // If no comment is present, clear the selection
    if ( !comment ){
      var keepRef = false;
      var isSpan = input.fragmentId.startsWith('fragment');
      if(commentsList.length > 0)
      {
        console.info("Comment List is not empty")
        for(var i=0; i<commentsList.length; i++){
          if (commentsList[i]['ref'] === input.fragmentId){
            keepRef = true;
            break;
          }
        }
      } else {
        console.info("Comment List is empty")
        keepRef = false;
      }


      if( keepRef ){
        $(input.fragmentId).removeClass("highlight");
        $(input.fragmentId).removeAttr('data-toggle');
        $(input.fragmentId).removeAttr('data-target');
        $(input.fragmentId).removeAttr('ng-click');
      } else if(isSpan) {
        $(input.fragmentId).replaceWith(function() {
           return $(this).contents();
         });
      } else {
        $(input.fragmentId).removeClass("highlight");
        $(input.fragmentId).removeAttr("data-toggle");
        $(input.fragmentId).removeAttr("data-target");
        $(input.fragmentId).removeAttr("ng-click");
      }
    }
  }

  $scope.setupCommentOnModal = function(ref){
    $scope.commentModal = {};
    console.log(ref);
    var comment = review.getComment(ref);
    if (comment){
      $scope.commentModal.fragmentId = comment.ref;
      $scope.commentModal.text = comment.text;
    }else {
      $scope.commentModal.fragmentId = ref;
      $scope.commentModal.text = "";
    }

  }

  // Function:
  $scope.showComments = function(){
    //console.log(review.comments);
    $scope.cs = review.comments;
    console.log($scope.cs);
  }

  // Show the ref
  $scope.showSelection = function(index){
    $($scope.commentsList[index]["ref"]).addClass("highlight");
  };

  // Hide the ref
  $scope.hideSelection = function(index){
    $($scope.commentsList[index]["ref"]).removeClass("highlight");
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

  // $scope.setupCommentOnModal = function($event){
  //   console.log("click");
  //   console.log($event);
  // }

  $scope.highlight = function(){
    // Get the selection and the correspondent range.
    var s = selection();
    console.log(s);
    var range = null;
    // If the selection is longer than 2 chars
    if(s.toString().length > 2){

      range = s.getRangeAt(0);

      range.startPoint = s.anchorOffset;
      range.endPoint = s.extentOffset;
      var commonContainer = range.commonAncestorContainer;

      if( (commonContainer.nodeName === "P" ||  commonContainer.parentElement.nodeName === "P") && range.startPoint < 2 && commonContainer.toString().length - range.toString().length < 4 ){
        console.log(range.commonAncestorContainer);
        var paraId = null;
        var ancestor = null;

        if(commonContainer.nodeName === "#text"){
          ancestor = $(commonContainer.parentElement);
        }else {
          ancestor = $(commonContainer);
        }

        paraId = ancestor.attr('id');

        if( !paraId ){
          // Create Reference to p element
          paraId = generateParaId()

          ancestor.attr('id', paraId);
        }
        // var comment = new Comment(paraId, "");
        ancestor.addClass('highlight');
        ancestor.addClass($scope.selectionColor);

        ancestor.attr('data-toggle', 'modal');
        ancestor.attr('data-target', '#comment-modal');
        ancestor.attr('ng-click', 'setupCommentOnModal("#'+paraId+'")');

        $('#comment-modal').modal('show');

        $scope.setupCommentOnModal("#"+paraId);


      } else {
        if( (commonContainer.nodeName === "SPAN" ||  commonContainer.parentElement.nodeName === "SPAN") && range.startPoint == 0 && commonContainer.parentElement.innerText.length - range.toString().length == 0){
          var spanId = null;
          var ancestor = null;

          if(commonContainer.nodeName === "#text"){
            ancestor = $(commonContainer.parentElement);
          }else {
            ancestor = $(commonContainer);
          }

          spanId = ancestor.attr('id');

          if( !spanId ){
            // Create Reference to p element
            spanId = generateSpanId()

            ancestor.attr('id', spanId);
          }
          // var comment = new Comment(paraId, "");
          ancestor.addClass('highlight');
          ancestor.addClass($scope.selectionColor);

          ancestor.attr('data-toggle', 'modal');
          ancestor.attr('data-target', '#comment-modal');
          ancestor.attr('ng-click', 'setupCommentOnModal("#'+spanId+'")');

          $('#comment-modal').modal('show');

          $scope.setupCommentOnModal("#"+spanId);

        }else{

          var newNode = document.createElement("span");
          var spanId = generateSpanId();
          console.log(range);

          // TODO come compilare in angular il contenuto aggiunto?
          newNode.setAttribute('id', spanId);
          newNode.setAttribute('data-toggle', 'modal');
          newNode.setAttribute('data-target', '#comment-modal');
          newNode.setAttribute('ng-click', 'setupCommentOnModal("#'+spanId+'")');

          newNode.setAttribute("class", "highlight");
          newNode.className += " "+$scope.selectionColor
          $compile(newNode)($scope);

          try {
            range.surroundContents(newNode);
            // var comment = new Comment(spanId, "");
            $('#comment-modal').modal('show');
            $scope.setupCommentOnModal("#"+spanId);
          }catch(err) {
            showErrors("This selection is not allowed!");
          }

        }
      }

    }else {
      showErrors("The selection is too short to be meaningful");
    }
  }

  var maxCounterPara = 0;
  var maxCounterSpan = 0;

  function generateParaId(){

    $('#article-container p[id^="para-"]').each(function( index ) {
      var num = parseInt($( this ).attr('id').split("-")[1]);
      if(num > maxCounterPara){
        maxCounterPara = num;
      }
    });

    var paraId = 'para-'+(maxCounterPara+1);
    return paraId;
  }

  function generateSpanId(){

    $('#article-container span[id^="fragment-"]').each(function( index ) {
      var num = parseInt($( this ).attr('id').split("-")[1]);
      if(num > maxCounterSpan){
        maxCounterSpan = num;
      }
    });

    var spanId = 'fragment-'+(maxCounterSpan+1);
    return spanId;
  }

  // function createId(element){
  //   element.setAttribute('id', 'parent-'+count)
  //   count++;
  //   return element.getAttribute('id');
  // }

  // function insertNote(note,active) {
  //   // Creo un range
  //   var r = document.createRange()
  //   var node = $('#'+note.node)[0];
  //   // Setto il range
  //   r.setStart(node,note.start);
  //   r.setEnd(node,note.end)
  //   // Creo lo span
  //   var span = document.createElement('span')
  //   span.setAttribute('id',note.id);
  //   span.setAttribute('data-toggle', 'modal');
  //   span.setAttribute('data-target', '#comment-modal');
  //   span.setAttribute('class','highlight');
  //   // Avvolgo il range con lo span
  //   r.surroundContents(span)
  //   $compile(span)(scope);
  // }

  // Utility method: show errors
  function showErrors(message){
    $scope.error = true;
    $scope.message = message;
  }

  // Utility method: hide errors
  function hideErrors(){
    $scope.error = true;
    $scope.message = "";
  }

})

.controller('LoginCtrl', function($scope, AuthService, $rootScope, $window) {
  console.log("login");
  $rootScope.navbar = false;
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

.controller('RegisterCtrl', function($scope, $rootScope, $window, AuthService) {
  console.log("register");
  $rootScope.navbar = false;
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
      console.log(errMsg)
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

.controller('HelpCtrl', function($scope, $routeParams, Api) {
  console.log("help");
})

.controller('AccountCtrl', function($scope, Api) {
  console.log("account");

  $scope.clicked = false;

  // Get user info
  Api.getCurrentUser().then(function(response) {
    console.log(response.data);
    $scope.user = response.data;
  })

  $scope.edit = function(){
    $scope.clicked = true;

  }

});
