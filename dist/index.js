'use strict';

/* eslint-disable */

function query2obj (query) {
  var queryArr = query.split('&').filter(function (x) { return x; });
  var res = null;
  try {
    res = JSON.parse(
      '{' +
        queryArr
          .map(function (x) {
            var ref = x.split('=');
            var key = ref[0];
            var value = ref[1];
            return ("\"" + key + "\":\"" + value + "\"")
          })
          .join(',\n') +
      '}'
    );
  } catch (err) {
    res = {};
  }
  return res
}

// 校验用到的工具函数或工具对象
var comm = {
  regex: {
    count: function count (countStr) {
      if (countStr === '*') {
        return '*'
      } else {
        return ("{" + countStr + "}")
      }
    },
    email: {
      whiteLists: [
        'qq.com',
        '163.com',
        'vip.163.com',
        'sohu.com',
        'sina.cn',
        'sina.com',
        'gmail.com',
        'hotmail.com'
      ]
    },
    number: {
      areaLabelReflex: {
        both: '-?',
        neg: '-',
        pos: ''
      }
    }
  }
};

// 内置的校验器
var validatorNameReflex = {

  /** social media */

  // 用户名
  username: function username (options) {
    options = Object.assign({ min: 4, max: 16 }, options);
    return new RegExp(("^[a-zA-Z][a-zA-Z0-9_-]{" + (options.min - 1) + "," + (options.max - 1) + "}$"))
  },
  // 中文用户名
  username_cn: function username_cn (options) {
    options = Object.assign({ min: 2, max: 8 }, options);
    return new RegExp(("^[a-zA-Z\\u4E00-\\u9FA5][a-zA-Z0-9\\u4E00-\\u9FA5_-]{" + (options.min - 1) + "," + (options.max - 1) + "}$"))
  },
  // 邮箱
  email: function email () {
    return new RegExp("^([A-Za-z0-9_\\-\\.])+\\@([A-Za-z0-9_\\-\\.])+\\.([A-Za-z]{2,6})$")
  },
  // 常用邮箱
  email_general: function email_general () {
    return new RegExp(("^([A-Za-z0-9_\\-\\.])+\\@(" + (comm.regex.email.whiteLists.join('|')) + ")$"))
  },
  // 手机号码
  mobile: /^((13[0-9])|(14[5|7])|(15([0-3]|[5-9]))|(18[0,5-9]))\d{8}$/,
  // 身份证
  idcard: /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
  // URL
  url: function (options) { return /^((https?|ftp|file):\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/.test(options.value) || '不是正确的URL'; },

  /** number */

  // 整数
  interger: function interger (options) {
    options = Object.assign({ area: 'both' }, options);
    return new RegExp(("^" + (comm.regex.number.areaLabelReflex[options.area]) + "\\d+$"))
  },
  // 浮点数
  float: function float (options) {
    options = Object.assign({ area: 'both', count: '*' }, options);
    return new RegExp(("^" + (comm.regex.number.areaLabelReflex[options.area]) + "\\d*\\.\\d" + (comm.regex.count(options.count)) + "$"))
  },
  // 数字
  number: 'interger||float',
  // 数字比较
  max: function max (options) {
    options = Object.assign({ max: Number.MAX_SAFE_INTEGER }, options);
    return !Number.isNaN(+options.value) && (+options.value < +options.max) || ("应不大于" + (options.max))
  },
  min: function min (options) {
    options = Object.assign({ min: Number.MIN_SAFE_INTEGER }, options);
    return !Number.isNaN(+options.value) && (+options.value > +options.min) || ("应不小于" + (options.min))
  },

  /** general */

  // 必需值
  required: function (options) { return (!['null', 'undefined'].includes(options.value) && /.+/.test(options.value) || '值缺失'); },
};

/** Valy
 * @description Valy校验器, 可以使用两种方式调用:
 *  1. new Valy('a1111', 'username').result
 *  2. new Valy('a1111').valid(['username', _ => _.length === 5]).check()
 * @param {Any} rawValue 待校验的值
 * @param {Array, Regex, Function} validItems 待校验的选项
 * @param {Boolean} debug 打开调试会时会打开一些log信息
 */
var Valy = function Valy (ref) {
  if ( ref === void 0 ) ref = { rawValue: undefined, debug: false };
  var rawValue = ref.rawValue;
  var rawValidItems = ref.rawValidItems;
  var debug = ref.debug; if ( debug === void 0 ) debug = false;

  var argLen = arguments.length;
  var arg1 = arguments[0];
  var arg2 = arguments[1];
  // console.log('@@@@@@@@@@@@', argLen, arg1, arg2, this)
  if (arg1 instanceof Object && !(arg1 instanceof Array)) {
    Object.assign(this, {
      pass: false,
      result: null,
      rawValue: rawValue,
      rawValidItems: rawValidItems,
      debug: debug
    });
    this.exec();
  } else if (argLen === 2) {
    Object.assign(this, {
      pass: false,
      result: null,
      rawValue: arg1,
      rawValidItems: arg2,
      debug: debug
    });
    this.exec();
  } else {
    Object.assign(this, {
      pass: false,
      result: null,
      rawValue: arg1,
      rawValidItems: rawValidItems,
      debug: false
    });
  }
  this.errorMsg = null;
  // console.log('@@@@@@@@@@@@', argLen, arg1, arg2, this)
};

Valy.prototype.toValid = function toValid (validItems, options) {
    var this$1 = this;
    if ( options === void 0 ) options = { stragedy: 'and' };

  var toValidResult = 'unexcepted valid result';
  validItems = validItems == null ? this.rawValidItems : validItems;
  // console.log('@@@ : ', typeof validItems, validItems)

  switch (typeof validItems) {
    case 'function':
      // console.log('valid items type : function : ', this)
      var fnResult = validItems(this.rawValue);
      // console.log('@@', fnResult)
      if (['function', 'object'].includes(typeof fnResult)) {
        toValidResult = this.toValid(fnResult);
      } else {
        toValidResult = fnResult;
      }
      break

    case 'object':
      // console.log('valid items type : object')
      if (Array.isArray(validItems)) {
        var toValidResultArr = validItems.map(function (x) { return this$1.toValid(x); });
        // console.log('@@ : ', toValidResultArr)
        switch (options.stragedy) {
          case 'and':
            toValidResult = toValidResultArr.every(function (x) { return x === true; });
            break
          case 'or':
            toValidResult = toValidResultArr.some(function (x) { return x === true; });
            break
        }
      } else if (validItems instanceof RegExp) {
        toValidResult = validItems.test(this.rawValue);
      } else {
        throw new Error(("unsupported object type validItem : " + validItems))
      }
      break

    case 'string':
      // console.log('valid items type : string')
      var validArr = validItems.split('||');
      if (validArr.length > 1) {
        toValidResult = this.toValid(validArr, Object.assign(options, { stragedy: 'or' }));
      } else {
        var toFindHandle = validItems.split('?');
        var handle = validatorNameReflex[toFindHandle[0]];
        if (!handle) {
          toValidResult = false;
          this.errorMsg = validItems;
          break
        }
        if (typeof handle === 'function') {
          var params = query2obj("value=" + (this.rawValue) + "&" + (toFindHandle[1] || ''));
          var handleFnRes = handle(params);
          // console.log('@@--1: ', handleFnRes)
          toValidResult = this.toValid(handleFnRes);
        } else {
          toValidResult = this.toValid(handle);
        }
      }
      break

    case 'boolean':
      toValidResult = validItems;
      break

    case 'undefined':
      toValidResult = false;
      break

    default:
      console.log(typeof this.validItems, this.validItems, "unsupported type of validItem");
      throw new Error(("unsupported type of validItem : " + validItems))
  }

  return toValidResult
};

// 主动调用校验
Valy.prototype.valid = function valid (validItems) {
  if (this.pass) { return this }
  if (!(this.result = this.toValid(validItems))) {
    this.pass = true;
  }
  return this
};

// 对值进行格式化
Valy.prototype.format = function format (fn) {
    if ( fn === void 0 ) fn = function (_) { return _; };

  this.rawValue = fn(this.rawValue);
  return this
};

// 返回校验结果
Valy.prototype.exec = function exec () {
  this.result = this.toValid();
  // console.log(this.result)
  return this.result
};

// 返回判断检验结果是否为某一特定的值
Valy.prototype.check = function check (assertResult) {
    if ( assertResult === void 0 ) assertResult = true;

  return this.result === assertResult
};
Valy.prototype.not = function not (assertResult) {
    if ( assertResult === void 0 ) assertResult = false;

  return this.result !== assertResult
};
Valy.prototype.getRes = function getRes () {
  return this.errorMsg || this.result
};

module.exports = Valy;
//# sourceMappingURL=index.js.map
