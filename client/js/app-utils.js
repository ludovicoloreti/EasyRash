angular.module('EasyRashApp.appUtils', [])

.factory('AppService', function(){

  var Person = function(){}

  var Article = function(){}

  var Review = function(article){
    this.type = "review";
    this.id = null;
    this.article = article
    this.comments = new Map();

    var generateId = function(comment){
      // TODO implement
      return "review1";
    }

    return {
      pushComment: function(comment){

        comment.setId( generateId(comment) );
        comments.set(comment.getId(), comment);
        return comment;
       },
      getComment: function(commentId){
        return comments.get(commentId);

       },
      deleteComment: function(commentId){
        comments.delete(commentId);
      }
    }

  }

  var Comment = function(ref, text, author){
    this.id = null;
    this.text = text;
    this.ref = ref;
    this.author = author;
    this.date = new Date();

    return {
      setId: function(id){
        this.id = id;
      },
      getId: function(){
        return this.id;
      },
      setText: function(text){
        this.text = text;
      }
    }
  }

  return {
    Comment : Comment,
    Review: Review,
    Article: Article,
    Person: Person
  }

});
