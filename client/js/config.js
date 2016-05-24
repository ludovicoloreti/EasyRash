angular.module("EasyRashApp.config", [])
.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated'
})
.constant("CONFIG", {
  "appVersion": "1.1.0",
  "base_url": "http://localhost:8080",
  "endpoint": "/api",
  "users": "/users",
  "user": "/user",
  "articles": "/articles",
  "article": "/article",
  "event": "/event",
  "events": "/events"
});
