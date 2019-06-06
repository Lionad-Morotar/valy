/* eslint-disable */

function query2obj (query) {
  const queryArr = query.split('&').filter(x => x)
  let res = null
  try {
    res = JSON.parse(
      '{' +
        queryArr
          .map(x => {
            const [key, value] = x.split('=')
            return `"${key}":"${value}"`
          })
          .join(',\n') +
      '}'
    )
  } catch (err) {
    res = {}
  }
  return res
}

// 校验用到的工具函数或工具对象
const comm = {
  regex: {
    count (countStr) {
      if (countStr === '*') {
        return '*'
      } else {
        return `{${countStr}}`
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

// 内置的校验器
const validatorNameReflex = {

  /** social media */

  // 用户名
  username (options) {
    options = Object.assign({ min: 4, max: 16 }, options)
    return new RegExp(`^[a-zA-Z][a-zA-Z0-9_-]{${options.min - 1},${options.max - 1}}$`)
  },
  // 中文用户名
  username_cn (options) {
    options = Object.assign({ min: 2, max: 8 }, options)
    return new RegExp(`^[a-zA-Z\\u4E00-\\u9FA5][a-zA-Z0-9\\u4E00-\\u9FA5_-]{${options.min - 1},${options.max - 1}}$`)
  },
  // 邮箱
  email () {
    return new RegExp(`^([A-Za-z0-9_\\-\\.])+\\@([A-Za-z0-9_\\-\\.])+\\.([A-Za-z]{2,6})$`)
  },
  // 常用邮箱
  email_general () {
    return new RegExp(`^([A-Za-z0-9_\\-\\.])+\\@(${comm.regex.email.whiteLists.join('|')})$`)
  },
  // 手机号码
  mobile: /^((13[0-9])|(14[5|7])|(15([0-3]|[5-9]))|(18[0,5-9]))\d{8}$/,
  // 身份证
  idcard: /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
  // URL
  url: options => /^((https?|ftp|file):\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/.test(options.value) || '不是正确的URL',

  /** number */

  // 整数
  interger (options) {
    options = Object.assign({ area: 'both' }, options)
    return new RegExp(`^${comm.regex.number.areaLabelReflex[options.area]}\\d+$`) 
  },
  // 浮点数
  float (options) {
    options = Object.assign({ area: 'both', count: '*' }, options)
    return new RegExp(`^${comm.regex.number.areaLabelReflex[options.area]}\\d*\\.\\d${comm.regex.count(options.count)}$`)
  },
  // 数字
  number: 'interger||float',
  // 数字比较
  max (options) {
    options = Object.assign({ max: Number.MAX_SAFE_INTEGER }, options)
    return !Number.isNaN(+options.value) && (+options.value < +options.max) || `应不大于${options.max }`
  },
  min (options) {
    options = Object.assign({ min: Number.MIN_SAFE_INTEGER }, options)
    return !Number.isNaN(+options.value) && (+options.value > +options.min) || `应不小于${options.min}`
  },

  /** general */

  // 必需值
  required: options => (!['null', 'undefined'].includes(options.value) && /.+/.test(options.value) || '值缺失'),
}

/** Valy
 * @description Valy校验器, 可以使用两种方式调用:
 *  1. new Valy('a1111', 'username').result
 *  2. new Valy('a1111').valid(['username', _ => _.length === 5]).check()
 * @param {Any} rawValue 待校验的值
 * @param {Array, Regex, Function} validItems 待校验的选项
 */
export default class Valy {
  constructor ({ rawValue, rawValidItems } = { rawValue: undefined }) {
    const argLen = arguments.length
    const arg1 = arguments[0]
    const arg2 = arguments[1]
    // console.log('@@@@@@@@@@@@', argLen, arg1, arg2, this)
    if (arg1 instanceof Object && !(arg1 instanceof Array)) {
      Object.assign(this, {
        pass: false,
        result: null,
        rawValue,
        rawValidItems
      })
      this.exec()
    } else if (argLen === 2) {
      Object.assign(this, {
        pass: false,
        result: null,
        rawValue: arg1,
        rawValidItems: arg2
      })
      this.exec()
    } else {
      Object.assign(this, {
        pass: false,
        result: null,
        rawValue: arg1,
        rawValidItems
      })
    }
    this.errorMsg = null
    // console.log('@@@@@@@@@@@@', argLen, arg1, arg2, this)
  }

  toValid (validItems, options = { stragedy: 'and' }) {
    let toValidResult = 'unexcepted valid result'
    validItems = validItems == null ? this.rawValidItems : validItems
    // console.log('@@@ : ', typeof validItems, validItems)

    switch (typeof validItems) {
      case 'function':
        // console.log('valid items type : function : ', this)
        const fnResult = validItems(this.rawValue)
        // console.log('@@', fnResult)
        if (['function', 'object'].includes(typeof fnResult)) {
          toValidResult = this.toValid(fnResult)
        } else {
          toValidResult = fnResult
        }
        break

      case 'object':
        // console.log('valid items type : object')
        if (Array.isArray(validItems)) {
          const toValidResultArr = validItems.map(x => this.toValid(x))
          // console.log('@@ : ', toValidResultArr)
          switch (options.stragedy) {
            case 'and':
              toValidResult = toValidResultArr.every(x => x === true)
              break
            case 'or':
              toValidResult = toValidResultArr.some(x => x === true)
              break
          }
        } else if (validItems instanceof RegExp) {
          toValidResult = validItems.test(this.rawValue)
        } else {
          throw new Error(`unsupported object type validItem : ${validItems}`)
        }
        break

      case 'string':
        // console.log('valid items type : string')
        const validArr = validItems.split('||')
        if (validArr.length > 1) {
          toValidResult = this.toValid(validArr, Object.assign(options, { stragedy: 'or' }))
        } else {
          const toFindHandle = validItems.split('?')
          const handle = validatorNameReflex[toFindHandle[0]]
          if (!handle) {
            toValidResult = false
            this.errorMsg = validItems
            break
          }
          if (typeof handle === 'function') {
            const params = query2obj(`value=${this.rawValue}&` + (toFindHandle[1] || ''))
            const handleFnRes = handle(params)
            // console.log('@@--1: ', handleFnRes)
            toValidResult = this.toValid(handleFnRes)
          } else {
            toValidResult = this.toValid(handle)
          }
        }
        break

      case 'boolean':
        toValidResult = validItems
        break

      case 'undefined':
        toValidResult = false
        break

      default:
        console.log(typeof this.validItems, this.validItems, `unsupported type of validItem`)
        throw new Error(`unsupported type of validItem : ${validItems}`)
    }

    return toValidResult
  }

  // 主动调用校验
  valid (validItems) {
    if (this.pass) return this
    if (!(this.result = this.toValid(validItems))) {
      this.pass = true
    }
    return this
  }

  // 对值进行格式化
  format (fn = _ => _) {
    this.rawValue = fn(this.rawValue)
    return this
  }

  // 返回校验结果
  exec () {
    this.result = this.toValid()
    // console.log(this.result)
    return this.result
  }

  // 返回判断检验结果是否为某一特定的值
  check (assertResult = true) {
    return this.result === assertResult
  }
  not (assertResult = false) {
    return this.result !== assertResult
  }
  getRes () {
    return this.errorMsg || this.result
  }
}
