var Tiki = angular.module('Tiki', [
	'ngRoute'
]);

Tiki.controller('TicketsCtrl', function ($scope, $http) {
	$scope.views = 0;
	$scope.io = io();

	$scope.io.on('channel', function(d) {
		switch(d.event) {
			case 'enter':
				customerEnter();
				break;

			case 'views':
				initViews(d.data);
				break;

			default:
				console.log(d.data);
				break;
		}
	});

	var initViews = function(d) {
		$scope.views = d;
		$scope.$digest();
		console.log($scope.views);
	};
	var customerEnter = function(d) {
		$scope.views++;
		$scope.$digest();
		console.log($scope.views);
	};
});