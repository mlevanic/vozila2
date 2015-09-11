angular.module('starter.cddontrollers', [])


.controller('DostupnaVozilaCtrl',['$scope','$cordovaSQLite','$timeout', 'PtrService','$http' ,function($scope,$cordovaSQLite,$timeout, PtrService,$http) {
//  $scope.dostupnavozila = [];
 
  // $scope.dostupnavozila = [
  //   { title: 'Mercedes W140', id: 1 },
  //   { title: 'VW Lupo 1.0', id: 2 },
  //   { title: 'Opel Astra GTC', id: 3 },
  //   { title: 'Fiat Bravo 1.6', id: 4 },
  //   { title: 'Mazda 323', id: 5 },
  //   { title: 'Ford Escort 1.0', id: 6 }
  // ]; 
  var popisvozila=function(){
     $scope.dostupnavozila = [];
        var query = "SELECT * FROM VOZILO";
       var refreshed = false;      
       $cordovaSQLite.execute(db,query,[]).then(function(res){
       // console.log();
        for (var i = 0; i < res.rows.length; i++) {
          $scope.dostupnavozila.push(res.rows.item(i));
          console.log(res.rows.item(i));
        };

       })

  }
  popisvozila();
  var obrisivozila=function(){
     var query = "DELETE from  VOZILO";
        $cordovaSQLite.execute(db, query, []).then(function(res) {
            console.log("PODACI OBRISANI");
        }, function (err) {
            console.error(err);
        });
  }

  var dodajkola=function(id, registracija,tip,vmodel){
      var query = "INSERT INTO VOZILO (idvozilo,vo_registracija,vo_tip,vo_model) VALUES (?,?,?,?)";
        $cordovaSQLite.execute(db, query, [id,  registracija,tip,vmodel]).then(function(res) {
            console.log("INSERT ID -> " + res.insertId);
        }, function (err) {
            console.error(err);
        });
   }; 

    $scope.refreshVozila = function() {

      console.log('Osvježavam listu!');
      $timeout(function() {
          
        console.log('u vozilarefresh');
         $http.get("http://vozila.mobilniured.com/WEB_vozila_api/vozilo.php?login=alen").success(function(response){            
            if (response.length>0) {
            obrisivozila();              
            x=response[1][1];        
            console.log(x); 
             for (var i = 0; i < response.length; i++) {
               console.log(response[i][0]+'-'+response[i][1]+'-'+response[i][2]+'-'+response[i][3]);
               dodajkola(response[i][0],response[i][1],response[i][2],response[i][3]);
             }
            }
            else {
              //ako ne uspije veza
            
            }
          }).error(function(){
            //ako odbije
          
      });
   

      //Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');

    }, 1000);
      popisvozila();
  };

}])
