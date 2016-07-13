/*
* Controllers module
*
* Contains all the controllers related to each view of the application
*/

angular.module('EasyRashApp.controllers', [])

.controller('AppCtrl', function($scope, Api, $rootScope, $http, CONFIG, $window, AuthService, AUTH_EVENTS) {
  // GLOBAL function to get the logged user informations
  $rootScope.getUser = function() {
    Api.getCurrentUser().then(function(response) {
      if (response.success === true) {
        $rootScope.userMsg = response.msg;
        $rootScope.userInfo = response.data;
      } else {
        $rootScope.userMsg = response.msg;
        $rootScope.userInfo = {};
      }
    })
  };
  // calling get current user function
  $rootScope.getUser();

  // if user isn't authenticated yet, then logout and redirect to login page
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $window.location.href = "/#/login";
    var alertPopup = console.error("Session Lost.\nSorry you have to login again.");
  });

  // Destroy User Session
  $scope.destroySession = function() {
    AuthService.logout();
  };

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
    $scope.reviewer = $rootScope.userInfo;

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
      console.log(msg);
      // reload the page
      // it will automatically check if the user is logged, then redirect to home
      $window.location.reload();
    }, function(errMsg) {
      // if there are server errors, let the user know by console and client alert
      $scope.error = errMsg;
    });
  };
})

.controller('RegisterCtrl', function($scope, $rootScope, $window, AuthService) {
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
      // change location of the page, redirecting to homepage
      $window.location.href = "/#/dash";
      // let the user know he is successfully registered
      var alertPopup = alert("Registered successfully!\nThank you.");
    }, function(errMsg) {
      // if there are server errors, let the user know by console and client alert
      console.log(errMsg)
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
      alert("You must insert your password to update your informations!")
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
          alert("Server error:\n"+response.data.msg);
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

});
