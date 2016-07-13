/*
* Controllers module
*
* Contains all the controllers related to each view of the application
*/

angular.module('EasyRashApp.controllers', [])

.controller('AppCtrl', function($scope, Api, $rootScope, $http, CONFIG, $window, AuthService, AUTH_EVENTS) {

  // if user isn't authenticated yet, then logout and redirect to login page
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

  // Get the logged user
  Api.getCurrentUser().then(function(response) {
    $scope.memberinfo = response.data;
    console.log("Current User:\n",response);
  })
})

.controller('ArticlesCtrl', function($scope) {
})

.controller('ArticleCtrl', function($scope, $routeParams) {
  // console.log("Article - ", $routeParams.articleId)
})

.controller('AnnotatorCtrl', function($scope, $routeParams, $document, $sce, $location, $uibModal, $anchorScroll, $timeout,$compile, Api) {

  /***************** START SETUP ********************/

  // Loading gif activated
  $scope.loading = true;
  // Object used to create a DOM representation of the RASH article
  var parser = new DOMParser();
  // Review on the article
  var review = null;
  //List of comments, decisions and reviews from other reviewers
  var commentsList = null;
  var reviewsList = null;
  var decisionsLIst = null;

  // Get the logged user
  getCurrentUser();

  // Get list of documents the user can review
  getDocList();

  // Get the RASH article
  callApiService();

  // Annotator mode sat false
  $scope.annotatorMode = false;

  // Already review switch
  $scope.canReview = true;

  // Can Decide switch
  $scope.canDecide = false;
  $scope.alreadyDecided = false;

  // Default highlight color
  $scope.selectionColor = "yellow"

  // Sidebar set open
  $scope.sidebarClosed = null;

  // Array of colors
  var colorList = ["yellow", "orange", "purple", "blue", "green"]

  // Article rating serttings
  $scope.eval = {};
  $scope.rating = 0;
  $scope.eval.vote = {
      current: 1,
      max: 5
  }

  var articleStats = {};
  articleStats.avgVote = 0;
  articleStats.numAccept = 0;
  articleStats.numReject = 0;

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
  /******************** END SETUP ************************/

  // Person object: RDF reviewer rapresentation
  function Person(){
    this["@context"] = "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json";
    this["@type"] = "person";
    this["@id"] = "mailto:"+$scope.reviewer.email;
    this["name"] = $scope.reviewer.given_name+" "+$scope.reviewer.family_name;
    this["as"] =  {
      "@id": "#role1",
      "@type": "role",
      "role_type": "pro:reviewer",
      "in": ""
    }
  }


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
        "comment": "",
        "rank": "",
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
    evaluateArticle: function(status, score, comment){

      if (status) this.article.eval.status = "pso:accepted-for-publication";
      else this.article.eval.status = "pso:rejected-for-publication";

      score = parseInt(score);

      if(score > 1 && score < 6) this.article.eval.rank = score;

      this.article.eval.comment = comment;
      console.log(this.article);
    },
    generateJsonLD: function(){
      var list = new Array();
      var jsonLD = {};
      jsonLD["@context"] = this["@context"];
      jsonLD["@type"] = this["@type"];
      jsonLD["@id"] = this["@id"];
      jsonLD["article"]= this["article"];
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

  function Decision() {
    this["@context"] = "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json";
    this["@type"] = "decision";
    this["@id"] = "#decision"+$scope.decisionCounter;
    this["article"] = {
      "@id": "",
      "eval": {
        "@id": this["@id"]+"-eval",
        "@type": "score",
        "status": "",
        "comment": "",
        "score": "",
        "author": "mailto:"+$scope.reviewer.email,
        "date": new Date().toISOString()
      }
    };
    this["comments"] = new Array()
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
      console.log(response);
      if(response.success){

        var doc = parser.parseFromString(response.data, 'text/html');
        var scriptList = doc.querySelectorAll('[type="application/ld+json"]');
        var docBody = doc.getElementsByTagName("body")[0];

        // DEFINING SCOPE -ROLE- VARIABLES SUCH AS "chair, pc_member, reviewer"
        $scope.isChair = response.chair; // true or false
        $scope.isReviewer = response.reviewer; // true or false
        $scope.isPcMember = response.pcMember; // true or false
        $scope.totalAssignedReviewers = response.numRevs;
        $scope.totalChairs = response.numChairs;
        // Stop the loading gif
        $scope.loading = false;

        // Show the article in #article-container
        $scope.articleBody = $sce.trustAsHtml(docBody.innerHTML);


        var annotations = new Array();

        for (i=0; i < scriptList.length; i++) {
          annotations.push( JSON.parse(scriptList[i].textContent) );
        }

        // console.log(annotations)
        commentsList = new Array();
        reviewsList = new Array();
        decisionsList = new Array();

        articleStats.avgVote = 0;

        for (i=0; i < annotations.length; i++) {
          var annotation = annotations[i];
          for (j=0; j < annotation.length; j++) {

            // If the user has already commented the article it can't review.
            if(annotation[j]['author'] === "mailto:"+$scope.reviewer.email){
              $scope.canReview = false;
            }

            switch(annotation[j]['@type']){
              case "comment":
              console.log("#article-container "+annotation[j]['ref']);
              annotation[j]['refText'] = docBody.querySelectorAll(annotation[j]['ref'])[0] ? docBody.querySelectorAll(annotation[j]['ref'])[0].innerText : "Error: no Reference detected";
              commentsList.push( annotation[j] );
              break;
              case "review":
              console.log(annotation[j]);
              reviewsList.push( annotation[j] );

              console.log(annotation[j]);

              articleStats.avgVote += parseInt(annotation[j]["article"]["eval"]["rank"]);
              console.log(articleStats.avgVote);

              if (annotation[j]["article"]["eval"]["status"] === "pso:accepted-for-publication"){
                articleStats.numAccept++;
              }else{
                articleStats.numReject++;
              }
              break;
              case "decision":

              if(annotation[j]['author'] === "mailto:"+$scope.reviewer.email){
                $scope.alreadyDecided = true;
              }
              decisionsList.push( annotation[j] );
              break;
            }
          }
        }
        // Set the average vote:
        if(articleStats.avgVote == 0 || reviewsList.length == 0 ){
          articleStats.avgVote = "No Vote";
        } else {
          articleStats.avgVote = articleStats.avgVote/reviewsList.length;
        }
        $scope.articleStats = articleStats;

        $scope.reviewCounter = reviewsList.length;

        if(reviewsList.length >= response.numRevs){
          $scope.canDecide == true;
        }

        console.log($scope.reviewCounter);
        $scope.commentCounter = commentsList.length; // TODO find a better solution
        console.log($scope.commentCounter);
        $scope.decisionCounter = decisionsList.length;

        console.log(commentsList);
        console.log(reviewsList);

        $scope.commentsList = commentsList;
        $scope.reviewsList = reviewsList;
        // Fine Prova
      }else {
        // Stop the loading gif
        $scope.loading = false;
        // Show the article in #article-container
        $scope.articleBody = $sce.trustAsHtml('<h1>Something went wrong.</h1><p>This file seems not present...</p><p>Return to <a href="/#/dash">dashboard</a>.</p>');
      }
    });
  }

  var s = true;
  $scope.showAllComments = function(){

    var author = "";
    var color = 0;

    if(s){
      s = false;
      for( var i=0; i < commentsList.length; i++) {

        var ref = commentsList[i].ref;

        if(commentsList[i].author !== author ){
          author = commentsList[i].author;
          color = colorList[parseInt(Math.random() * 5)];
        }
        $("#article-container "+ref).addClass("highlight "+color);
      }
    }else {
      s = true;
      for( var i=0; i < commentsList.length; i++) {
        var ref = commentsList[i].ref;
        $("#article-container "+ref).removeClass("highlight");
        for(var c = 0; c < colorList.length; c++){
          $("#article-container "+ref).removeClass(colorList[c]);
        }

      }
    }
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

  // Funciton: prepare the article before it is sent to the server.
  function prepareArticle(){
    var article = $("#article-container");
    article.find('*').each(function( index ) {

      if( $(this).attr('id') ){
        /* If the id is an id used by EasyRashApp for the annotation process it means it has
          a lot of other attributes that needs to be deleted before the article is sent to the server.
        */
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

  // Function: Save the list of comments by sending it to the server.
  $scope.saveAnnotations = function(){
    console.log(review);

    if(review.comments.length > 0){
      if(review.article.eval.status !== "") {
        var data = {};
        data.annotations = review.generateJsonLD();
        data.article = prepareArticle();
        data.articleName = $routeParams.articleId;

        Api.saveAnnotations(data).then(function(response) {
          console.log(response);
          //callApiService();
        });
      }else {
        showErrors("You must accept or reject the article before saving your annotations.")
      }

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

  // Function: save the comment related to a fragment
  // INVOKED BY: Comment modal
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

  // Funciton: delete the comment relate to a fragment and the fragment too
  // INVOKED BY - Comment modal
  $scope.deleteComment = function(input){
    console.log("Delete");
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

  // Function: set of the modal used for insert, update, delete a comment on a fragment
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

  // Function: evaluate article (reviewer)
  $scope.saveEval = function(e){
    console.log(e);
    if(e.comment && e.status !== undefined && e.vote.current){
      console.log(e);
      review.evaluateArticle(e.status, e.vote.current, e.comment);
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

  // Return the current selection, compatible with all browsers
  function selection(){
    if (window.getSelection) {
      return window.getSelection();
    } else if (document.getSelection) {
      return document.getSelection();
    } else if (document.selection) {
      return document.selection.createRange().text;
    }
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
      if(range.commonAncestorContainer.parentElement.nodeName === "P"){
        commonContainer = commonContainer.parentElement
      }
      console.log(range);
      console.log(commonContainer.parentElement.innerText);

      console.log(range.startPoint < 2);
      console.log(commonContainer.nodeName === "P");
      console.log(commonContainer.innerText.toString().length );
      console.log(range.toString().length)
      if( commonContainer.nodeName === "P"  && range.startPoint < 2 && commonContainer.innerText.toString().length - range.toString().length < 4 ){
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

  // Number of fragment/para in the current docuement, used to craete the incremental and unique id
  var maxCounterPara = 0;
  var maxCounterSpan = 0;

  // Generate id for a selected paragraph
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

  // Generate the id of a selected fragment
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

  // Utility method: show errors
  function showErrors(message){
    $scope.error = true;
    $scope.message = message;
  }

  // Utility method: hide errors
  $scope.hideErrors = function(){
    $scope.error = false;
    $scope.message = "";
  }

})

.controller('LoginCtrl', function($scope, AuthService, $rootScope, $window) {
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
      $window.location.reload();
    }, function(errMsg) {
      $scope.error = errMsg;
    });
  };
})

.controller('RegisterCtrl', function($scope, $rootScope, $window, AuthService) {
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
  Api.getEvents().then(function(response) {
    $scope.eventsList = response;
  })
})

.controller('EventCtrl', function($scope, $routeParams, Api) {
  Api.getEvent($routeParams.eventId).then(function(response) {
    console.log("> Evento:\n",response);
    $scope.eventInfo = response;
  })
})

.controller('HelpCtrl', function($scope, $routeParams, Api) {
})

.controller('AccountCtrl', function($scope, Api) {

  $scope.update = function(data) {
    console.log(data)
    if(data.oldPass === undefined) {
      alert("Devi inserire la password attuale per effettuare le modifiche richieste!")
    } else {s
      Api.updateUser(data).then(function(response) {
        console.log(response)
        $scope.user = response.config.data;
        $scope.clicked = false;
      });
    }
  }
  $scope.clicked = false;

  $scope.undo = function(){
    // reload the page to avoid to save something we dont wantss
    window.location.reload();
  }
  // Get user info
  Api.getCurrentUser().then(function(response) {
    // get the current user
    $scope.user = response.data;
  });

  $scope.edit = function(){
    // reset password fields
    $scope.user.oldPass = "";
    $scope.user.newPass = "";
    $scope.clicked = true;
  };

});
