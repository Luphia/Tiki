/*

myIO.emit('channel', {"event": "buyType", "data": {"type": "A01", "number": 5}})
myIO.emit('channel', {"event": "buyCode", "data": tickets[1]})

 */

var Tiki = angular.module('Tiki', [
	'ngRoute'
]);

var myIO;
var tickets;
var again;

Tiki.controller('TicketsCtrl', function ($scope, $http) {
	$scope.views = 0;
	$scope.times = 0;
	$scope.io = io();
	myIO = $scope.io;
	$scope.remainTickets = [];
	$scope.countTickets = {};
	$scope.bought = [];
	$scope.soldout = [];
	$scope.io.emit('channel', {"event": "getTickets"});

	$scope.io.on('channel', function(d) {
		switch(d.event) {
			case 'enter':
				customerEnter(d.data);
				break;

			case 'reset':
				$scope.times = d.times;
				$scope.show = true;
				$scope.$digest();
				setTimeout(function() {$scope.show = false; $scope.$digest();}, 3000);
				$scope.io.emit('channel', {"event": "getTickets"});
				break;

			case 'getTickets':
				getTickets(d.data);
				$scope.times = d.times;

				$scope.$digest();
				break;

			case 'buyCode':
				buyCode(d.data);
				break;

			case 'buyType':
				buyType(d.data);
				break;

			case 'buyEvent':
				buyEvent(d.data);
				break;

			case 'sold':
				sold(d.data);
				$scope.$digest();
				break;

			default:
				console.log(d);
				break;
		}
	});

	$scope.buyType = function(type, number) {
		$scope.io.emit('channel', {"event": "buyType", "data": {"type": type, "number": number}})
	}

	var customerEnter = function(d) {
		$scope.views = d.history;
		$scope.online = d.current;
		$scope.$digest();
	};
	var getTickets = function(d) {
		$scope.remainTickets = d;
		tickets = $scope.remainTickets;
		countRemain();
	};
	var countRemain = function() {
		var rs = {
			"total": 0,
			"detail": {}
		};

		for(var k in $scope.remainTickets) {
			var code = $scope.remainTickets[k];
			var type = code.substr(0, 3);

			if(!rs.detail[type]) {
				rs.detail[type] = 0;
			}
			rs.detail[type]++;
			rs.total++;
		}

		$scope.countTickets = rs;

		return rs;
	};
	var buyCode = function(d) {
		if(d) $scope.bought.push(d);
	};
	var buyType = function(d) {
		for(var k in d) {
			if(d[k]) $scope.bought.push(d[k]);
		}
	};
	var buyEvent = function(d) {
		for(var k in d) {
			if(d[k]) $scope.bought.push(d[k]);
		}
	};
	var sold = function(d) {
		if(Array.isArray(d)) {
			for(var k in d) {
				var code = d[k];
				$scope.remainTickets.splice( $scope.remainTickets.indexOf(code), 1 );
				$scope.soldout.push(code);
			}
		}
		else {
			$scope.remainTickets.splice( $scope.remainTickets.indexOf(d), 1 );
			$scope.soldout.push(d);
		}
		countRemain();
		tickets = $scope.remainTickets;
	};
});