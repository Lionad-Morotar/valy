'use strict';

// import utils from './utils'

var insideValidator = {

  /** social media */

  email: /^([A-Za-z0-9_.])+@([A-Za-z0-9_])+.([A-Za-z]{2,6})$/,
  mobile: /^((13[0-9])|(14[5|7])|(15([0-3]|[5-9]))|(18[0,5-9]))\d{8}$/,
  idcard: /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,

  // /** number */

  interger: /^-?\d+$/,
  float: /^-?\d*.\d*$/,
  number: 'interger||float',
  notNaN: function notNaN () {
    return !Number.isNaN(+this.value)
  },
  max: function max (max$1) {
    return ['notNaN', +this.value < max$1]
  },
  min: function min (min$1) {
    return ['notNaN', +this.value > min$1]
  },

  /** general */

  required: /.+/,
  is: function is (_) { return this.value === _ },
  not: function not (_) { return this.value !== _ }
}

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
  if ( rawValue === void 0 ) rawValue = '';
  if ( validItems === void 0 ) validItems = [];

  Object.assign(this, {
    pass: false,
    result: null,
    errorMsg: null,
    rawValue: rawValue,
    value: rawValue,
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
              ? handle.bind(this$1, params)
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
      var fnResult = validItems(this$1.value);
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
    'regexp': function () { return validItems.test(this$1.value); },
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
      // TODO eval((1&&1||2)||0)
      var validArr = validItems.split('||');
      if (validArr.length > 1) {
        toValidResult = this.toValid(validArr, Object.assign(options, { stragedy: 'or' }));
      } else {
        var toFindHandle = validItems.split('?');
        var ref = [toFindHandle[0], (toFindHandle[1] || '').split(',')];
          var fnName = ref[0];
          var params = ref[1];
        var handle = maps.find(function (x) { return x.has(fnName); }).get(fnName);
        if (!handle) {
          toValidResult = false;
          this.errorMsg = validItems;
          break
        }
        if (typeof handle === 'function') {
          var handleFnRes = handle.bind({ value: this.value }).apply(void 0, params);
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
Valy.prototype.valid = function valid (validItems) {
  if (this.pass) { return this }
  if (!(this.result = this.toValid(validItems))) {
    this.pass = true;
  }
  return this
};
Valy.prototype.format = function format (fn) {
    if ( fn === void 0 ) fn = function (_) { return _; };

  this.value = fn(this.value);
  return this
};
Valy.prototype.flush = function flush (key) {
  return key
    ? this[key]
    : this.errorMsg || this.result
};

var maps = [];
Valy.use = function (models) { return maps.unshift(new Map(Object.entries(models))); };
Valy.use(insideValidator);

module.exports = Valy;
//# sourceMappingURL=index.js.map
