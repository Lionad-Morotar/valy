/* eslint-disable */

import utils from './utils'
import defaultValidator from './defaultValidator.js'

/** Valy
 * @description Valy校验器, 可以使用两种方式调用:
 *  1. new Valy('a1111', 'username').result
 *  2. new Valy('a1111').valid(['username', _ => _.length === 5]).check()
 * @param {Any} rawValue 待校验的值
 * @param {Array, Regex, Function} validItems 待校验的选项
 */
export default class Valy {
  constructor (rawValue, validItems = []) {
      Object.assign(this, {
        pass: false,
        result: null,
        errorMsg: null,
        rawValue,
        validItems,
        rawValidItems
      })
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
          const handle = defaultValidator[toFindHandle[0]]
          if (!handle) {
            toValidResult = false
            this.errorMsg = validItems
            break
          }
          if (typeof handle === 'function') {
            const params = utils.query2obj(`value=${this.rawValue}&` + (toFindHandle[1] || ''))
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
