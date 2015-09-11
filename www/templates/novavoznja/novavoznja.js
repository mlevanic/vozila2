angular.module('starter.novavoznja', [])

.controller('novavoznja', ['$scope','$cordovaSQLite', '$state','$ionicHistory' , function($scope,$cordovaSQLite,$state,$ionicHistory){

  var idinapocetnubezHistory =function () { //da ne kopiram kod kad mitreba
   $ionicHistory.nextViewOptions({
           disableBack: true
        });
        $state.go('app.pocetna'); 
  }

  var brisiaktivnuvoznju=function(){
   var query = "DELETE from  TRENUTNAVOZNJA";     
   $cordovaSQLite.execute(db, query, []).then(function(res) {
        console.log("PODACI o trenutnojvoznji OBRISANI");
    }, function (err) {
        console.error(err);
    });
  }

	var finit=function() { //provjera ima li započeta vožnja.. ako ima nastavak ako ne nova vožnja
     
		 $scope.aktivnavoznja={};
		 
		 var query = "SELECT vo_registracija,datum,stanjekm, relacija,odlazak FROM TRENUTNAVOZNJA";   		 
		$cordovaSQLite.execute(db, query, []).then(function(res) {			
     //alert(res.rows.length);  
     if (res.rows.length==0) {     	
  		// hint provjeri da li ima defaul vozilo pa ga pošalji u popisvozila
        $scope.aktivnavoznja.relacija="";  //probaj otkriti lokaciju glavnu
        $scope.aktivnavoznja.registracija="";        
        $scope.aktivnavoznja.vdatumvoznje = new Date();
        $scope.aktivnavoznja.vpocetnovrijeme =new Date();
        $scope.aktivnavoznja.vstanjekm=0;       // todo provjeri imaš li kilometražu za kola aktivna (to treba na izlazu iz comboboxa)
        $scope.aktivnavoznja.dolazak=new Date();
        $scope.aktivnavoznja.stanjedolazak=0;
  			popisvozila("0");
     	}
     else
     	{       
       var vdat= new Date(res.rows.item(0).datum); 
       var vvrijeme=new Date(res.rows.item(0).odlazak);
       console.log(typeof(vdat));
       $scope.aktivnavoznja.relacija=res.rows.item(0).relacija;  
       $scope.aktivnavoznja.registracija=res.rows.item(0).registracija; 
       $scope.aktivnavoznja.vstanjekm=res.rows.item(0).stanjekm;                 
       $scope.aktivnavoznja.vpocetnovrijeme =vvrijeme;
       $scope.aktivnavoznja.vdatumvoznje = vdat;
       $scope.aktivnavoznja.dolazak=new Date();
       $scope.aktivnavoznja.stanjedolazak=0;       
       popisvozila(res.rows.item(0).vo_registracija);
       
     	};
        
    }, function (err) {
      console.error(err);
    });	
	}

	finit();  

	var popisvozila=function(odabranovozilo){
     $scope.dostupnavozila = [];
       var postavinavozilo=0;
       var query = "SELECT vo_registracija FROM VOZILO";
       var refreshed = false;      
       $cordovaSQLite.execute(db,query,[]).then(function(res){
       // console.log();
        for (var i = 0; i < res.rows.length; i++) {
          $scope.dostupnavozila.push(res.rows.item(i));
          console.log(res.rows.item(i));
          if (res.rows.item(i).vo_registracija==odabranovozilo){
            postavinavozilo=i;  //ako je započeta vožnja postavi na vozilo s odabranom reg oznakom
          }
        };        
     		$scope.odabraniauto = $scope.dostupnavozila[postavinavozilo]; 
       })
  }

  $scope.zapocnivoznju=function(aktivnavoznja,odabraniauto){  
    //provjeri ima li započeta vožnja i onda samo napravi update podataka
    var query="SELECT vo_registracija FROM TRENUTNAVOZNJA";
    $cordovaSQLite.execute(db,query,[]).then(function(res) {
        if (res.rows.length==0){
            query = "INSERT INTO TRENUTNAVOZNJA (vo_registracija,datum,stanjekm, relacija,odlazak) VALUES (?,?,?,?,?)";
            $cordovaSQLite.execute(db, query, [odabraniauto.vo_registracija,aktivnavoznja.vdatumvoznje,aktivnavoznja.vstanjekm, aktivnavoznja.relacija, aktivnavoznja.vpocetnovrijeme]).then(function(res) {
                console.log("INSERT ID -> " + res.insertId);
            }, function (err) {
                console.error(err);
            });
        }
        else{
          console.log("update TRENUTNAVOZNJA");
          query = "UPDATE TRENUTNAVOZNJA SET vo_registracija=(?) ,datum=(?),stanjekm=(?), relacija=(?),odlazak=(?)";
           $cordovaSQLite.execute(db, query, [odabraniauto.vo_registracija,aktivnavoznja.vdatumvoznje,aktivnavoznja.vstanjekm, aktivnavoznja.relacija, aktivnavoznja.vpocetnovrijeme]).then(function(res) {
                console.log("uPDATE USPIO");
            }, function (err) {
                console.error(err);
            });
        }
       idinapocetnubezHistory();
    }, function (err) {
        console.error(err);
    });
  }

  $scope.alertaj=function(auto) {
  	alert("odabrani:"+auto);
  
  } 


  // provjera kilometraže za auto nakon selecta
  $scope.provjerikilometrazu=function(registracija){
    //NAĐI ID AUTOA
   var voziloID=0; 
   var query="SELECT idvozilo FROM VOZILO where vo_registracija=?";    
    $cordovaSQLite.execute(db, query, [registracija]).then(function(res) {
           console.log("tražim id vozila");
           if (res.rows.length>0){ //postavi u modelu vrijednost kilometraže
             voziloID=res.rows.item(0).idvozilo;  
             console.log(res.rows.item(0).idvozilo);   
             console.log(voziloID);
              var  query2="SELECT stanjekmdolazak FROM VOZNJA where idvozilo=? order by stanjekmdolazak desc limit 1";
                $cordovaSQLite.execute(db, query2, [voziloID]).then(function(res2) {
                    console.log("query za kilometražu");
                    if (res2.rows.length>0){ //postavi u modelu vrijednost kilometraže
                      console.log(res2.rows.item(0).stanjekmdolazak);
                    }
                }, function (err) {
                    console.error(err);
                });             
           }
       }, function (err) {
           console.error(err);
       });

    if (voziloID>0) {
      
    };    
  }



  $scope.zavrsivoznju=function(aktivnavoznja,odabraniauto){  
    


    brisiaktivnuvoznju();
    idinapocetnubezHistory();

  }

}])