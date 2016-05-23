angular.module("EasyRashApp.config", [])
.constant("CONFIG", {
  "appVersion": "1.1.0",
  "base_url": "http://localhost:8080",
  "users": "/users",
  "user": "/user",
  "articles": "/articles",
  "article": "/article",
  "event": "/event",
  "events": "/events"
});
// .constant("CONFIG", {
//   "appVersion": "1.0.0",
//   "base_url": "http://birimbolla.altervista.org/server/index.php/",
//   "users": "users",
//   "user": "user",
//   "articles": "articles",
//   "article": "article",
//   "event": "event",
//   "events": "events"
// });
