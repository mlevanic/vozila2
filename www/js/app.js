// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers','ngCordova','starter.cddontrollers','starter.services','starter.novavoznja'])

.run(function($ionicPlatform,$cordovaSQLite) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    if(window.cordova) {
    // App syntax
      db = $cordovaSQLite.openDB("vozilaDB.db");
    } else {
      // Ionic serve syntax
      db = window.openDatabase("vozilaDB.db", "1.0", "Voznipark", -1);
    }

     
          // kreiranje tablica
     // $cordovaSQLite.execute(db, "DELETE TABLE TABLE IF NOT EXISTS team");  
      //$cordovaSQLite.execute(db, "DROP TABLE IF EXISTS VOZILO");             
      $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS VOZILO ( idvozilo integer, vo_registracija text, vo_tip text, vo_model text )");        
      $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS VOZNJA (id integer primary key, idvozilo integer, datum text, stanjekm integer, relacija text, odlazak text, dolazak text, stanjekmdolazak text, sync integer default 0)");            
      $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS TOCENJE(id integer primary key, idvozilo integer, datum text, stanjekm integer,litara real, iznos real, sync integer default 0 )");                  
      $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS TRENUTNAVOZNJA (vo_registracija text, datum text, stanjekm integer, relacija text,  odlazak text, dolazak text, stanjekmdolazak text)");
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
    .state('app.pocetna', {
      url: '/pocetna',
      views: {
         'menuContent': {
            templateUrl: 'templates/pocetna.html',
           controller: 'AppCtrl'
            }
      }
    })

   .state('login', {
        url: '/login',
        templateUrl: "templates/login/login.html",
        controller: 'LoginCtrl'
   })

   .state('app.novavoznja', {
      url: '/novavoznja',
      views: {
        'menuContent': {
          templateUrl: 'templates/novavoznja/novavoznja.html',
          controller:'novavoznja'
        }
      }
    })
    .state('app.tocenjegoriva', {
      url: '/tocenjegoriva',
      views: {
        'menuContent': {
          templateUrl: 'templates/tocenjegoriva.html'
        }
      }
    }) 

    .state('app.onama', {
      url: "/onama",
        views: {
          'menuContent': {
            templateUrl: "templates/onama.html"
          }
        }
    })
    .state('app.dostupnavozila',{
       url:'/dostupnavozila',
       views:{
        'menuContent':{
        templateUrl:'templates/vozila/dostupnavozila.html',
        controller:'DostupnaVozilaCtrl'
        }
       }
    }) 

   .state('app.vozilo', {
      url: '/dostupnavozila/:voziloId',
      views: {
        'menuContent': {
          templateUrl: 'templates/vozilo.html',
          controller: 'VoziloCtrl'
        }
      }
   }); 
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/pocetna');
})

// ovo je za ispravan prikaz vrmena za time inpute ... nije radilo ispravno bez ovoga na uređaju
.directive('formattedTime', function ($filter) {
  return {
    require: '?ngModel',
    link: function(scope, elem, attr, ngModel) {
        if( !ngModel )
            return;
        if( attr.type !== 'time' )
            return;
                
        ngModel.$formatters.unshift(function(value) {
            return value.replace(/:[0-9]+.[0-9]+$/, '');
        });
    }
  };
  
})

.run(function ($rootScope, $state, AuthService, AUTH_EVENTS) {
  $rootScope.$on('$stateChangeStart', function (event,next, nextParams, fromState) {

    if ('data' in next && 'authorizedRoles' in next.data) {
      var authorizedRoles = next.data.authorizedRoles;
      if (!AuthService.isAuthorized(authorizedRoles)) {
        event.preventDefault();
        $state.go($state.current, {}, {reload: true});
        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
      }
    }

    if (!AuthService.isAuthenticated()) {
      if (next.name !== 'login') {
        event.preventDefault();
        $state.go('login');
      }
    }
  });
});
