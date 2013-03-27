
// 路由配置
var jsq = angular.module('jsqpage',[]);
jsq.config(function($routeProvider) {
  $routeProvider.
      when('/first', {templateUrl: 'view/index.html'}).
      when('/buy', {templateUrl: 'view/buy.html', controller: 'buyCon'}).
      when('/sell', {templateUrl: 'view/sell.html', controller: 'sellCon'}).
      when('/help', {templateUrl: 'view/help.html', controller: 'helpCon'}).
      otherwise({redirectTo: '/first'});
});

