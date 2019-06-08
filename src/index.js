/* eslint-disable no-sequences */

import utils from './utils'
import insideValidator from './insideValidator.js'

const DEFAULT_VALID_OPTIONS = { stragedy: 'and' }

/** Valy
 * @description Valy校验器, 可以使用两种方式调用:
 *  1. new Valy('a1111', 'username').result
 *  2. new Valy('a1111').valid(['username', _ => _.length === 5]).check()
 * @param {Any} rawValue 待校验的值
 * @param {Array, Regex, Function} validItems 待校验的选项
 */
class Valy {
  constructor (rawValue, validItems = []) {
    Object.assign(this, {
      pass: false,
      result: null,
      errorMsg: null,
      // TODO value, 每一步的结果 (比如在链式调用中穿插 format 函数)
      rawValue,
      validItems
    })
    return new Proxy(this, {
      get: (target, key, receiver) => {
        const findMap = maps.find(x => x.has(key))
        return !findMap
          ? Reflect.get(target, key, receiver)
          : (params = {}) => {
            const handle = findMap.get(key)
            this.valid(
              handle.bind
                ? handle.bind(this, Object.assign({ value: this.rawValue }, params))
                : handle
            )
            return receiver
          }
      }
    })
  }

  toValid (validItems = this.rawValidItems, options) {
    /** default value */

    options = Object.assign(DEFAULT_VALID_OPTIONS, options)

    /** const */

    const methods = {
      'function': () => {
        const fnResult = validItems(this.rawValue)
        return ['function', 'object'].includes(typeof fnResult)
          ? this.toValid(fnResult)
          : fnResult
      },
      'array': () => {
        const results = validItems.map(x => this.toValid(x))
        return options.stragedy === 'and'
          ? results.every(x => x === true)
          : results.some(x => x === true)
      },
      'regexp': () => validItems.test(this.rawValue),
      'boolean': () => validItems,
      'undefined': () => false,
      'error': () => { throw new Error(`unsupported type of validItem : ${typeof validItems} - ${validItems}`) }
    }

    /** vars */

    let toValidResult = null
    switch (typeof validItems) {
      case 'object':
        if (Array.isArray(validItems)) {
          toValidResult = methods['array'].bind(this)()
        } else if (validItems instanceof RegExp) {
          toValidResult = methods['regexp'].bind(this)()
        }
        break

      case 'string':
        const validArr = validItems.split('||')
        if (validArr.length > 1) {
          toValidResult = this.toValid(validArr, Object.assign(options, { stragedy: 'or' }))
        } else {
          const toFindHandle = validItems.split('?')
          const handle = maps.find(x => x.has(toFindHandle[0])).get(toFindHandle[0])
          if (!handle) {
            toValidResult = false
            this.errorMsg = validItems
            break
          }
          if (typeof handle === 'function') {
            const params = utils.query2obj(`value=${this.rawValue}&` + (toFindHandle[1] || ''))
            const handleFnRes = handle(params)
            toValidResult = this.toValid(handleFnRes)
          } else {
            toValidResult = this.toValid(handle)
          }
        }
        break

      default:
        toValidResult = methods[typeof validItems].bind(this)()
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

const maps = []
Valy.use = models => maps.unshift(new Map(Object.entries(models)))
Valy.use(insideValidator)

export default Valy