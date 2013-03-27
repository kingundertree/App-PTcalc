// 定义匹配输入格式指令
var pattern1 = /^[1-9]\d{0,11}(\.\d{1,4})?$/;
var pattern2 = /^0(\.\d{1,4})?$/;
jsq.directive("numPattern", function() {
  return {
    require: "ngModel",
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        if (pattern1.test(viewValue) || pattern2.test(viewValue)) {
          ctrl.$setValidity("numPattern", true);
          return viewValue;
        } else {
          ctrl.$setValidity("numPattern", false);
          return undefined;
        }
      });
    }
  };
});