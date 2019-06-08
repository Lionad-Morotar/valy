'use strict';

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

var utils = {

  /** utils */

  query2obj: query2obj,

  /** common */

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

}

var insideValidator = {

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
    return new RegExp(("^([A-Za-z0-9_\\-\\.])+\\@(" + (utils.regex.email.whiteLists.join('|')) + ")$"))
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
    return new RegExp(("^" + (utils.regex.number.areaLabelReflex[options.area]) + "\\d+$"))
  },
  // 浮点数
  float: function float (options) {
    options = Object.assign({ area: 'both', count: '*' }, options);
    return new RegExp(("^" + (utils.regex.number.areaLabelReflex[options.area]) + "\\d*\\.\\d" + (utils.regex.count(options.count)) + "$"))
  },
  // 数字
  number: 'interger||float',
  // 数字比较q
  max: function max (options) {
    options = Object.assign({ max: Number.MAX_SAFE_INTEGER }, options);
    return !Number.isNaN(+options.value) ? (+options.value < +options.max) : ("应不大于" + (options.max))
  },
  min: function min (options) {
    options = Object.assign({ min: Number.MIN_SAFE_INTEGER }, options);
    return !Number.isNaN(+options.value) ? (+options.value > +options.min) : ("应不小于" + (options.min))
  },

  /** general */

  // 必需值
  required: function (options) { return (!['null', 'undefined'].includes(options.value) ? /.+/.test(options.value) : '值缺失'); },
}

/* eslint-disable no-sequences */

var DEFAULT_VALID_OPTIONS = { stragedy: 'and' };

/** Valy
 * @description Valy校验器, 可以使用两种方式调用:
 *  1. new Valy('a1111', 'username').result
 *  2. new Valy('a1111').valid(['username', _ => _.length === 5]).check()
 * @param {Any} rawValue 待校验的值
 * @param {Array, Regex, Function} validItems 待校验的选项
 */
var Valy = function Valy (rawValue, validItems) {
  var this$1 = this;
  if ( validItems === void 0 ) validItems = [];

  Object.assign(this, {
    pass: false,
    result: null,
    errorMsg: null,
    // TODO value, 每一步的结果 (比如在链式调用中穿插 format 函数)
    rawValue: rawValue,
    validItems: validItems
  });
  return new Proxy(this, {
    get: function (target, key, receiver) {
      // TODO prototype properties
      var findMap = maps.find(function (x) { return x.has(key); });
      return !findMap
        ? Reflect.get(target, key, receiver)
        : function (params) {
          if ( params === void 0 ) params = {};

          var handle = findMap.get(key);
          this$1.valid(
            handle.bind
              ? handle.bind(this$1, Object.assign({ value: this$1.rawValue }, params))
              : handle
          );
          return receiver
        }
    }
  })
};

// TODO async validate
Valy.prototype.toValid = function toValid (validItems, options) {
    var this$1 = this;
    if ( validItems === void 0 ) validItems = this.rawValidItems;

  /** default value */

  options = Object.assign(DEFAULT_VALID_OPTIONS, options);

  /** const */

  var methods = {
    'function': function () {
      var fnResult = validItems(this$1.rawValue);
      return ['function', 'object'].includes(typeof fnResult)
        ? this$1.toValid(fnResult)
        : fnResult
    },
    'array': function () {
      var results = validItems.map(function (x) { return this$1.toValid(x); });
      return options.stragedy === 'and'
        ? results.every(function (x) { return x === true; })
        : results.some(function (x) { return x === true; })
    },
    'regexp': function () { return validItems.test(this$1.rawValue); },
    'boolean': function () { return validItems; },
    'undefined': function () { return false; },
    'error': function () { throw new Error(("unsupported type of validItem : " + (typeof validItems) + " - " + validItems)) }
  };

  /** vars */

  var toValidResult = null;
  switch (typeof validItems) {
    case 'object':
      if (Array.isArray(validItems)) {
        toValidResult = methods['array'].bind(this)();
      } else if (validItems instanceof RegExp) {
        toValidResult = methods['regexp'].bind(this)();
      }
      break

    case 'string':
      // TODO replace params syntax `?name=val` with `(val)`
      // TODO eval((1&&1||2)||0)
      var validArr = validItems.split('||');
      if (validArr.length > 1) {
        toValidResult = this.toValid(validArr, Object.assign(options, { stragedy: 'or' }));
      } else {
        var toFindHandle = validItems.split('?');
        var handle = maps.find(function (x) { return x.has(toFindHandle[0]); }).get(toFindHandle[0]);
        if (!handle) {
          toValidResult = false;
          this.errorMsg = validItems;
          break
        }
        if (typeof handle === 'function') {
          var params = utils.query2obj("value=" + (this.rawValue) + "&" + (toFindHandle[1] || ''));
          var handleFnRes = handle(params);
          toValidResult = this.toValid(handleFnRes);
        } else {
          toValidResult = this.toValid(handle);
        }
      }
      break

    default:
      toValidResult = methods[typeof validItems].bind(this)();
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

// TODO format

// 对值进行格式化
Valy.prototype.format = function format (fn) {
    if ( fn === void 0 ) fn = function (_) { return _; };

  this.rawValue = fn(this.rawValue);
  return this
};

// 返回校验结果
Valy.prototype.exec = function exec () {
  this.result = this.toValid();
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

var maps = [];
Valy.use = function (models) { return maps.unshift(new Map(Object.entries(models))); };
Valy.use(insideValidator);

module.exports = Valy;
//# sourceMappingURL=index.js.map
