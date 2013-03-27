jsq.controller('buyCon',function buyCon($scope){

	$scope.resultShow = false;

	var filter = $scope.filter = {};

	$scope.familyNum = 3;
	// isSh 沪籍 false 非沪籍 true 
	// isFirst 首套 false 非首套 true
	// houseType 普通住宅 false 非普通住宅 true
	// native 中国国籍 false 非中国国籍 true
	// commission 佣金 false 无佣金 true

	//监控住房面积和家庭人口数的显示和隐藏
	$scope.$watch('filter', function(){
		$scope.existShow =(!$scope.filter.isSh && $scope.filter.isFirst) ? true : false;
	},true);


	//提交按钮，买房结果页显示
  $scope.showResult = function() {

  	// 登记费
  	$scope.registFee = 0.0080;
  	// 权证印花
  	$scope.certificateFee = 0.0005;
  	// 配图费
  	$scope.imgFee = 0.0025;

    // 计算契税
    $scope.propertyTaxResult = propertyTax().toFixed(4);//计算房产税部分值
    $scope.deedTaxResult = deedTax().toFixed(4);//计算契税部分值
    $scope.tradingFeeResult = tradingFee().toFixed(4);//计算交易手续费
    $scope.notaryFeeResult = notaryFee().toFixed(4);//计算公证费
    $scope.commissionFeeResult = commissionFee().toFixed(4);//计算佣金
    $scope.totalTaxes = parseFloat($scope.propertyTaxResult) + parseFloat($scope.deedTaxResult)
    	+ parseFloat($scope.tradingFeeResult) + parseFloat($scope.commissionFeeResult);
 		+ $scope.registFee + $scope.certificateFee  + $scope.imgFee 
 		+ parseFloat($scope.notaryFeeResult);
 	$scope.totalTaxesResult = $scope.totalTaxes.toFixed(4);
 	
 	$scope.lastPrice = parseFloat($scope.totalTaxes) + parseFloat($scope.contractPrice);
 	$scope.lastPriceResult = $scope.lastPrice.toFixed(4);
	 console.log('总支付:', $scope.totalTaxesResult);
	 console.log('房产税:', $scope.propertyTaxResult);
	 console.log('契税:',$scope.deedTaxResult);
	 console.log('交易手续费:',$scope.tradingFeeResult);
	 console.log('公证费:',$scope.notaryFeeResult);
	 console.log('佣金:',$scope.commissionFeeResult);

  	$scope.resultShow = true;
  }

	//房产税逻辑部分
	function propertyTax() {
		var propertyTax = 0;
		var perFeeCel = 2.6896;
		// (合同价/面积)>2.6896万
		var perFeeCompare = ($scope.contractPrice / $scope.area > perFeeCel) ? true : false;

		// (总面积-60*家庭人数) <= 0
		var restArea = $scope.area - 60 * $scope.familyNum;
		if (restArea <= 0) return 0;
		// 沪籍首套,房产税=0
		if (!$scope.isSh && !$scope.isFirst) {
			return 0 ;
		}
		// 沪籍非首套，且(合同价/面积)>2.6896万,房产税={合同价/面积*(总面积-60*家庭人数)}*70%*0.6%
		if (!$scope.isSh && $scope.isFirst && perFeeCel) {
			return ($scope.contractPrice / $scope.area) * restArea * 0.7 * 0.006;
		}
		// 沪籍非首套，且(合同价/面积)<=2.6896万,房产税={合同价/面积*(总面积-60*家庭人数)}*70%*0.4%
		if (!$scope.isSh && $scope.isFirst && !perFeeCel) {
			return ($scope.contractPrice / $scope.area) * restArea * 0.7 * 0.004;
		}
		// 非沪籍,(合同价/面积)>2.6896万,房产税= 合同价*70%*0.6%
		if ($scope.isSh && perFeeCel) {
			return $scope.contractPrice * 0.7 * 0.006;
		}
		// 非沪籍,(合同价/面积)<=2.6896万,房产税= 合同价*70%*0.4%
		if ($scope.isSh && !perFeeCel) {
			return $scope.contractPrice * 0.7 * 0.004;
		}
		return 0;
	}
//契税逻辑部分
  function deedTax() {
  	var proportion = 0;

  	//非普通住宅，全额3%比例
  	if ($scope.houseType) proportion = 0.03;
  	else {
  		//普通住宅非首套，全额3%
  		if ($scope.isFirst) proportion = 0.03;
  		else {
		  //普通住宅,首套,且面积小于等于90平米，全额1%
		  proportion = ($scope.area <= 90) ? 0.01 : 0.015;
  		}
  	}
  	return $scope.contractPrice * proportion;
  }
//交易手续费费
	function tradingFee(){
		return $scope.area * 0.00025;
	}
//佣金
	function commissionFee(){
		//选择佣金时，安装总价1%计算
		return $scope.commissionFee ? 0 : $scope.contractPrice * 0.01;
	}
//公证费
	function notaryFee(){	
		//大陆，则无公证费
		if (!$scope.native) return 0;	

		// todo 合同价>10000万元 ? 
		var notaryFee = 0;
		if ($scope.contractPrice > 0 && $scope.contractPrice <= 50) {
			if ($scope.contractPrice * 0.003 < 0.02) {
				notaryFee = 0.02;
			} else {
				notaryFee = $scope.contractPrice * 0.003;
			}
		} else if ($scope.contractPrice > 50 && $scope.contractPrice <= 500) {
			notaryFee = $scope.contractPrice * 0.0025 + 0.025;
		} else if ($scope.contractPrice > 500 && $scope.contractPrice <= 1000) {
			notaryFee = $scope.contractPrice * 0.002 + 0.275;
		} else if ($scope.contractPrice > 1000 && $scope.contractPrice <= 2000) {
			notaryFee = $scope.contractPrice * 0.0015 + 0.775;
		} else if ($scope.contractPrice > 2000 && $scope.contractPrice <= 5000) {
			notaryFee = $scope.contractPrice * 0.001 + 1.775;
		} else if ($scope.contractPrice > 5000 && $scope.contractPrice <= 10000) {
			notaryFee = $scope.contractPrice * 0.0005 + 4.275;
		} else {
			notaryFee = 0;
		}
		return notaryFee;
	}

});