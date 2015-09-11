angular.module('starter')

.service('AuthService', function($q, $http, USER_ROLES) {
  var LOCAL_TOKEN_KEY = 'vozilaToken1';
  var username = '';
  var isAuthenticated = false;
  var role = '';
  var authToken;  

  function loadUserCredentials() {
    var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
    if (token) {
      useCredentials(token);
    }
  }

  function storeUserCredentials(token) {
    window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
    useCredentials(token);
  }

  function useCredentials(token) {
    username = token.split('.')[0];
    isAuthenticated = true;
    authToken = token;      
    // Set the token as header for your requests!
    $http.defaults.headers.common['X-Auth-Token'] = token;
  }

  function destroyUserCredentials() {
    authToken = undefined;
    username = '';
    isAuthenticated = false;
    $http.defaults.headers.common['X-Auth-Token'] = undefined;
    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
  }

  var login = function(name, pw) {
    return $q(function(resolve, reject) {
      var x="";     
      $http.get("http://vozila.mobilniured.com/WEB_vozila_api/operater.php?login="+name+"&pswd="+pw).success(function(response){            
        if (response.length>0) {
        x=response[0][1];
        storeUserCredentials(name+'.yourServerToken');
        console.log('iks',x);                
        resolve('Login success.',x);
        }
        else {
        reject('Login Failed.');
        }
      }).error(function(){
        reject('Login Failed.');
      });    
       // if ((name == 'admin' && pw == '1') || (name == 'user' && pw == '1')) {
      //   // Make a request and receive your auth token from your server
      //   storeUserCredentials(name + '.yourServerToken');
      // //   console.log('clickPrevent','este');
      //   resolve('Login success.');
      // } else {
      //   reject('Login Failed.');
      // }
    });
  };

  var logout = function() {
    destroyUserCredentials();
  };

  var isAuthorized = function(authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (isAuthenticated && authorizedRoles.indexOf(role) !== -1);
  };

  loadUserCredentials();

  return {
    login: login,
    logout: logout,
    isAuthorized: isAuthorized,
    isAuthenticated: function() {return isAuthenticated;},
    username: function() {return username;},
    role: function() {return role;},    
  };
})


.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
        403: AUTH_EVENTS.notAuthorized
      }[response.status], response);
      return $q.reject(response);
    }
  };
})


.config(function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
});
