/*
* Controllers module
*
* Contains all the controllers related to each view of the application
*/

angular.module('EasyRashApp.controllers', [])

.controller('AppCtrl', function($scope, Api, $rootScope, $http, CONFIG, $window, AuthService, AUTH_EVENTS) {
  // GLOBAL function to get the logged user informations
  $rootScope.getUser = function( callback ) {
    Api.getCurrentUser().then(function(response) {
      if (response.success === true) {
        $rootScope.userMsg = response.msg;
        $rootScope.userInfo = response.data;
      } else {
        $rootScope.userMsg = response.msg;
        $rootScope.userInfo = {};
      }
      if(callback){
        callback();
      }
    })
  };
  // calling get current user function
  $rootScope.getUser();

  // if user isn't authenticated yet, then logout and redirect to login page
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $window.location.href = "/#/login";
    var alertPopup = "Session Lost.\nSorry you have to login again.";
  });

  // Logout service
  $scope.logout = function() {
    AuthService.logout();
    // Redirect to login page
    $window.location.href = "/#/login";
  };
})

.controller('DashCtrl', function($scope, Api) {

  // call Api service function "Get list of articles which user can comment"
  Api.getArticlesToReview().then(function(response) {
    $scope.submissions = response.data;
  });
  // call Api service function "Get all events"
  Api.getEvents().then(function(response) {
    $scope.events = response;
  });

})

