var nodewiki = angular.module('nodewiki', []);

function mainController($scope, $http) {
  $scope.formData = {};
  $scope.path = $location.path();
  $http.get('/api/'+$location.path())
    .success(function(data) {
      if (data) $scope.page = data;
      else $scope.page = {title : $location.path(), text : 'Not found.'};
      console.log('opened '+$location.path());
    })
    .error(function(data) {
      $scope.page = {title : $location.path(), text : 'The requested page was not found on this server.'};
      console.log('error');
    });
}
