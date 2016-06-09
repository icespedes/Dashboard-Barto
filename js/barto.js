  angular.module('bartoApp', [])
    .controller('PranksController', ['$scope', function($scope) {
      $scope.jokerData = [];
      $scope.jokesData = [];

      //UPDATE REALTIME GRAFICO
      var updateChart = function() {
        chart.data.labels = (function() { return $scope.jokerData.map(function(item) { return item.title; }) })();
        chart.data.datasets = [ {data: (function() { return $scope.jokerData.map(function(item) { return item.count; }) })(),
        backgroundColor: "rgba(210, 93, 39, 0.7)",
        hoverBackgroundColor: "rgba(210, 93, 39, 0.5)"
         }];
        chart.update();
      };

      //OBTENER LOS DATOS DE JOKES
      io.socket.get('/jokes', function(data) {
        $scope.jokesData = data;
        $scope.$digest();
      });

      //OBTENER LOS DATOS DE JOKER
      io.socket.get('/joker', function(data) {
        $scope.jokerData = data.map(function(item) { return { id: item.id, title: item.title, count: item.jokes.length };});
        $scope.$digest();
      });

      //SUSCRIPCION PARA ACTUALIZAR JOKES
      io.socket.on('jokes', function(event){
        if(event.verb === 'created') {
          $scope.jokesData.push(event.data);
          var marker = new google.maps.Marker({
              position: new google.maps.LatLng(event.data.latitude, event.data.longitude),
              map: map,
              icon: image,
              title: event.data.title,
              visible: true
          });   
          $scope.$digest();
        }
        else 
          console.log('jokes', event);
      });

      //SUSCRIPCION PARA ACTUALIZAR JOKER
      io.socket.on('joker', function(event){
        if(event.verb === 'addedTo') {
          $scope.jokerData[$scope.jokerData.findIndex(function(item) { return item.id === event.id})].count++;
          updateChart();
        }
        else if(event.verb === 'created') {
          $scope.jokerData.push(event.data);
          updateChart();
          $scope.$digest();
        }
        else 
          console.log('joker', event);
      });

      //AÑADIR BROMA
      $scope.addJoke = function(joke) {
        io.socket.post('/jokes', joke, function(resData, jwres) {
          $scope.getAllJokes();
          $scope.$digest();
        });
      };

      //BORRAR BROMA
      $scope.delJoke = function(joke) {
        io.socket.delete('/jokes', joke, function(resData, jwres) {
        $scope.getAllJokes();
        });
      };

      //MODIFICAR BROMA
      $scope.updJoke = function(joke) {
        io.socket.put('/jokes', joke, function(resData, jwres) {
          $scope.getAllJokes();
          console.log(jwres);
        });
      };

      //OBTENER TODAS LAS BROMAS
      $scope.getAllJokes = function() {
        io.socket.get('/jokes', function(data) {
          $scope.jokesData = data;
          $scope.$digest();
        });
      };

      //TRIGGER MODAL
      $(document).ready(function(){
        $('.modal-trigger').leanModal();
      });

    }]);
