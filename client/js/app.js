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
    otherwise({
      redirectTo: '/dash'
    });
});
