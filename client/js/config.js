/*
 * Configuration module
 * Contains constants and url abbreviations
*/
angular.module("EasyRashApp.config", [])
.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated'
})
.constant("CONFIG", {
  "appVersion": "1.5.0",
  "base_url": "http://localhost:8080",
  "endpoint": "/api",
  "users": "/users",
  "user": "/user",
  "articles": "/articles",
  "article": "/article",
  "raw_article": "/raw-article",
  "event": "/event",
  "events": "/events",
  "register": "/signup",
  "login": "/authenticate",
  "userinfo": "/memberinfo",
  "doclist": "/doclist",
  "save_annotations": "/save-annotations",
  "updateUser": "/userUpdate"
});
