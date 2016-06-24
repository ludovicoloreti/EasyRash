angular.module('EasyRashApp', ['ngRoute', 'ngSanitize','ui.bootstrap', 'EasyRashApp.config', 'EasyRashApp.controllers', 'EasyRashApp.authServices', 'EasyRashApp.api', 'EasyRashApp.interfaceUtils'])

.run(function($rootScope, AuthService, AUTH_EVENTS, $window) {
  console.info("EasyRashApp is running bitchh!");
  $rootScope.$on('$stateChangeStart', function (event, next, nextParams, fromState) {

    if (!AuthService.isAuthenticated()) {
      console.log(next.name);
      if (next.name !== 'outside.login' && next.name !== 'outside.register') {
        event.preventDefault();
        window.location.href = "/login";

        //$state.go('outside.login');
      }
    }
  });
})

.config(function($routeProvider,$httpProvider) {
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
  // TODO da rivedere
  when('/annotation-page/:articleId', {
    templateUrl: 'templates/annotation-page.html',
    controller: 'AnnotatorCtrl'
  }).
  when('/account', {
    templateUrl: 'templates/account.html',
    controller: 'AccountCtrl'
  }).
  when('/login', {
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  }).
  when('/register', {
    templateUrl: 'templates/register.html',
    controller: 'RegisterCtrl'
  }).
  when('/events', {
    templateUrl: 'templates/events.html',
    controller: 'EventsCtrl'
  }).
  when('/event/:eventId', {
    templateUrl: 'templates/event.html',
    controller: 'EventCtrl'
  }).
  otherwise({
    redirectTo: '/login'
  });
  $httpProvider.interceptors.push('AuthInterceptor');
});
