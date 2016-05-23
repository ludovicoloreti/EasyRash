angular.module('EasyRashApp', ['ngRoute', 'ngSanitize', 'ui.bootstrap', 'EasyRashApp.config', 'EasyRashApp.controllers', 'EasyRashApp.services'])

.run(function() {
  console.info("EasyRashApp is running bitchh!");
})

.config(function($routeProvider) {
  $routeProvider.
    when('/dash', {
      templateUrl: 'templates/dash.html',
      controller: 'DashCtrl'
    }).
    when('/articles', {
      templateUrl: 'templates/articles.html',
      controller: 'ArticlesCtrl'
    }).
    when('/article/:articleId', {
      templateUrl: 'templates/article.html',
      controller: 'ArticleCtrl'
    }).
    when('/account', {
      templateUrl: 'templates/account.html',
      controller: 'AccountCtrl'
    }).
    when('/login', {
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
    }).
    when('/events', {
      templateUrl: 'templates/events.html',
      controller: 'EventsCtrl'
    }).
    otherwise({
      redirectTo: '/dash'
    });
});
