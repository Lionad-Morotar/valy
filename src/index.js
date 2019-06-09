import insideValidator from './insideValidator.js'

const DEFAULT_VALID_OPTIONS = { stragedy: 'and' }

/** Valy
 * @param {Any} value 待校验的值
 */
class Valy {
  constructor (value = '') {
    Object.assign(this, {
      pass: false,
      result: null,
      message: null,
      value
    })
    return new Proxy(this, {
      get: (target, key, receiver) => {
        // TODO prototype properties
        const findMap = maps.find(x => x.has(key))
        return !findMap
          ? Reflect.get(target, key, receiver)
          : (params = {}) => {
            const handle = findMap.get(key)
            this.valid(
              handle.bind
                ? handle.bind(this, params)
                : handle
            )
            return receiver
          }
      }
    })
  }

  // TODO async validate
  toValid (validItems = [], options) {

    options = Object.assign(DEFAULT_VALID_OPTIONS, options)

    /** const */

    const methods = {
      'function': () => {
        const fnResult = validItems(this.value)
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
      'regexp': () => validItems.test(this.value),
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
        // TODO eval((1&&1||2)||0)
        const validArr = validItems.split('||')
        if (validArr.length > 1) {
          toValidResult = this.toValid(validArr, Object.assign(options, { stragedy: 'or' }))
        } else {
          const toFindHandle = validItems.split('?')
          const [fnName, params] = [toFindHandle[0], (toFindHandle[1] || '').split(',')]
          const handle = maps.find(x => x.has(fnName)).get(fnName)
          if (!handle) {
            toValidResult = false
            this.message = validItems
            break
          }
          if (typeof handle === 'function') {
            const handleFnRes = handle.bind(this)(...params)
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
  valid (validItems) {
    if (this.pass) return this
    if (!(this.result = this.toValid(validItems))) {
      this.pass = true
    }
    return this
  }
  format (fn = _ => _) {
    this.value = fn(this.value)
    return this
  }
  flush (key) {
    return key
      ? this[key]
      : this.message || this.result
  }
}

const maps = []
Valy.use = models => maps.unshift(new Map(Object.entries(models)))
Valy.use(insideValidator)

export default Valy