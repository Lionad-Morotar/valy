'use strict';

// import utils from './utils'

var defaultValidator = {

  /** social media */

  email: /^([A-Za-z0-9_.])+@([A-Za-z0-9_])+.([A-Za-z]{2,6})$/,
  mobile: /^((13[0-9])|(14[5|7])|(15([0-3]|[5-9]))|(18[0,5-9]))\d{8}$/,

  /** number */

  interger: /^-?\d+$/,
  float: /^-?\d*.\d*$/,
  number: 'interger||float',
  max (max) {
    return ['notNaN', +this.value < max]
  },
  min (min) {
    return ['notNaN', +this.value > min]
  },

  /** array */
  
  some (_) { 
    return this.value.some(x => this._valid(_, { value: x })) 
  },
  every (_) { 
    return this.value.every(x => this._valid(_, { value: x })) 
  },

  /** general */

  required: /.+/,
  is (_) { 
    return this.value === _ 
  },
  not (_) { 
    return this.value !== _ 
  },
  has (_) {
    return this.value.includes(_)
  }
};

/**
 * Valy 链式调用的校验器 
 */
class Valy {

  /** Constructor
   * @param {Any} value 待校验的值
   * @instance.value 校验的内容
   * @instance.result 校验结果
   * @instance.message 检验结果信息（比如，错误信息）
   * @instance.pass 当一个数已经校验失败，则无需继续校验下去
   */
  constructor (value = '') {
    if (!(this instanceof Valy)) return new Valy(value)

    Object.assign(this, {
      pass: false,
      result: null,
      message: '',
      value
    });

    const insiderProps = Object.keys(this)
      .concat(['_valid','format','valid','flush']);

    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (insiderProps.includes(prop)) {
          return Reflect.get(target, prop, receiver)
        } else {
          const handle = fns.find(x => x.has(prop));
          const fn = handle.get(prop);
          return params => {
            this.valid(fn.bind ? fn.bind(this, params) : fn);
            return receiver
          } 
        }
      }
    })
  }

  /**
   * 校验逻辑
   * @param options.stragedy 当校验对象是数组时，默认使用 and（every）还是 some 逻辑
   */
  _valid (validators = [], options = { value: this.value }) {
    options = Object.assign({ stragedy: 'and' }, options);
    const value = options.value;

    /* 根据校验器的类型执行校验策略 */

    const methods = {
      Function () {
        const fnRes = validators(value);
        const type = typeof fnResult;
        return (type === 'function' || type === 'object')
          ? this._valid(fnRes)
          : fnRes
      },
      Array () {
        const results = validators.map(x => this._valid(x));
        return options.stragedy === 'and'
          ? results.every(x => x === true)
          : results.some(x => x === true)
      },
      RegExp () {
        return validators.test(value)
      },
      Undefined () {
        return false
      },
      // TODO: '1&&2||(2||3)'
      String () {
        let validResult = null;
        const validArr = validators.split('||');
        if (validArr.length > 1) {
          validResult = this._valid(validArr, Object.assign(options, { stragedy: 'or' }));
        } else {
          const toFindHandle = validators.split('?');
          const [fnName, params] = [toFindHandle[0], (toFindHandle[1] || '').split(',')];
          const handle = fns.find(x => x.has(fnName)).get(fnName);
          if (!handle) {
            validResult = false;
            this.message = validators;
            return validResult
          }
          if (typeof handle === 'function') {
            const handleFnRes = handle.bind(this)(...params);
            validResult = this._valid(handleFnRes);
          } else {
            validResult = this._valid(handle);
          }
        }
        return validResult
      }
    };

    const validatorsType = Object.prototype.toString.call(validators).slice(8, -1);

    if (!methods[validatorsType]) {
      throw new Error('Unsupported Validators Type')
    }

    return methods[validatorsType].bind(this)()
  }

  // 传入一个新的值，作为需要校验的对象
  format (fnOrVal) {
    this.value = fnOrVal instanceof Function
      ? fnOrVal(this.value)
      : fnOrVal;
    return this
  }
  
  // 同步校验
  valid (validators, opts) {
    if (this.pass) return this
    this.pass = !(this.result = this._valid(validators, opts));
    return this
  }

  // 异步校验
  async validAsync (validators, opts) {
    if (this.pass) return this
    this.pass = !(this.result = this._valid(await validators, opts));
    return this
  }

  // 获取结果
  // TODO: refactor
  flush () {
    return this.message || this.result
  }
}

/* 通过 Valy.use 注册插件 */

const fns = [];
Valy.use = models => {
  const fnsMap = new Map(Object.entries(models));
  fns.unshift(fnsMap);
};
// TODO 有没有必要加入 Valy.destory 注销某个插件这种功能

Valy.use(defaultValidator);

module.exports = Valy;
//# sourceMappingURL=index.js.map
