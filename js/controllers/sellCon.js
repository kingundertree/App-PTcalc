jsq.controller("sellCon", function($scope, $http) {
  // houseType 普通房-false 非普通房-true
  // hasInvoice 提供发票-false 不提供-true
  // buyTime 买入时间满5年-false 不满5年-true
  // isOnly 唯一-false 不唯一true

  $scope.resultShow = false;
  var filter = $scope.filter = {
    region: null
  }

  // 获取select选择的地区
  $http.get("data/region.json").success(function(data) {
    $scope.filter.regions = data;
    $scope.filter.region = data[0];
  });

  $scope.showResult = function(){

    if (!this.sellForm.$valid) {
       return false;
    }

    //初始化相应值
    $scope.money = $scope.money ? parseFloat($scope.money) : 0;
    $scope.payment = $scope.money;
    $scope.cost = $scope.cost ? parseFloat($scope.cost) : 0;
    $scope.area = $scope.area ? parseFloat($scope.area) : 0;
    $scope.interest = $scope.interest ? parseFloat($scope.interest) : 0;
    $scope.decorationCost = $scope.decorationCost ? parseFloat($scope.decorationCost) : 0;
    $scope.primaryCost = primaryCost();

    // 从合同价算到手价时，到手价初始化为0；从到手价算合同价时，合同价初始化为0
    if (!$scope.calType) {
      $scope.payment = $scope.money;
      $scope.lastPrice = 0;
      // 购入价<=合同价
      if ($scope.cost > $scope.payment) {
          return false;
      }
    } else {
      $scope.lastPrice = $scope.money;
      $scope.payment = 0;
    }

    // console.log('$scope.money',$scope.money);
    // console.log('$scope.payment',$scope.payment);
    // console.log('$scope.lastPrice',$scope.lastPrice);
    // console.log('$scope.cost',$scope.cost);
    // console.log('$scope.area',$scope.area);
    // console.log('$scope.interest',$scope.interest);
    // console.log('$scope.decorationCost',$scope.decorationCost);
    // console.log('primaryCost',$scope.primaryCost);

    // 初始化相关参数
    $scope.totalBusinessProportion = totalBusinessProportion();
    $scope.diffTaxProportion = diffTaxProportion();
    $scope.commissionProportion = commissionProportion();

     // 根据各税的利润和全额显示和隐藏，初始化个税全额/利润比例
    if ($scope.taxCalType == 1) {
      $scope.perTotalProportion = 0;
      $scope.perProfitProportion = perProfitProportion();
    } else if ($scope.taxCalType == 2) {
      $scope.perTotalProportion = perTotalProportion();
      $scope.perProfitProportion = 0;
    } else {
      $scope.perProfitProportion = 0;
      $scope.perTotalProportion = 0;
    }

    $scope.tradingFee = tradingFee();

    // console.log('$scope.totalBusinessProportion',$scope.totalBusinessProportion);
    // console.log('$scope.diffTaxProportion',$scope.diffTaxProportion);
    // console.log('$scope.perTotalProportion',$scope.perTotalProportion);
    // console.log('$scope.perProfitProportion',$scope.perProfitProportion);
    // console.log('$scope.commissionProportion',$scope.commissionProportion);

    //从到手价计算合同价
    if($scope.calType){
      // temp1 1-营业税比例-个税全额比例-个税利润比例-佣金比例
      var temp1 = 1 - $scope.totalBusinessProportion - $scope.perTotalProportion
                    - $scope.perProfitProportion - commissionProportion();
      // temp2 = 购入价 * 差额比例 + (购入价 + 装修 + 利润) * 个税利润比例 - 交易手续费
      var temp2 = $scope.cost * $scope.diffTaxProportion + $scope.primaryCost * $scope.perProfitProportion
                    - $scope.tradingFee;
      // 合同价(有公证费/无公证费)
      if (!$scope.native) {
        $scope.payment = contractPriceCal(temp1, temp2);
        /*===========移除到手价小于成本的情况=============*/
        if ($scope.payment < primaryCost) {
          $scope.perProfitProportion = 0;
          $scope.payment = contractPriceCal(temp1, temp2);
          if ($scope.payment < primaryCost) {
              // $window.alert("输入有误!");
              // $scope.payment = 0;
          }
        } 
      } else {
        $scope.payment = contractPriceCal2($scope.lastPrice, temp1, temp2);
        if ($scope.payment < primaryCost) {
          $scope.payment = contractPriceCal2($scope.lastPrice, temp1, temp2);
        }
      }

      $scope.profit = profit();
      $scope.incomeTax = incomeTax();
      $scope.businessTax = businessTax();
      $scope.commissionFee = commissionFee();
      $scope.notaryFee = notaryFee();
      $scope.totalTax = $scope.incomeTax + $scope.businessTax + $scope.tradingFee + $scope.commissionFee + $scope.notaryFee;

      // console.log('$scope.profit',$scope.profit);
      // console.log("合同价", $scope.payment);
      // console.log("总税费", $scope.totalTax);
      // console.log("营业税", $scope.businessTax);
      // console.log("个税", $scope.incomeTax);
      // console.log("交易手续费", $scope.tradingFee);
      // console.log("公证费", $scope.notaryFee);
      // console.log("佣金", $scope.commissionFee);

    }

    if (!$scope.calType){

      $scope.profit = profit();
      $scope.incomeTax = incomeTax();
      $scope.businessTax = businessTax();
      $scope.commissionFee = commissionFee();
      $scope.notaryFee = notaryFee();
      $scope.totalTax = $scope.incomeTax + $scope.businessTax + $scope.tradingFee + $scope.commissionFee + $scope.notaryFee;
      $scope.lastPrice = $scope.payment - $scope.totalTax;

      console.log('$scope.profit',$scope.profit);
      console.log("合同价", $scope.payment);
      console.log("总税费", $scope.totalTax);
      console.log("营业税", $scope.businessTax);
      console.log("个税", $scope.incomeTax);
      console.log("交易手续费", $scope.tradingFee);
      console.log("公证费", $scope.notaryFee);
      console.log("佣金", $scope.commissionFee);
    }


    //显示结果内容
    $scope.resultShow = true;
  }

// 合同价=(到手价-购入价*差额比例+交易手续费-(购入价+贷款利息+装修成本)*个税利润比例)/(1-营业税全额比例-个税全额比例-个税利润比例-佣金比例)
  function contractPriceCal(temp1, temp2) {
    return ($scope.lastPrice - temp2) / temp1;
  }

// 有公证费时算合同价
  function contractPriceCal2(lastPrice, temp1, temp2) {
    // 公证费比例
    var notaryTaxProportion = 0;
    // 公证费常量
    var notaryTaxNum = 0;
    if (lastPrice <= 6.6666 * temp1 + temp2 - 0.02) {
      notaryTaxProportion = 0;
      notaryTaxNum = 0.02
    }else if (lastPrice <= 50 * (temp1 - 0.003) + temp2) {
      notaryTaxProportion = 0.003;
      notaryTaxNum = 0;
    }else if (lastPrice <= 500 * (temp1 - 0.0025) + temp2 - 0.025) {
      notaryTaxProportion = 0.0025;
      notaryTaxNum = 0.025;
    }else if (lastPrice <= 1000 * (temp1 - 0.002) + temp2 - 0.275) {
      notaryTaxProportion = 0.002;
      notaryTaxNum = 0.275;
    }else if (lastPrice <= 2000 *(temp1 - 0.0015) + temp2 - 0.775) {
      notaryTaxProportion = 0.0015;
      notaryTaxNum = 0.775;
    }else if (lastPrice <= 5000 * (temp1 - 0.001) + temp2 - 1.775) {
      notaryTaxProportion = 0.001;
      notaryTaxNum = 1.775;
    }else{
      notaryTaxProportion =0.0005;
      notaryTaxNum = 4.275;
    }
    return (lastPrice - temp2 + notaryTaxNum) / (temp1 - notaryTaxProportion);
  }

/*个人所得税计算部分，包括执行函数已经各税全额比例和利润比例*/
// 个税执行函数
  function incomeTax(){ 
    var incomeTax = 0;

    if ($scope.lastPrice == 0 && $scope.payment - $scope.primaryCost <= 0) {
        $scope.perProfitProportion = 0;
    }

    return $scope.payment * $scope.perTotalProportion + $scope.profit * $scope.perProfitProportion;      
  }

// 个税免征 优先判断
  function noPersonalTax() {
    // 普通住宅 + 五年以外 + 承诺唯一
    if (!$scope.filter.houseType && !$scope.filter.buyTime && !$scope.filter.isOnly) {
      return true;
    }
    // 非普通住宅 + 五年以外  + 承诺唯一
    if ($scope.filter.houseType && !$scope.filter.buyTime && !$scope.filter.isOnly) {
      return true;
    }
    return false;
  } 

// 个税全额时 -- 全额计算系数
  function perTotalProportion() {
    // 普通住宅 + 无发票 个税按照全额1%计算
    if (!$scope.filter.houseType && $scope.filter.hasInvoice) {
      return 0.01;
    }
    // 非普通住宅 + 五年内 个税按照全额2%计算
    if ($scope.filter.houseType && $scope.filter.buyTime) {
      return 0.02;
    }
    // 非普通住宅 + 五年外 + 不提供原始发票 个税按照全额2%计算
    if ($scope.filter.houseType && !$scope.filter.buyTime && $scope.filter.hasInvoice) {
      return 0.02;
    }
    // 非普通住宅 + 五年外 + 提供发票 + 不承诺唯一 + 徐汇/静安/长宁/虹口/宝山/普陀）地区，个税按照全额2%计算
    if ($scope.filter.houseType && !$scope.filter.buyTime && !$scope.filter.hasInvoice && $scope.filter.isOnly && ($scope.filter.region.regionType=="2")) {
      return 0.02;
    }
    return 0;
  }

// 个税利润 -- 利润系数为20%
  function perProfitProportion() {
    // 普通住宅 + 提供发票 
    if (!$scope.filter.houseType && !$scope.filter.hasInvoice) {
      return 0.2;
    }
    // 非普通住宅 + 五年内
    if ($scope.filter.houseType && $scope.filter.buyTime) {
      return 0.2;
    }
    // 非普通住宅 + 五年外 + 提供发票 + 不承诺唯一
    if ($scope.filter.houseType && !$scope.filter.buyTime && !$scope.filter.hasInvoice && $scope.filter.isOnly) {
      return 0.2;
    }
    return 0;
  }

/*营业税部分，包括营业税执行函数和营业税全额比例和差额比例*/
//营业税计算执行函数
  function businessTax(){

    if ($scope.payment <= $scope.cost && $scope.diffTaxProportion !== 0) {
      $scope.diffTaxProportion = 0;
    }
    return  $scope.payment * $scope.totalBusinessProportion - $scope.cost *  $scope.diffTaxProportion;
  }

// 营业税计算全额计算
  function totalBusinessProportion(){
    //普通住宅，且五年内，则营业税为全额的5.65%
    if (!$scope.filter.houseType && $scope.filter.buyTime) {
      return 0.0565;
    }
    //非普通住宅,全额5.65%
    if ($scope.filter.houseType) {
      return 0.0565;
    }
    return 0;
  }

// 营业税差额比例
  function diffTaxProportion(){
    //非普通住宅 + 五年外 + 承诺唯一， 差额的5.65%
    if ($scope.filter.houseType && !$scope.filter.buyTime && !$scope.filter.isOnly) {
      return 0.0565;
    }
    //非普通住宅 + 五年外 + 不承诺唯一 + 有票， 差额的5.65%
    if ($scope.filter.houseType && !$scope.filter.buyTime && $scope.filter.isOnly && !$scope.hasInvoice) {
      return 0.0565;
    }
    return 0;
  }

//交易手续费费
  function tradingFee(){
      return $scope.area * tradingFeeProportion();
  }

// 交易手续费比例
  function tradingFeeProportion() {
    return 0.00025;
  }

//佣金费用
  function commissionFee(){
    return $scope.payment * commissionProportion();
  }

// 佣金比例
  function commissionProportion() {
    return $scope.commission ? 0 : 0.01;
  }

//利润
  function profit(){
    return $scope.payment - $scope.cost - $scope.interest - $scope.decorationCost;
  }

//公证费
  function notaryFee(){ 
    //大陆，则无公证费
    if (!$scope.native) return 0; 

    var notaryFee = 0;
    if ($scope.payment <= 50) {
      if ($scope.payment * 0.003 < 0.02) {
        notaryFee = 0.02;
      } else {
        notaryFee = $scope.payment * 0.003;
      }
    } else if ($scope.payment <= 500){
      notaryFee = $scope.payment * 0.0025 + 0.025;
    } else if ($scope.payment <= 1000) {
      notaryFee = $scope.payment * 0.002 + 0.275;
    } else if ($scope.payment <= 2000) {
      notaryFee = $scope.payment * 0.0015 + 0.775;
    } else if ($scope.payment <= 5000) {
      notaryFee = $scope.payment * 0.001 + 1.775;
    } else {
      notaryFee = $scope.payment * 0.0005 + 4.275;
    }
    return notaryFee;
  }

  // 房子成本价 = 购入价+贷款利息+装修成本
  function primaryCost(){
    return $scope.cost + $scope.interest + $scope.decorationCost;
  }


/*界面交互，监控部分*/
// 个人所得税计算方式 -- 利润/全额/免征,显示和隐藏
  $scope.$watch('filter', function(){
    // 免征时不在页面显示个人所得税选项
    $scope.noPersonalTax = noPersonalTax();
    if (!$scope.noPersonalTax) {
      $scope.profitShow = perProfitProportion() ? true : false;
      $scope.totalShow = perTotalProportion() ? true : false;
      if ($scope.profitShow && $scope.totalShow) {
        $scope.taxCalType = 2;
      } else {
        $scope.taxCalType = $scope.profitShow ? 1 : ($scope.totalShow ? 2 : 0);
      }
    } else {
      $scope.profitShow = false;
      $scope.totalShow = false;
    }
  }, true);

  // 计算方式改变时，清空输入的合同价/到手价值
  $scope.$watch("calType", function() {
      $scope.money = "";
  });

// 监控利润/金额两个选择
  $scope.$watch('taxCalType', function(){
    $scope.byProfit = ($scope.taxCalType == 1) ? true : false;
  }, true);
/*界面交互，监控部分 end*/

});