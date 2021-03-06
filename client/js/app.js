angular.module('EasyRashApp', ['ngRoute', 'ngSanitize', 'mgcrea.ngStrap','ui.bootstrap', 'EasyRashApp.config', 'EasyRashApp.controllers', 'EasyRashApp.authServices', 'EasyRashApp.api', 'EasyRashApp.interfaceUtils'])

.run(function($rootScope, AuthService, AUTH_EVENTS, $window) {
  console.info("EasyRashApp is running! Gotta catch'em all!");

  // handling navbar in different controllers (to hide or show the header navbar)
  $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
    if (current.$$route.controller === "RegisterCtrl" || current.$$route.controller === "LoginCtrl")
    {
      $rootScope.navbar = false;
      $rootScope.footerbar = false;
    } else if (current.$$route.controller === "AnnotatorCtrl"){
      $rootScope.navbar = true;
      $rootScope.footerbar = false;
    } else {
      $rootScope.navbar = true;
      $rootScope.footerbar = true;
    }
  });

  // event handler fired when the transition begins
  $rootScope.$on('$stateChangeStart', function (event, next, nextParams, fromState) {
    if (!AuthService.isAuthenticated()) {
      if (next.name !== 'outside.login' && next.name !== 'outside.register') {
        event.preventDefault();
        window.location.href = "/login";
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
  when('/help', {
    templateUrl: 'templates/manual.html'
  }).
  otherwise({
    redirectTo: '/login'
  });
  $httpProvider.interceptors.push('AuthInterceptor');
});