.controller('AnnotatorCtrl', function($scope, $rootScope, $routeParams, $document, $sce, $location, $uibModal, $anchorScroll, $timeout,$compile, Api) {

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

  // Set the reviewer/chair
  $rootScope.getUser(function(){

    $scope.reviewer = $rootScope.userInfo;
    // Get list of documents the user can review
    getDocList();

    // Get the RASH article
    callApiService();

  });

  // Annotator mode sat false
  $scope.annotatorMode = false;

  /**** User rights ****/
  // Already review switch
  $scope.canReview = false;
  // Can Decide switch
  $scope.canDecide = false;
  $scope.alreadyDecided = false;
  $scope.alreadyReviewed = false;
  /*********************/

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

  // Statistics object
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

  // Person utility methods
  Person.prototype = {
    setChairRole: function(){
      this.as = {
        "@id": "#role2",
        "@type": "role",
        "role_type": "pro:chair",
        "in": ""
      }
    }
  }


  // Review object for the specified article
  function Review(){
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
    // Generates the id of a comment
    generateId: function(comment){
      $scope.commentCounter++;
      return this["@id"]+"-c"+$scope.commentCounter;
    },
    // Insert a comment
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
    // Get the comment by id (the id is the reference)
    getComment: function(commentKey){
      for (var i=0; i<this.comments.length; i++) {
        if (this.comments[i].key == commentKey) {
          return this.comments[i].value ;
        }
      }
    },
    // Delete a comment
    deleteComment: function(commentId){
      for (var i=0; i<this.comments.length; i++) {
        if (this.comments[i].key == commentId) {
          this.comments.splice(i,1) ;
        }
      }
    },
    // Evaluate the article
    evaluateArticle: function(status, score, comment){

      if (status === true) this.article.eval.status = "pso:accepted-for-publication";
      else this.article.eval.status = "pso:rejected-for-publication";

      var s = parseInt(score);

      if(s >= 1 && s < 6) this.article.eval.rank = s;

      this.article.eval.comment = comment;
    },
    // Generate the Json-ld for the RDF. This json is redy to be sent to the server
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

  // Chair Decision object
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
        "rank": "",
        "author": "mailto:"+$scope.reviewer.email,
        "date": new Date().toISOString()
      }
    }
  }

  // Decision handling methods
  Decision.prototype = {
    // Express an evaluation for the article
    evaluateArticle: function(status, score, comment){

      if (status === true) this.article.eval.status = "pso:accepted-for-publication";
      else this.article.eval.status = "pso:rejected-for-publication";

      var s = parseInt(score);

      if(s >= 1 && s < 6) this.article.eval.rank = s;

      this.article.eval.comment = comment;
    },
    // Generate the json-ld before sending it to the server
    generateJsonLD: function(){

      var jsonLD = new Array();
      var person = new Person();
      person.setChairRole();

      jsonLD.push(this);
      jsonLD.push(person);
      return jsonLD;
    }
  }

  // Funciton: get the list of article to review
  function getDocList(){
    Api.getArticlesToReview().then(function(response) {
      // Set the list of submissions
      $scope.submissions = response.data;
    })
  }

  // Get the RASH article
  function callApiService(){
    // Get the article when the page loadthrough the Api service, the article type is processed
    Api.getArticle($routeParams.articleId, "processed").then(function(response) {
      // If I get the normal article I'm in reading mode
      $scope.annotatorMode = false;

      if(response.success){
        // DOM rapresentation for the article
        var doc = parser.parseFromString(response.data, 'text/html');
        // Get the list of scripts
        var scriptList = doc.querySelectorAll('[type="application/ld+json"]');
        // Get the article body
        var docBody = doc.getElementsByTagName("body")[0];

        // MARK - START Set rights
        $scope.isChair = response.chair; // true or false
        $scope.isReviewer = response.reviewer; // true or false
        $scope.isPcMember = response.pcMember; // true or false
        $scope.totalAssignedReviewers = response.numRevs;
        $scope.totalChairs = response.numChairs;

        // If reviewer - can review
        if(response.reviewer){
          $scope.canReview = true;
        }

        // If chair - can decide but not review
        if(response.chair){
          $scope.canDecide = true;
          $scope.canReview = false;
        }
        // MARK - END set rights

        // Stop the loading gif
        $scope.loading = false;

        // Show the article in #article-container
        $scope.articleBody = $sce.trustAsHtml(docBody.innerHTML);

        var annotations = new Array();

        // Trasform the list of scripts in a list of object.
        for (i=0; i < scriptList.length; i++) {
          annotations.push( JSON.parse(scriptList[i].textContent) );
        }

        commentsList = new Array();
        reviewsList = new Array();
        chairDecision = null;

        articleStats.avgVote = 0;

        /*
          For each script tag check the array of annotations:
          The array can contain this array: [ Review, Comment, Person ]
          The array can contain this array: [ Decision, Person ]
         */
        for (i=0; i < annotations.length; i++) {
          var annotation = annotations[i];
          for (j=0; j < annotation.length; j++) {

            // Check the type of annotation
            switch(annotation[j]['@type']){
              case "comment":
              // Get the text of the fragment the comment is referring to
              annotation[j]['refText'] = docBody.querySelectorAll(annotation[j]['ref'])[0] ? docBody.querySelectorAll(annotation[j]['ref'])[0].innerText : "Error: no Reference detected";
              commentsList.push( annotation[j] );
              break;

              case "review":

              // If the user has already commented the article he can't review.
              if(annotation[j]['article']['eval']['author'] === "mailto:"+$scope.reviewer.email){
                $scope.canReview = false;
                $scope.alreadyReviewed = true;
              }

              reviewsList.push( annotation[j] );

              // Set statistics: avg vote
              articleStats.avgVote += parseInt(annotation[j]["article"]["eval"]["rank"]);

              // Set statistics: accepted or rejected
              if (annotation[j]["article"]["eval"]["status"] === "pso:accepted-for-publication"){
                articleStats.numAccept++;
              }else{
                articleStats.numReject++;
              }
              break;

              case "decision":

              // If the user has already decided, he is a chair and can't decide.
              if(annotation[j]['article']['eval']['author'] === "mailto:"+$scope.reviewer.email){
                $scope.canDecide = false;
                $scope.alreadyDecided = true;
              }
              // Set the decision
              chairDecision = annotation[j];
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

        // Set the object containing statistics
        $scope.articleStats = articleStats;

        $scope.reviewCounter = reviewsList.length;

        // If all reviewers have commented the article, the chair can decide
        if(reviewsList.length >= response.numRevs){
          $scope.canDecide = true;
        }else{
          $scope.canDecide = false;
        }

        $scope.commentCounter = commentsList.length;

        // Only one chair can decide. It can be changed in an easy way using this counter
        $scope.decisionCounter = 1;

        $scope.commentsList = commentsList;
        $scope.reviewsList = reviewsList;
        $scope.chairDecision = chairDecision;

      }else {
        // Stop the loading gif
        $scope.loading = false;
        // Show the article in #article-container
        $scope.articleBody = $sce.trustAsHtml('<h1>Ops... something went wrong.</h1><p>This file seems to be not present...<br>A large team of Pokemon Trainers is working hard on it. In the meantime, gotta catch\'em all!</p><p>Return to <a href="/#/dash">dashboard</a>.</p>');
      }
    });
  }

  // Show and hide all comments using random colors
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
    if(review && review.comments.length > 0){
      var answer = confirm("You have unsaved content. If you leave the page all your work will be lost.\nAre you sure to exit?")
      if (!answer) {
        event.preventDefault();
      }
    }
  });

  // Funciton: Load the original RASH article prepared for the review
  $scope.loadRash = function(){
    Api.getArticle($routeParams.articleId, "unprocessed").then(function(response) {

      if(response.success){
        $scope.annotatorMode = true;

        // Create the review
        review = new Review();

        // Load the unprecessed rash file to #article-container
        $scope.articleBody = $sce.trustAsHtml(response.data.body);
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
    return article.html();
  }
  // Function: dave the chair decision
  $scope.saveDecision = function(d){

    var decision = new Decision();
    if( d.text && d.status !== undefined && !isNaN($scope.articleStats.avgVote) ){
      decision.evaluateArticle(d.status, $scope.articleStats.avgVote, d.text);


      var data = {};
      data.articleName = $routeParams.articleId;
      data.decision = decision.generateJsonLD();

      // If the chair can decide save the decision.
      if($scope.canDecide && !$scope.alreadyDecided){
        Api.saveDecision(data).then(function(response) {
          callApiService();
        });
      }
    }


  }

  // Function: Save the list of comments by sending it to the server.
  $scope.saveAnnotations = function(){

    if(review && review.comments.length > 0 ){
      if(review.article.eval.status !== "") {
        var data = {};
        data.annotations = review.generateJsonLD();
        data.article = prepareArticle();
        data.articleName = $routeParams.articleId;

        Api.saveAnnotations(data).then(function(response) {
          review = null;
          callApiService();
        });
      }else {
        showErrors("You must accept or reject the article before saving your annotations.")
      }

    }else {
      showErrors("No comments.")
    }
  }

  // Function: exit the annotator mode
  $scope.exit = function(){
    // If the user has unsaved annotations
    if(review && review.comments.length > 0){
      var answer = confirm("You have unsaved content. If you leave the page all your work will be lost.\nAre you sure to exit?")
      if (answer) {
        review = null;
        callApiService();
      }
    }else{
      callApiService();

    }
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

      review.pushComment(comment);
    }
  }

  // Funciton: delete the comment relate to a fragment and the fragment too
  // INVOKED BY - Comment modal
  $scope.deleteComment = function(input){
    var keepRef = false;
    var isSpan = input.fragmentId.indexOf('fragment') > -1;

    for(var i=0; i<commentsList.length; i++){
      if (commentsList[i]['ref'] === input.fragmentId){
        keepRef = true;
      }
    }

    if( keepRef ){
      // TODO REMOVE ALL ATTRIBUTES
      $(input.fragmentId).removeClass();
      $(input.fragmentId).removeClass("highlight");
      $(input.fragmentId).removeAttr("data-toggle");
      $(input.fragmentId).removeAttr("data-target");
      $(input.fragmentId).removeAttr("ng-click");
    }else if(isSpan) {
      $(input.fragmentId).replaceWith(function() {
        return $(this).contents();
      });
    }else {
      $(input.fragmentId).removeClass();
      $(input.fragmentId).removeClass("highlight");
      $(input.fragmentId).removeAttr("data-toggle");
      $(input.fragmentId).removeAttr("data-target");
      $(input.fragmentId).removeAttr("ng-click");
    }

    review.deleteComment(input.fragmentId);
  }

  // When a user is creating a comment and cancel the action
  $scope.cancel = function(input){

    var comment = review.getComment(input.fragmentId);
    // If no comment is present, clear the selection
    if ( !comment ){
      var keepRef = false;
      var isSpan = input.fragmentId.indexOf('fragment') > -1;
      if(commentsList.length > 0)
      {
        for(var i=0; i<commentsList.length; i++){
          if (commentsList[i]['ref'] === input.fragmentId){
            keepRef = true;
            break;
          }
        }
      } else {
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
    if(e.comment && e.status !== undefined && e.vote.current){
      review.evaluateArticle(e.status, e.vote.current, e.comment);
    }
  }

  // Function: show the list of comments
  // INVOKED BY: #comment-list-modal
  $scope.showComments = function(){
    $scope.cs = review.comments;
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
    $location.hash(id);
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

  // Highlight a selection
  $scope.highlight = function(){
    // Get the selection and the correspondent range.
    var s = selection();
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
      if( commonContainer.nodeName === "P"  && range.startPoint < 2 && commonContainer.innerText.toString().length - range.toString().length < 4 ){
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

  // don't show the header navbar in the login page
  $rootScope.navbar = false;
  // check if the user is already authenticated
  if (AuthService.isAuthenticated() === true) {
    // if is authenticated redirect him to the homepage
    $window.location.href = "/#/dash";
  }

  // setting user fields for login
  $scope.user = {
    email: '',
    pass: ''
  };

  // when the user click on the login button
  $scope.login = function() {
    // call the AuthService login funciton and post the user data in the func
    AuthService.login($scope.user).then(function(msg) {
      // reload the page
      // it will automatically check if the user is logged, then redirect to home
      $window.location.reload();
    }, function(errMsg) {
      // if there are server errors, let the user know by console and client alert
      $scope.error = errMsg;
    });
  };
})

.controller('RegisterCtrl', function($scope, $rootScope, $timeout, $location, $window, AuthService) {

  // don't show the header navbar in the registration page
  $rootScope.navbar = false;
  // check if the user is already authenticated
  if (AuthService.isAuthenticated() === true) {
    // if is authenticated redirect him to the homepage
    $window.location.href = "/#/dash";
  }

  // setting user fields for registration
  $scope.user = {
    email: '',
    pass: '',
    given_name: '',
    family_name: '',
    sex: ''
  };

  // when the user click on the register button
  $scope.signup = function() {
    // call the AuthService service -lol- and it's function register with user data
    AuthService.register($scope.user).then(function(msg) {
      // let the user know he is successfully registered
      $scope.info = "Registered successfully!\nCheck your email to confirm.";
      // change location of the page, redirecting to homepage
      $timeout(function() {
        $location.path('/#/login');
        }, 3000);

    }, function(errMsg) {
      // if there are server errors, let the user know by console and client alert
      $scope.error = errMsg;
    });
  };
})

.controller('EventsCtrl', function($scope, Api) {
  // call the Api service "get all events"
  Api.getEvents().then(function(response) {
    // set the scope eventInfo with the server response (all events in the scope)
    $scope.eventsList = response;
  })
})

.controller('EventCtrl', function($scope, $routeParams, Api) {
  // call the Api service "get single event" by id passed by route params
  Api.getEvent($routeParams.eventId).then(function(response) {
    // set the scope eventInfo with the server response (single event in the scope)
    $scope.eventInfo = response;
  })
})

.controller('AccountCtrl', function($scope, $rootScope, Api) {
  // call the get current user function
  $rootScope.getUser();
  // by default user-info's page is non-editable
  $scope.clicked = false;
  // setting rootScope userinfo as scope user
  $scope.user = $rootScope.userInfo;

  // when the user click on the save button (update user infos)
  $scope.update = function(data) {
    // if the field for the current password is empty
    if((typeof (data.oldPass) === undefined) || (data.oldPass === "")) {
      // alert the user who has to insert it to save infos
      showInfo("You must insert your password to update your informations!")
    } else {
      // if is all correct, then call the api update user with the data edited
      Api.updateUser(data).then(function(response) {
        // if server's answer is success (true)
        if (response.data.success === true) {
          // update the client user scope with server's response
          $scope.user = response.config.data;
          // and change the editable state in non-editable
          $scope.clicked = false;
        } else {
          // if server success is false, then let the user know what's the server's error
          showInfo(response.data.msg);
        }
      });
    }
  }

  // when the user wnat to cancel what's doing
  $scope.undo = function(){
    // reload the page to avoid saving somethin' the user doesn't want.
    window.location.reload();
  }

  // when the user want to edit his informations
  $scope.edit = function(){
    // reset password fields to avoid security problems
    $scope.user.oldPass = "";
    $scope.user.newPass = "";
    // show input fileds editable
    $scope.clicked = true;
  };

  // Utility method: show info
  function showInfo(message){
    $scope.info = true;
    $scope.message = message;
  }

  // Utility method: hide info
  $scope.hideInfo = function(){
    $scope.info = false;
    $scope.message = "";
  }

});
